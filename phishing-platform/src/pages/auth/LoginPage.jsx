import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fish, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e293b 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 64, height: 64, background: '#2563eb', borderRadius: '1rem',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1rem', boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
          }}>
            <Fish size={32} color="white" />
          </div>
          <h1 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.25rem' }}>PhishGuard</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>Plateforme de Simulation de Phishing</p>
        </div>

        {/* Card */}
        <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>Connexion</h2>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem',
              padding: '0.75rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.875rem',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); clearError(); }}
                  placeholder="admin@company.com"
                  required
                  className="input"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearError(); }}
                  placeholder="••••••••"
                  required
                  className="input"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {showPwd ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.9375rem', marginTop: '0.5rem' }}
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Demo credentials */}
          <div style={{ marginTop: '1.5rem', padding: '0.875rem', background: '#f0f9ff', borderRadius: '0.5rem', border: '1px solid #bae6fd' }}>
            <p style={{ margin: '0 0 0.375rem', fontSize: '0.75rem', fontWeight: 600, color: '#0369a1' }}>Comptes de démonstration</p>
            <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: '#0369a1' }}>Admin : admin@company.com / password123</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#0369a1' }}>Opérateur : operator@company.com / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
