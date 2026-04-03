import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend } from 'recharts';
import api from '../../api/axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUS_FR = { draft: 'Brouillon', active: 'Active', paused: 'En pause', completed: 'Terminée' };
const EVENT_FR = { email_sent: 'Envoyé', email_opened: 'Ouvert', link_clicked: 'Cliqué', data_submitted: 'Soumis', reported: 'Signalé' };

export default function ResultsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [selected, setSelected] = useState('');
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/campaigns').then(r => {
      setCampaigns(r.data.campaigns);
      if (r.data.campaigns.length > 0) setSelected(r.data.campaigns[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    api.get(`/campaigns/${selected}`)
      .then(r => setCampaign(r.data.campaign))
      .finally(() => setLoading(false));
  }, [selected]);

  const stats = campaign?.stats || {};

  const funnelData = [
    { name: 'Envoyés', value: stats.sent || 0 },
    { name: 'Ouverts', value: stats.opened || 0 },
    { name: 'Cliqués', value: stats.clicked || 0 },
    { name: 'Soumis', value: stats.submitted || 0 },
    { name: 'Signalés', value: stats.reported || 0 },
  ];

  // Timeline: events by day
  const timelineMap = {};
  (campaign?.results || []).forEach(r => {
    r.events?.forEach(e => {
      const day = format(new Date(e.timestamp), 'dd/MM');
      if (!timelineMap[day]) timelineMap[day] = { day, Ouverts: 0, Cliqués: 0, Soumis: 0 };
      if (e.type === 'email_opened') timelineMap[day].Ouverts++;
      if (e.type === 'link_clicked') timelineMap[day].Cliqués++;
      if (e.type === 'data_submitted') timelineMap[day].Soumis++;
    });
  });
  const timelineData = Object.values(timelineMap).sort((a, b) => a.day.localeCompare(b.day));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Campaign selector */}
      <div className="card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151', whiteSpace: 'nowrap' }}>Campagne :</label>
        <select className="input" style={{ maxWidth: 350 }} value={selected} onChange={e => setSelected(e.target.value)}>
          {campaigns.map(c => <option key={c._id} value={c._id}>{c.name} ({STATUS_FR[c.status]})</option>)}
        </select>
      </div>

      {loading ? <p style={{ textAlign: 'center', color: '#94a3b8' }}>Chargement...</p> : campaign && (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
            {funnelData.map(({ name, value }) => (
              <div key={name} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a' }}>{value}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>{name}</div>
                {stats.sent > 0 && name !== 'Envoyés' && (
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {Math.round((value / stats.sent) * 100)}%
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="card">
              <h3 style={{ margin: '0 0 1rem', fontSize: '0.9375rem', fontWeight: 600 }}>Entonnoir</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={funnelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Nombre" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <h3 style={{ margin: '0 0 1rem', fontSize: '0.9375rem', fontWeight: 600 }}>Chronologie des événements</h3>
              {timelineData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Ouverts" stroke="#818cf8" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="Cliqués" stroke="#fb923c" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="Soumis" stroke="#f87171" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>Aucun événement</div>
              )}
            </div>
          </div>

          {/* Results table */}
          <div className="table-container" style={{ background: 'white' }}>
            <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600 }}>Résultats individuels ({campaign.results?.length ?? 0})</h3>
            </div>
            <table>
              <thead>
                <tr><th>Cible</th><th>Département</th><th>Envoyé</th><th>Ouvert</th><th>Cliqué</th><th>Soumis</th><th>Signalé</th><th>Risque</th></tr>
              </thead>
              <tbody>
                {(campaign.results || []).map((r, i) => {
                  const has = (type) => r.events?.some(e => e.type === type);
                  const getTime = (type) => {
                    const ev = r.events?.find(e => e.type === type);
                    return ev ? format(new Date(ev.timestamp), 'HH:mm d/MM', { locale: fr }) : null;
                  };
                  return (
                    <tr key={i} style={{ background: r.riskLevel === 'high' ? '#fef2f2' : has('reported') ? '#f0fdf4' : undefined }}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{r.targetName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{r.targetEmail}</div>
                      </td>
                      <td style={{ color: '#64748b' }}>{r.department || '—'}</td>
                      {['email_sent', 'email_opened', 'link_clicked', 'data_submitted', 'reported'].map(type => (
                        <td key={type}>
                          {has(type) ? (
                            <div>
                              <div style={{ color: type === 'data_submitted' ? '#dc2626' : type === 'reported' ? '#16a34a' : '#64748b', fontWeight: 600 }}>✓</div>
                              {getTime(type) && <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{getTime(type)}</div>}
                            </div>
                          ) : <span style={{ color: '#e2e8f0' }}>—</span>}
                        </td>
                      ))}
                      <td><span className={`badge badge-${r.riskLevel}`}>{r.riskLevel === 'high' ? 'Élevé' : r.riskLevel === 'medium' ? 'Moyen' : 'Faible'}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {campaigns.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          Aucune campagne disponible.
        </div>
      )}
    </div>
  );
}
