import os
import boto3
from typing import List, Dict
from dotenv import load_dotenv

# Load env variables from backend/.env
dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.env"))
load_dotenv(dotenv_path)

# Retrieve the Bedrock API key
token = os.environ.get("AWS_BEARER_TOKEN_BEDROCK")

# Setup environment variables temporarily clearing standard credentials to ensure bearer token auth
orig_access_key = os.environ.pop("AWS_ACCESS_KEY_ID", None)
orig_secret_key = os.environ.pop("AWS_SECRET_ACCESS_KEY", None)
orig_session_token = os.environ.pop("AWS_SESSION_TOKEN", None)

try:
    if token:
        os.environ["AWS_BEARER_TOKEN_BEDROCK"] = token
    # Default to us-east-1 since Bedrock Nova/Claude models are primary there
    aws_region = os.environ.get("AWS_REGION_BEDROCK", "us-east-1")
    client = boto3.client("bedrock-runtime", region_name=aws_region)
finally:
    # Restore standard credentials for other clients
    if orig_access_key is not None:
        os.environ["AWS_ACCESS_KEY_ID"] = orig_access_key
    if orig_secret_key is not None:
        os.environ["AWS_SECRET_ACCESS_KEY"] = orig_secret_key
    if orig_session_token is not None:
        os.environ["AWS_SESSION_TOKEN"] = orig_session_token

DEFAULT_MODEL_ID = os.environ.get("BEDROCK_MODEL_ID", "us.amazon.nova-lite-v1:0")

def get_fallback_mock_story(shap_breakdown: List[Dict], days_remaining: int) -> str:
    """
    Returns a beautifully structured, constrained financial story paragraph
    following the exact prompt rules, as a backup for the demo.
    """
    reasons = [item["reason"] for item in shap_breakdown]
    
    # Simple rule-based generation to mimic Bedrock output for the demo MSMEs
    # This prevents the demo from breaking if Bedrock is throttled/unavailable.
    gst_reason = next((r for r in reasons if "GST" in r or "filing" in r), "")
    upi_reason = next((r for r in reasons if "UPI" in r or "settlement" in r), "")
    vol_reason = next((r for r in reasons if "volatility" in r or "cashflow" in r), "")
    conc_reason = next((r for r in reasons if "concentration" in r or "buyer" in r), "")
    payroll_reason = next((r for r in reasons if "EPFO" in r or "payroll" in r), "")

    # Clean the bullet points to be concise
    reasons_list = [r for r in [gst_reason, upi_reason, vol_reason, conc_reason, payroll_reason] if r]
    
    if len(reasons_list) >= 3:
        # Create a coherent financial story using the SHAP facts
        sentence1 = f"This business is estimated to be {days_remaining} days away from credit readiness due to several key factors."
        
        # Combine negative factors
        negatives = []
        if "delayed" in gst_reason or "compliance" in gst_reason:
            negatives.append("delayed GST filings")
        if "declining" in upi_reason:
            negatives.append("declining UPI settlement volumes")
        if "high" in vol_reason or "fluctuations" in vol_reason:
            negatives.append("volatile bank inflows")
        if "High customer concentration" in conc_reason or "concentration" in conc_reason:
            negatives.append("high revenue concentration from a single buyer")
            
        if negatives:
            sentence2 = f"Primary bottlenecks include " + ", ".join(negatives[:-1]) + (f", and {negatives[-1]}" if len(negatives) > 1 else f"{negatives[0]}") + "."
        else:
            sentence2 = "Credit factors show stable operations, with minor improvements needed."
            
        # Add a positive note if available
        positives = []
        if "perfect" in gst_reason or "100% on time" in gst_reason:
            positives.append("a perfect GST filing record")
        if "growing" in upi_reason:
            positives.append("positive month-on-month UPI growth")
        if "low" in vol_reason or "stable" in vol_reason:
            positives.append("very stable cash flows")
        if "Healthy customer concentration" in conc_reason:
            positives.append("healthy client diversification")
        if "100% consistent" in payroll_reason or "consistent" in payroll_reason:
            positives.append("consistent EPFO compliance")
            
        if positives:
            sentence3 = f"On the positive side, the business demonstrates " + ", ".join(positives[:-1]) + (f", and {positives[-1]}" if len(positives) > 1 else f"{positives[0]}") + "."
        else:
            sentence3 = "Addressing the operational bottlenecks will help accelerate loan readiness."
            
        return f"{sentence1} {sentence2} {sentence3}"
    
    # Generic backup
    return f"This business has {days_remaining} days remaining until credit-ready. Key factors include {', '.join(reasons_list[:3])}."

def generate_financial_story(shap_breakdown: List[Dict], days_remaining: int, model_id: str = None) -> str:
    """
    Generates a financial story paragraph using Amazon Bedrock Converse API.
    Refers ONLY to the reasons provided in the shap_breakdown.
    """
    if not token or token == "INVALID_TOKEN":
        raise ValueError("AWS_BEARER_TOKEN_BEDROCK is invalid or missing.")

    if model_id is None:
        model_id = DEFAULT_MODEL_ID

    reasons = [item["reason"] for item in shap_breakdown if "reason" in item]
    if not reasons:
        raise ValueError("No reasons found in SHAP breakdown to generate story.")

    reasons_bullet_list = "\n".join([f"- {r}" for r in reasons])
    
    prompt_text = (
        f"Explain in exactly 2 to 3 plain, simple, and direct sentences why this MSME has its current score, "
        f"using ONLY the specific details and reasons provided in the bullet points below. Do NOT invent any facts, "
        f"numbers, or other details not explicitly listed below. Write in a professional, objective tone as a financial adviser.\n\n"
        f"Credit Readiness Countdown: {days_remaining} days remaining.\n\n"
        f"Reasons:\n{reasons_bullet_list}"
    )

    messages = [
        {
            "role": "user",
            "content": [{"text": prompt_text}]
        }
    ]

    response = client.converse(
        modelId=model_id,
        messages=messages,
        inferenceConfig={
            "maxTokens": 200,
            "temperature": 0.2
        }
    )
    
    story_paragraph = response["output"]["message"]["content"][0]["text"].strip()
    return story_paragraph
