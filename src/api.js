const BASE = 'http://localhost:8000';

function getToken() {
  return localStorage.getItem('mv_token');
}

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  // ── Auth ────────────────────────────────────────────────────────────────
  requestOtp:   (phone)                   => request('POST', '/api/auth/request-otp', { phone }),
  verifyOtp:    (phone, otp)              => request('POST', '/api/auth/verify-otp',  { phone, otp }),
  setupProfile: (nickname, avatar_color)  => request('POST', '/api/auth/setup-profile', { nickname, avatar_color }),
  getMe:        ()                        => request('GET',  '/api/auth/me'),

  // ── Catálogos ────────────────────────────────────────────────────────────
  getCategories:     () => request('GET', '/api/categories'),
  getNeighborhoods:  () => request('GET', '/api/neighborhoods'),
  getDisputeReasons: () => request('GET', '/api/dispute-reasons'),

  // ── Reportes ─────────────────────────────────────────────────────────────
  getReports: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
    ).toString();
    return request('GET', `/api/reports${qs ? '?' + qs : ''}`);
  },
  getReport:     (id)             => request('GET',    `/api/reports/${id}`),
  createReport:  (data)           => request('POST',   '/api/reports', data),
  updateReport:  (id, data)       => request('PUT',    `/api/reports/${id}`, data),
  deleteReport:  (id)             => request('DELETE', `/api/reports/${id}`),
  confirmReport: (id)             => request('POST',   `/api/reports/${id}/confirm`),
  disputeReport: (id, reason_id)  => request('POST',   `/api/reports/${id}/dispute`, { reason_id }),
  addComment:    (id, body, anon) => request('POST',   `/api/reports/${id}/comments`, { body, is_anonymous: anon ?? false }),

  // ── Usuarios ─────────────────────────────────────────────────────────────
  getUser:                  (id)          => request('GET', `/api/users/${id}`),
  updateMe:                 (data)        => request('PUT', '/api/users/me', data),
  getMyReports:             ()            => request('GET', '/api/users/me/reports'),
  getConfirmedReports:      ()            => request('GET', '/api/users/me/confirmed-reports'),
  updateFollowedCategories: (categories)  => request('PUT', '/api/users/me/followed-categories', { categories }),
};
