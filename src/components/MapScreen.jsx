import { useState, useEffect } from 'react';
import * as Icons from './Icons';
import { CATEGORIES, USER_LOCATION } from '../data';
import MapView from './MapView';
import { GlassButton, BottomSheet, Button, CategoryChip, Avatar } from './Shared';
import { ReportDetail } from './Compose';
import { api } from '../api';
import { normalizeReport } from '../utils';

function ReviewForm({ aiResult, setAiResult }) {
  const [catOpen, setCatOpen] = useState(false);
  const currentCat = CATEGORIES[aiResult.cat];
  return (
    <>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-ink-3)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>
          Título
        </div>
        <input value={aiResult.title} onChange={e => setAiResult({ ...aiResult, title: e.target.value })}
          style={{
            width: '100%', padding: 12, borderRadius: 12,
            border: '1px solid var(--color-line)', background: '#fff',
            fontSize: 15, fontWeight: 600, fontFamily: 'inherit', outline: 'none',
          }}/>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-ink-3)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
          Categoría
          {!catOpen && (
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 3,
              background: 'var(--color-primary-soft)', color: 'var(--color-primary)',
              textTransform: 'uppercase', letterSpacing: 0.3,
            }}>Detectada</span>
          )}
        </div>
        {!catOpen ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 12px', borderRadius: 999,
              background: currentCat.color, border: `1.5px solid ${currentCat.color}`,
              fontSize: 14, fontWeight: 600, color: '#fff',
            }}>
              <span style={{ fontSize: 15 }}>{currentCat.emoji}</span>
              {currentCat.label}
            </div>
            <button onClick={() => setCatOpen(true)} style={{
              background: 'transparent', border: 'none', padding: '6px 4px',
              fontSize: 13, fontWeight: 600, color: 'var(--color-primary)',
              cursor: 'pointer', fontFamily: 'inherit',
            }}>Cambiar</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.keys(CATEGORIES).map(k => (
              <CategoryChip key={k} cat={k} selected={aiResult.cat === k}
                onClick={() => { setAiResult({ ...aiResult, cat: k }); setCatOpen(false); }}/>
            ))}
          </div>
        )}
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-ink-3)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>
          Descripción
        </div>
        <textarea value={aiResult.body} onChange={e => setAiResult({ ...aiResult, body: e.target.value })}
          style={{
            width: '100%', minHeight: 100, padding: 12, borderRadius: 12,
            border: '1px solid var(--color-line)', background: '#fff',
            fontSize: 14, fontFamily: 'inherit', lineHeight: 1.5, resize: 'none', outline: 'none',
          }}/>
      </div>
    </>
  );
}

