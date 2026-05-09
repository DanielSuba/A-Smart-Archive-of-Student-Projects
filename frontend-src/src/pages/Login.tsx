import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

// Funkcja służy do renderowania formularza logowania użytkownika.
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Funkcja służy do wysyłania danych logowania do API.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(email, password);
      toast.success(t.login.successToast);
      navigate('/my-projects');
    } catch (err: any) {
      setError(err.response?.data?.detail || t.login.errorFallback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <h1 className="auth-title">{t.login.title}</h1>
        <p className="auth-subtitle">{t.login.subtitle}</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t.login.email} <span>*</span></label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="student@uczelnia.pl" />
          </div>
          <div className="form-group">
            <label className="form-label">{t.login.password} <span>*</span></label>
            <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? t.login.loggingIn : t.login.submit}
          </button>
        </form>
        <div className="auth-footer">
          {t.login.noAccount} <Link to="/register">{t.login.register}</Link>
        </div>
      </div>
    </div>
  );
}
