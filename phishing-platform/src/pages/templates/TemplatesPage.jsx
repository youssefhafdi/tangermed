import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Mail } from 'lucide-react';
import api from '../../api/axios';
import useUIStore from '../../store/uiStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const CAT_FR = { credential_harvest: 'Vol identifiants', urgency: 'Urgence', it_notice: 'Notice IT', hr: 'RH', financial: 'Financier', other: 'Autre' };
const CAT_COLORS = { credential_harvest: '#fee2e2', urgency: '#fef3c7', it_notice: '#dbeafe', hr: '#fce7f3', financial: '#dcfce7', other: '#f1f5f9' };

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { notify } = useUIStore();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/templates').then(r => setTemplates(r.data.templates)).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Supprimer le modèle "${name}" ?`)) return;
    try {
      await api.delete(`/templates/${id}`);
      setTemplates(ts => ts.filter(t => t._id !== id));
      notify('Modèle supprimé', 'success');
    } catch {
      notify('Erreur', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={() => navigate('/templates/new')}><Plus size={16} /> Nouveau Modèle</button>
      </div>

      {loading ? <p style={{ color: '#94a3b8', textAlign: 'center' }}>Chargement...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {templates.map(t => (
            <div key={t._id} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: '0.625rem', background: CAT_COLORS[t.category] || '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={18} color="#2563eb" />
                </div>
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }} onClick={() => navigate(`/templates/${t._id}`)}>
                    <Edit size={13} />
                  </button>
                  <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(t._id, t.name)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.25rem', fontSize: '0.9375rem', fontWeight: 600 }}>{t.name}</h3>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b' }}>{t.subject}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: '0.75rem', padding: '0.2rem 0.625rem', borderRadius: 9999,
                  background: CAT_COLORS[t.category] || '#f1f5f9', color: '#374151', fontWeight: 500,
                }}>
                  {CAT_FR[t.category] || t.category}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {format(new Date(t.updatedAt), 'd MMM yyyy', { locale: fr })}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.625rem' }}>
                De : <strong>{t.fromName}</strong> &lt;{t.fromEmail}&gt;
              </div>
            </div>
          ))}
          {templates.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              <Mail size={48} color="#e2e8f0" style={{ marginBottom: '1rem' }} />
              <p>Aucun modèle d'email.</p>
              <button className="btn btn-primary" onClick={() => navigate('/templates/new')}>Créer le premier modèle</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
