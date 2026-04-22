import { useState, useEffect } from 'react';
import * as Icons from './Icons';
import { CATEGORIES } from '../data';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { normalizeReport } from '../utils';

export default function Profile({ isOwn = true, user: propUser, onBack }) {
  const { user: ctxUser, logout, refreshUser } = useAuth();
  const user = isOwn ? ctxUser : propUser;

  const [tab, setTab]           = useState('reportes');
  const [myReports, setMyReports]   = useState([]);
  const [confirmed, setConfirmed]   = useState([]);
  const [loadingReports, setLoadingReports] = useState(isOwn);

  useEffect(() => {
    if (!isOwn) return;
    setLoadingReports(true);
    Promise.all([api.getMyReports(), api.getConfirmedReports()])
      .then(([mine, conf]) => {
        setMyReports(mine.map(normalizeReport));
        setConfirmed(conf.map(normalizeReport));
      })
      .catch(() => {})
      .finally(() => setLoadingReports(false));
  }, [isOwn]);

  if (!user) return null;

  return (
    <div style={{
      height: '100%', background: 'var(--color-bg)',
      display: 'flex', flexDirection: 'column', overflow: 'auto',
    }}>
      <div style={{
        padding: '18px 18px 12px',
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--color-bg)', position: 'sticky', top: 0, zIndex: 2,
      }}>
        {onBack && (
          <button onClick={onBack} style={{
            width: 36, height: 36, borderRadius: 18, background: 'var(--color-surface-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer',
          }}>
            <Icons.ArrowLeft size={18}/>
          </button>
        )}
        <div style={{ flex: 1, fontSize: 16, fontWeight: 700, letterSpacing: -0.3 }}>
          {isOwn ? 'Mi perfil' : 'Perfil'}
        </div>
        {isOwn && (
          <button style={{
            padding: '7px 12px', borderRadius: 999, background: 'var(--color-surface-2)',
            fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
          }}>Editar</button>
        )}
      </div>

      <div style={{ padding: '8px 18px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <div style={{
            width: 68, height: 68, borderRadius: 34, background: user.avatar || '#2E7D5B',
            color: '#fff', fontSize: 22, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            {user.letter || (user.nickname || 'U').slice(0, 2).toUpperCase()}
            {user.official && (
              <div style={{
                position: 'absolute', bottom: -2, right: -2,
                width: 22, height: 22, borderRadius: 11, background: '#2E7D5B',
                border: '2px solid var(--color-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icons.Verified size={12} color="#fff"/>
              </div>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3 }}>
                @{user.nickname}
              </div>
              {user.verified && !user.official && (
                <div style={{
                  fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3,
                  background: 'var(--color-primary-soft)', color: 'var(--color-primary)', letterSpacing: 0.3,
                }}>VERIFICADO</div>
              )}
              {user.official && (
                <div style={{
                  fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3,
                  background: '#E7E6FB', color: '#4F46E5', letterSpacing: 0.3,
                }}>OFICIAL</div>
              )}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-ink-3)', fontFamily: 'monospace', letterSpacing: 0.2, marginTop: 2 }}>
              ID #{user.userId}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-ink-3)', marginTop: 3 }}>
              <Icons.Location size={10} color="var(--color-ink-3)"/> {user.neighborhood} · Desde {user.joined}
            </div>
          </div>
        </div>

        {user.bio && (
          <div style={{ fontSize: 13, color: 'var(--color-ink-2)', lineHeight: 1.5, marginBottom: 14 }}>
            {user.bio}
          </div>
        )}

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
          background: '#fff', border: '1px solid var(--color-line)',
          borderRadius: 14, padding: 12, marginBottom: 14,
        }}>
          {[
            { label: 'Reportes', val: user.stats?.reports ?? 0 },
            { label: 'Confirmaciones', val: user.stats?.confirmations ?? 0 },
            { label: 'Karma', val: user.stats?.karma ?? 0 },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-ink)', letterSpacing: -0.3 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'var(--color-ink-3)', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {user.badges && user.badges.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-ink-3)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 }}>
              Insignias
            </div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {user.badges.map(b => (
                <div key={b.id} style={{
                  minWidth: 110, padding: '10px 12px', borderRadius: 12,
                  background: '#fff', border: '1px solid var(--color-line)', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 22, marginBottom: 2 }}>{b.emoji}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ink)' }}>{b.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--color-ink-3)', marginTop: 2, lineHeight: 1.3 }}>{b.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{
        display: 'flex', borderBottom: '1px solid var(--color-line)',
        padding: '0 18px', gap: 20, background: 'var(--color-bg)',
      }}>
        {[
          { id: 'reportes', label: 'Mis reportes', n: myReports.length },
          { id: 'seguidos', label: 'Seguidos', n: confirmed.length },
          ...(isOwn ? [{ id: 'ajustes', label: 'Ajustes' }] : []),
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '12px 2px',
            background: 'transparent', border: 'none',
            borderBottom: tab === t.id ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: tab === t.id ? 'var(--color-ink)' : 'var(--color-ink-3)',
            fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
          }}>
            {t.label} {t.n != null && <span style={{ color: 'var(--color-ink-3)', fontWeight: 500 }}>{t.n}</span>}
          </button>
        ))}
      </div>

      <div style={{ padding: '14px 18px 100px', flex: 1 }}>
        {tab === 'reportes' && (
          <ReportsTab
            reports={myReports}
            loading={loadingReports}
            empty={isOwn ? 'Aún no has publicado reportes.' : 'Este vecino no tiene reportes públicos.'}
          />
        )}
        {tab === 'seguidos' && (
          <ReportsTab reports={confirmed} loading={loadingReports} empty="Confirma reportes para seguirlos."/>
        )}
        {tab === 'ajustes' && isOwn && (
          <SettingsTab settings={user.settings} onLogout={logout} onSave={s => api.updateMe({ settings: s }).then(() => refreshUser())}/>
        )}
      </div>
    </div>
  );
}

