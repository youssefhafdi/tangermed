import { Bell, Menu } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';

export default function Topbar({ title }) {
  const { user } = useAuthStore();
  const { notifications } = useUIStore();
  const unread = notifications.length;

  return (
    <header style={{
      background: 'white', borderBottom: '1px solid #e2e8f0',
      padding: '0 1.5rem', height: 64, display: 'flex',
      alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 40,
    }}>
      <h1 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>{title}</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <Bell size={20} color="#64748b" />
          {unread > 0 && (
            <span style={{
              position: 'absolute', top: -6, right: -6,
              background: '#ef4444', color: 'white', borderRadius: '50%',
              width: 16, height: 16, fontSize: '0.65rem', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontWeight: 600,
            }}>{unread}</span>
          )}
        </div>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: '#2563eb',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 600, fontSize: '0.8rem'
            }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>{user.name}</span>
          </div>
        )}
      </div>
    </header>
  );
}
