import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Globe, Edit, Trash2 } from 'lucide-react';
import api from '../api/axios';
import useUIStore from '../store/uiStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function LandingPagesPage() {
  const navigate = useNavigate();
  const { notify } = useUIStore();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/landing-pages').then(r => setPages(r.data.landingPages)).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Supprimer "${name}" ?`)) return;
    try {
      await api.delete(`/landing-pages/${id}`);
      setPages(ps => ps.filter(p => p._id !== id));
      notify('Page supprimée', 'success');
    } catch {
      notify('Erreur', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={() => navigate('/landing-pages/new')}><Plus size={16} /> Nouvelle Page</button>
      </div>

      {loading ? <p style={{ textAlign: 'center', color: '#94a3b8' }}>Chargement...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {pages.map(p => (
            <div key={p._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                <div style={{ width: 42, height: 42, borderRadius: '0.625rem', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe size={20} color="#16a34a" />
                </div>
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }} onClick={() => navigate(`/landing-pages/${p._id}`)}>
                    <Edit size={13} />
                  </button>
                  <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(p._id, p.name)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <h3 style={{ margin: '0 0 0.375rem', fontSize: '0.9375rem', fontWeight: 600 }}>{p.name}</h3>
              <p style={{ margin: '0 0 0.75rem', fontSize: '0.8125rem', color: '#64748b' }}>Redirection : {p.redirectUrl}</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {p.captureCredentials && <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>Capture identifiants</span>}
                {p.capturePasswords && <span className="badge" style={{ background: '#fee2e2', color: '#991b1b' }}>Capture mots de passe</span>}
              </div>
              <div style={{ marginTop: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.625rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                {format(new Date(p.updatedAt), 'd MMM yyyy', { locale: fr })}
              </div>
            </div>
          ))}
          {pages.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              <Globe size={48} color="#e2e8f0" style={{ marginBottom: '1rem' }} />
              <p>Aucune page d'hameçonnage.</p>
              <button className="btn btn-primary" onClick={() => navigate('/landing-pages/new')}>Créer une page</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