function ReportsTab({ reports, loading, empty }) {
  if (loading) {
    return <div style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--color-ink-3)', fontSize: 13 }}>Cargando…</div>;
  }
  if (!reports.length) {
    return <div style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--color-ink-3)', fontSize: 13 }}>{empty}</div>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {reports.map(r => {
        const cat = CATEGORIES[r.cat];
        if (!cat) return null;
        return (
          <div key={r.id} style={{
            display: 'flex', gap: 10, padding: 12,
            background: '#fff', border: '1px solid var(--color-line)', borderRadius: 14,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, background: cat.soft,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
            }}>{cat.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, marginBottom: 3 }}>{r.title}</div>
              <div style={{ fontSize: 11, color: 'var(--color-ink-3)', display: 'flex', gap: 10 }}>
                <span>{r.time}</span>
                <span>✓ {r.confirmations}</span>
                <span>💬 {r.comments}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SettingsTab({ settings: initSettings, onLogout, onSave }) {
  const [s, setS] = useState(initSettings ?? {
    anon_by_default: false, notif_security: true, notif_replies: true, notif_announcements: false,
  });

  const toggle = (key) => {
    const next = { ...s, [key]: !s[key] };
    setS(next);
    onSave(next);
  };

  const sections = [
    {
      title: 'Notificaciones',
      items: [
        { label: 'Alertas de seguridad',     key: 'notif_security' },
        { label: 'Respuestas a mis reportes', key: 'notif_replies' },
        { label: 'Tianguis y anuncios',       key: 'notif_announcements' },
      ],
    },
    {
      title: 'Privacidad',
      items: [
        { label: 'Modo anónimo por defecto', key: 'anon_by_default' },
      ],
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {sections.map(sec => (
        <div key={sec.title}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-ink-3)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 }}>
            {sec.title}
          </div>
          <div style={{ background: '#fff', border: '1px solid var(--color-line)', borderRadius: 14, overflow: 'hidden' }}>
            {sec.items.map((it, i) => (
              <div key={it.key} onClick={() => toggle(it.key)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                borderTop: i ? '1px solid var(--color-line)' : 'none',
                cursor: 'pointer',
              }}>
                <div style={{ flex: 1, fontSize: 14 }}>{it.label}</div>
                <div style={{
                  width: 38, height: 22, borderRadius: 11,
                  background: s[it.key] ? 'var(--color-primary)' : 'var(--color-line)',
                  position: 'relative', transition: 'background 0.2s',
                }}>
                  <div style={{
                    position: 'absolute', top: 2, left: s[it.key] ? 18 : 2,
                    width: 18, height: 18, borderRadius: 9, background: '#fff',
                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-ink-3)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 }}>
          Soporte
        </div>
        <div style={{ background: '#fff', border: '1px solid var(--color-line)', borderRadius: 14, overflow: 'hidden' }}>
          {['Centro de ayuda', 'Términos y privacidad', 'Reportar un problema'].map((l, i) => (
            <div key={l} style={{
              padding: '12px 14px', borderTop: i ? '1px solid var(--color-line)' : 'none',
              display: 'flex', alignItems: 'center', fontSize: 14,
            }}>
              <span style={{ flex: 1 }}>{l}</span>
              <Icons.Chevron size={16} color="var(--color-ink-3)"/>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onLogout} style={{
        padding: '13px 16px', marginTop: 4, borderRadius: 14,
        background: '#fff', color: '#DC2626',
        border: '1px solid var(--color-line)',
        fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
      }}>
        Cerrar sesión
      </button>
    </div>
  );
}
