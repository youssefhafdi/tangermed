import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
import useUIStore from '../store/uiStore';

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head><title>Connexion</title>
<style>
  body { font-family: Arial, sans-serif; background: #f0f4f8; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
  .card { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); width: 360px; }
  h1 { color: #1e3a8a; text-align: center; margin-top: 0; }
  input { width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; margin: 8px 0; box-sizing: border-box; font-size: 14px; }
  button { width: 100%; padding: 12px; background: #2563eb; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; margin-top: 10px; }
  .hint { color: #ef4444; font-size: 12px; text-align: center; margin-top: 10px; }
</style>
</head>
<body>
  <div class="card">
    <h1>🏢 Portail Entreprise</h1>
    <form>
      <label>Email</label>
      <input type="email" placeholder="votre@email.com" />
      <label>Mot de passe</label>
      <input type="password" placeholder="••••••••" />
      <button type="submit">Se connecter</button>
    </form>
    <p class="hint">⚠️ Simulation de phishing - Formation sécurité</p>
  </div>
</body>
</html>`;

export default function LandingPageEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useUIStore();
  const isNew = id === 'new';
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', redirectUrl: 'https://www.google.com',
    captureCredentials: true, capturePasswords: false,
    htmlContent: DEFAULT_HTML,
  });

  useEffect(() => {
    if (!isNew) {
      api.get(`/landing-pages/${id}`).then(r => {
        const p = r.data.landingPage;
        setForm({ name: p.name, redirectUrl: p.redirectUrl, captureCredentials: p.captureCredentials, capturePasswords: p.capturePasswords, htmlContent: p.htmlContent });
      }).catch(() => { notify('Page introuvable', 'error'); navigate('/landing-pages'); });
    }
  }, [id]);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name) { notify('Le nom est requis', 'warning'); return; }
    setSaving(true);
    try {
      if (isNew) {
        await api.post('/landing-pages', form);
      } else {
        await api.put(`/landing-pages/${id}`, form);
      }
      notify(`Page ${isNew ? 'créée' : 'mise à jour'}`, 'success');
      navigate('/landing-pages');
    } catch (e) {
      notify(e.response?.data?.message || 'Erreur', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 128px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-outline" onClick={() => navigate('/landing-pages')}><ArrowLeft size={16} /> Retour</button>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={() => setShowPreview(v => !v)}>
            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
            {showPreview ? 'Masquer' : 'Aperçu'}
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showPreview ? '1fr 1fr' : '1fr', gap: '1rem', flex: 1, overflow: 'hidden' }}>
        <div className="card" style={{ overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{isNew ? 'Nouvelle Page' : 'Modifier la Page'}</h2>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>Nom *</label>
            <input className="input" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Ex: Portail Microsoft 365" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>URL de redirection (après soumission)</label>
            <input className="input" value={form.redirectUrl} onChange={e => update('redirectUrl', e.target.value)} placeholder="https://..." />
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input type="checkbox" checked={form.captureCredentials} onChange={e => update('captureCredentials', e.target.checked)} />
              Capturer les identifiants
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input type="checkbox" checked={form.capturePasswords} onChange={e => update('capturePasswords', e.target.checked)} />
              Capturer les mots de passe
            </label>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>HTML de la page *</label>
            <textarea
              value={form.htmlContent}
              onChange={e => update('htmlContent', e.target.value)}
              style={{ width: '100%', height: 400, padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.8125rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', resize: 'vertical', outline: 'none' }}
            />
          </div>
        </div>

        {showPreview && (
          <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.9375rem', fontWeight: 600 }}>Aperçu</h3>
            <div style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '0.5rem', overflow: 'hidden' }}>
              <iframe srcDoc={form.htmlContent} title="preview" style={{ width: '100%', height: '100%', border: 'none' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
