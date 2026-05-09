import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

// Funkcja służy do renderowania formularza rejestracji użytkownika.
export default function Register() {
  const [form, setForm] = useState({ email: '', name: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  // Funkcja służy do wysyłania danych rejestracji do API.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Hasła nie są zgodne'); return; }
    if (form.password.length < 6) { setError('Hasło musi mieć co najmniej 6 znaków'); return; }
    setLoading(true); setError('');
    try {
      await register(form.email, form.name, form.password);
      toast.success('Konto utworzone!');
      navigate('/my-projects');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Błąd rejestracji');
    } finally {
      setLoading(false);
    }
  };

  // Funkcja służy do aktualizowania wybranego pola formularza rejestracji.
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <h1 className="auth-title">Utwórz konto</h1>
        <p className="auth-subtitle">Dołącz do Archiwum Projektów</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Imię i nazwisko <span>*</span></label>
            <input className="form-input" value={form.name} onChange={set('name')} required placeholder="Jan Kowalski" />
          </div>
          <div className="form-group">
            <label className="form-label">Email <span>*</span></label>
            <input className="form-input" type="email" value={form.email} onChange={set('email')} required placeholder="student@uczelnia.pl" />
          </div>
          <div className="form-group">
            <label className="form-label">Hasło <span>*</span></label>
            <input className="form-input" type="password" value={form.password} onChange={set('password')} required placeholder="min. 6 znaków" />
          </div>
          <div className="form-group">
            <label className="form-label">Potwierdź hasło <span>*</span></label>
            <input className="form-input" type="password" value={form.confirm} onChange={set('confirm')} required />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Tworzenie konta...' : 'Zarejestruj się'}
          </button>
        </form>
        <div className="auth-footer">Masz już konto? <Link to="/login">Zaloguj się</Link></div>
      </div>
    </div>
  );
}
