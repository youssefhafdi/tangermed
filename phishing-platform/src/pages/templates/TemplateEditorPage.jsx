import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import api from '../../api/axios';
import useUIStore from '../../store/uiStore';

const CATEGORIES = [
  { value: 'credential_harvest', label: 'Vol d\'identifiants' },
  { value: 'urgency', label: 'Urgence' },
  { value: 'it_notice', label: 'Notice IT' },
  { value: 'hr', label: 'Ressources Humaines' },
  { value: 'financial', label: 'Financier' },
  { value: 'other', label: 'Autre' },
];

const DEFAULT_HTML = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:#1e3a8a;padding:20px;text-align:center">
    <h1 style="color:white;margin:0">Votre Entreprise</h1>
  </div>
  <div style="padding:30px;background:#f9fafb">
    <p>Bonjour {{FirstName}},</p>
    <p>Votre message ici.</p>
    <div style="text-align:center;margin:30px 0">
      <a href="{{PhishingLink}}" style="background:#2563eb;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;font-size:16px">
        Cliquez ici
      </a>
    </div>
    <p style="color:#6b7280;font-size:12px">Ceci est un test de sécurité.</p>
  </div>
</div>`;

export default function TemplateEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useUIStore();
  const isNew = id === 'new';
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', subject: '', fromName: '', fromEmail: '',
    category: 'other', htmlContent: DEFAULT_HTML,
  });

  useEffect(() => {
    if (!isNew) {
      api.get(`/templates/${id}`).then(r => {
        const t = r.data.template;
        setForm({ name: t.name, subject: t.subject, fromName: t.fromName, fromEmail: t.fromEmail, category: t.category, htmlContent: t.htmlContent });
      }).catch(() => { notify('Modèle introuvable', 'error'); navigate('/templates'); });
    }
  }, [id]);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.subject || !form.fromName || !form.fromEmail) {
      notify('Veuillez remplir tous les champs obligatoires', 'warning');
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        await api.post('/templates', form);
      } else {
        await api.put(`/templates/${id}`, form);
      }
      notify(`Modèle ${isNew ? 'créé' : 'mis à jour'} avec succès`, 'success');
      navigate('/templates');
    } catch (e) {
      notify(e.response?.data?.message || 'Erreur', 'error');
    } finally {
      setSaving(false);
    }
  };

  const previewHtml = form.htmlContent
    .replace(/\{\{FirstName\}\}/g, 'Jean')
    .replace(/\{\{LastName\}\}/g, 'Dupont')
    .replace(/\{\{Email\}\}/g, 'jean.dupont@company.com')
    .replace(/\{\{Company\}\}/g, 'MonEntreprise')
    .replace(/\{\{PhishingLink\}\}/g, '#');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 128px)' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-outline" onClick={() => navigate('/templates')}><ArrowLeft size={16} /> Retour</button>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={() => setShowPreview(v => !v)}>
            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
            {showPreview ? 'Masquer aperçu' : 'Aperçu'}
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showPreview ? '1fr 1fr' : '1fr', gap: '1rem', flex: 1, overflow: 'hidden' }}>
        {/* Editor */}
        <div className="card" style={{ overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{isNew ? 'Nouveau Modèle' : 'Modifier le Modèle'}</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>Nom du modèle *</label>
              <input className="input" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Ex: Réinitialisation mot de passe" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>Catégorie</label>
              <select className="input" value={form.category} onChange={e => update('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>Nom expéditeur *</label>
              <input className="input" value={form.fromName} onChange={e => update('fromName', e.target.value)} placeholder="Support IT" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>Email expéditeur *</label>
              <input className="input" value={form.fromEmail} onChange={e => update('fromEmail', e.target.value)} placeholder="support@company.com" />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>Sujet *</label>
            <input className="input" value={form.subject} onChange={e => update('subject', e.target.value)} placeholder="Ex: Action requise : votre compte" />
          </div>

          {/* Variables hint */}
          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '0.5rem', padding: '0.75rem' }}>
            <p style={{ margin: '0 0 0.375rem', fontSize: '0.75rem', fontWeight: 600, color: '#0369a1' }}>Variables disponibles :</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {['{{FirstName}}', '{{LastName}}', '{{Email}}', '{{Company}}', '{{PhishingLink}}'].map(v => (
                <code key={v} style={{ fontSize: '0.75rem', background: 'white', border: '1px solid #bae6fd', borderRadius: '0.25rem', padding: '0.125rem 0.375rem', cursor: 'pointer', color: '#0369a1' }}
                  onClick={() => navigator.clipboard.writeText(v)}
                >{v}</code>
              ))}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>Corps HTML *</label>
            <textarea
              value={form.htmlContent}
              onChange={e => update('htmlContent', e.target.value)}
              style={{
                width: '100%', height: 300, padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.8125rem',
                border: '1px solid #d1d5db', borderRadius: '0.5rem', resize: 'vertical', outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600 }}>Aperçu</h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>Les variables sont remplacées par des données exemple</p>
            </div>
            <div style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '0.5rem', overflow: 'hidden' }}>
              <iframe
                srcDoc={previewHtml}
                title="preview"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
