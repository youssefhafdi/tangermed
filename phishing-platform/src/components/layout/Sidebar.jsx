import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Target, Mail, Users, Globe, BarChart2,
  Shield, ChevronLeft, ChevronRight, LogOut, Fish
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Tableau de bord', exact: true },
  { to: '/campaigns', icon: Target, label: 'Campagnes' },
  { to: '/templates', icon: Mail, label: 'Modèles Email' },
  { to: '/groups', icon: Users, label: 'Groupes Cibles' },
  { to: '/landing-pages', icon: Globe, label: 'Pages d\'hameçonnage' },
  { to: '/results', icon: BarChart2, label: 'Résultats' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside
      className="flex flex-col h-screen sticky top-0"
      style={{
        width: sidebarOpen ? 260 : 72,
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        transition: 'width 0.25s ease',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: 36, height: 36, background: '#2563eb', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Fish size={20} color="white" />
        </div>
        {sidebarOpen && (
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>PhishGuard</div>
            <div style={{ color: '#94a3b8', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>Simulation de Phishing</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0.625rem', overflow: 'hidden' }}>
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            title={!sidebarOpen ? label : undefined}
          >
            <Icon size={18} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <NavLink
            to="/users"
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            title={!sidebarOpen ? 'Utilisateurs' : undefined}
          >
            <Shield size={18} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>Utilisateurs</span>}
          </NavLink>
        )}
      </nav>

      {/* User info */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {sidebarOpen && user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', background: '#2563eb',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 600, fontSize: '0.875rem', flexShrink: 0
            }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: 'white', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>{user.role}</div>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="sidebar-nav-item"
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
          title={!sidebarOpen ? 'Déconnexion' : undefined}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>Déconnexion</span>}
        </button>
      </div>

      {/* Collapse btn */}
      <button
        onClick={toggleSidebar}
        style={{
          position: 'absolute', top: '1.25rem', right: -12,
          width: 24, height: 24, borderRadius: '50%', background: '#2563eb',
          border: 'none', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 10,
        }}
      >
        {sidebarOpen ? <ChevronLeft size={14} color="white" /> : <ChevronRight size={14} color="white" />}
      </button>
    </aside>
  );
}