export default function MapScreen({ onProfile }) {
  const [userLoc, setUserLoc] = useState(USER_LOCATION);
  const [reports, setReports] = useState([]);
  const [mode, setMode] = useState('map');
  const [methodsOpen, setMethodsOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [levels, setLevels] = useState(Array(48).fill(0.2));
  const [transcript, setTranscript] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [pinned, setPinned] = useState(null);
  const [centered, setCentered] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [detailSnap, setDetailSnap] = useState('mid');

  const filteredReports = activeFilter === 'all' ? reports : reports.filter(r => r.cat === activeFilter);

  // use fixed CDMX demo location instead of real geolocation
  useEffect(() => {
    setCentered({ ...USER_LOCATION, zoom: 16 });
    loadReports(USER_LOCATION);
  }, []);

  const loadReports = (loc) => {
    api.getReports({ lat: loc.lat, lng: loc.lng, radius_km: 5 })
      .then(data => setReports((data.reports ?? []).map(normalizeReport)))
      .catch(() => {});
  };

  useEffect(() => {
    if (mode !== 'recording') return;
    const t = setInterval(() => {
      setSeconds(s => s + 1);
      setLevels(ls => [...ls.slice(1), 0.25 + Math.random() * 0.75]);
    }, 120);
    return () => clearInterval(t);
  }, [mode]);

  const startRec = () => {
    setMode('recording'); setSeconds(0); setTranscript(''); setAiResult(null);
    setPinned(userLoc);
  };

  const stopRec = () => {
    setMode('processing');
    const fullTx = 'Se acaba de fundir la luminaria que está afuera del parque, en esta esquina. Desde anoche no prende y se siente inseguro caminar de regreso a casa.';
    let i = 0;
    const step = () => {
      i += 4;
      setTranscript(fullTx.slice(0, i));
      if (i < fullTx.length) setTimeout(step, 28);
      else {
        setTimeout(() => {
          setAiResult({
            cat: 'alumbrado',
            title: 'Luminaria fundida cerca del parque',
            body: 'Luminaria apagada desde anoche en esta esquina, junto al parque. Afecta seguridad para quienes caminan de vuelta a casa.',
            confidence: 0.92,
          });
          setMode('review');
        }, 500);
      }
    };
    setTimeout(step, 400);
  };

  const publish = () => {
    api.createReport({
      category: aiResult.cat,
      lat: pinned.lat, lng: pinned.lng,
      title: aiResult.title, body: aiResult.body,
    }).then(raw => {
      const r = normalizeReport(raw);
      setReports(rs => [r, ...rs]);
      setMode('sent');
      setTimeout(() => {
        setMode('map'); setPinned(null); setAiResult(null); setTranscript(''); setSeconds(0);
        setCentered({ lat: r.lat, lng: r.lng, zoom: 17 });
      }, 1800);
    }).catch(() => {
      setMode('sent');
      setTimeout(() => {
        setMode('map'); setPinned(null); setAiResult(null); setTranscript(''); setSeconds(0);
      }, 1800);
    });
  };

  const handleTapPin = (r) => {
    setMode('detail');
    setDetailSnap('mid');
    setCentered({ lat: r.lat - 0.0012, lng: r.lng, zoom: 17 });
    // fetch full report with comments
    api.getReport(r.id)
      .then(raw => setSelectedReport(normalizeReport(raw)))
      .catch(() => setSelectedReport(r));
    setSelectedReport(r); // optimistic
  };

  const cancel = () => {
    setMode('map'); setAiResult(null); setTranscript(''); setPinned(null); setSelectedReport(null);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <MapView
        reports={filteredReports} userLoc={userLoc}
        onTapPin={handleTapPin}
        droppedPin={['recording', 'processing', 'review'].includes(mode) ? pinned : null}
        centered={centered} highlightedId={selectedReport?.id}
        mapStyle="carto-voyager"
      />

      {/* Top bar */}
      {mode === 'map' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
          padding: 'env(safe-area-inset-top, 14px) 14px 10px',
          paddingTop: 'max(env(safe-area-inset-top), 14px)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0) 100%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: 'var(--color-ink-3)', fontWeight: 500 }}>MI VECINDARIO</div>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.3 }}>Roma Norte</div>
            </div>
            <GlassButton size={40} onClick={onProfile}>
              <Icons.User size={18} color="#1A1E1C"/>
            </GlassButton>
            <GlassButton size={40}>
              <Icons.Bell size={18} color="#1A1E1C"/>
            </GlassButton>
          </div>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
            <button onClick={() => setActiveFilter('all')} style={{
              padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: activeFilter === 'all' ? 'var(--color-ink)' : 'rgba(255,255,255,0.85)',
              color: activeFilter === 'all' ? '#fff' : 'var(--color-ink-2)', flexShrink: 0,
              boxShadow: 'var(--shadow-card)',
            }}>Todo · {reports.length}</button>
            {Object.keys(CATEGORIES).map(k => {
              const c = CATEGORIES[k];
              const n = reports.filter(r => r.cat === k).length;
              return (
                <button key={k} onClick={() => setActiveFilter(k)} style={{
                  padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                  background: activeFilter === k ? c.color : 'rgba(255,255,255,0.85)',
                  color: activeFilter === k ? '#fff' : c.color, flexShrink: 0,
                  boxShadow: 'var(--shadow-card)', display: 'inline-flex', alignItems: 'center', gap: 5,
                }}>
                  <span>{c.emoji}</span>{c.short}{n > 0 && ` · ${n}`}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom mic bar */}
      {mode === 'map' && (
        <>
          <div style={{
            position: 'absolute', bottom: 160, left: 14, right: 14, zIndex: 30,
            padding: '10px 14px', borderRadius: 18,
            background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{ display: 'flex' }}>
              {reports.slice(0, 3).map((r) => (
                <Avatar key={r.id} color={r.avatar} letter={r.author[0]} size={26}/>
              ))}
            </div>
            <div style={{ flex: 1, fontSize: 12, color: 'var(--color-ink-2)', lineHeight: 1.3 }}>
              <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>{reports.length} vecinos</span> han reportado cerca de ti
            </div>
            <Icons.Chevron size={14} color="#8B8F8C"/>
          </div>

          {methodsOpen && (
            <div className="fade-in" style={{
              position: 'absolute', bottom: 234, right: 14, zIndex: 38,
              display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end',
            }}>
              {[
                { id: 'photo', icon: <Icons.Camera size={20}/>, label: 'Foto' },
                { id: 'video', icon: <Icons.Video size={20}/>, label: 'Video' },
                { id: 'text',  icon: <Icons.Text size={20}/>,  label: 'Escribir' },
              ].map(m => (
                <button key={m.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px 8px 8px',
                  borderRadius: 28, background: 'rgba(255,255,255,0.98)',
                  backdropFilter: 'blur(12px)', boxShadow: 'var(--shadow-card)',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 20,
                    background: 'var(--color-primary-soft)', color: 'var(--color-primary-ink)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{m.icon}</div>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{m.label}</span>
                </button>
              ))}
            </div>
          )}

          <div style={{
            position: 'absolute', bottom: 80,
            left: 14, right: 14, zIndex: 40,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <GlassButton size={56} onClick={() => setCentered({ lat: userLoc.lat, lng: userLoc.lng, zoom: 16 })}>
              <Icons.Crosshair size={22} color="#2E7D5B"/>
            </GlassButton>

            <button onTouchStart={startRec} onClick={startRec} style={{
              flex: 1, height: 68, borderRadius: 34,
              background: 'var(--color-primary)', color: '#fff',
              boxShadow: 'var(--shadow-fab)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', left: 8, top: 8, width: 52, height: 52, borderRadius: 26,
                background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icons.Mic size={26} color="#fff" stroke={2.3}/>
              </div>
              <div style={{ textAlign: 'left', marginLeft: 50 }}>
                <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.2 }}>Reportar con voz</div>
                <div style={{ fontSize: 11, opacity: 0.85, marginTop: 1 }}>Presiona y cuéntame qué pasa</div>
              </div>
              <div style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                padding: '3px 7px', borderRadius: 4, background: 'rgba(255,255,255,0.25)',
                fontSize: 9, fontWeight: 700, letterSpacing: 0.3,
              }}>IA</div>
            </button>

            <GlassButton size={56} onClick={() => setMethodsOpen(o => !o)}>
              {methodsOpen ? <Icons.Close size={22} color="#1A1E1C"/> : <Icons.Plus size={22} color="#1A1E1C"/>}
            </GlassButton>
          </div>
        </>
      )}

      {/* Recording overlay */}
      {mode === 'recording' && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50,
          background: 'linear-gradient(180deg, rgba(220,38,38,0.05) 0%, rgba(220,38,38,0.25) 100%)',
          backdropFilter: 'blur(2px)',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: '0 0 40px',
        }}>
          <div style={{ padding: '0 20px 24px', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 14px', borderRadius: 20, background: 'rgba(220,38,38,0.95)',
              color: '#fff', fontSize: 13, fontWeight: 600, marginBottom: 24,
              animation: 'recording-pulse 1.2s var(--ease-out) infinite',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: '#fff' }}/>
              GRABANDO · 0:{String(seconds).padStart(2, '0')}
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)',
              borderRadius: 24, padding: '20px 18px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3, marginBottom: 6, textAlign: 'left' }}>
                Te escucho...
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-ink-2)', marginBottom: 16, textAlign: 'left' }}>
                Cuenta qué pasa, dónde y desde cuándo. Yo me encargo del resto.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, height: 60, marginBottom: 18 }}>
                {levels.map((l, i) => (
                  <div key={i} style={{
                    width: 3, height: `${l * 100}%`, minHeight: 4, borderRadius: 2,
                    background: '#DC2626', transition: 'height 0.12s var(--ease-out)',
                  }}/>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="ghost" onClick={cancel} style={{ flex: 1 }}>Cancelar</Button>
                <Button variant="danger" onClick={stopRec} style={{ flex: 1.5 }}
                  icon={<div style={{ width: 12, height: 12, borderRadius: 3, background: '#fff' }}/>}>
                  Detener
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Processing */}
      {mode === 'processing' && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50,
          background: 'rgba(20,30,24,0.3)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'flex-end', padding: '0 14px 40px',
        }}>
          <div style={{
            background: '#fff', borderRadius: 24, padding: '20px 18px',
            width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Icons.Sparkles size={18} color="#2E7D5B"/>
              <div style={{
                fontSize: 13, fontWeight: 600,
                background: 'linear-gradient(90deg, #2E7D5B, #7C3AED, #2E7D5B)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                animation: 'ai-shimmer 1.8s linear infinite',
              }}>Entendiendo lo que dijiste...</div>
            </div>
            <div style={{
              padding: 14, background: 'var(--color-surface-2)', borderRadius: 14,
              fontSize: 14, lineHeight: 1.5, minHeight: 100,
            }}>
              <span style={{ color: 'var(--color-ink)' }}>{transcript}</span>
              <span style={{
                display: 'inline-block', width: 2, height: 16, background: '#2E7D5B',
                marginLeft: 2, verticalAlign: 'middle', animation: 'recording-pulse 0.8s infinite',
              }}/>
            </div>
          </div>
        </div>
      )}

      {/* Review */}
      {mode === 'review' && aiResult && (
        <BottomSheet snap="full" hideHandle>
          <div style={{ padding: '18px 18px 40px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
              padding: '10px 12px', background: 'var(--color-primary-soft)', borderRadius: 12,
            }}>
              <Icons.Sparkles size={16} color="#2E7D5B"/>
              <div style={{ fontSize: 13, color: 'var(--color-primary-ink)', fontWeight: 600 }}>
                Preparé esto. Revísalo y publica.
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 700, marginLeft: 'auto' }}>
                {Math.round(aiResult.confidence * 100)}%
              </div>
            </div>

            <ReviewForm aiResult={aiResult} setAiResult={setAiResult}/>

            <div style={{
              marginTop: 16, padding: '12px 14px', background: 'var(--color-surface-2)',
              borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <Icons.Location size={18} color="#2E7D5B"/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Álvaro Obregón 132</div>
                <div style={{ fontSize: 11, color: 'var(--color-ink-3)' }}>Roma Norte, CDMX</div>
              </div>
              <button style={{ fontSize: 12, color: 'var(--color-primary)', fontWeight: 600 }}>
                Ajustar
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <Button variant="ghost" onClick={cancel} style={{ flex: 1 }}>Descartar</Button>
              <Button onClick={publish} style={{ flex: 1.6 }}>Publicar reporte</Button>
            </div>
          </div>
        </BottomSheet>
      )}

      {/* Detail */}
      {mode === 'detail' && selectedReport && (
        <BottomSheet snap={detailSnap} onSnap={setDetailSnap} peekHeight={180} midHeight={480}>
          <ReportDetail report={selectedReport} onClose={cancel}/>
        </BottomSheet>
      )}
      {mode === 'detail' && (
        <div style={{ position: 'absolute', top: 'max(env(safe-area-inset-top), 14px)', left: 14, right: 14, zIndex: 60, display: 'flex', justifyContent: 'space-between' }}>
          <GlassButton onClick={cancel}>
            <Icons.ArrowLeft size={20} color="#1A1E1C"/>
          </GlassButton>
          <GlassButton onClick={() => setDetailSnap(detailSnap === 'full' ? 'mid' : 'full')}>
            {detailSnap === 'full' ? <Icons.ChevronUp size={20} color="#1A1E1C" stroke={2.5}/> : <Icons.Chevron size={20} color="#1A1E1C" stroke={2.5}/>}
          </GlassButton>
        </div>
      )}

      {/* Sent */}
      {mode === 'sent' && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(20,30,24,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
          backdropFilter: 'blur(4px)',
        }} className="fade-in">
          <div style={{
            background: '#fff', borderRadius: 24, padding: '32px 28px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
            boxShadow: '0 30px 60px rgba(0,0,0,0.25)', maxWidth: 300, margin: '0 20px',
          }}>
            <div style={{
              width: 68, height: 68, borderRadius: '50%', background: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icons.Check size={36} color="#fff" stroke={3}/>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.3 }}>¡Publicado!</div>
            <div style={{ fontSize: 14, color: 'var(--color-ink-2)', textAlign: 'center', lineHeight: 1.4 }}>
              Tu reporte ya está en el mapa de la colonia.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
