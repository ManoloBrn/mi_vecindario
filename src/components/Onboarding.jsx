import { useState } from 'react';
import * as Icons from './Icons';
import { CATEGORIES } from '../data';
import { api } from '../api';

export default function Onboarding({ user, onDone }) {
  const [step, setStep] = useState(0);
  const steps = ['permisos', 'colonia', 'foto', 'categorias'];
  const total = steps.length;
  const next = () => step < total - 1 ? setStep(step + 1) : onDone && onDone();

  return (
    <div style={{
      height: '100%', background: 'var(--color-bg)',
      display: 'flex', flexDirection: 'column', position: 'relative',
    }}>
      <div style={{ padding: '22px 22px 0' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i <= step ? 'var(--color-primary)' : 'var(--color-line)',
              transition: 'background 0.3s',
            }}/>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--color-ink-3)', fontWeight: 500 }}>
            Paso {step + 1} de {total}
          </div>
          <button onClick={next} style={{
            fontSize: 13, fontWeight: 600, color: 'var(--color-ink-3)',
            background: 'transparent', border: 'none', padding: 4, cursor: 'pointer',
          }}>Omitir</button>
        </div>
      </div>

      <div style={{ flex: 1, padding: '24px 22px', display: 'flex', flexDirection: 'column' }}>
        {steps[step] === 'permisos' && <PermissionsStep onNext={next}/>}
        {steps[step] === 'colonia' && <NeighborhoodStep onNext={next}/>}
        {steps[step] === 'foto' && <PhotoStep onNext={next}/>}
        {steps[step] === 'categorias' && <CategoriesStep onNext={next} isLast={step === total - 1}/>}
      </div>
    </div>
  );
}

function PermissionsStep({ onNext }) {
  const [loc, setLoc] = useState(false);
  const [notif, setNotif] = useState(false);
  return (
    <>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, marginBottom: 8 }}>
        Dos permisos para empezar
      </div>
      <div style={{ fontSize: 14, color: 'var(--color-ink-2)', marginBottom: 24, lineHeight: 1.5 }}>
        Los necesitamos para mostrarte lo que pasa cerca y avisarte cuando alguien responda.
      </div>

      {[
        { key: 'loc',   title: 'Ubicación',       desc: 'Ver y reportar cosas cerca de ti',          icon: <Icons.Location size={22} color="#fff"/>, set: setLoc,   val: loc,   color: '#2E7D5B' },
        { key: 'notif', title: 'Notificaciones',   desc: 'Alertas de seguridad y respuestas',        icon: <Icons.Bell size={22} color="#fff"/>,     set: setNotif, val: notif, color: '#4F46E5' },
      ].map(p => (
        <div key={p.key} onClick={() => p.set(true)} style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: 14, marginBottom: 10, borderRadius: 14,
          background: '#fff', border: `1px solid ${p.val ? 'var(--color-primary)' : 'var(--color-line)'}`,
          cursor: 'pointer', transition: 'all 0.2s',
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14, background: p.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{p.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{p.title}</div>
            <div style={{ fontSize: 12, color: 'var(--color-ink-3)', lineHeight: 1.4 }}>{p.desc}</div>
          </div>
          <div style={{
            width: 24, height: 24, borderRadius: 12,
            background: p.val ? 'var(--color-primary)' : 'transparent',
            border: p.val ? 'none' : '1.5px solid var(--color-line)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {p.val && <Icons.Check size={14} color="#fff"/>}
          </div>
        </div>
      ))}

      <div style={{ flex: 1 }}/>

      <button onClick={onNext} style={{
        width: '100%', padding: '14px 16px', borderRadius: 14,
        background: 'var(--color-primary)', color: '#fff',
        border: 'none', fontSize: 15, fontWeight: 600, fontFamily: 'inherit',
      }}>Continuar</button>
    </>
  );
}

function NeighborhoodStep({ onNext }) {
  const options = ['Roma Norte', 'Roma Sur', 'Condesa', 'Juárez', 'Cuauhtémoc', 'San Rafael'];
  const [selected, setSelected] = useState('Roma Norte');
  return (
    <>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, marginBottom: 8 }}>
        ¿En qué colonia vives?
      </div>
      <div style={{ fontSize: 14, color: 'var(--color-ink-2)', marginBottom: 20, lineHeight: 1.5 }}>
        Verás primero los reportes de tu zona. Puedes cambiarlo cuando quieras.
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 14px', borderRadius: 12,
        background: '#fff', border: '1px solid var(--color-line)', marginBottom: 14,
      }}>
        <Icons.Search size={18} color="var(--color-ink-3)"/>
        <input placeholder="Busca tu colonia..." style={{
          flex: 1, border: 'none', background: 'transparent',
          fontSize: 14, fontFamily: 'inherit', outline: 'none',
        }}/>
      </div>

      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-ink-3)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 }}>
        Cerca de ti
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {options.map(n => (
          <button key={n} onClick={() => setSelected(n)} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 14px', borderRadius: 12,
            background: selected === n ? 'var(--color-primary-soft)' : '#fff',
            border: `1px solid ${selected === n ? 'var(--color-primary)' : 'var(--color-line)'}`,
            fontSize: 14, fontWeight: selected === n ? 600 : 500,
            color: 'var(--color-ink)', textAlign: 'left', fontFamily: 'inherit',
          }}>
            <Icons.Location size={16} color={selected === n ? 'var(--color-primary)' : 'var(--color-ink-3)'}/>
            <span style={{ flex: 1 }}>{n}</span>
            {selected === n && <Icons.Check size={16} color="var(--color-primary)"/>}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, minHeight: 10 }}/>

      <button onClick={onNext} style={{
        width: '100%', padding: '14px 16px', borderRadius: 14,
        background: 'var(--color-primary)', color: '#fff',
        border: 'none', fontSize: 15, fontWeight: 600, fontFamily: 'inherit',
      }}>Continuar</button>
    </>
  );
}

