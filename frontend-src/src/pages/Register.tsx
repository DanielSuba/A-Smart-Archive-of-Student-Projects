import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

// Funkcja służy do renderowania formularza rejestracji użytkownika.
export default function Register() {
  const [form, setForm] = useState({ email: '', name: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Funkcja służy do wysyłania danych rejestracji do API.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError(t.register.passwordMismatch); return; }
    if (form.password.length < 6) { setError(t.register.passwordTooShort); return; }
    setLoading(true); setError('');
    try {
      await register(form.email, form.name, form.password);
      toast.success(t.register.successToast);
      navigate('/my-projects');
    } catch (err: any) {
      setError(err.response?.data?.detail || t.register.errorFallback);
    } finally {
      setLoading(false);
    }
  };

  // Funkcja służy do aktualizowania wybranego pola formularza rejestracji.
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <h1 className="auth-title">{t.register.title}</h1>
        <p className="auth-subtitle">{t.register.subtitle}</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t.register.fullName} <span>*</span></label>
            <input className="form-input" value={form.name} onChange={set('name')} required placeholder="Jan Kowalski" />
          </div>
          <div className="form-group">
            <label className="form-label">{t.register.email} <span>*</span></label>
            <input className="form-input" type="email" value={form.email} onChange={set('email')} required placeholder="student@uczelnia.pl" />
          </div>
          <div className="form-group">
            <label className="form-label">{t.register.password} <span>*</span></label>
            <input className="form-input" type="password" value={form.password} onChange={set('password')} required placeholder={t.register.passwordPlaceholder} />
          </div>
          <div className="form-group">
            <label className="form-label">{t.register.confirmPassword} <span>*</span></label>
            <input className="form-input" type="password" value={form.confirm} onChange={set('confirm')} required />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? t.register.creating : t.register.submit}
          </button>
        </form>
        <div className="auth-footer">{t.register.hasAccount} <Link to="/login">{t.register.login}</Link></div>
      </div>
    </div>
  );
}
