import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Upload } from 'lucide-react';
import Papa from 'papaparse';
import api from '../../api/axios';
import useUIStore from '../../store/uiStore';

export default function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useUIStore();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTarget, setNewTarget] = useState({ email: '', firstName: '', lastName: '', department: '', position: '' });
  const fileRef = useRef();

  const fetchGroup = async () => {
    try {
      const { data } = await api.get(`/groups/${id}`);
      setGroup(data.group);
    } catch {
      notify('Groupe introuvable', 'error');
      navigate('/groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGroup(); }, [id]);

  const handleAddTarget = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(`/groups/${id}/targets`, { targets: [newTarget] });
      setGroup(data.group);
      setNewTarget({ email: '', firstName: '', lastName: '', department: '', position: '' });
      setShowAdd(false);
      notify('Cible ajoutée', 'success');
    } catch (e) {
      notify(e.response?.data?.message || 'Erreur', 'error');
    }
  };

  const handleRemoveTarget = async (targetId) => {
    if (!confirm('Supprimer cette cible ?')) return;
    try {
      const { data } = await api.delete(`/groups/${id}/targets/${targetId}`);
      setGroup(data.group);
      notify('Cible supprimée', 'success');
    } catch {
      notify('Erreur', 'error');
    }
  };

  const handleCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const targets = results.data.map(row => ({
          email: row.email || row.Email || row.EMAIL || '',
          firstName: row.firstName || row.first_name || row.Prénom || '',
          lastName: row.lastName || row.last_name || row.Nom || '',
          department: row.department || row.Department || row.Département || '',
          position: row.position || row.Position || row.Poste || '',
        })).filter(t => t.email);

        if (targets.length === 0) {
          notify('Aucune cible valide dans le CSV', 'warning');
          return;
        }
        try {
          const { data } = await api.post(`/groups/${id}/targets`, { targets });
          setGroup(data.group);
          notify(`${targets.length} cibles importées`, 'success');
        } catch {
          notify('Erreur lors de l\'importation', 'error');
        }
      },
    });
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Chargement...</div>;
  if (!group) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn btn-outline" onClick={() => navigate('/groups')} style={{ padding: '0.5rem' }}><ArrowLeft size={16} /></button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{group.name}</h1>
          {group.description && <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.875rem' }}>{group.description}</p>}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={() => fileRef.current.click()}><Upload size={15} /> Importer CSV</button>
          <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCSV} />
          <button className="btn btn-primary" onClick={() => setShowAdd(v => !v)}><Plus size={15} /> Ajouter une cible</button>
        </div>
      </div>

      {/* CSV hint */}
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.5rem', padding: '0.75rem', fontSize: '0.8125rem', color: '#166534' }}>
        <strong>Format CSV attendu :</strong> email, firstName, lastName, department, position (en-têtes en anglais ou français)
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card">
          <h3 style={{ margin: '0 0 1rem', fontSize: '0.9375rem', fontWeight: 600 }}>Ajouter une cible</h3>
          <form onSubmit={handleAddTarget} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
            <div><label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}>Email *</label>
              <input className="input" required type="email" value={newTarget.email} onChange={e => setNewTarget(t => ({ ...t, email: e.target.value }))} placeholder="prenom.nom@company.com" /></div>
            <div><label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}>Prénom *</label>
              <input className="input" required value={newTarget.firstName} onChange={e => setNewTarget(t => ({ ...t, firstName: e.target.value }))} placeholder="Jean" /></div>
            <div><label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}>Nom *</label>
              <input className="input" required value={newTarget.lastName} onChange={e => setNewTarget(t => ({ ...t, lastName: e.target.value }))} placeholder="Dupont" /></div>
            <div><label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}>Département</label>
              <input className="input" value={newTarget.department} onChange={e => setNewTarget(t => ({ ...t, department: e.target.value }))} placeholder="Finance" /></div>
            <div><label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' }}>Poste</label>
              <input className="input" value={newTarget.position} onChange={e => setNewTarget(t => ({ ...t, position: e.target.value }))} placeholder="Comptable" /></div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowAdd(false)}>Annuler</button>
              <button type="submit" className="btn btn-primary">Ajouter</button>
            </div>
          </form>
        </div>
      )}

      {/* Targets table */}
      <div className="table-container" style={{ background: 'white' }}>
        <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Cibles ({group.targets?.length ?? 0})</span>
        </div>
        <table>
          <thead>
            <tr><th>Email</th><th>Prénom</th><th>Nom</th><th>Département</th><th>Poste</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {(group.targets || []).map(t => (
              <tr key={t._id}>
                <td style={{ fontWeight: 500 }}>{t.email}</td>
                <td>{t.firstName}</td>
                <td>{t.lastName}</td>
                <td style={{ color: '#64748b' }}>{t.department || '—'}</td>
                <td style={{ color: '#64748b' }}>{t.position || '—'}</td>
                <td>
                  <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleRemoveTarget(t._id)}>
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
            {(!group.targets || group.targets.length === 0) && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                Aucune cible. Ajoutez des cibles manuellement ou importez un CSV.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
