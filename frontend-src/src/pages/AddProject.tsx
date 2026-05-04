import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../services/api';
import toast from 'react-hot-toast';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);

function countSentences(text: string): number {
  return text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 2).length;
}

export default function AddProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', year: String(CURRENT_YEAR),
    role: '', repo_url: '',
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const sentenceCount = countSentences(form.description);
  const descValid = sentenceCount >= 3;
  const sourceValid = form.repo_url.trim() || file;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descValid) { setError('Opis musi zawierać co najmniej 3 zdania.'); return; }
    if (!sourceValid) { setError('Musisz podać link do repozytorium lub wgrać plik dokumentacji.'); return; }

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
              placeholder="Opisz projekt w co najmniej 3 zdaniach: cel, technologie, wyzwania..."
              rows={5} />
            <div className={`form-hint ${sentenceCount >= 3 ? '' : 'form-error'}`}>
              {sentenceCount < 3 ? `${sentenceCount}/3 zdań — wymagane minimum 3` : `${sentenceCount} zdań`}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Rok <span>*</span></label>
              <select className="form-select" value={form.year} onChange={set('year')}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Rola w projekcie <span>*</span></label>
              <input className="form-input" value={form.role} onChange={set('role')} required
                placeholder="np. Fullstack Developer" />
            </div>
          </div>

          <div className="section-title" style={{ marginTop: '0.5rem' }}>Źródło projektu <span style={{ color: 'var(--accent3)' }}>*</span></div>
          <p className="form-hint" style={{ marginBottom: '0.75rem' }}>Podaj przynajmniej jedno źródło — repozytorium lub plik dokumentacji.</p>

          <div className="form-group">
            <label className="form-label">Link do repozytorium (GitHub, GitLab...)</label>
            <input className="form-input" value={form.repo_url} onChange={set('repo_url')}
              placeholder="https://github.com/uzytkownik/repozytorium" type="url" />
            <div className="form-hint">Technologie zostaną wykryte automatycznie z GitHub API</div>
          </div>

          <div className="form-group">
            <label className="form-label">lub wgraj plik dokumentacji (PDF, package.json)</label>
            <input className="form-input" type="file" accept=".pdf,.json,.txt,.zip"
              onChange={e => setFile(e.target.files?.[0] || null)} />
            {file && <div className="form-hint" style={{ color: 'var(--accent2)' }}>Plik: {file.name}</div>}
          </div>

          {!sourceValid && form.title && (
            <div className="alert alert-warning">Podaj link do repozytorium lub wgraj plik dokumentacji</div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button className="btn btn-primary" type="submit" disabled={loading || !descValid || !sourceValid}>
              {loading ? 'Analizowanie...' : 'Zapisz i Analizuj'}
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => navigate(-1)}>Anuluj</button>
          </div>
        </form>
      </div>
    </div>
  );
}
