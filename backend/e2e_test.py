"""E2E flow test for Demo MSME A and Demo MSME B profiles using stdlib only."""
import urllib.request
import json

BASE = "http://127.0.0.1:8000"
SEP = "=" * 70

def api_get(path):
    r = urllib.request.urlopen(f"{BASE}{path}")
    return r.status, json.loads(r.read())

def api_post(path, body):
    data = json.dumps(body).encode()
    req = urllib.request.Request(f"{BASE}{path}", data=data, headers={"Content-Type": "application/json"})
    r = urllib.request.urlopen(req)
    return r.status, json.loads(r.read())

# -- STEP 1: Onboarding Connect (Demo MSME A) --
print(SEP)
print("STEP 1: POST /msme/connect  (demo-msme-a)")
print(SEP)
status, data = api_post("/msme/connect", {"msme_id": "demo-msme-a", "sources": ["gst","upi","bank","epfo"]})
print(f"Status: {status}")
print(json.dumps(data, indent=2))

# -- STEP 2: Dashboard Load (GET /score) --
print(f"\n{SEP}")
print("STEP 2: GET /msme/demo-msme-a/score  (initial dashboard load)")
print(SEP)
status, data = api_get("/msme/demo-msme-a/score")
print(f"Status: {status}")
print(f"days_remaining: {data['days_remaining']}")
print(f"current_probability: {data['current_probability']}")
actions = data["top_3_actions"]
print(f"top_3_actions ({len(actions)} items):")
for i, a in enumerate(actions, 1):
    print(f"  {i}. [{a['action_id']}] saves {a['days_saved']} days")
    print(f"     {a['action']}")
breakdown = data["shap_breakdown"]
print(f"shap_breakdown ({len(breakdown)} items):")
for s in breakdown:
    sv = s["shap_value"]
    sign = "+" if sv >= 0 else ""
    print(f"  {s['label']}: {sign}{sv:.4f} -- {s['reason']}")

# -- STEP 3a: Complete Action 1 (filing_on_time_rate) --
print(f"\n{SEP}")
print("STEP 3a: POST action-complete  (filing_on_time_rate)")
print(SEP)
status, d = api_post("/msme/demo-msme-a/action-complete", {"action_id": "filing_on_time_rate"})
print(f"Status: {status}")
print(f"days_remaining: {d['days_remaining']}  (was 47)")
print(f"current_probability: {d['current_probability']}")
ra = d["top_3_actions"]
print(f"remaining actions: {len(ra)}")
for i, a in enumerate(ra, 1):
    print(f"  {i}. [{a['action_id']}] saves {a['days_saved']} days")

# -- STEP 3b: Complete Action 2 (upi_trend_slope) --
print(f"\n{SEP}")
print("STEP 3b: POST action-complete  (upi_trend_slope)")
print(SEP)
status, d = api_post("/msme/demo-msme-a/action-complete", {"action_id": "upi_trend_slope"})
print(f"Status: {status}")
print(f"days_remaining: {d['days_remaining']}  (was 27)")
print(f"current_probability: {d['current_probability']}")
ra = d["top_3_actions"]
print(f"remaining actions: {len(ra)}")
for i, a in enumerate(ra, 1):
    print(f"  {i}. [{a['action_id']}] saves {a['days_saved']} days")

# -- STEP 3c: Complete Action 3 (cashflow_volatility_score) --
print(f"\n{SEP}")
print("STEP 3c: POST action-complete  (cashflow_volatility_score)")
print(SEP)
status, d = api_post("/msme/demo-msme-a/action-complete", {"action_id": "cashflow_volatility_score"})
print(f"Status: {status}")
print(f"days_remaining: {d['days_remaining']}  (was 12)")
print(f"current_probability: {d['current_probability']}")
ra = d["top_3_actions"]
print(f"remaining actions: {len(ra)}")

# -- STEP 4: Final score refresh after all actions --
print(f"\n{SEP}")
print("STEP 4: GET /msme/demo-msme-a/score  (final state after all 3 actions)")
print(SEP)
status, data = api_get("/msme/demo-msme-a/score")
print(f"days_remaining: {data['days_remaining']}")
print(f"current_probability: {data['current_probability']}")
actions = data["top_3_actions"]
print(f"top_3_actions: {len(actions)} items")
breakdown = data["shap_breakdown"]
print(f"shap_breakdown ({len(breakdown)} items):")
for s in breakdown:
    sv = s["shap_value"]
    sign = "+" if sv >= 0 else ""
    print(f"  {s['label']}: {sign}{sv:.4f} -- {s['reason']}")

# -- STEP 5: Demo MSME B (pre-approved) --
print(f"\n{SEP}")
print("STEP 5: GET /msme/demo-msme-b/score  (pre-approved success state)")
print(SEP)
status, data = api_get("/msme/demo-msme-b/score")
print(f"Status: {status}")
print(f"days_remaining: {data['days_remaining']}")
print(f"current_probability: {data['current_probability']}")
actions = data["top_3_actions"]
print(f"top_3_actions: {len(actions)} items")
breakdown = data["shap_breakdown"]
print(f"shap_breakdown ({len(breakdown)} items):")
for s in breakdown:
    sv = s["shap_value"]
    sign = "+" if sv >= 0 else ""
    print(f"  {s['label']}: {sign}{sv:.4f} -- {s['reason']}")

# -- STEP 6: Verify profiles C, D, E, F --
for label, msme_id in [
    ("Demo C: Compound Risk", "demo-msme-c"),
    ("Demo D: Close to Ready (no EPFO)", "demo-msme-d"),
    ("Demo E: One Blocker", "demo-msme-e"),
    ("Demo F: Seasonal Business", "demo-msme-f")
]:
    print(f"\n{SEP}")
    print(f"STEP 6: POST /msme/connect & GET /score ({label}: {msme_id})")
    print(SEP)
    # Onboard
    status, conn = api_post("/msme/connect", {"msme_id": msme_id, "sources": ["gst","upi","bank","epfo"]})
    print(f"Onboard status: {status}")
    # Get Score
    status, data = api_get(f"/msme/{msme_id}/score")
    print(f"Get score status: {status}")
    print(f"days_remaining: {data['days_remaining']}")
    print(f"current_probability: {data['current_probability']}")
    actions = data["top_3_actions"]
    print(f"top_3_actions ({len(actions)} items):")
    for i, a in enumerate(actions, 1):
        print(f"  {i}. [{a['action_id']}] saves {a['days_saved']} days")
    breakdown = data["shap_breakdown"]
    print(f"shap_breakdown ({len(breakdown)} items):")
    for s in breakdown:
        sv = s["shap_value"]
        sign = "+" if sv >= 0 else ""
        print(f"  {s['label']}: {sign}{sv:.4f} -- {s['reason']}")

# -- STEP 7: Action progressions to Ready State --
print(f"\n{SEP}")
print("STEP 7: Complete all actions on Demo E to test transition to 0 days (Ready State)")
print(SEP)
# Complete concentration blocker
status, d = api_post("/msme/demo-msme-e/action-complete", {"action_id": "top_buyer_concentration_pct"})
print(f"Status: {status}")
print(f"days_remaining after action: {d['days_remaining']} (was 8)")
print(f"current_probability: {d['current_probability']}")

print(f"\n{SEP}")
print("E2E TEST COMPLETE")
print(SEP)
