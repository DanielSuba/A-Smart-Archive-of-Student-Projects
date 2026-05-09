import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProject } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
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
  const { t } = useLanguage();

  // Funkcja służy do aktualizowania wybranego pola formularza projektu.
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const repoValid = form.repo_url.trim().length > 0;

  // Funkcja służy do wysyłania formularza tworzenia projektu do API.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoValid) { setError(t.addProject.errorSource); return; }

    setLoading(true); setError('');
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
    if (file) fd.append('file', file);

    try {
      const res = await createProject(fd);
      toast.success(t.addProject.successToast);
      navigate(`/project/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || t.addProject.errorFallback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <div className="page-header">
        <h1 className="page-title">{t.addProject.title}</h1>
        <p className="page-subtitle">{t.addProject.subtitle}</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="section-title">{t.addProject.sectionBasic}</div>

          <div className="form-group">
            <label className="form-label">{t.addProject.labelTitle} <span>*</span></label>
            <input className="form-input" value={form.title} onChange={set('title')} required
              placeholder={t.addProject.titlePlaceholder} minLength={3} />
          </div>

          <div className="form-group">
            <label className="form-label">{t.addProject.labelDesc} <span>*</span></label>
            <textarea className="form-textarea" value={form.description} onChange={set('description')} required
              placeholder={t.addProject.descPlaceholder}
              rows={5} />
          </div>

          <div className="form-group">
            <label className="form-label">{t.addProject.labelRole} <span>*</span></label>
            <input className="form-input" value={form.role} onChange={set('role')} required
              placeholder={t.addProject.rolePlaceholder} />
          </div>

          <div className="section-title" style={{ marginTop: '0.5rem' }}>{t.addProject.sectionSource} <span style={{ color: 'var(--accent3)' }}>*</span></div>
          <p className="form-hint" style={{ marginBottom: '0.75rem' }}>{t.addProject.sourceHint}</p>

          <div className="form-group">
            <label className="form-label">{t.addProject.labelRepo} <span>*</span></label>
            <input className="form-input" value={form.repo_url} onChange={set('repo_url')}
              placeholder="https://github.com/uzytkownik/repozytorium" type="url" required />
            <div className="form-hint">{t.addProject.repoHint}</div>
          </div>

          <div className="form-group">
            <label className="form-label">{t.addProject.labelFile}</label>
            <input className="form-input" type="file" accept=".pdf,.json,.txt,.zip"
              onChange={e => setFile(e.target.files?.[0] || null)} />
            {file && <div className="form-hint" style={{ color: 'var(--accent2)' }}>{t.addProject.fileSelected(file.name)}</div>}
          </div>

          {!repoValid && form.title && (
            <div className="alert alert-warning">{t.addProject.warnSource}</div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button className="btn btn-primary" type="submit" disabled={loading || !repoValid}>
              {loading ? t.addProject.analyzing : t.addProject.submit}
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => navigate(-1)}>{t.addProject.cancel}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
