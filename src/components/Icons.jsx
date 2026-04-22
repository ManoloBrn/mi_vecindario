const Icon = ({ size = 20, color = 'currentColor', stroke = 2, path, children, vb = 24 }) => (
  <svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`} fill="none"
       stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {path ? <path d={path}/> : children}
  </svg>
);

export const Camera    = (p) => <Icon {...p}><path d="M3 8a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z"/><circle cx="12" cy="13" r="4"/></Icon>;
export const Video     = (p) => <Icon {...p}><rect x="2" y="6" width="14" height="12" rx="2"/><path d="m22 8-6 4 6 4V8Z"/></Icon>;
export const Text      = (p) => <Icon {...p}><path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2"/><path d="M9 20h6M12 4v16"/></Icon>;
export const Mic       = (p) => <Icon {...p}><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></Icon>;
export const Search    = (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></Icon>;
export const Close     = (p) => <Icon {...p}><path d="M18 6 6 18M6 6l12 12"/></Icon>;
export const Check     = (p) => <Icon {...p}><path d="m5 12 5 5L20 7"/></Icon>;
export const Location  = (p) => <Icon {...p}><path d="M12 21s-7-6.5-7-12a7 7 0 1 1 14 0c0 5.5-7 12-7 12Z"/><circle cx="12" cy="9" r="2.5"/></Icon>;
export const Crosshair = (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><circle cx="12" cy="12" r="2.5" fill={p.color || 'currentColor'}/></Icon>;
export const ArrowLeft = (p) => <Icon {...p}><path d="M19 12H5M12 19l-7-7 7-7"/></Icon>;
export const Chevron   = (p) => <Icon {...p}><path d="m9 18 6-6-6-6"/></Icon>;
export const ChevronUp = (p) => <Icon {...p}><path d="m6 15 6-6 6 6"/></Icon>;
export const Plus      = (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>;
export const Home      = (p) => <Icon {...p}><path d="M3 11 12 3l9 8v10a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V11Z"/></Icon>;
export const List      = (p) => <Icon {...p}><path d="M3 6h18M3 12h18M3 18h18"/></Icon>;
export const User      = (p) => <Icon {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></Icon>;
export const Bell      = (p) => <Icon {...p}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9Z"/><path d="M10 21a2 2 0 0 0 4 0"/></Icon>;
export const Heart     = (p) => <Icon {...p}><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z"/></Icon>;
export const Message   = (p) => <Icon {...p}><path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12Z"/></Icon>;
export const Share     = (p) => <Icon {...p}><path d="M12 15V3M12 3l-4 4M12 3l4 4M5 15v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4"/></Icon>;
export const Sparkles  = (p) => <Icon {...p}><path d="M12 3 13.5 8.5 19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z"/><path d="M19 17l0.8 2.2L22 20l-2.2 0.8L19 23l-0.8-2.2L16 20l2.2-0.8L19 17Z"/></Icon>;
export const Waveform  = (p) => <Icon {...p}><path d="M2 12h2M6 8v8M10 4v16M14 7v10M18 10v4M22 12h0"/></Icon>;
export const Verified  = (p) => <Icon {...p}><path d="m9 12 2 2 4-4"/><path d="M12 3l2.5 1.5L17 4l1 2.5L20 8l-1 2.5L20 13l-1 2.5L18 18l-2.5-1L14 19l-2 1-2-1-1.5-2L6 18l-1-2.5L4 13l1-2.5L4 8l1-2.5L8 4l1.5-1L12 3Z"/></Icon>;
export const Alert     = (p) => <Icon {...p}><path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17v0"/></Icon>;
export const Dot       = (p) => <Icon {...p}><circle cx="12" cy="12" r="5" fill={p.color || 'currentColor'} stroke="none"/></Icon>;
export const Flag      = (p) => <Icon {...p}><path d="M4 21V4h12l-2 4 2 4H4"/></Icon>;
export const Shield    = (p) => <Icon {...p}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/></Icon>;
export const Map       = (p) => <Icon {...p}><path d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7Z"/><path d="M9 4v13M15 7v13"/></Icon>;
