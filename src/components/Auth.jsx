import { useState, useEffect } from 'react';
import * as Icons from './Icons';
import { api } from '../api';

function ProviderButton({ icon, label, onClick, primary }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '13px 16px', marginBottom: 8,
      borderRadius: 14,
      background: primary ? 'var(--color-primary)' : '#fff',
      color: primary ? '#fff' : 'var(--color-ink)',
      border: primary ? 'none' : '1px solid var(--color-line)',
      display: 'flex', alignItems: 'center', gap: 12,
      fontSize: 15, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
    }}>
      <span style={{ width: 22, display: 'flex', justifyContent: 'center' }}>{icon}</span>
      <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
    </button>
  );
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.2-.2-1.7H9v3.3h4.8c-.2 1.1-.8 2-1.8 2.6v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.4Z"/>
    <path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.2-3.8H.8v2.3C2.3 15.9 5.4 18 9 18Z"/>
    <path fill="#FBBC04" d="M3.8 10.7c-.2-.6-.3-1.2-.3-1.7s.1-1.1.3-1.7V5H.8C.3 6.1 0 7.5 0 9s.3 2.9.8 4l3-2.3Z"/>
    <path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.5 1.3l2.6-2.6C13.5.9 11.4 0 9 0 5.4 0 2.3 2.1.8 5l3 2.3C4.6 5.2 6.6 3.6 9 3.6Z"/>
  </svg>
);
const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="#1A1E1C">
    <path d="M14.7 9.6c0-2 1.6-3 1.7-3-.9-1.4-2.4-1.5-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7-1.4 0-2.6.8-3.3 2-1.4 2.5-.4 6.1 1 8.1.7 1 1.5 2 2.5 2 1 0 1.4-.7 2.7-.7 1.2 0 1.6.7 2.6.6 1.1 0 1.8-1 2.4-2 .8-1.1 1.1-2.2 1.2-2.2-.1 0-2.3-.9-2.3-3.2ZM12.8 3.7c.5-.6.9-1.5.8-2.4-.8 0-1.7.5-2.2 1.1-.5.5-.9 1.4-.8 2.3.9.1 1.8-.5 2.2-1Z"/>
  </svg>
);

