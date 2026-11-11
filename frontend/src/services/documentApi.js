const API_PREFIX = '/api';
const USER_ID = 'usuario-local';

async function request(path, options = {}) {
  const headers = new Headers(options.headers);
  headers.set('X-User-Id', USER_ID);

  const response = await fetch(`${API_PREFIX}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error?.message || 'Não foi possível concluir a solicitação.');
  }

  return response;
}

export async function listDocuments(signal) {
  const response = await request('/documents', { signal });
  const payload = await response.json();
  return payload.data;
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await request('/upload', {
    method: 'POST',
    body: formData,
  });
  const payload = await response.json();
  return payload.data;
}

export async function downloadDocument(id) {
  const response = await request(`/documents/${encodeURIComponent(id)}/download`);
  return response.blob();
}