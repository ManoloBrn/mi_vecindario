import { useState, useEffect } from 'react';
import * as Icons from './Icons';
import { CATEGORIES } from '../data';
import { Avatar, CategoryChip, Button } from './Shared';
import { api } from '../api';
import { relativeTime } from '../utils';

export function ComposeText({ category, text, setText, onSend, pinned }) {
  const cat = CATEGORIES[category];
  return (
    <div style={{ padding: '18px 18px 24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <CategoryChip cat={category}/>
        <div style={{ fontSize: 12, color: 'var(--color-ink-3)' }}>
          · Álvaro Obregón 132
        </div>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4, marginBottom: 12 }}>
        Escribe el reporte
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={`Describe el/la ${cat.short.toLowerCase()}. Primera línea será el título.`}
        autoFocus
        style={{
          flex: 1, minHeight: 180, padding: 14, borderRadius: 14,
          border: '1px solid var(--color-line)', background: 'var(--color-surface-2)',
          fontSize: 15, fontFamily: 'inherit', lineHeight: 1.5, resize: 'none', outline: 'none',
          color: 'var(--color-ink)',
        }}
      />
      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <Button variant="secondary" icon={<Icons.Camera size={18}/>} style={{ flex: 1 }}>
          Adjuntar foto
        </Button>
        <Button onClick={onSend} disabled={!text.trim()} style={{ flex: 1 }}>
          Publicar
        </Button>
      </div>
    </div>
  );
}

