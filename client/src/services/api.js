const API_BASE = '/api';

export async function fetchScenarios() {
  const res = await fetch(`${API_BASE}/scenarios`);
  if (!res.ok) throw new Error('Failed to load scenarios');
  return res.json();
}

export async function fetchScenario(id) {
  const res = await fetch(`${API_BASE}/scenarios/${id}`);
  if (!res.ok) throw new Error(`Failed to load scenario ${id}`);
  return res.json();
}

export async function scanEnvironment(payload) {
  const res = await fetch(`${API_BASE}/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to scan environment');
  }
  return res.json();
}

export async function syncEnvironment(payload) {
  const res = await fetch(`${API_BASE}/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to sync environment');
  }
  return res.json();
}

export async function uploadAndScanEnv(file, scenarioId) {
  const formData = new FormData();
  formData.append('envFile', file);
  if (scenarioId) {
    formData.append('scenarioId', scenarioId);
  }

  const res = await fetch(`${API_BASE}/upload-env`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to upload and scan .env file');
  }
  return res.json();
}

export async function executeCliCommand(payload) {
  const res = await fetch(`${API_BASE}/cli/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to execute CLI command');
  }
  return res.json();
}

export async function fetchCliCommands() {
  const res = await fetch(`${API_BASE}/cli/commands`);
  if (!res.ok) throw new Error('Failed to load CLI commands');
  return res.json();
}

export async function fetchEnvironments() {
  const res = await fetch(`${API_BASE}/manager/environments`);
  if (!res.ok) throw new Error('Failed to load sample environments');
  return res.json();
}

export async function compareEnvironments(payload) {
  const res = await fetch(`${API_BASE}/manager/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to compare environments');
  }
  return res.json();
}

export async function fetchPackageInfo() {
  const res = await fetch(`${API_BASE}/package/info`);
  if (!res.ok) throw new Error('Failed to load package info');
  return res.json();
}
