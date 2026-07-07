import os
import io
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.db.database import get_msme
from app.ml.days_calibration import calculate_days_to_ready
from app.ml.shap_explain import explain_prediction
import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

# Load env variables from backend/.env
load_dotenv()

router = APIRouter()

# Import ReportLab elements
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_pdf_report(msme_id: str, msme_data: dict, calibration: dict, shap_breakdown: list) -> bytes:
    """
    Generates a premium PDF report using ReportLab.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    story = []
    styles = getSampleStyleSheet()

    # Define custom sprout colors
    c_primary = colors.HexColor("#00684A")   # MongoDB Forest Green
    c_success = colors.HexColor("#00D66B")   # Sprout Green
    c_dark = colors.HexColor("#001E2B")      # Deep Text
    c_muted = colors.HexColor("#5A6B70")     # Muted Text
    c_light = colors.HexColor("#F7F9F8")     # Clean Off-white

    # Custom typography styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=c_primary,
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=c_muted,
        spaceAfter=20
    )

    section_header_style = ParagraphStyle(
        'SecHeader',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=c_primary,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=c_dark
    )

    bold_body_style = ParagraphStyle(
        'BoldBodyTextCustom',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    # 1. Document Title & Subtitle
    story.append(Paragraph("Naadi (Din) Credit Readiness Report", title_style))
    story.append(Paragraph(f"AI-Powered Financial Health Card • Business ID: {msme_id}", subtitle_style))
    story.append(Spacer(1, 10))

    # 2. Executive Status Panel
    days_rem = calibration["days_to_ready"]
    prob = calibration["credit_readiness_probability"]
    status_str = "PRE-APPROVED / READY" if days_rem <= 0 else f"{days_rem} DAYS REMAINING"
    
    status_data = [
        [
            Paragraph("<b>Overall Status:</b>", body_style), 
            Paragraph(f"<font color='{c_primary.hexval()}'><b>{status_str}</b></font>", bold_body_style)
        ],
        [
            Paragraph("<b>Readiness Probability:</b>", body_style), 
            Paragraph(f"<b>{(prob * 100):.1f}%</b>", body_style)
        ],
        [
            Paragraph("<b>Business Name:</b>", body_style), 
            Paragraph(f"MSME {msme_id}", body_style)
        ],
        [
            Paragraph("<b>Discipline Rating:</b>", body_style), 
            Paragraph(msme_data.get('discipline_level', 'Average').upper(), bold_body_style)
        ]
    ]
    
    t_status = Table(status_data, colWidths=[180, 320])
    t_status.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_light),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor("#E3E1DE")),
    ]))
    story.append(t_status)
    story.append(Spacer(1, 20))

    # 3. Ledger Metrics Breakdown
    story.append(Paragraph("I. Ledger Indicators", section_header_style))
    
    indicators_headers = [
        Paragraph("<b>Indicator</b>", bold_body_style), 
        Paragraph("<b>Current Value</b>", bold_body_style), 
        Paragraph("<b>Health Rating</b>", bold_body_style)
    ]
    
    indicators_rows = [indicators_headers]
    
    # Map metrics to row outputs
    metrics_map = [
        ("GST Filing History", f"{msme_data['filing_on_time_rate']:.1%}", "Excellent" if msme_data['filing_on_time_rate'] >= 0.9 else "Needs Improvement"),
        ("UPI Settlement Trend", f"{msme_data['upi_trend_slope']:.1%}/mo", "Growing" if msme_data['upi_trend_slope'] > 0 else "Declining"),
        ("Cashflow Stability", f"{msme_data['cashflow_volatility_score']:.2f}", "Stable" if msme_data['cashflow_volatility_score'] < 0.15 else "Volatile"),
        ("Buyer Concentration Risk", f"{msme_data['top_buyer_concentration_pct']:.1%}", "Healthy" if msme_data['top_buyer_concentration_pct'] <= 0.35 else "Concentration Warning"),
    ]
    
    if msme_data.get('has_employees'):
        metrics_map.append(("EPFO Consistency", f"{msme_data['payroll_consistency_score']:.1%}", "Consistent" if msme_data['payroll_consistency_score'] >= 0.9 else "Inconsistent"))
    else:
        metrics_map.append(("EPFO Consistency", "N/A (No employees)", "Exempt"))

    for ind, val, rating in metrics_map:
        rating_color = c_primary if "Excellent" in rating or "Stable" in rating or "Healthy" in rating or "Growing" in rating or "Consistent" in rating else c_muted
        indicators_rows.append([
            Paragraph(ind, body_style),
            Paragraph(val, body_style),
            Paragraph(f"<font color='{rating_color.hexval()}'><b>{rating}</b></font>", bold_body_style)
        ])
        
    t_indicators = Table(indicators_rows, colWidths=[200, 150, 150])
    t_indicators.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#00684A")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E3E1DE")),
    ]))
    # Quick fix: Table Style header color text overrides
    for i in range(len(indicators_headers)):
        indicators_headers[i].style.textColor = colors.white
        
    story.append(t_indicators)
    story.append(Spacer(1, 20))

    # 4. Explainable AI Insights (SHAP)
    story.append(Paragraph("II. Credit Health Drivers (SHAP AI Analysis)", section_header_style))
    
    shap_rows = [[
        Paragraph("<b>Ledger Driver</b>", bold_body_style), 
        Paragraph("<b>Impact</b>", bold_body_style), 
        Paragraph("<b>Details / System Observation</b>", bold_body_style)
    ]]
    # Reset headers back to black text
    for item in shap_rows[0]:
        item.style.textColor = colors.white

    for item in shap_breakdown:
        sv = item["shap_value"]
        impact = "POSITIVE" if sv >= 0 else "NEGATIVE"
        impact_color = c_success if sv >= 0 else colors.HexColor("#D64545")
        
        shap_rows.append([
            Paragraph(item["label"], body_style),
            Paragraph(f"<font color='{impact_color.hexval()}'><b>{impact} ({sv:+.2f})</b></font>", bold_body_style),
            Paragraph(item["reason"], body_style)
        ])
        
    t_shap = Table(shap_rows, colWidths=[150, 110, 240])
    t_shap.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E3E1DE")),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t_shap)
    story.append(Spacer(1, 20))

    # 5. Recovery Action Plan
    story.append(Paragraph("III. Prescriptive Action Plan", section_header_style))
    if days_rem <= 0:
        story.append(Paragraph("Congratulations! Your ledger metrics are clean. No corrective actions required. You are fully credit-ready.", body_style))
    else:
        recs = calibration.get("recommendations", [])
        action_rows = [[
            Paragraph("<b>Target Metric</b>", bold_body_style), 
            Paragraph("<b>Prescribed Growth Action</b>", bold_body_style), 
            Paragraph("<b>Days Saved</b>", bold_body_style)
        ]]
        for item in action_rows[0]:
            item.style.textColor = colors.white

        for rec in recs:
            action_rows.append([
                Paragraph(rec["label"], body_style),
                Paragraph(rec["action"], body_style),
                Paragraph(f"<font color='{c_success.hexval()}'><b>+{rec['days_saved']} Days</b></font>", bold_body_style)
            ])
            
        t_action = Table(action_rows, colWidths=[150, 260, 90])
        t_action.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), c_primary),
            ('PADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E3E1DE")),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(t_action)

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

@router.get("/msme/{msme_id}/report")
def get_msme_report(msme_id: str):
    """
    Generates report PDF, uploads it to S3, and returns a presigned URL.
    """
    # 1. Fetch data
    msme_data = get_msme(msme_id)
    if not msme_data:
        raise HTTPException(status_code=404, detail=f"MSME with ID {msme_id} not found")
        
    features = {
        'filing_on_time_rate': msme_data['filing_on_time_rate'],
        'upi_trend_slope': msme_data['upi_trend_slope'],
        'cashflow_volatility_score': msme_data['cashflow_volatility_score'],
        'top_buyer_concentration_pct': msme_data['top_buyer_concentration_pct'],
        'payroll_consistency_score': msme_data['payroll_consistency_score']
    }
    
    calibration = calculate_days_to_ready(features, msme_id=msme_id)
    
    shap_raw = explain_prediction(features, filter_negative=False, msme_id=msme_id)
    shap_breakdown = [
        {
            "feature": item["feature"],
            "label": item["label"],
            "shap_value": item["shap_value"],
            "reason": item["reason"]
        }
        for item in shap_raw
    ]
    
    # 2. Generate PDF ReportLab bytes
    try:
        pdf_data = generate_pdf_report(msme_id, msme_data, calibration, shap_breakdown)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

    # 3. Read S3 parameters from environment
    aws_id = os.getenv("AWS_ACCESS_KEY_ID")
    aws_key = os.getenv("AWS_SECRET_ACCESS_KEY")
    aws_region = os.getenv("AWS_REGION")
    bucket_name = os.getenv("S3_BUCKET_NAME")

    if not all([aws_id, aws_key, aws_region, bucket_name]):
        # Fallback: Stream PDF directly if S3 variables are not set
        return StreamingResponse(
            io.BytesIO(pdf_data),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=din_report_{msme_id}.pdf"}
        )

    # 4. Upload to S3
    s3_key = f"reports/din_report_{msme_id}.pdf"
    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=aws_id,
            aws_secret_access_key=aws_key,
            region_name=aws_region
        )
        
        # Upload buffer
        s3_client.put_object(
            Bucket=bucket_name,
            Key=s3_key,
            Body=pdf_data,
            ContentType='application/pdf'
        )
        
        # 5. Generate 1-hour expiry presigned URL
        presigned_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': s3_key},
            ExpiresIn=3600
        )
        
        return {"report_url": presigned_url}

    except ClientError as e:
        # Fallback or raise error
        raise HTTPException(status_code=500, detail=f"S3 Upload failed: {str(e)}")
