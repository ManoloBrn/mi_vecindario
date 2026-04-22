import * as Icons from './Icons';
import { CATEGORIES } from '../data';

export function Avatar({ color = '#ccc', letter, size = 36, official = false }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 600, fontSize: size * 0.4, flexShrink: 0,
      position: 'relative', boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.3)',
    }}>
      {letter}
      {official && (
        <div style={{
          position: 'absolute', bottom: -2, right: -2, width: 14, height: 14,
          borderRadius: '50%', background: '#2E7D5B', border: '2px solid #fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icons.Check size={8} color="#fff" stroke={3}/>
        </div>
      )}
    </div>
  );
}

export function CategoryChip({ cat, small = false, selected = false, onClick }) {
  const c = CATEGORIES[cat];
  if (!c) return null;
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: small ? '4px 9px' : '6px 12px',
      borderRadius: 999,
      background: selected ? c.color : c.soft,
      color: selected ? '#fff' : c.color,
      fontSize: small ? 11 : 13, fontWeight: 600,
      letterSpacing: -0.1, border: selected ? 'none' : `1px solid ${c.color}22`,
      transition: 'all 0.15s', flexShrink: 0,
    }}>
      <span style={{ fontSize: small ? 11 : 13 }}>{c.emoji}</span>
      <span>{c.short}</span>
    </button>
  );
}

export function ReportCard({ report, onClick, compact = false }) {
  const cat = CATEGORIES[report.cat];
  const letter = report.author.split(' ').map(w => w[0]).slice(0, 2).join('');
  return (
    <button onClick={onClick} style={{
      width: '100%', textAlign: 'left', background: '#fff',
      borderRadius: 18, padding: compact ? 12 : 14,
      boxShadow: 'var(--shadow-card)',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar color={report.avatar} letter={letter} size={32} official={report.official}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink)' }}>
              {report.author}
            </span>
            {report.verified && <Icons.Dot size={6} color="#2E7D5B"/>}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-ink-3)', marginTop: 1 }}>{report.time}</div>
        </div>
        <CategoryChip cat={report.cat} small/>
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)', letterSpacing: -0.2, lineHeight: 1.3, marginBottom: 4 }}>
          {report.urgent && <span style={{ color: '#DC2626', marginRight: 4 }}>●</span>}
          {report.title}
        </div>
        {!compact && (
          <div style={{ fontSize: 13, color: 'var(--color-ink-2)', lineHeight: 1.45 }}>
            {report.body}
          </div>
        )}
      </div>
      {report.photo && !compact && (
        <div style={{
          width: '100%', height: 140, borderRadius: 12, background: report.photo,
          backgroundImage: `linear-gradient(135deg, ${report.photo}, ${report.photo}dd)`,
        }}/>
      )}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 12, color: 'var(--color-ink-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icons.Check size={13}/>
          <span>{report.confirmations} confirmaciones</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icons.Message size={13}/>
          <span>{report.comments}</span>
        </div>
      </div>
    </button>
  );
}

export function BottomSheet({ snap = 'mid', onSnap, peekHeight = 120, midHeight = 380, children, hideHandle = false }) {
  const height = { peek: peekHeight, mid: midHeight, full: 'calc(100% - 60px)' }[snap];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      height, maxHeight: 'calc(100% - 60px)', background: '#fff',
      borderTopLeftRadius: 24, borderTopRightRadius: 24,
      boxShadow: 'var(--shadow-sheet)',
      transition: 'height 0.3s var(--ease-out)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      zIndex: 50,
    }}>
      {!hideHandle && (
        <div onClick={() => {
          if (!onSnap) return;
          if (snap === 'peek') onSnap('mid');
          else if (snap === 'mid') onSnap('full');
          else onSnap('peek');
        }} style={{
          display: 'flex', justifyContent: 'center', padding: '10px 0 6px', cursor: 'pointer', flexShrink: 0,
        }}>
          <div style={{ width: 40, height: 5, borderRadius: 3, background: 'var(--color-line)' }}/>
        </div>
      )}
      <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {children}
      </div>
    </div>
  );
}

export function TopBar({ title, left, right, sub }) {
  return (
    <div style={{
      position: 'absolute', top: 48, left: 0, right: 0, zIndex: 30,
      padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 10,
    }}>
      {left}
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3 }}>{title}</div>}
        {sub && <div style={{ fontSize: 12, color: 'var(--color-ink-3)', marginTop: 1 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

export function GlassButton({ children, onClick, size = 44, style = {} }) {
  return (
    <button onClick={onClick} style={{
      width: size, height: size, borderRadius: size / 2,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      boxShadow: 'var(--shadow-card)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...style,
    }}>{children}</button>
  );
}

export function Button({ children, variant = 'primary', size = 'md', onClick, style = {}, disabled = false, icon }) {
  const sizes = {
    sm: { h: 34, px: 14, fs: 13 },
    md: { h: 46, px: 18, fs: 15 },
    lg: { h: 54, px: 22, fs: 16 },
  }[size];
  const variants = {
    primary:   { bg: 'var(--color-primary)',      color: '#fff',                  shadow: 'var(--shadow-fab)' },
    secondary: { bg: 'var(--color-primary-soft)', color: 'var(--color-primary-ink)' },
    ghost:     { bg: 'transparent',               color: 'var(--color-ink-2)',    border: '1px solid var(--color-line)' },
    danger:    { bg: '#DC2626',                   color: '#fff' },
  }[variant];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      height: sizes.h, padding: `0 ${sizes.px}px`, borderRadius: sizes.h / 2,
      fontSize: sizes.fs, fontWeight: 600, letterSpacing: -0.2,
      background: variants.bg, color: variants.color, boxShadow: variants.shadow,
      border: variants.border || 'none',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
      opacity: disabled ? 0.5 : 1, transition: 'transform 0.1s',
      ...style,
    }}
    onMouseDown={e => !disabled && (e.currentTarget.style.transform = 'scale(0.97)')}
    onMouseUp={e => e.currentTarget.style.transform = ''}
    onMouseLeave={e => e.currentTarget.style.transform = ''}
    >
      {icon}
      {children}
    </button>
  );
}
