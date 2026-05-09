import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../services/api';
import toast from 'react-hot-toast';

// Funkcja służy do renderowania formularza dodawania nowego projektu.
export default function AddProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', role: '', repo_url: '',
  });

  // Funkcja służy do aktualizowania wybranego pola formularza projektu.
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const repoValid = form.repo_url.trim().length > 0;

  // Funkcja służy do wysyłania formularza tworzenia projektu do API.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoValid) { setError('Musisz podać link do repozytorium.'); return; }

    setLoading(true); setError('');
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
    if (file) fd.append('file', file);

    try {
      const res = await createProject(fd);
      toast.success('Projekt dodany i przeanalizowany!');
      navigate(`/project/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Błąd podczas zapisywania projektu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <div className="page-header">
        <h1 className="page-title">Dodaj Projekt</h1>
        <p className="page-subtitle">Technologie zostaną wykryte automatycznie z repozytorium</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="section-title">Podstawowe informacje</div>

          <div className="form-group">
            <label className="form-label">Tytuł projektu <span>*</span></label>
            <input className="form-input" value={form.title} onChange={set('title')} required
              placeholder="np. System zarządzania biblioteką" minLength={3} />
          </div>

          <div className="form-group">
            <label className="form-label">Opis <span>*</span></label>
            <textarea className="form-textarea" value={form.description} onChange={set('description')} required
              placeholder="Opisz projekt: cel, technologie, wyzwania..."
              rows={5} />
          </div>

          <div className="form-group">
            <label className="form-label">Rola w projekcie <span>*</span></label>
            <input className="form-input" value={form.role} onChange={set('role')} required
              placeholder="np. Fullstack Developer" />
          </div>

          <div className="section-title" style={{ marginTop: '0.5rem' }}>Źródło projektu <span style={{ color: 'var(--accent3)' }}>*</span></div>
          <p className="form-hint" style={{ marginBottom: '0.75rem' }}>Podaj link do repozytorium. Dokumentacja jest opcjonalna.</p>

          <div className="form-group">
            <label className="form-label">Link do repozytorium (GitHub) <span>*</span></label>
            <input className="form-input" value={form.repo_url} onChange={set('repo_url')}
              placeholder="https://github.com/uzytkownik/repozytorium" type="url" required />
            <div className="form-hint">Technologie zostaną wykryte automatycznie z GitHub API</div>
          </div>

          <div className="form-group">
            <label className="form-label">Wgraj plik dokumentacji (opcjonalnie: PDF, package.json)</label>
            <input className="form-input" type="file" accept=".pdf,.json,.txt,.zip"
              onChange={e => setFile(e.target.files?.[0] || null)} />
            {file && <div className="form-hint" style={{ color: 'var(--accent2)' }}>Plik: {file.name}</div>}
          </div>

          {!repoValid && form.title && (
            <div className="alert alert-warning">Podaj link do repozytorium</div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button className="btn btn-primary" type="submit" disabled={loading || !repoValid}>
              {loading ? 'Analizowanie...' : 'Zapisz i Analizuj'}
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => navigate(-1)}>Anuluj</button>
          </div>
        </form>
      </div>
    </div>
  );
}
