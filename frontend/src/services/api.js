const API_BASE_URL = "http://127.0.0.1:8000";

/**
 * Connects an MSME by validating the ID and linking data sources.
 * POST /msme/connect
 * Request:  { msme_id: string, sources: string[] }
 * Response: { msme_id, connected_sources, business_name, discipline_level, has_employees }
 */
export async function connectMsme(msmeId, sources) {
  const response = await fetch(`${API_BASE_URL}/msme/connect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ msme_id: msmeId, sources }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || `Connection failed (${response.status})`);
  }

  return response.json();
}

/**
 * Fetches the credit readiness score, countdown, recommendations,
 * and SHAP explanation breakdown for a given MSME.
 */
export async function getMsmeScore(msmeId) {
  const response = await fetch(`${API_BASE_URL}/msme/${msmeId}/score`);
  if (!response.ok) {
    throw new Error(`Failed to fetch score for MSME ${msmeId}`);
  }
  return response.json();
}

/**
 * Submits an action-complete request to simulate optimizing a credit parameter.
 * Re-runs the scoring pipeline and returns the updated countdown/actions.
 */
export async function completeAction(msmeId, actionId) {
  const response = await fetch(`${API_BASE_URL}/msme/${msmeId}/action-complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action_id: actionId }),
  });
  
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to complete action: ${errText || response.statusText}`);
  }
  
  return response.json();
}

/**
 * Generates and fetches the S3 presigned URL for the MSME credit health PDF report.
 * GET /msme/{msme_id}/report
 */
export async function getMsmeReport(msmeId) {
  const response = await fetch(`${API_BASE_URL}/msme/${msmeId}/report`);
  if (!response.ok) {
    throw new Error(`Failed to generate credit report for MSME ${msmeId}`);
  }
  return response.json();
}

/**
 * Simulates a hypothetical score by providing custom, non-persistent features.
 * POST /msme/{msme_id}/simulate
 */
export async function simulateScore(msmeId, simulatedFeatures) {
  const response = await fetch(`${API_BASE_URL}/msme/${msmeId}/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ features: simulatedFeatures }),
  });
  
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Simulation failed: ${errText || response.statusText}`);
  }
  
  return response.json();
}

/**
 * Fetches the generated financial story narrative for a given MSME.
 * GET /msme/{msme_id}/story
 */
export async function getMsmeStory(msmeId) {
  const response = await fetch(`${API_BASE_URL}/msme/${msmeId}/story`);
  if (!response.ok) {
    throw new Error(`Failed to fetch story for MSME ${msmeId}`);
  }
  return response.json();
}


