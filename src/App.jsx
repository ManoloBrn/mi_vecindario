import { useState, useEffect } from 'react';
import * as Icons from './components/Icons';
import { LoginA } from './components/Auth';
import Onboarding from './components/Onboarding';
import MapScreen from './components/MapScreen';
import Profile from './components/Profile';
import { AuthProvider, useAuth } from './context/AuthContext';

function BottomNav({ activeTab, onTab }) {
  const tabs = [
    { id: 'map',     icon: Icons.Map,  label: 'Mapa' },
    { id: 'profile', icon: Icons.User, label: 'Perfil' },
  ];
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--color-line)',
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      {tabs.map(t => {
        const Ic = t.icon;
        const active = activeTab === t.id;
        return (
          <button key={t.id} onClick={() => onTab(t.id)} style={{
            flex: 1, padding: '10px 8px 8px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 3,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: active ? 'var(--color-primary)' : 'var(--color-ink-3)',
            transition: 'color 0.15s',
          }}>
            <Ic size={22} color={active ? 'var(--color-primary)' : 'var(--color-ink-3)'}/>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.2 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function AppShell() {
  const { user, loading, login } = useAuth();
  const [screen, setScreen]     = useState(null);
  const [activeTab, setActiveTab] = useState('map');

  useEffect(() => {
    if (!loading) setScreen(user ? 'app' : 'login');
  }, [loading, user]);

  const handleLoginDone = async (token, isNewUser) => {
    await login(token);
    setScreen(isNewUser ? 'onboarding' : 'app');
  };

  if (!screen) {
    return (
      <div style={{
        height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg)',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 24, background: 'var(--color-primary)',
          animation: 'pulse-ring 1.2s var(--ease-out) infinite',
        }}/>
      </div>
    );
  }

  if (screen === 'login') {
    return (
      <div style={{ height: '100dvh', overflow: 'hidden' }}>
        <LoginA onDone={handleLoginDone}/>
      </div>
    );
  }

  if (screen === 'onboarding') {
    return (
      <div style={{ height: '100dvh', overflow: 'hidden' }}>
        <Onboarding user={user} onDone={() => setScreen('app')}/>
      </div>
    );
  }

  return (
    <div style={{ height: '100dvh', position: 'relative', overflow: 'hidden' }}>
      {activeTab === 'map' && (
        <MapScreen onProfile={() => setActiveTab('profile')}/>
      )}
      {activeTab === 'profile' && (
        <div style={{ height: '100%', overflow: 'auto', paddingBottom: 64 }}>
          <Profile isOwn={true}/>
        </div>
      )}
      <BottomNav activeTab={activeTab} onTab={setActiveTab}/>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell/>
    </AuthProvider>
  );
}
