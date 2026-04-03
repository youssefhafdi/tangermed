import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import useUIStore from '../../store/uiStore';

const icons = {
  success: <CheckCircle size={18} color="#16a34a" />,
  error: <XCircle size={18} color="#dc2626" />,
  warning: <AlertCircle size={18} color="#d97706" />,
};

const colors = {
  success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534' },
  error: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b' },
  warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
};

export default function NotificationContainer() {
  const { notifications, dismissNotification } = useUIStore();

  return (
    <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {notifications.map(n => {
        const c = colors[n.type] || colors.success;
        return (
          <div key={n.id} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            background: c.bg, border: `1px solid ${c.border}`,
            borderRadius: '0.5rem', padding: '0.875rem 1rem',
            minWidth: 280, maxWidth: 380, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            animation: 'slideIn 0.2s ease',
          }}>
            {icons[n.type] || icons.success}
            <span style={{ flex: 1, fontSize: '0.875rem', color: c.text, fontWeight: 500 }}>{n.message}</span>
            <button
              onClick={() => dismissNotification(n.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }}
            >
              <X size={14} color="#94a3b8" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
