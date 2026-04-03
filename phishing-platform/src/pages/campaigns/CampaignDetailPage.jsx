import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../api/axios';
import useUIStore from '../../store/uiStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const RISK_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
const STATUS_FR = { draft: 'Brouillon', active: 'Active', paused: 'En pause', completed: 'Terminée' };
const EVENT_FR = { email_sent: 'Email envoyé', email_opened: 'Email ouvert', link_clicked: 'Lien cliqué', data_submitted: 'Données soumises', reported: 'Signalé' };

export default function CampaignDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useUIStore();
  const [campaign, setCampaign] = useState(null);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const fetchCampaign = async () => {
    try {
      const { data } = await api.get(`/campaigns/${id}`);
      setCampaign(data.campaign);
    } catch {
      notify('Campagne introuvable', 'error');
      navigate('/campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCampaign(); }, [id]);

  const handleLaunch = async () => {
    try {
      const { data } = await api.post(`/campaigns/${id}/launch`);
      notify(data.message, 'success');
      fetchCampaign();
    } catch (e) {
      notify(e.response?.data?.message || 'Erreur', 'error');
    }
  };

  const handlePause = async () => {
    try {
      await api.post(`/campaigns/${id}/pause`);
      notify('Campagne mise en pause', 'success');
      fetchCampaign();
    } catch {
      notify('Erreur', 'error');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Chargement...</div>;
  if (!campaign) return null;

  const stats = campaign.stats || {};
  const funnelData = [
    { name: 'Envoyés', value: stats.sent || 0, fill: '#93c5fd' },
    { name: 'Ouverts', value: stats.opened || 0, fill: '#818cf8' },
    { name: 'Cliqués', value: stats.clicked || 0, fill: '#fb923c' },
    { name: 'Soumis', value: stats.submitted || 0, fill: '#f87171' },
    { name: 'Signalés', value: stats.reported || 0, fill: '#4ade80' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <button className="btn btn-outline" onClick={() => navigate('/campaigns')} style={{ padding: '0.5rem' }}>
          <ArrowLeft size={16} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{campaign.name}</h1>
            <span className={`badge badge-${campaign.status}`}>{STATUS_FR[campaign.status]}</span>
          </div>
          {campaign.description && <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>{campaign.description}</p>}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {campaign.status === 'draft' && (
            <button className="btn btn-primary" onClick={handleLaunch}><Play size={15} /> Lancer</button>
          )}
          {campaign.status === 'active' && (
            <button className="btn" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }} onClick={handlePause}>
              <Pause size={15} /> Pause
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '0' }}>
        {['overview', 'results'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '0.625rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer',
            fontSize: '0.875rem', fontWeight: tab === t ? 600 : 400,
            color: tab === t ? '#2563eb' : '#64748b',
            borderBottom: tab === t ? '2px solid #2563eb' : '2px solid transparent',
            transition: 'all 0.15s',
          }}>
            {t === 'overview' ? 'Aperçu' : 'Résultats détaillés'}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
            {funnelData.map(({ name, value, fill }) => (
              <div key={name} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: fill }}>{value}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>{name}</div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="card">
            <h3 style={{ margin: '0 0 1rem', fontSize: '0.9375rem', fontWeight: 600 }}>Entonnoir de la campagne</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={funnelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {funnelData.map((entry, i) => (
                    <rect key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="card">
              <h3 style={{ margin: '0 0 0.875rem', fontSize: '0.9375rem', fontWeight: 600 }}>Informations</h3>
              {[
                ['Modèle', campaign.template?.name || '—'],
                ['Groupe', `${campaign.group?.name || '—'} (${campaign.group?.targets?.length || 0} cibles)`],
                ['Page', campaign.landingPage?.name || '—'],
                ['Créé par', campaign.createdBy?.name || '—'],
                ['Lancement', campaign.launchDate ? format(new Date(campaign.launchDate), 'd MMM yyyy HH:mm', { locale: fr }) : '—'],
                ['Fin', campaign.endDate ? format(new Date(campaign.endDate), 'd MMM yyyy', { locale: fr }) : '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem' }}>
                  <span style={{ color: '#64748b' }}>{k}</span>
                  <span style={{ fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
            <div className="card">
              <h3 style={{ margin: '0 0 0.875rem', fontSize: '0.9375rem', fontWeight: 600 }}>Taux de performance</h3>
              {stats.sent > 0 && [
                ['Taux d\'ouverture', stats.opened, '#818cf8'],
                ['Taux de clic', stats.clicked, '#fb923c'],
                ['Taux de soumission', stats.submitted, '#f87171'],
                ['Taux de signalement', stats.reported, '#4ade80'],
              ].map(([label, val, color]) => {
                const pct = Math.round((val / stats.sent) * 100);
                return (
                  <div key={label} style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: '#64748b' }}>{label}</span>
                      <span style={{ fontWeight: 600 }}>{pct}%</span>
                    </div>
                    <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'results' && (
        <div className="table-container" style={{ background: 'white' }}>
          <table>
            <thead>
              <tr><th>Cible</th><th>Département</th><th>Événements</th><th>Dernier événement</th><th>Risque</th></tr>
            </thead>
            <tbody>
              {(campaign.results || []).map((r, i) => {
                const lastEvent = r.events?.[r.events.length - 1];
                return (
                  <tr key={i} style={{ background: r.riskLevel === 'high' ? '#fef2f2' : r.events?.some(e => e.type === 'reported') ? '#f0fdf4' : undefined }}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{r.targetName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{r.targetEmail}</div>
                    </td>
                    <td style={{ color: '#64748b' }}>{r.department || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {r.events?.map((e, j) => (
                          <span key={j} style={{
                            fontSize: '0.7rem', padding: '0.125rem 0.5rem', borderRadius: 9999,
                            background: e.type === 'data_submitted' ? '#fee2e2' : e.type === 'link_clicked' ? '#fef3c7' : e.type === 'reported' ? '#dcfce7' : '#f1f5f9',
                            color: e.type === 'data_submitted' ? '#991b1b' : e.type === 'link_clicked' ? '#92400e' : e.type === 'reported' ? '#166534' : '#64748b',
                          }}>
                            {EVENT_FR[e.type] || e.type}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                      {lastEvent ? format(new Date(lastEvent.timestamp), 'd MMM HH:mm', { locale: fr }) : '—'}
                    </td>
                    <td><span className={`badge badge-${r.riskLevel}`}>{r.riskLevel === 'high' ? 'Élevé' : r.riskLevel === 'medium' ? 'Moyen' : 'Faible'}</span></td>
                  </tr>
                );
              })}
              {(!campaign.results || campaign.results.length === 0) && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  Aucun résultat. Lancez la campagne d'abord.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