export function ComposeVoice({ category, setCategory, onSend, pinned }) {
  const [phase, setPhase] = useState('ready');
  const [seconds, setSeconds] = useState(0);
  const [levels, setLevels] = useState(Array(24).fill(0.2));
  const [transcript, setTranscript] = useState('');
  const [aiTitle, setAiTitle] = useState('');
  const [aiCat, setAiCat] = useState(category);
  const [aiBody, setAiBody] = useState('');

  useEffect(() => {
    if (phase !== 'recording') return;
    const t = setInterval(() => {
      setSeconds(s => s + 1);
      setLevels(ls => [...ls.slice(1), 0.3 + Math.random() * 0.7]);
    }, 150);
    return () => clearInterval(t);
  }, [phase]);

  const startRec = () => { setPhase('recording'); setSeconds(0); };
  const stopRec = () => {
    setPhase('processing');
    const fullTx = 'Hay un bache enorme aquí en Álvaro Obregón, como a media calle, ya se llevó dos llantas esta semana. Está sobre el carril derecho yendo hacia el poniente, entre Orizaba y Córdoba.';
    let i = 0;
    const step = () => {
      i += 3;
      setTranscript(fullTx.slice(0, i));
      if (i < fullTx.length) setTimeout(step, 30);
      else {
        setTimeout(() => {
          setAiTitle('Bache grande en Álvaro Obregón');
          setAiCat('bache');
          setCategory('bache');
          setAiBody('Bache sobre el carril derecho de Álvaro Obregón, entre Orizaba y Córdoba, dirección poniente. Ya afectó dos llantas esta semana.');
          setPhase('result');
        }, 400);
      }
    };
    setTimeout(step, 400);
  };

  if (phase === 'ready' || phase === 'recording') {
    return (
      <div style={{ padding: '18px 18px 24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <CategoryChip cat={category}/>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 0.3, textTransform: 'uppercase',
            padding: '2px 6px', borderRadius: 4, background: 'var(--color-primary-soft)', color: 'var(--color-primary)',
          }}>IA activa</span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4, marginBottom: 4 }}>
          Cuéntame qué pasa
        </div>
        <div style={{ fontSize: 14, color: 'var(--color-ink-2)', marginBottom: 20, lineHeight: 1.4 }}>
          Habla normal. La IA va a transcribir, clasificar y pre-llenar todo por ti.
        </div>

        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 3, padding: '0 20px', minHeight: 160,
        }}>
          {levels.map((l, i) => (
            <div key={i} style={{
              width: 5, height: phase === 'recording' ? `${l * 100}%` : '18%',
              minHeight: 6, maxHeight: '80%',
              borderRadius: 3, background: phase === 'recording' ? '#DC2626' : 'var(--color-line)',
              transition: 'height 0.15s var(--ease-out)',
            }}/>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            fontSize: 36, fontWeight: 300, fontVariantNumeric: 'tabular-nums',
            color: phase === 'recording' ? '#DC2626' : 'var(--color-ink-3)', letterSpacing: -1,
          }}>
            {`0:${String(seconds).padStart(2, '0')}`}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-ink-3)', marginTop: 4 }}>
            {phase === 'recording' ? 'Grabando... toca para detener' : 'Mantén presionado o toca para grabar'}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 10 }}>
          <button onClick={phase === 'recording' ? stopRec : startRec} style={{
            width: 84, height: 84, borderRadius: 42,
            background: phase === 'recording' ? '#DC2626' : 'var(--color-primary)',
            boxShadow: phase === 'recording' ? '0 0 0 10px rgba(220,38,38,0.2)' : 'var(--shadow-fab)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: phase === 'recording' ? 'recording-pulse 1.2s var(--ease-out) infinite' : 'none',
          }}>
            {phase === 'recording' ? (
              <div style={{ width: 28, height: 28, borderRadius: 6, background: '#fff' }}/>
            ) : (
              <Icons.Mic size={36} color="#fff" stroke={2.2}/>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'processing') {
    return (
      <div style={{ padding: '28px 20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <Icons.Sparkles size={18} color="#2E7D5B"/>
          <div style={{
            fontSize: 13, fontWeight: 600, color: 'var(--color-primary-ink)',
            background: 'linear-gradient(90deg, #2E7D5B 0%, #8B6914 50%, #2E7D5B 100%)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            animation: 'ai-shimmer 1.8s linear infinite',
          }}>Transcribiendo y clasificando...</div>
        </div>
        <div style={{
          padding: 16, background: 'var(--color-surface-2)', borderRadius: 16,
          fontSize: 15, lineHeight: 1.5, color: 'var(--color-ink)', minHeight: 180,
        }}>
          {transcript}
          <span style={{
            display: 'inline-block', width: 2, height: 18, background: '#2E7D5B',
            marginLeft: 2, verticalAlign: 'middle', animation: 'recording-pulse 1s infinite',
          }}/>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 18px 24px', display: 'flex', flexDirection: 'column', gap: 14, height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icons.Sparkles size={16} color="#2E7D5B"/>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary)' }}>
          La IA preparó esto
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-ink-3)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>
          Categoría detectada
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {Object.keys(CATEGORIES).map(k => (
            <CategoryChip key={k} cat={k} selected={aiCat === k} onClick={() => { setAiCat(k); setCategory(k); }}/>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-ink-3)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>
          Título
        </div>
        <input
          value={aiTitle}
          onChange={e => setAiTitle(e.target.value)}
          style={{
            width: '100%', padding: 12, borderRadius: 12,
            border: '1px solid var(--color-line)', background: '#fff',
            fontSize: 15, fontWeight: 600, fontFamily: 'inherit', outline: 'none',
          }}
        />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-ink-3)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>
          Descripción
        </div>
        <textarea
          value={aiBody}
          onChange={e => setAiBody(e.target.value)}
          style={{
            flex: 1, minHeight: 100, padding: 12, borderRadius: 12,
            border: '1px solid var(--color-line)', background: '#fff',
            fontSize: 14, fontFamily: 'inherit', lineHeight: 1.5, resize: 'none', outline: 'none',
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Button variant="ghost" icon={<Icons.Mic size={16}/>} style={{ flex: 1 }}>
          Grabar otra vez
        </Button>
        <Button onClick={onSend} style={{ flex: 1.5 }}>
          Publicar reporte
        </Button>
      </div>
    </div>
  );
}

export function ComposeMedia({ kind, category, onSend }) {
  const [caption, setCaption] = useState('');
  const bg = kind === 'photo' ? '#2B2826' : '#1a1a1a';
  return (
    <div style={{ padding: '18px 18px 24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <CategoryChip cat={category}/>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4, marginBottom: 12 }}>
        {kind === 'photo' ? 'Agregar foto' : 'Grabar video'}
      </div>
      <div style={{
        width: '100%', aspectRatio: '3/4', borderRadius: 18, background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(255,255,255,0.7)', marginBottom: 14, position: 'relative', overflow: 'hidden',
        backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.08) 0%, transparent 50%)',
      }}>
        {kind === 'photo' ? <Icons.Camera size={48} color="rgba(255,255,255,0.7)"/> : <Icons.Video size={48} color="rgba(255,255,255,0.7)"/>}
        <div style={{
          position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
          width: 64, height: 64, borderRadius: 32, background: '#fff',
          border: '4px solid rgba(255,255,255,0.3)', boxShadow: '0 0 0 4px rgba(0,0,0,0.2)',
        }}/>
      </div>
      <input
        value={caption} onChange={e => setCaption(e.target.value)}
        placeholder="Agrega una descripción..."
        style={{
          padding: 12, borderRadius: 12, border: '1px solid var(--color-line)',
          fontSize: 14, fontFamily: 'inherit', outline: 'none', marginBottom: 12,
        }}
      />
      <Button onClick={onSend} style={{ width: '100%' }}>
        Publicar
      </Button>
    </div>
  );
}

export function ReportDetail({ report, onClose }) {
  const cat = CATEGORIES[report.cat];
  const letter = report.author.split(' ').map(w => w[0]).slice(0, 2).join('');
  const [confirmed, setConfirmed]       = useState(report.viewerConfirmed ?? false);
  const [confirmCount, setConfirmCount] = useState(report.confirmations);
  const [flagOpen, setFlagOpen]         = useState(false);
  const [flagged, setFlagged]           = useState(report.viewerDisputed ?? false);
  const [disputeExpanded, setDisputeExpanded] = useState(false);
  const [disputeReasons, setDisputeReasons]   = useState([]);
  const [messages, setMessages]         = useState(report.messages || []);
  const [commentText, setCommentText]   = useState('');

  useEffect(() => { setMessages(report.messages || []); }, [report]);

  const handleConfirm = () => {
    api.confirmReport(report.id)
      .then(res => { setConfirmed(res.confirmed); setConfirmCount(res.confirmation_count); })
      .catch(() => {});
    // optimistic toggle
    setConfirmed(c => !c);
    setConfirmCount(n => confirmed ? n - 1 : n + 1);
  };

  const handleFlagOpen = () => {
    if (flagged) return;
    api.getDisputeReasons().then(setDisputeReasons).catch(() => {});
    setFlagOpen(true);
  };

  const handleDispute = (reasonId) => {
    api.disputeReport(report.id, reasonId)
      .then(() => { setFlagged(true); setFlagOpen(false); })
      .catch(() => setFlagOpen(false));
    setFlagged(true); setFlagOpen(false);
  };

  const handleComment = () => {
    const body = commentText.trim();
    if (!body) return;
    api.addComment(report.id, body)
      .then(c => setMessages(ms => [...ms, {
        a: c.author.nickname, c: c.author.avatar_color, t: c.body, time: relativeTime(c.created_at),
      }]))
      .catch(() => {});
    setCommentText('');
  };

  return (
    <div style={{ padding: '8px 18px 120px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <Avatar color={report.avatar} letter={letter} size={44} official={report.official}/>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{report.author}</span>
            {report.verified && <div style={{
              fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3,
              background: 'var(--color-primary-soft)', color: 'var(--color-primary)', letterSpacing: 0.3,
            }}>VERIFICADO</div>}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-ink-3)' }}>{report.time} · Álvaro Obregón 132</div>
        </div>
        <CategoryChip cat={report.cat} small/>
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.25, marginBottom: 8 }}>
        {report.urgent && <span style={{ color: '#DC2626', marginRight: 6 }}>●</span>}
        {report.title}
      </div>
      <div style={{ fontSize: 15, color: 'var(--color-ink-2)', lineHeight: 1.5, marginBottom: 14 }}>
        {report.body}
      </div>
      {report.photo && (
        <div style={{
          width: '100%', height: 220, borderRadius: 14, marginBottom: 14,
          background: report.photo, backgroundImage: `linear-gradient(135deg, ${report.photo}, ${report.photo}cc)`,
        }}/>
      )}

      {report.disputes && (
        <div style={{
          border: '1px solid #F5C97A', background: '#FEF6E4',
          borderRadius: 14, padding: '12px 14px', marginBottom: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: disputeExpanded ? 10 : 4 }}>
            <Icons.Alert size={16} color="#B45309"/>
            <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#7C4A03' }}>
              {report.disputes.count} denuncia{report.disputes.count !== 1 ? 's' : ''} · {report.disputes.status}
            </div>
            <button onClick={() => setDisputeExpanded(e => !e)} style={{
              fontSize: 12, fontWeight: 600, color: '#7C4A03',
              background: 'transparent', border: 'none', padding: 4, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              {disputeExpanded ? 'Ocultar' : 'Ver detalles'}
            </button>
          </div>
          {!disputeExpanded && (
            <div style={{ fontSize: 12, color: '#7C4A03', lineHeight: 1.4 }}>
              Este reporte fue denunciado por vecinos. Léelo con criterio.
            </div>
          )}
          {disputeExpanded && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {report.disputes.reasons.map((r, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  fontSize: 12, color: '#7C4A03',
                  padding: '6px 10px', background: 'rgba(180,83,9,0.08)', borderRadius: 8,
                }}>
                  <span>{r.label}</span>
                  <span style={{ fontWeight: 700 }}>{r.count}</span>
                </div>
              ))}
              <div style={{ fontSize: 11, color: '#7C4A03', opacity: 0.8, marginTop: 4, lineHeight: 1.4 }}>
                Un moderador revisará este reporte. Si es falso o dañino será removido.
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{
        display: 'flex', gap: 8, paddingBottom: 14,
        borderBottom: '1px solid var(--color-line)', marginBottom: 14,
      }}>
        <button onClick={handleConfirm} style={{
          flex: 1, padding: '10px 12px', borderRadius: 12,
          background: confirmed ? 'var(--color-primary)' : 'var(--color-primary-soft)',
          color: confirmed ? '#fff' : 'var(--color-primary-ink)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          fontSize: 13, fontWeight: 600,
        }}>
          <Icons.Check size={16}/>
          {confirmed ? 'Confirmado' : 'Confirmar'} · {confirmCount}
        </button>
        <button style={{
          padding: '10px 12px', borderRadius: 12,
          background: 'var(--color-surface-2)', color: 'var(--color-ink-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          fontSize: 13, fontWeight: 600,
        }}>
          <Icons.Message size={16}/>
          {report.messages != null ? messages.length : report.comments}
        </button>
        <button
          onClick={handleFlagOpen}
          style={{
            padding: '10px 12px', borderRadius: 12,
            background: flagged ? '#FEE2E2' : 'transparent',
            border: `1px solid ${flagged ? '#FCA5A5' : 'var(--color-line)'}`,
            color: flagged ? '#B91C1C' : 'var(--color-ink-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontSize: 13, fontWeight: 600,
          }}>
          <Icons.Flag size={16}/>
          {(report.disputes?.count || 0) + (flagged && !report.viewerDisputed ? 1 : 0)}
        </button>
        <button style={{
          padding: '10px 12px', borderRadius: 12,
          background: 'var(--color-surface-2)', color: 'var(--color-ink-2)',
        }}>
          <Icons.Share size={16}/>
        </button>
      </div>

      {flagOpen && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(26,30,28,0.5)', zIndex: 50,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }} onClick={() => setFlagOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', background: '#fff',
            borderTopLeftRadius: 20, borderTopRightRadius: 20,
            padding: '18px 18px 22px',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Denunciar reporte</div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-3)', marginBottom: 14, lineHeight: 1.4 }}>
              ¿Por qué crees que este reporte no debería estar aquí?
            </div>
            {disputeReasons.map(r => (
              <button key={r.id}
                onClick={() => handleDispute(r.id)}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '12px 14px', marginBottom: 6,
                  borderRadius: 12, background: 'var(--color-surface-2)',
                  fontSize: 14, color: 'var(--color-ink)', fontFamily: 'inherit',
                  border: '1px solid transparent', cursor: 'pointer',
                }}>
                {r.label}
              </button>
            ))}
            {disputeReasons.length === 0 && (
              <div style={{ padding: '12px 0', color: 'var(--color-ink-3)', fontSize: 13 }}>Cargando razones…</div>
            )}
            <button onClick={() => setFlagOpen(false)} style={{
              width: '100%', padding: 12, marginTop: 6,
              borderRadius: 12, background: 'transparent',
              fontSize: 14, fontWeight: 600, color: 'var(--color-ink-3)', fontFamily: 'inherit',
            }}>Cancelar</button>
          </div>
        </div>
      )}

      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ink-3)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        Mensajes
        <span style={{ color: 'var(--color-ink-3)', fontWeight: 500 }}>· {report.messages != null ? messages.length : report.comments}</span>
      </div>
      {messages.length === 0 && report.messages != null && (
        <div style={{ fontSize: 13, color: 'var(--color-ink-3)', textAlign: 'center', padding: '16px 0 8px' }}>
          Sin comentarios aún. Sé el primero.
        </div>
      )}
      {messages.map((c, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <Avatar color={c.c} letter={c.a[0]} size={28}/>
          <div style={{ flex: 1, background: 'var(--color-surface-2)', padding: '8px 12px', borderRadius: 12, borderTopLeftRadius: 4 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{c.a}</div>
              {c.time && <div style={{ fontSize: 10, color: 'var(--color-ink-3)' }}>{c.time}</div>}
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-2)', lineHeight: 1.4 }}>{c.t}</div>
          </div>
        </div>
      ))}

      <div style={{
        display: 'flex', gap: 8, alignItems: 'center',
        padding: '10px 12px', marginTop: 8,
        background: 'var(--color-surface-2)', borderRadius: 999,
      }}>
        <input
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleComment()}
          placeholder="Escribe un mensaje..."
          style={{
            flex: 1, border: 'none', background: 'transparent',
            fontSize: 13, fontFamily: 'inherit', outline: 'none',
          }}
        />
        <button onClick={handleComment} style={{
          background: commentText.trim() ? 'var(--color-primary)' : 'var(--color-line)', color: '#fff',
          width: 32, height: 32, borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icons.Share size={14} color="#fff"/>
        </button>
      </div>
    </div>
  );
}
