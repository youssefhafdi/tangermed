import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Trash2, Eye } from 'lucide-react';
import api from '../../api/axios';
import useUIStore from '../../store/uiStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function GroupsPage() {
  const navigate = useNavigate();
  const { notify } = useUIStore();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/groups').then(r => setGroups(r.data.groups)).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/groups', form);
      setGroups(gs => [data.group, ...gs]);
      setShowModal(false);
      setForm({ name: '', description: '' });
      notify('Groupe créé', 'success');
    } catch {
      notify('Erreur', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Supprimer le groupe "${name}" ?`)) return;
    try {
      await api.delete(`/groups/${id}`);
      setGroups(gs => gs.filter(g => g._id !== id));
      notify('Groupe supprimé', 'success');
    } catch {
      notify('Erreur', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Nouveau Groupe</button>
      </div>

      {loading ? <p style={{ textAlign: 'center', color: '#94a3b8' }}>Chargement...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {groups.map(g => (
            <div key={g._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: 42, height: 42, borderRadius: '0.625rem', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={20} color="#2563eb" />
                </div>
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }} onClick={() => navigate(`/groups/${g._id}`)}>
                    <Eye size={13} />
                  </button>
                  <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(g._id, g.name)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.25rem', fontSize: '0.9375rem', fontWeight: 600 }}>{g.name}</h3>
                {g.description && <p style={{ margin: 0, fontSize: '0.8125rem', color: '#64748b' }}>{g.description}</p>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.625rem' }}>
                <span><strong style={{ color: '#0f172a' }}>{g.targets?.length ?? 0}</strong> cibles</span>
                <span>{format(new Date(g.updatedAt), 'd MMM yyyy', { locale: fr })}</span>
              </div>
            </div>
          ))}
          {groups.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              <Users size={48} color="#e2e8f0" style={{ marginBottom: '1rem' }} />
              <p>Aucun groupe.</p>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>Créer un groupe</button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', width: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.125rem', fontWeight: 600 }}>Nouveau Groupe Cible</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>Nom *</label>
                <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="Ex: Équipe Finance" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>Description</label>
                <textarea className="input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description du groupe..." style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Création...' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
