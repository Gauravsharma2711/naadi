import os
import io
from typing import Optional
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.db.database import get_msme
from app.ml.days_calibration import calculate_days_to_ready
from app.ml.shap_explain import explain_prediction
import boto3
from botocore.exceptions import ClientError
from botocore.config import Config
from dotenv import load_dotenv

# Load env variables from backend/.env
load_dotenv()

router = APIRouter()

# Import ReportLab elements
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.graphics.shapes import Drawing, Wedge, Circle, String, Rect
from datetime import datetime

def generate_pdf_report(msme_id: str, msme_data: dict, calibration: dict, shap_breakdown: list) -> bytes:
    """
    Generates a premium, highly personalized PDF report using ReportLab.
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

    # Define custom design system colors (from DESIGN_SYSTEM.md)
    c_primary = colors.HexColor("#00684A")   # MongoDB Forest Green
    c_accent = colors.HexColor("#00D66B")    # Primary Accent Green
    c_track = colors.HexColor("#B8E8C8")     # Muted Sprout Green
    c_dark = colors.HexColor("#001E2B")      # Deep Charcoal Text
    c_muted = colors.HexColor("#5A6B70")     # Muted Text
    c_light = colors.HexColor("#F7F9F8")     # Surface Clean Off-white
    c_alert = colors.HexColor("#D64545")     # Error / Risk Red

    # Custom typography styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=c_primary,
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=c_muted,
    )
    
    headline_style = ParagraphStyle(
        'HeadlineStyle',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=c_primary,
        spaceBefore=10,
        spaceAfter=15
    )

    section_header_style = ParagraphStyle(
        'SecHeader',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=c_primary,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=c_dark
    )

    bold_body_style = ParagraphStyle(
        'BoldBodyTextCustom',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    muted_body_style = ParagraphStyle(
        'MutedBodyTextCustom',
        parent=body_style,
        fontName='Helvetica',
        textColor=c_muted
    )

    # 1. Branded Header Table (Left: Company & Date; Right: Branded Title)
    report_date = datetime.now().strftime("%B %d, %Y")
    clean_msme_id = msme_id.replace('demo-msme-', '').upper()
    header_data = [
        [
            Paragraph(f"<b>MSME Profile:</b> Business {clean_msme_id}<br/><b>Issued:</b> {report_date}", body_style),
            Paragraph("<b>Naadi (Din) Financial Health Card</b><br/><font color='#5A6B70'>AI Credit Readiness Audit</font>", ParagraphStyle('RHeader', parent=body_style, alignment=2))
        ]
    ]
    t_header = Table(header_data, colWidths=[250, 280])
    t_header.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LINEBELOW', (0, 0), (-1, -1), 1, colors.HexColor("#E3E1DE")),
    ]))
    story.append(t_header)
    story.append(Spacer(1, 10))

    # 2. Dynamic Wording Status Headline
    days_rem = calibration["days_to_ready"]
    if days_rem <= 0:
        status_headline = "Loan-ready today — all systems clear"
    elif days_rem <= 15:
        status_headline = f"{days_rem} days from loan-ready — minor adjustments remaining"
    elif days_rem <= 60:
        status_headline = f"{days_rem} days from loan-ready — mid-journey progress"
    else:
        status_headline = f"{days_rem} days — significant gaps to address before credit-readiness"

    story.append(Paragraph(f"Current State: <font color='{c_primary.hexval()}'>{status_headline}</font>", headline_style))

    # 3. Visual Summary Section: Growth-Ring Dial + Metadata Side-by-Side
    # Create the Growth-Ring Dial drawing
    d_dial = Drawing(160, 140)
    # The progress goes from 0.0 to 1.0 (where 0.0 means 180 days remaining, and 1.0 is 0 days remaining)
    progress = max(0.0, min(1.0, (180 - days_rem) / 180))
    
    # Draw Background Track Wedge (-225 to 45 is a 270-degree arc leaving a bottom gap)
    w_track = Wedge(80, 70, 60, -225, 45, width=12)
    w_track.fillColor = c_track
    w_track.strokeColor = None
    d_dial.add(w_track)
    
    # Draw Filled Progress Wedge
    if progress > 0:
        w_fill = Wedge(80, 70, 60, -225, -225 + progress * 270, width=12)
        w_fill.fillColor = c_accent
        w_fill.strokeColor = None
        d_dial.add(w_fill)
        
    # Draw Text inside the growth-ring dial
    if days_rem == 0:
        s_days = String(80, 66, "READY", textAnchor='middle', fontName='Helvetica-Bold', fontSize=18, fillColor=c_primary)
        s_label = String(80, 52, "LOAN READY", textAnchor='middle', fontName='Helvetica-Bold', fontSize=6.5, fillColor=c_muted)
    else:
        s_days = String(80, 64, f"{days_rem}", textAnchor='middle', fontName='Helvetica-Bold', fontSize=24, fillColor=c_dark)
        s_label = String(80, 52, "DAYS TO READY", textAnchor='middle', fontName='Helvetica-Bold', fontSize=6.5, fillColor=c_muted)
        
    d_dial.add(s_days)
    d_dial.add(s_label)

    # Metadata Panel (Right side)
    prob = calibration["credit_readiness_probability"]
    discipline = msme_data.get('discipline_level', 'Average').upper()
    
    meta_html = f"""
    <b>Credit Readiness Index:</b> {(prob * 100):.1f}%<br/>
    <b>Financial Discipline:</b> {discipline}<br/>
    <b>Days to Loan-Ready:</b> {days_rem if days_rem > 0 else '0 (Pre-Approved)'} days<br/>
    <b>EPFO Coverage:</b> {'Active' if msme_data.get('has_employees') else 'Exempt (No Employees)'}
    """
    
    meta_table_data = [
        [d_dial, Paragraph(meta_html, body_style)]
    ]
    t_summary = Table(meta_table_data, colWidths=[180, 350])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_light),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 10),
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor("#E3E1DE")),
        ('LINEABOVE', (0, 0), (-1, -1), 0.5, colors.HexColor("#E3E1DE")),
    ]))
    story.append(t_summary)
    story.append(Spacer(1, 10))

    # 4. Ledger Metrics Breakdown Table
    story.append(Paragraph("I. Key Ledger Indicators", section_header_style))
    
    indicators_headers = [
        Paragraph("<b>Indicator</b>", bold_body_style), 
        Paragraph("<b>Current Value</b>", bold_body_style), 
        Paragraph("<b>Health Rating</b>", bold_body_style)
    ]
    
    indicators_rows = [indicators_headers]
    
    # Map metrics to row outputs
    metrics_map = [
        ("GST Filing Compliance", f"{msme_data['filing_on_time_rate']:.1%}", "Excellent" if msme_data['filing_on_time_rate'] >= 0.9 else "Needs Improvement"),
        ("UPI Settlement Trend", f"{msme_data['upi_trend_slope']:.1%}/mo", "Growing" if msme_data['upi_trend_slope'] > 0 else "Declining"),
        ("Cashflow Stability", f"{msme_data['cashflow_volatility_score']:.2f}", "Stable" if msme_data['cashflow_volatility_score'] < 0.15 else "Volatile"),
        ("Buyer Concentration Risk", f"{msme_data['top_buyer_concentration_pct']:.1%}", "Healthy" if msme_data['top_buyer_concentration_pct'] <= 0.35 else "Concentration Warning"),
    ]
    
    if msme_data.get('has_employees'):
        metrics_map.append(("EPFO Payroll Consistency", f"{msme_data['payroll_consistency_score']:.1%}", "Consistent" if msme_data['payroll_consistency_score'] >= 0.9 else "Inconsistent"))
    else:
        metrics_map.append(("EPFO Payroll Consistency", "N/A (No Employees)", "Exempt"))

    for ind, val, rating in metrics_map:
        rating_color = c_primary if "Excellent" in rating or "Stable" in rating or "Healthy" in rating or "Growing" in rating or "Consistent" in rating or "Exempt" in rating else c_alert
        indicators_rows.append([
            Paragraph(ind, body_style),
            Paragraph(val, body_style),
            Paragraph(f"<font color='{rating_color.hexval()}'><b>{rating}</b></font>", bold_body_style)
        ])
        
    t_indicators = Table(indicators_rows, colWidths=[210, 160, 160])
    t_indicators.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), c_primary),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E3E1DE")),
    ]))
    for item in indicators_headers:
        item.style.textColor = colors.white
        
    story.append(t_indicators)
    story.append(Spacer(1, 10))

    # 5. Explainable AI Insights (Why Section)
    story.append(Paragraph("II. Credit Health Drivers (AI Diagnostic)", section_header_style))
    
    # Split explanations into Positive and Negative drivers
    negatives = []
    positives = []
    
    for item in shap_breakdown:
        sv = item["shap_value"]
        if sv < 0:
            negatives.append(item)
        else:
            positives.append(item)
            
    # Sort them
    negatives.sort(key=lambda x: x["shap_value"])  # Most negative first
    positives.sort(key=lambda x: x["shap_value"], reverse=True) # Most positive first
    
    story.append(Paragraph("<b>Key Gaps to Address</b>", bold_body_style))
    story.append(Spacer(1, 4))
    if negatives:
        for item in negatives:
            bullet_html = f"<font color='{c_alert.hexval()}'>■</font> <b>{item['label']}</b> (Impact: {item['shap_value']:+.2f})<br/>{item['reason']}"
            story.append(Paragraph(bullet_html, ParagraphStyle('NegBullet', parent=body_style, leftIndent=15, spaceBefore=2, spaceAfter=4)))
    else:
        story.append(Paragraph("No negative drivers identified. All ledger components are performing optimally.", muted_body_style))
        
    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>Supporting Strengths</b>", bold_body_style))
    story.append(Spacer(1, 4))
    if positives:
        for item in positives:
            bullet_html = f"<font color='{c_primary.hexval()}'>■</font> <b>{item['label']}</b> (Impact: {item['shap_value']:+.2f})<br/>{item['reason']}"
            story.append(Paragraph(bullet_html, ParagraphStyle('PosBullet', parent=body_style, leftIndent=15, spaceBefore=2, spaceAfter=4)))
    else:
        story.append(Paragraph("No positive drivers identified.", muted_body_style))
        
    story.append(Spacer(1, 10))

    # 6. Action Plan Section (Checklist)
    story.append(Paragraph("III. Prescriptive Action Plan", section_header_style))
    if days_rem <= 0:
        story.append(Paragraph("Congratulations! Your ledger metrics are clean. No corrective actions required. You are fully credit-ready.", body_style))
    else:
        recs = calibration.get("recommendations", [])
        
        # Helper to generate a clean checklist checkbox
        def make_checkbox_drawing():
            d = Drawing(14, 14)
            r = Rect(0, 1, 12, 12, fillColor=colors.HexColor("#FFFFFF"), strokeColor=c_muted, strokeWidth=1)
            d.add(r)
            return d
            
        action_table_data = []
        for rec in recs:
            checkbox = make_checkbox_drawing()
            text_p = Paragraph(
                f"<b>{rec['label']}</b> <font color='{c_primary.hexval()}'><b>(Saves {rec['days_saved']} Days)</b></font><br/>"
                f"<font color='{c_muted.hexval()}'>{rec['action']}</font>",
                body_style
            )
            action_table_data.append([checkbox, text_p])
            
        if action_table_data:
            t_action = Table(action_table_data, colWidths=[25, 505])
            t_action.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('PADDING', (0, 0), (-1, -1), 6),
                ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor("#E3E1DE")),
            ]))
            story.append(t_action)
        else:
            story.append(Paragraph("No recommendations generated.", body_style))

    # 7. Conditional Footer (Data sources)
    used_sources = ["GST", "UPI", "Account Aggregator (AA)"]
    if msme_data.get('has_employees', False):
        used_sources.append("EPFO")
    sources_str = ", ".join(used_sources[:-1]) + f", and {used_sources[-1]}"
    
    footer_style = ParagraphStyle(
        'FooterStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=10,
        textColor=c_muted,
        alignment=1, # Centered
        spaceBefore=25
    )
    story.append(Spacer(1, 10))
    story.append(Paragraph(f"This report is generated using verified {sources_str} data. All analyses are proprietary to Naadi (Din) Credit Calibration Engine.", footer_style))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

@router.get("/msme/{msme_id}/report")
def get_msme_report(msme_id: str, session_id: Optional[str] = None):
    """
    Generates report PDF, uploads it to S3, and returns a presigned URL.
    """
    # 1. Fetch data
    msme_data = get_msme(msme_id, session_id)
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
            region_name=aws_region,
            config=Config(
                signature_version='s3v4',
                s3={'addressing_style': 'virtual'}
            )
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