export function LoginA({ onDone }) {
  const [step, setStep]         = useState('welcome');
  const [phone, setPhone]       = useState('');
  const [code, setCode]         = useState('');

  const [nickname, setNickname] = useState('');
  const [avatarColor, setAvatarColor] = useState('#2E7D5B');
  const [demoOtp, setDemoOtp]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const back = () => {
    setError('');
    if (step === 'phone') setStep('welcome');
    else if (step === 'code') setStep('phone');
    else if (step === 'nickname') setStep('code');
  };

  const handleRequestOtp = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.requestOtp('+52' + phone);
      setDemoOtp(res.demo_otp || '');
      setStep('code');
    } catch (e) {
      setError(e.message || 'Error al enviar código');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (otp) => {
    setLoading(true); setError('');
    try {
      const res = await api.verifyOtp('+52' + phone, otp);
      if (res.needs_setup) {
        // store temp token so setupProfile call can use it
        localStorage.setItem('mv_token', res.token);
        setStep('nickname');
      } else {
        onDone(res.token, false);
      }
    } catch (e) {
      setError(e.message || 'Código inválido');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupProfile = async () => {
    const cleanNick = nickname.replace(/[^a-zA-Z0-9_]/g, '');
    setLoading(true); setError('');
    try {
      const res = await api.setupProfile(cleanNick, avatarColor);
      onDone(res.token, true);
    } catch (e) {
      setError(e.message || 'Error al crear perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100%', background: 'var(--color-bg)',
      display: 'flex', flexDirection: 'column', position: 'relative',
    }}>
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.25,
        backgroundImage: `
          linear-gradient(135deg, transparent 40%, rgba(46,125,91,0.06) 50%, transparent 60%),
          repeating-linear-gradient(30deg, transparent 0 40px, rgba(46,125,91,0.04) 40px 41px),
          repeating-linear-gradient(120deg, transparent 0 60px, rgba(46,125,91,0.04) 60px 61px)
        `,
        pointerEvents: 'none',
      }}/>

      <div style={{ padding: '24px 22px 8px', position: 'relative', zIndex: 1 }}>
        {step !== 'welcome' && (
          <button onClick={back} style={{
            background: 'transparent', border: 'none', padding: 4, marginBottom: 8,
            display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-ink-2)',
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>
            <Icons.ArrowLeft size={18}/> Atrás
          </button>
        )}
      </div>

      <div style={{ flex: 1, padding: '10px 22px 24px', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
        {error && (
          <div style={{
            padding: '10px 14px', marginBottom: 12, borderRadius: 10,
            background: '#FDE7E7', border: '1px solid #FCA5A5',
            fontSize: 13, color: '#B91C1C', fontWeight: 500,
          }}>{error}</div>
        )}
        {step === 'welcome'  && <WelcomePanel onNext={() => setStep('phone')}/>}
        {step === 'phone'    && (
          <PhonePanel phone={phone} setPhone={setPhone} loading={loading} onNext={handleRequestOtp}/>
        )}
        {step === 'code'     && (
          <CodePanel
            phone={phone} code={code} setCode={setCode}
            demoOtp={demoOtp} loading={loading} onNext={handleVerifyOtp}
          />
        )}
        {step === 'nickname' && (
          <NicknamePanel
            nickname={nickname} setNickname={setNickname}
            avatarColor={avatarColor} setAvatarColor={setAvatarColor}
            loading={loading} onDone={handleSetupProfile}
          />
        )}
      </div>
    </div>
  );
}

function WelcomePanel({ onNext }) {
  return (
    <>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{
          width: 84, height: 84, borderRadius: 28, background: 'var(--color-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
          boxShadow: '0 12px 30px rgba(46,125,91,0.3)',
        }}>
          <Icons.Location size={40} color="#fff"/>
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6, marginBottom: 8, color: 'var(--color-ink)' }}>
          Mi Vecindario
        </div>
        <div style={{ fontSize: 15, color: 'var(--color-ink-2)', lineHeight: 1.5, maxWidth: 280 }}>
          La red de tu colonia. Reporta problemas, encuentra mascotas y mantente al tanto.
        </div>
      </div>

      <div>
        <button onClick={onNext} style={{
          width: '100%', padding: '14px 16px', marginBottom: 8,
          borderRadius: 14, background: 'var(--color-primary)', color: '#fff',
          border: 'none', fontSize: 15, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
        }}>
          Continuar con teléfono
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0', color: 'var(--color-ink-3)', fontSize: 12 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--color-line)' }}/>
          o
          <div style={{ flex: 1, height: 1, background: 'var(--color-line)' }}/>
        </div>

        <ProviderButton icon={<GoogleIcon/>} label="Continuar con Google (no disponible)"/>
        <ProviderButton icon={<AppleIcon/>}  label="Continuar con Apple (no disponible)"/>

        <div style={{ fontSize: 11, color: 'var(--color-ink-3)', textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>
          Al continuar aceptas los <span style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Términos</span> y la <span style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Política de privacidad</span>.
        </div>
      </div>
    </>
  );
}

function PhonePanel({ phone, setPhone, loading, onNext }) {
  return (
    <>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, marginBottom: 6 }}>
        ¿Cuál es tu teléfono?
      </div>
      <div style={{ fontSize: 14, color: 'var(--color-ink-2)', marginBottom: 24, lineHeight: 1.45 }}>
        Te enviaremos un código por SMS para verificar tu cuenta.
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <div style={{
          padding: '14px 12px', borderRadius: 12,
          background: '#fff', border: '1px solid var(--color-line)',
          fontSize: 15, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6,
        }}>
          🇲🇽 +52
        </div>
        <input
          value={phone}
          onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
          placeholder="55 1234 5678"
          autoFocus
          inputMode="numeric"
          style={{
            flex: 1, padding: '14px 14px', borderRadius: 12,
            background: '#fff', border: '1px solid var(--color-line)',
            fontSize: 15, fontFamily: 'inherit', outline: 'none',
          }}
        />
      </div>

      <div style={{ fontSize: 12, color: 'var(--color-ink-3)', marginBottom: 16, lineHeight: 1.4 }}>
        Demo: prueba con <b>5598765432</b> (MarisolR) o cualquier número nuevo.
      </div>

      <div style={{ flex: 1 }}/>

      <button
        onClick={onNext}
        disabled={phone.length < 10 || loading}
        style={{
          width: '100%', padding: '14px 16px', borderRadius: 14,
          background: phone.length >= 10 && !loading ? 'var(--color-primary)' : 'var(--color-line)',
          color: '#fff', border: 'none',
          fontSize: 15, fontWeight: 600, fontFamily: 'inherit',
          cursor: phone.length >= 10 && !loading ? 'pointer' : 'not-allowed',
        }}>
        {loading ? 'Enviando…' : 'Enviar código'}
      </button>
    </>
  );
}

