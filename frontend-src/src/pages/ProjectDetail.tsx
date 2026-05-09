import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProject, deleteProject, analyzeProject, updateProject } from '../services/api';
import type { Project } from '../types';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

function DiffBadge({ level }: { level: string }) {
  const cls: Record<string, string> = {
    'Początkujący': 'badge-beginner', 'Średni': 'badge-intermediate',
    'Zaawansowany': 'badge-advanced', 'Ekspert': 'badge-expert'
  };
  return <span className={`badge ${cls[level] || 'badge-beginner'}`}>{level}</span>;
}

function ConfBar({ confidence }: { confidence: number }) {
  const cls = confidence >= 70 ? 'conf-high' : confidence >= 40 ? 'conf-med' : 'conf-low';
  return (
    <div className="conf-track">
      <div className={`conf-fill ${cls}`} style={{ width: `${confidence}%` }} />
    </div>
  );
}

function formatDate(value: string | null | undefined) {
  return value ? new Date(value).toLocaleDateString('pl') : 'Brak danych';
}

function formatFileCount(value: number | null | undefined) {
  if (value === null || value === undefined) return 'Brak danych';
  return value > 50 ? '50+' : value;
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', role: '', repo_url: '' });
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  useEffect(() => { loadProject(); }, [id]);

  async function loadProject() {
    setLoading(true);
    try {
      const res = await getProject(Number(id));
      setProject(res.data);
      const p = res.data;
      setEditForm({ title: p.title, description: p.description, role: p.role, repo_url: p.repo_url || '' });
    } catch { navigate('/my-projects'); }
    finally { setLoading(false); }
  }

  async function handleDelete() {
    if (!confirm('Usunąć projekt?')) return;
    await deleteProject(Number(id));
    toast.success('Projekt usunięty');
    navigate('/my-projects');
  }

  async function handleAnalyze() {
    setAnalyzing(true);
    try {
      await analyzeProject(Number(id));
      toast.success('Analiza zakończona!');
      loadProject();
    } catch { toast.error('Błąd analizy'); }
    finally { setAnalyzing(false); }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateProject(Number(id), editForm);
      toast.success('Projekt zaktualizowany');
      setEditing(false);
      loadProject();
    } catch (err: any) { toast.error(err.response?.data?.detail || 'Błąd aktualizacji'); }
  }

  if (loading) return <div className="spinner" />;
  if (!project) return null;

  const canEdit = user?.id === project.user_id || isAdmin;

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link className="btn btn-secondary btn-sm" to="/my-projects">Wróć</Link>
      </div>

      {editing ? (
        <div className="card form-card" style={{ maxWidth: '100%' }}>
          <div className="section-title">Edytuj projekt</div>
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label className="form-label">Tytuł</label>
              <input className="form-input" value={editForm.title}
                onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Opis</label>
              <textarea className="form-textarea" value={editForm.description}
                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={5} required />
            </div>
            <div className="form-group">
              <label className="form-label">Rola</label>
              <input className="form-input" value={editForm.role}
                onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Repozytorium</label>
              <input className="form-input" value={editForm.repo_url}
                onChange={e => setEditForm(f => ({ ...f, repo_url: e.target.value }))} type="url" />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" type="submit">Zapisz</button>
              <button className="btn btn-secondary" type="button" onClick={() => setEditing(false)}>Anuluj</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="detail-grid">
          <div>
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                <h1 style={{ fontFamily: 'inherit', fontSize: '1.4rem' }}>{project.title}</h1>
                <DiffBadge level={project.difficulty_level} />
              </div>
              <div className="project-meta" style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                <strong>{project.role}</strong>
                {project.owner && <> · <span style={{ color: 'var(--accent)' }}>{project.owner.name}</span></>}
                {project.has_cicd && <span className="badge badge-cicd" style={{ marginLeft: '0.5rem' }}>CI/CD</span>}
              </div>
              <p style={{ color: 'var(--text2)', lineHeight: 1.7, marginBottom: '1rem' }}>{project.description}</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {canEdit && <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>Edytuj</button>}
                {project.repo_url && <a className="btn btn-accent btn-sm" href={project.repo_url} target="_blank" rel="noreferrer">Repozytorium</a>}
                {canEdit && <button className="btn btn-secondary btn-sm" onClick={handleAnalyze} disabled={analyzing}>{analyzing ? 'Analizowanie...' : 'Przeanalizuj ponownie'}</button>}
                {canEdit && <button className="btn btn-danger btn-sm" onClick={handleDelete}>Usuń</button>}
              </div>
            </div>

            <div className="card">
              <div className="section-title">Wykryte technologie ({project.technologies.length})</div>
              {project.technologies.length === 0 ? (
                <p style={{ color: 'var(--text2)', fontSize: '0.875rem' }}>Brak wykrytych technologii. Kliknij "Przeanalizuj ponownie".</p>
              ) : (
                project.technologies.sort((a, b) => b.confidence_level - a.confidence_level).map(t => (
                  <div key={t.id} className="confidence-bar">
                    <span style={{ minWidth: '120px', fontSize: '0.82rem' }}>{t.name}</span>
                    <ConfBar confidence={t.confidence_level} />
                    <span style={{ minWidth: '40px', textAlign: 'right', color: 'var(--text2)' }}>{t.confidence_level.toFixed(0)}%</span>
                    {t.category && <span className="badge badge-tech">{t.category}</span>}
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div className="section-title">Scoring trudności</div>
              <div style={{ textAlign: 'center', padding: '0.75rem 0' }}>
                <div style={{ fontSize: '2.5rem', fontFamily: 'inherit', color: 'var(--accent)', fontWeight: 600 }}>
                  {project.difficulty_score.toFixed(0)}
                </div>
                <div style={{ color: 'var(--text2)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>punktów / 100</div>
                <DiffBadge level={project.difficulty_level} />
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ background: 'var(--bg3)', borderRadius: '6px', overflow: 'hidden', height: '10px' }}>
                  <div style={{ width: `${project.difficulty_score}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent2), var(--accent4))', transition: 'width 0.8s ease' }} />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="section-title">Informacje</div>
              {[
                ['Rola', project.role],
                ['Technologii', project.technologies.length],
                ['CI/CD', project.has_cicd ? 'Tak' : 'Nie'],
                ['Dokumentacja', project.doc_file_path ? 'Tak (PDF)' : 'Nie'],
                ['Dodano', new Date(project.created_at).toLocaleDateString('pl')],
                ['Ostatnia aktywność', formatDate(project.github_last_commit_at)],
                ['Liczba gwiazdek', project.github_stars ?? 'Brak danych'],
                ['Liczba plików', formatFileCount(project.github_file_count)],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text2)' }}>{label}</span>
                  <span style={{ fontWeight: 500 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
