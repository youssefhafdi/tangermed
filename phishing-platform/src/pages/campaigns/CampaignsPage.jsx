import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Play, Pause, Trash2, Eye, Search } from 'lucide-react';
import api from '../../api/axios';
import useUIStore from '../../store/uiStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUS_TABS = ['all', 'draft', 'active', 'paused', 'completed'];
const STATUS_FR = { all: 'Tous', draft: 'Brouillon', active: 'Active', paused: 'En pause', completed: 'Terminée' };

export default function CampaignsPage() {
  const navigate = useNavigate();
  const { notify } = useUIStore();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/campaigns', { params: { status, search } });
      setCampaigns(data.campaigns);
      setTotal(data.total);
    } catch (e) {
      notify('Erreur de chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCampaigns(); }, [status, search]);

  const handleLaunch = async (id) => {
    try {
      const { data } = await api.post(`/campaigns/${id}/launch`);
      notify(data.message, 'success');
      fetchCampaigns();
    } catch (e) {
      notify(e.response?.data?.message || 'Erreur', 'error');
    }
  };

  const handlePause = async (id) => {
    try {
      await api.post(`/campaigns/${id}/pause`);
      notify('Campagne mise en pause', 'success');
      fetchCampaigns();
    } catch {
      notify('Erreur', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Supprimer la campagne "${name}" ?`)) return;
    try {
      await api.delete(`/campaigns/${id}`);
      notify('Campagne supprimée', 'success');
      fetchCampaigns();
    } catch {
      notify('Erreur', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>{total} campagne(s)</p>
        <button className="btn btn-primary" onClick={() => navigate('/campaigns/new')}>
          <Plus size={16} /> Nouvelle Campagne
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {STATUS_TABS.map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              style={{
                padding: '0.375rem 0.875rem', borderRadius: '0.375rem', border: 'none',
                cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 500,
                background: status === s ? '#2563eb' : '#f1f5f9',
                color: status === s ? 'white' : '#64748b',
                transition: 'all 0.15s',
              }}
            >
              {STATUS_FR[s]}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input"
            style={{ paddingLeft: '2rem', width: 220 }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-container" style={{ background: 'white' }}>
        <table>
          <thead>
            <tr>
              <th>Campagne</th><th>Statut</th><th>Date de lancement</th>
              <th>Cibles</th><th>Envoyés</th><th>Cliqués</th><th>Soumis</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Chargement...</td></tr>
            ) : campaigns.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                Aucune campagne. <button className="btn btn-primary" style={{ marginLeft: '1rem' }} onClick={() => navigate('/campaigns/new')}>Créer</button>
              </td></tr>
            ) : campaigns.map(c => {
              const stats = c.stats || {};
              return (
                <tr key={c._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{c.name}</div>
                    {c.description && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.125rem' }}>{c.description}</div>}
                  </td>
                  <td><span className={`badge badge-${c.status}`}>{STATUS_FR[c.status]}</span></td>
                  <td style={{ color: '#64748b', fontSize: '0.8125rem' }}>
                    {c.launchDate ? format(new Date(c.launchDate), 'd MMM yyyy', { locale: fr }) : '—'}
                  </td>
                  <td style={{ fontWeight: 500 }}>{c.group?.targets?.length ?? 0}</td>
                  <td>{stats.sent ?? 0}</td>
                  <td style={{ color: stats.clicked > 0 ? '#f59e0b' : undefined, fontWeight: stats.clicked > 0 ? 600 : 400 }}>{stats.clicked ?? 0}</td>
                  <td style={{ color: stats.submitted > 0 ? '#ef4444' : undefined, fontWeight: stats.submitted > 0 ? 600 : 400 }}>{stats.submitted ?? 0}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }} onClick={() => navigate(`/campaigns/${c._id}`)} title="Détails">
                        <Eye size={14} />
                      </button>
                      {c.status === 'draft' && (
                        <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleLaunch(c._id)} title="Lancer">
                          <Play size={14} />
                        </button>
                      )}
                      {c.status === 'active' && (
                        <button className="btn" style={{ padding: '0.25rem 0.5rem', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }} onClick={() => handlePause(c._id)} title="Pause">
                          <Pause size={14} />
                        </button>
                      )}
                      <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(c._id, c.name)} title="Supprimer">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