function PhotoStep({ onNext }) {
  const [picked, setPicked] = useState(null);
  const colors = ['#E76F51', '#F4A261', '#2A9D8F', '#457B9D', '#9B7EDE', '#E11D8C'];
  return (
    <>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, marginBottom: 8 }}>
        Ponle cara (opcional)
      </div>
      <div style={{ fontSize: 14, color: 'var(--color-ink-2)', marginBottom: 28, lineHeight: 1.5 }}>
        Tus vecinos se sentirán más seguros si pueden ver quién eres.
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
        <div style={{
          width: 120, height: 120, borderRadius: 60,
          background: picked || 'var(--color-surface-2)',
          border: '3px dashed var(--color-line)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', color: '#fff', fontSize: 44, fontWeight: 700,
        }}>
          {picked ? 'D' : <Icons.Camera size={36} color="var(--color-ink-3)"/>}
          <button style={{
            position: 'absolute', bottom: 2, right: 2,
            width: 36, height: 36, borderRadius: 18,
            background: 'var(--color-primary)', color: '#fff',
            border: '3px solid #fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icons.Plus size={18} color="#fff"/>
          </button>
        </div>
      </div>

      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-ink-3)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 10, textAlign: 'center' }}>
        O elige un color
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
        {colors.map(c => (
          <button key={c} onClick={() => setPicked(c)} style={{
            width: 38, height: 38, borderRadius: 19, background: c,
            border: picked === c ? '3px solid var(--color-ink)' : '3px solid transparent',
            cursor: 'pointer',
          }}/>
        ))}
      </div>

      <div style={{ flex: 1 }}/>

      <button onClick={onNext} style={{
        width: '100%', padding: '14px 16px', borderRadius: 14,
        background: 'var(--color-primary)', color: '#fff',
        border: 'none', fontSize: 15, fontWeight: 600, fontFamily: 'inherit',
      }}>{picked ? 'Continuar' : 'Hacerlo después'}</button>
    </>
  );
}

function CategoriesStep({ onNext }) {
  const [sel, setSel] = useState(['seguridad', 'bache', 'alumbrado']);
  const [saving, setSaving] = useState(false);
  const toggle = k => setSel(s => s.includes(k) ? s.filter(x => x !== k) : [...s, k]);

  const handleDone = () => {
    setSaving(true);
    api.updateFollowedCategories(sel).finally(() => { setSaving(false); onNext(); });
  };
  return (
    <>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, marginBottom: 8 }}>
        ¿De qué te avisamos?
      </div>
      <div style={{ fontSize: 14, color: 'var(--color-ink-2)', marginBottom: 20, lineHeight: 1.5 }}>
        Elige las categorías que quieres seguir. Recibirás notificaciones solo de estas.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Object.entries(CATEGORIES).map(([k, c]) => {
          const on = sel.includes(k);
          return (
            <button key={k} onClick={() => toggle(k)} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', borderRadius: 14,
              background: on ? 'var(--color-primary-soft)' : '#fff',
              border: `1.5px solid ${on ? 'var(--color-primary)' : 'var(--color-line)'}`,
              textAlign: 'left', fontFamily: 'inherit', cursor: 'pointer',
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 12, background: c.soft,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>{c.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>{c.label}</div>
              </div>
              <div style={{
                width: 22, height: 22, borderRadius: 11,
                background: on ? 'var(--color-primary)' : 'transparent',
                border: on ? 'none' : '1.5px solid var(--color-line)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{on && <Icons.Check size={12} color="#fff"/>}</div>
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, minHeight: 10 }}/>

      <button onClick={handleDone} disabled={saving} style={{
        width: '100%', padding: '14px 16px', borderRadius: 14,
        background: 'var(--color-primary)', color: '#fff',
        border: 'none', fontSize: 15, fontWeight: 600, fontFamily: 'inherit',
        opacity: saving ? 0.7 : 1,
      }}>
        {saving ? 'Guardando…' : 'Listo — ir al mapa'}
      </button>
    </>
  );
}
