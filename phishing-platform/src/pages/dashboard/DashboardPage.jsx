import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from 'recharts';
import { Target, Mail, AlertTriangle, TrendingUp, Eye, MousePointer, ShieldAlert } from 'lucide-react';
import api from '../../api/axios';

const STATUS_COLORS = { draft: '#94a3b8', active: '#3b82f6', paused: '#f59e0b', completed: '#10b981' };
const STATUS_FR = { draft: 'Brouillon', active: 'Active', paused: 'En pause', completed: 'Terminée' };

function KpiCard({ title, value, icon: Icon, color, sub }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
      <div style={{ width: 48, height: 48, borderRadius: '0.75rem', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <p style={{ margin: '0 0 0.25rem', fontSize: '0.8125rem', color: '#64748b', fontWeight: 500 }}>{title}</p>
        <p style={{ margin: '0 0 0.125rem', fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/campaigns/stats/dashboard')
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(4,1fr)' }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card" style={{ height: 100, background: '#f1f5f9', animation: 'pulse 1.5s infinite' }} />
      ))}
    </div>
  );

  const statusData = Object.entries(
    (stats?.campaignStats || []).reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: STATUS_FR[name] || name, value, color: STATUS_COLORS[name] }));

  const funnelData = (stats?.campaignStats || []).slice(0, 6).map(c => ({
    name: c.name?.length > 15 ? c.name.slice(0, 15) + '…' : c.name,
    Envoyés: c.sent,
    Ouverts: c.opened,
    Cliqués: c.clicked,
    Soumis: c.submitted,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <KpiCard title="Campagnes Actives" value={stats?.activeCampaigns ?? 0} icon={Target} color="#2563eb" sub={`${stats?.totalCampaigns ?? 0} total`} />
        <KpiCard title="Taux de Phishing" value={`${stats?.phishRate ?? 0}%`} icon={TrendingUp} color="#f59e0b" sub="des emails cliqués" />
        <KpiCard title="Identifiants Volés" value={stats?.totalSubmitted ?? 0} icon={ShieldAlert} color="#ef4444" sub="formulaires soumis" />
        <KpiCard title="Emails Rapportés" value={stats?.totalReported ?? 0} icon={Eye} color="#10b981" sub="bonne réaction" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1rem' }}>
        {/* Funnel Chart */}
        <div className="card">
          <h3 style={{ margin: '0 0 1rem', fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a' }}>Entonnoir par Campagne</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={funnelData} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Envoyés" fill="#93c5fd" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Ouverts" fill="#818cf8" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Cliqués" fill="#fb923c" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Soumis" fill="#f87171" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut */}
        <div className="card">
          <h3 style={{ margin: '0 0 1rem', fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a' }}>Statut des Campagnes</h3>
          {statusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                {statusData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }} />
                    <span style={{ color: '#64748b' }}>{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#94a3b8', paddingTop: '2rem' }}>
              <p>Aucune campagne</p>
              <button className="btn btn-primary" onClick={() => navigate('/campaigns/new')} style={{ marginTop: '0.5rem' }}>
                Créer une campagne
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent campaigns */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a' }}>Campagnes Récentes</h3>
          <button className="btn btn-outline" onClick={() => navigate('/campaigns')} style={{ fontSize: '0.8125rem' }}>
            Voir tout
          </button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Campagne</th><th>Statut</th><th>Envoyés</th>
                <th>Ouverts</th><th>Cliqués</th><th>Soumis</th><th>Taux</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.campaignStats || []).slice(0, 5).map((c, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td>
                  <td><span className={`badge badge-${c.status}`}>{STATUS_FR[c.status]}</span></td>
                  <td>{c.sent}</td>
                  <td>{c.opened}</td>
                  <td>{c.clicked}</td>
                  <td style={{ color: c.submitted > 0 ? '#dc2626' : undefined, fontWeight: c.submitted > 0 ? 600 : 400 }}>{c.submitted}</td>
                  <td style={{ fontWeight: 600, color: c.sent > 0 && (c.clicked / c.sent) > 0.3 ? '#dc2626' : '#0f172a' }}>
                    {c.sent > 0 ? `${Math.round((c.clicked / c.sent) * 100)}%` : '—'}
                  </td>
                </tr>
              ))}
              {(!stats?.campaignStats || stats.campaignStats.length === 0) && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>Aucune campagne</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
