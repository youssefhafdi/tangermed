import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import NotificationContainer from '../ui/NotificationContainer';

const TITLES = {
  '/': 'Tableau de bord',
  '/campaigns': 'Campagnes',
  '/campaigns/new': 'Nouvelle Campagne',
  '/templates': 'Modèles Email',
  '/groups': 'Groupes Cibles',
  '/landing-pages': 'Pages d\'hameçonnage',
  '/results': 'Résultats & Analytiques',
  '/users': 'Gestion Utilisateurs',
};

export default function AppLayout() {
  const location = useLocation();
  const title = TITLES[location.pathname] || 'PhishGuard';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar title={title} />
        <main style={{ flex: 1, padding: '1.5rem', overflow: 'auto' }}>
          <Outlet />
        </main>
      </div>
      <NotificationContainer />
    </div>
  );
}
