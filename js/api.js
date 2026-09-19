import { API_URL } from './config.js';

function parse(response) {
  if (!response.ok) throw new Error('HTTP ' + response.status);
  return response.json();
}

export async function fetchClaimedRows(sport) {
  const response = await fetch(API_URL + '?' + new URLSearchParams({ action: 'list', sport }));
  const data = await parse(response);
  return Array.isArray(data && data.rows) ? data.rows : [];
}

export async function submitRequest(payload) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  });
  return parse(response);
}
