import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import api from '../../api/axios';
import useUIStore from '../../store/uiStore';

const STEPS = ['Détails', 'Modèle Email', 'Groupe Cible', 'Page & Confirmation'];

export default function CampaignCreatePage() {
  const navigate = useNavigate();
  const { notify } = useUIStore();
  const [step, setStep] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [groups, setGroups] = useState([]);
  const [landingPages, setLandingPages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '', description: '', launchDate: '', endDate: '',
    templateId: '', groupId: '', landingPageId: '', smtpProfile: 'default',
  });

  useEffect(() => {
    Promise.all([
      api.get('/templates'),
      api.get('/groups'),
      api.get('/landing-pages'),
    ]).then(([t, g, lp]) => {
      setTemplates(t.data.templates);
      setGroups(g.data.groups);
      setLandingPages(lp.data.landingPages);
    });
  }, []);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const canNext = () => {
    if (step === 0) return form.name.trim().length >= 3;
    if (step === 1) return !!form.templateId;
    if (step === 2) return !!form.groupId;
    return !!form.landingPageId;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post('/campaigns', {
        name: form.name,
        description: form.description,
        launchDate: form.launchDate || undefined,
        endDate: form.endDate || undefined,
        template: form.templateId,
        group: form.groupId,
        landingPage: form.landingPageId,
        smtpProfile: form.smtpProfile,
      });
      notify('Campagne créée avec succès !', 'success');
      navigate('/campaigns');
    } catch (e) {
      notify(e.response?.data?.message || 'Erreur lors de la création', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : undefined }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, fontSize: '0.8125rem', flexShrink: 0,
                background: i < step ? '#10b981' : i === step ? '#2563eb' : '#e2e8f0',
                color: i <= step ? 'white' : '#94a3b8',
              }}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span style={{ fontSize: '0.8125rem', fontWeight: i === step ? 600 : 400, color: i === step ? '#0f172a' : '#94a3b8', whiteSpace: 'nowrap' }}>
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, margin: '0 0.75rem', background: i < step ? '#10b981' : '#e2e8f0' }} />
            )}
          </div>
        ))}
      </div>

      <div className="card">
        {/* Step 0 */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', fontWeight: 600 }}>Détails de la campagne</h2>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>Nom *</label>
              <input className="input" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Ex: Campagne Q2 Finance" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>Description</label>
              <textarea className="input" rows={3} value={form.description} onChange={e => update('description', e.target.value)} placeholder="Objectif de la campagne..." style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>Date de lancement</label>
                <input className="input" type="datetime-local" value={form.launchDate} onChange={e => update('launchDate', e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>Date de fin</label>
                <input className="input" type="datetime-local" value={form.endDate} onChange={e => update('endDate', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <div>
            <h2 style={{ margin: '0 0 1rem', fontSize: '1.125rem', fontWeight: 600 }}>Sélectionner un modèle email</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
              {templates.map(t => (
                <div
                  key={t._id}
                  onClick={() => update('templateId', t._id)}
                  style={{
                    border: `2px solid ${form.templateId === t._id ? '#2563eb' : '#e2e8f0'}`,
                    borderRadius: '0.75rem', padding: '1rem', cursor: 'pointer',
                    background: form.templateId === t._id ? '#eff6ff' : 'white',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '0.375rem', fontSize: '0.9rem' }}>{t.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>{t.subject}</div>
                  <span className="badge badge-draft" style={{ fontSize: '0.7rem' }}>{t.category}</span>
                </div>
              ))}
              {templates.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                  <p>Aucun modèle. <button className="btn btn-primary" onClick={() => navigate('/templates')} style={{ marginLeft: '0.5rem' }}>Créer un modèle</button></p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <h2 style={{ margin: '0 0 1rem', fontSize: '1.125rem', fontWeight: 600 }}>Sélectionner un groupe cible</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {groups.map(g => (
                <div
                  key={g._id}
                  onClick={() => update('groupId', g._id)}
                  style={{
                    border: `2px solid ${form.groupId === g._id ? '#2563eb' : '#e2e8f0'}`,
                    borderRadius: '0.75rem', padding: '1rem', cursor: 'pointer',
                    background: form.groupId === g._id ? '#eff6ff' : 'white',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{g.name}</div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>{g.targets?.length ?? 0} cibles</div>
                  {g.description && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{g.description}</div>}
                </div>
              ))}
              {groups.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                  <p>Aucun groupe. <button className="btn btn-primary" onClick={() => navigate('/groups')} style={{ marginLeft: '0.5rem' }}>Créer un groupe</button></p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Page d'hameçonnage & Confirmation</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              {landingPages.map(lp => (
                <div
                  key={lp._id}
                  onClick={() => update('landingPageId', lp._id)}
                  style={{
                    border: `2px solid ${form.landingPageId === lp._id ? '#2563eb' : '#e2e8f0'}`,
                    borderRadius: '0.75rem', padding: '1rem', cursor: 'pointer',
                    background: form.landingPageId === lp._id ? '#eff6ff' : 'white',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{lp.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Redirect: {lp.redirectUrl}</div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 0.875rem', fontSize: '0.9375rem', fontWeight: 600 }}>Récapitulatif</h3>
              {[
                ['Nom', form.name],
                ['Modèle', templates.find(t => t._id === form.templateId)?.name || '—'],
                ['Groupe', groups.find(g => g._id === form.groupId)?.name || '—'],
                ['Cibles', groups.find(g => g._id === form.groupId)?.targets?.length ?? 0],
                ['Page', landingPages.find(l => l._id === form.landingPageId)?.name || '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0', borderBottom: '1px solid #e2e8f0', fontSize: '0.875rem' }}>
                  <span style={{ color: '#64748b' }}>{k}</span>
                  <span style={{ fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nav buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
          <button
            className="btn btn-outline"
            onClick={() => step === 0 ? navigate('/campaigns') : setStep(s => s - 1)}
          >
            <ChevronLeft size={16} /> {step === 0 ? 'Annuler' : 'Précédent'}
          </button>
          {step < 3 ? (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)} disabled={!canNext()}>
              Suivant <ChevronRight size={16} />
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleSubmit} disabled={!canNext() || submitting}>
              {submitting ? 'Création...' : <><Check size={16} /> Créer la campagne</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
