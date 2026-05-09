import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(email, password);
      toast.success('Zalogowano pomyślnie!');
      navigate('/my-projects');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Błąd logowania');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <h1 className="auth-title">Zaloguj się</h1>
        <p className="auth-subtitle">Inteligentne Archiwum Projektów Studenta</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email <span>*</span></label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="student@uczelnia.pl" />
          </div>
          <div className="form-group">
            <label className="form-label">Hasło <span>*</span></label>
            <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>
        <div className="auth-footer">
          Nie masz konta? <Link to="/register">Zarejestruj się</Link>
        </div>
      </div>
    </div>
  );
}
