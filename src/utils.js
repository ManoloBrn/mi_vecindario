/**
 * Convierte una fecha ISO a texto relativo: "hace 2 h", "hace 30 min", etc.
 */
export function relativeTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)   return 'ahora';
  if (mins  < 60)  return `hace ${mins} min`;
  if (hours < 24)  return `hace ${hours} h`;
  if (days  < 7)   return `hace ${days} día${days > 1 ? 's' : ''}`;
  return new Date(isoString).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

/**
 * Transforma el formato de la API al formato que esperan los componentes.
 * API:        { author: { nickname, avatar_color, letter }, category: { slug, ... }, ... }
 * Componente: { author: 'MarisolR', avatar: '#F4A261', cat: 'bache', ... }
 */
export function normalizeReport(r) {
  return {
    id:            r.id,
    cat:           r.category.slug,
    lat:           r.lat,
    lng:           r.lng,
    address_hint:  r.address_hint,
    title:         r.title,
    body:          r.body,
    author:        r.is_anonymous ? 'Anónimo' : (r.author.nickname ?? 'Vecino'),
    avatar:        r.author.avatar_color ?? '#6C757D',
    letter:        r.author.letter ?? 'A',
    official:      r.author.is_official ?? false,
    verified:      r.is_verified,
    urgent:        r.is_urgent,
    time:          relativeTime(r.created_at),
    confirmations: r.confirmation_count,
    comments:      r.comment_count,
    status:        r.status,
    disputes:      r.disputes_summary ?? null,
    messages:      r.comments?.map(c => ({
      a: c.is_anonymous ? 'Anónimo' : c.author.nickname,
      c: c.author.avatar_color ?? '#6C757D',
      t: c.body,
      time: relativeTime(c.created_at),
    })) ?? undefined,
    // flags para el viewer autenticado
    viewerConfirmed: r.viewer_confirmed ?? false,
    viewerDisputed:  r.viewer_disputed  ?? false,
  };
}

/**
 * Transforma el usuario de la API al formato que usa Profile.
 */
export function normalizeUser(u) {
  return {
    ...u,
    userId:       u.public_id,
    letter:       u.letter ?? (u.nickname ?? 'U').slice(0, 2).toUpperCase(),
    avatar:       u.avatar_color,
    official:     u.is_official ?? false,
    verified:     u.is_verified ?? false,
    neighborhood: u.neighborhood?.name ?? '',
    joined:       u.joined_at
      ? new Date(u.joined_at).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
      : '',
    stats: u.stats ?? { reports: 0, confirmations: 0, karma: 0 },
    badges: (u.badges ?? []).map(b => ({
      id:    b.slug,
      label: b.label,
      emoji: b.emoji,
      desc:  b.description,
    })),
    followedCategories: u.followed_categories ?? [],
    settings: u.settings ?? { anon_by_default: false, notif_security: true, notif_replies: true, notif_announcements: false },
  };
}