function CodePanel({ phone, code, setCode, demoOtp, loading, onNext }) {
  const digits = code.padEnd(6, ' ').split('');

  useEffect(() => {
    if (code.length === 6) {
      const t = setTimeout(() => onNext(code), 400);
      return () => clearTimeout(t);
    }
  }, [code]);

  return (
    <>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, marginBottom: 6 }}>
        Código de verificación
      </div>
      <div style={{ fontSize: 14, color: 'var(--color-ink-2)', marginBottom: 24, lineHeight: 1.45 }}>
        Enviamos un código de 6 dígitos a <b>+52 {phone || '55 1234 5678'}</b>
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, justifyContent: 'space-between' }}>
          {digits.map((d, i) => (
            <div key={i} style={{
              flex: 1, aspectRatio: '1', maxWidth: 48,
              borderRadius: 12, background: '#fff',
              border: `1.5px solid ${d !== ' ' ? 'var(--color-primary)' : 'var(--color-line)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 700, color: 'var(--color-ink)',
            }}>
              {d !== ' ' ? d : ''}
            </div>
          ))}
        </div>
        <input
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          autoFocus
          inputMode="numeric"
          disabled={loading}
          style={{ position: 'absolute', inset: 0, opacity: 0, pointerEvents: 'all', cursor: 'text' }}
        />
      </div>

      {demoOtp && (
        <div
          onClick={() => setCode(demoOtp)}
          style={{
            fontSize: 13, color: 'var(--color-primary)', fontWeight: 600,
            textAlign: 'center', padding: '8px', cursor: 'pointer',
            background: 'var(--color-primary-soft)', borderRadius: 10,
          }}
        >
          Demo: toca para autocompletar → {demoOtp}
        </div>
      )}

      <div style={{ flex: 1 }}/>

      <div style={{ fontSize: 12, color: 'var(--color-ink-3)', textAlign: 'center', marginBottom: 12 }}>
        ¿No lo recibiste? <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Reenviar en 45s</span>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--color-ink-3)' }}>Verificando…</div>
      )}
    </>
  );
}

function NicknamePanel({ nickname, setNickname, avatarColor, setAvatarColor, loading, onDone }) {
  const cleanNick = nickname.replace(/[^a-zA-Z0-9_]/g, '');
  const colors = ['#2E7D5B', '#E76F51', '#F4A261', '#2A9D8F', '#457B9D', '#9B7EDE', '#E11D8C'];
  return (
    <>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, marginBottom: 6 }}>
        Elige tu nombre de usuario
      </div>
      <div style={{ fontSize: 14, color: 'var(--color-ink-2)', marginBottom: 24, lineHeight: 1.45 }}>
        Así te verán tus vecinos.
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-ink-3)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>
          Nickname
        </div>
        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid var(--color-line)', borderRadius: 12, padding: '0 12px' }}>
          <span style={{ fontSize: 15, color: 'var(--color-ink-3)', marginRight: 2 }}>@</span>
          <input
            value={nickname} onChange={e => setNickname(e.target.value)}
            placeholder="tu_nombre"
            autoFocus
            style={{
              flex: 1, padding: '14px 0', border: 'none', background: 'transparent',
              fontSize: 15, fontWeight: 600, fontFamily: 'inherit', outline: 'none',
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-ink-3)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 }}>
          Color de avatar
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {colors.map(c => (
            <button key={c} onClick={() => setAvatarColor(c)} style={{
              width: 38, height: 38, borderRadius: 19, background: c,
              border: avatarColor === c ? '3px solid var(--color-ink)' : '3px solid transparent',
              cursor: 'pointer',
            }}/>
          ))}
        </div>
      </div>

      <div style={{
        padding: '12px 14px', background: 'var(--color-primary-soft)',
        borderRadius: 12, marginBottom: 14,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 19,
          background: avatarColor, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, letterSpacing: 0.3,
        }}>
          {(cleanNick[0] || 'U').toUpperCase()}{(cleanNick[1] || '').toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>
            @{cleanNick || 'tu_nombre'}
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }}/>

      <button
        onClick={onDone}
        disabled={cleanNick.length < 3 || loading}
        style={{
          width: '100%', padding: '14px 16px', borderRadius: 14,
          background: cleanNick.length >= 3 && !loading ? 'var(--color-primary)' : 'var(--color-line)',
          color: '#fff', border: 'none',
          fontSize: 15, fontWeight: 600, fontFamily: 'inherit',
          cursor: cleanNick.length >= 3 && !loading ? 'pointer' : 'not-allowed',
        }}>
        {loading ? 'Creando perfil…' : 'Continuar'}
      </button>
    </>
  );
}
