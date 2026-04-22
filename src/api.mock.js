import {
  MOCK_USERS_BY_PHONE, MOCK_REPORTS_SOURCE,
  MOCK_CATEGORIES_LIST, MOCK_NEIGHBORHOODS, MOCK_DISPUTE_REASONS,
} from './mockData';

const DEMO_OTP   = '123456';
const USER_KEY   = 'mv_demo_user';

// Deep-copy source so mutations stay in-memory and don't affect the original
let _reports = MOCK_REPORTS_SOURCE.map(r => ({ ...r, comments: [...r.comments] }));
let _nextId  = 200;

const wait = (ms = 350) => new Promise(r => setTimeout(r, ms));

function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw || raw === 'null') {
    const err = new Error('No autenticado');
    err.status = 401;
    throw err;
  }
  return JSON.parse(raw);
}

export const mockApi = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  requestOtp: async (phone) => {
    await wait(700);
    return { message: 'Código enviado', demo_otp: DEMO_OTP };
  },

  verifyOtp: async (phone, otp) => {
    await wait(800);
    if (otp !== DEMO_OTP) {
      const err = new Error('Código inválido o expirado');
      err.status = 401;
      throw err;
    }
    const user = MOCK_USERS_BY_PHONE[phone] ?? null;
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return { token: 'demo-token', user, needs_setup: false };
    }
    return { token: `demo-new:${phone}`, needs_setup: true };
  },

  setupProfile: async (nickname, avatar_color) => {
    await wait(600);
    const newUser = {
      id: 99,
      public_id: String(Math.floor(10000 + Math.random() * 90000)),
      nickname,
      avatar_color,
      letter: nickname.slice(0, 2).toUpperCase(),
      bio: null,
      neighborhood: { id: 1, slug: 'roma-norte', name: 'Roma Norte', city: 'Ciudad de México', state: 'CDMX' },
      joined_at: new Date().toISOString(),
      is_verified: false, is_official: false, is_organization: false,
      stats: { reports: 0, confirmations: 0, karma: 0 },
      badges: [],
      settings: { anon_by_default: false, notif_security: true, notif_replies: true, notif_announcements: false },
      followed_categories: [],
    };
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    return { token: 'demo-token', user: newUser };
  },

  getMe: async () => {
    await wait(200);
    return getStoredUser();
  },

  // ── Catálogos ─────────────────────────────────────────────────────────────
  getCategories:     async () => { await wait(100); return MOCK_CATEGORIES_LIST; },
  getNeighborhoods:  async () => { await wait(100); return MOCK_NEIGHBORHOODS; },
  getDisputeReasons: async () => { await wait(100); return MOCK_DISPUTE_REASONS; },

  // ── Reportes ──────────────────────────────────────────────────────────────
  getReports: async () => {
    await wait(450);
    const visible = _reports.filter(r => r.status !== 'removed');
    return { reports: visible, total: visible.length };
  },

  getReport: async (id) => {
    await wait(300);
    const report = _reports.find(r => r.id === id);
    if (!report) {
      const err = new Error('Reporte no encontrado');
      err.status = 404;
      throw err;
    }
    return { ...report, viewer_confirmed: report._confirmed ?? false, viewer_disputed: report._disputed ?? false };
  },

  createReport: async (data) => {
    await wait(600);
    const user    = getStoredUser();
    const catObj  = MOCK_CATEGORIES_LIST.find(c => c.slug === data.category) ?? MOCK_CATEGORIES_LIST[0];
    const newReport = {
      id:     _nextId++,
      category: catObj,
      lat: data.lat, lng: data.lng,
      address_hint: data.address_hint ?? 'Roma Norte',
      title: data.title,
      body:  data.body ?? '',
      author: { id: user.id, nickname: user.nickname, avatar_color: user.avatar_color, letter: user.letter, is_verified: user.is_verified, is_official: user.is_official ?? false },
      is_anonymous: data.is_anonymous ?? false,
      is_verified: false, is_urgent: data.is_urgent ?? false,
      status: 'active',
      created_at: new Date().toISOString(),
      confirmation_count: 0, comment_count: 0, dispute_count: 0,
      media: [], comments: [],
    };
    _reports = [newReport, ..._reports];
    return newReport;
  },

  updateReport:  async (id, data) => { await wait(300); _reports = _reports.map(r => r.id === id ? { ...r, ...data } : r); return _reports.find(r => r.id === id); },
  deleteReport:  async (id)       => { await wait(300); _reports = _reports.filter(r => r.id !== id); return null; },

  confirmReport: async (id) => {
    await wait(300);
    const r = _reports.find(r => r.id === id);
    if (!r) throw new Error('Reporte no encontrado');
    r._confirmed = !r._confirmed;
    r.confirmation_count += r._confirmed ? 1 : -1;
    return { confirmed: r._confirmed, confirmation_count: r.confirmation_count };
  },

  disputeReport: async (id, reason_id) => {
    await wait(300);
    const r = _reports.find(r => r.id === id);
    if (r) { r.dispute_count = (r.dispute_count ?? 0) + 1; r._disputed = true; }
    return { dispute_count: r?.dispute_count ?? 1, status: r?.status ?? 'active' };
  },

  addComment: async (id, body, anon) => {
    await wait(400);
    const user    = getStoredUser();
    const report  = _reports.find(r => r.id === id);
    const comment = {
      id: _nextId++,
      author: { id: user.id, nickname: user.nickname, avatar_color: user.avatar_color, letter: user.letter, is_verified: user.is_verified },
      body,
      is_anonymous: anon ?? false,
      created_at: new Date().toISOString(),
    };
    if (report) {
      report.comments = [...(report.comments ?? []), comment];
      report.comment_count = report.comments.length;
    }
    return comment;
  },

  // ── Usuarios ──────────────────────────────────────────────────────────────
  getUser: async (id) => {
    await wait(300);
    const found = Object.values(MOCK_USERS_BY_PHONE).find(u => u.id === id);
    return found ?? getStoredUser();
  },

  updateMe: async (data) => {
    await wait(400);
    const user    = getStoredUser();
    const updated = { ...user, ...data };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    return updated;
  },

  getMyReports: async () => {
    await wait(300);
    const user = getStoredUser();
    const mine = _reports.filter(r => !r.is_anonymous && r.author?.id === user.id);
    // For demo users show a subset of reports if they have none authored
    return mine.length ? mine : _reports.filter(r => [1, 2].includes(r.id));
  },

  getConfirmedReports: async () => {
    await wait(300);
    return _reports.filter(r => [1, 3, 6].includes(r.id));
  },

  updateFollowedCategories: async (categories) => {
    await wait(300);
    const user    = getStoredUser();
    const updated = { ...user, followed_categories: categories };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    return updated;
  },
};
