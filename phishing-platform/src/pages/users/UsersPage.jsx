import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit, Shield } from 'lucide-react';
import api from '../../api/axios';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ROLES = ['admin', 'operator', 'viewer'];
const ROLE_FR = { admin: 'Administrateur', operator: 'Opérateur', viewer: 'Lecteur' };
const ROLE_COLORS = { admin: '#fee2e2', operator: '#dbeafe', viewer: '#f1f5f9' };
const ROLE_TEXT = { admin: '#991b1b', operator: '#1d4ed8', viewer: '#64748b' };

export default function UsersPage() {
  const { notify } = useUIStore();
  const { user: me } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'operator' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/users').then(r => setUsers(r.data.users)).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/auth/register', form);
      setUsers(us => [data.user, ...us]);
      setShowModal(false);
      setForm({ name: '', email: '', password: '', role: 'operator' });
      notify('Utilisateur créé', 'success');
    } catch (e) {
      notify(e.response?.data?.message || 'Erreur', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      await api.put(`/users/${id}`, { isActive: !isActive });
      setUsers(us => us.map(u => u._id === id ? { ...u, isActive: !isActive } : u));
      notify(isActive ? 'Utilisateur désactivé' : 'Utilisateur activé', 'success');
    } catch {
      notify('Erreur', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Supprimer l'utilisateur "${name}" ?`)) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(us => us.filter(u => u._id !== id));
      notify('Utilisateur supprimé', 'success');
    } catch (e) {
      notify(e.response?.data?.message || 'Erreur', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Nouvel Utilisateur</button>
      </div>

      <div className="table-container" style={{ background: 'white' }}>
        <table>
          <thead>
            <tr><th>Utilisateur</th><th>Email</th><th>Rôle</th><th>Statut</th><th>Dernière connexion</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Chargement...</td></tr>
            ) : users.map(u => (
              <tr key={u._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#2563eb', fontSize: '0.875rem' }}>
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 500 }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ color: '#64748b' }}>{u.email}</td>
                <td>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.625rem', borderRadius: 9999, background: ROLE_COLORS[u.role], color: ROLE_TEXT[u.role], fontWeight: 500 }}>
                    {ROLE_FR[u.role]}
                  </span>
                </td>
                <td>
                  <span className={`badge ${u.isActive ? 'badge-active' : 'badge-draft'}`}>
                    {u.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td style={{ color: '#64748b', fontSize: '0.8125rem' }}>
                  {u.lastLogin ? format(new Date(u.lastLogin), 'd MMM yyyy HH:mm', { locale: fr }) : 'Jamais'}
                </td>
                <td>
                  {u._id !== me?._id && (
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => handleToggleActive(u._id, u.isActive)}
                        title={u.isActive ? 'Désactiver' : 'Activer'}
                      >
                        <Shield size={13} />
                      </button>
                      <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(u._id, u.name)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', width: 440 }}>
            <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.125rem', fontWeight: 600 }}>Nouvel Utilisateur</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>Nom complet *</label>
                <input className="input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jean Dupont" /></div>
              <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>Email *</label>
                <input className="input" required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jean@company.com" /></div>
              <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>Mot de passe *</label>
                <input className="input" required type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 6 caractères" /></div>
              <div><label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>Rôle</label>
                <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  {ROLES.map(r => <option key={r} value={r}>{ROLE_FR[r]}</option>)}
                </select></div>
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
