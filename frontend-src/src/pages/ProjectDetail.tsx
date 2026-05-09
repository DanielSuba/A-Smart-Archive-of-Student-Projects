import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProject, deleteProject, analyzeProject, updateProject } from '../services/api';
import type { Project } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

// Funkcja służy do renderowania etykiety poziomu trudności projektu.
function DiffBadge({ level }: { level: string }) {
  const { t } = useLanguage();
  const cls: Record<string, string> = {
    'Początkujący': 'badge-beginner', 'Średni': 'badge-intermediate',
    'Zaawansowany': 'badge-advanced', 'Ekspert': 'badge-expert'
  };
  return <span className={`badge ${cls[level] || 'badge-beginner'}`}>{t.difficulty[level] || level}</span>;
}

// Funkcja służy do renderowania paska pewności wykrycia technologii.
function ConfBar({ confidence }: { confidence: number }) {
  const cls = confidence >= 70 ? 'conf-high' : confidence >= 40 ? 'conf-med' : 'conf-low';
  return (
    <div className="conf-track">
      <div className={`conf-fill ${cls}`} style={{ width: `${confidence}%` }} />
    </div>
  );
}

// Funkcja służy do formatowania daty lub zwracania informacji o braku danych.
function formatDate(value: string | null | undefined, locale: string, noDataLabel: string) {
  return value ? new Date(value).toLocaleDateString(locale) : noDataLabel;
}

// Funkcja służy do formatowania liczby plików repozytorium.
function formatFileCount(value: number | null | undefined, noDataLabel: string) {
  if (value === null || value === undefined) return noDataLabel;
  return value > 50 ? '50+' : value;
}

// Funkcja służy do budowania linku pobrania ZIP repozytorium GitHub.
function githubZipUrl(repoUrl: string | null) {
  if (!repoUrl) return null;
  const match = repoUrl.match(/github\.com[/:]([^/]+)\/([^/\s.]+)/);
  if (!match) return null;
  return `https://api.github.com/repos/${match[1]}/${match[2].replace('.git', '')}/zipball`;
}

// Funkcja służy do budowania linku pobrania dokumentacji projektu.
function documentationUrl(path: string | null) {
  if (!path) return null;
  return `/${path.replace(/\\/g, '/').replace(/^\/+/, '')}`;
}

// Funkcja służy do formatowania wyniku i uzasadnienia oceny AI.
function scoreText(item: { score?: number; justification?: string; notes?: string } | undefined, noData: string, noScore: string) {
  if (!item) return noData;
  const score = typeof item.score === 'number' ? `${item.score}/10` : noScore;
  const justification = item.justification || item.notes;
  return justification ? `${score} - ${justification}` : score;
}

type DetailT = ReturnType<typeof useLanguage>['t']['projectDetail'];

// Funkcja służy do przygotowania wierszy tabeli oceny dokumentacji AI.
function documentationRows(project: Project, td: DetailT) {
  if (!project.doc_file_path || project.ai_doc_status === 'no_documentation') {
    return [[td.aiStatus, td.aiNoDoc]];
  }
  if (project.ai_doc_status !== 'ready' || !project.ai_doc_evaluation) {
    return [[td.aiStatus, td.aiUnavailable]];
  }
  const evaluation = project.ai_doc_evaluation;
  if (evaluation.evaluations) {
    return [
      [td.aiCompleteness, scoreText(evaluation.evaluations.completeness, td.noData, td.noScore)],
      [td.aiReadability, scoreText(evaluation.evaluations.readability, td.noData, td.noScore)],
      [td.aiBusinessContext, scoreText(evaluation.evaluations.business_context, td.noData, td.noScore)],
      [td.aiTechStack, scoreText(evaluation.evaluations.tech_stack || evaluation.evaluations.tech_stack_rationale, td.noData, td.noScore)],
      [td.aiSummary, evaluation.summary || td.noData],
    ];
  }
  return [
    [td.aiCompleteness, scoreText(evaluation.completeness_score, td.noData, td.noScore)],
    [td.aiReadability, scoreText(evaluation.readability_structure, td.noData, td.noScore)],
    [td.aiBusinessContext, scoreText(evaluation.business_context, td.noData, td.noScore)],
    [td.aiTechStackRationale, scoreText(evaluation.tech_stack_rationale, td.noData, td.noScore)],
    [td.aiSummary, evaluation.summary || td.noData],
  ];
}

// Funkcja służy do renderowania strony szczegółów projektu.
export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', role: '', repo_url: '' });
  const [editFile, setEditFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();

  useEffect(() => { loadProject(); }, [id]);

  // Funkcja służy do pobierania aktualnych danych projektu.
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

  // Funkcja służy do usuwania aktualnie przeglądanego projektu.
  async function handleDelete() {
    if (!confirm(t.projectDetail.deleteConfirm)) return;
    await deleteProject(Number(id));
    toast.success(t.projectDetail.deleteSuccess);
    navigate('/my-projects');
  }

  // Funkcja służy do ponownego uruchamiania analizy projektu.
  async function handleAnalyze() {
    setAnalyzing(true);
    try {
      await analyzeProject(Number(id));
      toast.success(t.projectDetail.analyzeSuccess);
      loadProject();
    } catch { toast.error(t.projectDetail.analyzeError); }
    finally { setAnalyzing(false); }
  }

  // Funkcja służy do zapisywania zmian w edytowanym projekcie.
  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(editForm).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, String(v)); });
      if (editFile) fd.append('file', editFile);
      await updateProject(Number(id), fd);
      toast.success(t.projectDetail.updateSuccess);
      setEditing(false);
      setEditFile(null);
      loadProject();
    } catch (err: any) { toast.error(err.response?.data?.detail || t.projectDetail.updateError); }
  }

  if (loading) return <div className="spinner" />;
  if (!project) return null;

  const canEdit = user?.id === project.user_id || isAdmin;
  const zipUrl = githubZipUrl(project.repo_url);
  const docUrl = documentationUrl(project.doc_file_path);

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link className="btn btn-secondary btn-sm" to="/my-projects">{t.projectDetail.back}</Link>
      </div>

      {editing ? (
        <div className="card form-card" style={{ maxWidth: '100%' }}>
          <div className="section-title">{t.projectDetail.editTitle}</div>
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label className="form-label">{t.projectDetail.labelTitle}</label>
              <input className="form-input" value={editForm.title}
                onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">{t.projectDetail.labelDesc}</label>
              <textarea className="form-textarea" value={editForm.description}
                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={5} required />
            </div>
            <div className="form-group">
              <label className="form-label">{t.projectDetail.labelRole}</label>
              <input className="form-input" value={editForm.role}
                onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">{t.projectDetail.labelRepo}</label>
              <input className="form-input" value={editForm.repo_url}
                onChange={e => setEditForm(f => ({ ...f, repo_url: e.target.value }))} type="url" />
            </div>
            <div className="form-group">
              <label className="form-label">{t.addProject.labelFile}</label>
              <input className="form-input" type="file" accept=".pdf,.json,.txt,.zip"
                onChange={e => setEditFile(e.target.files?.[0] || null)} />
              {editFile && <div className="form-hint" style={{ color: 'var(--accent2)' }}>{t.addProject.fileSelected(editFile.name)}</div>}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary" type="submit">{t.projectDetail.save}</button>
              <button className="btn btn-secondary" type="button" onClick={() => { setEditing(false); setEditFile(null); }}>{t.projectDetail.cancel}</button>
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
                {canEdit && <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>{t.projectDetail.editBtn}</button>}
                {project.repo_url && <a className="btn btn-accent btn-sm" href={project.repo_url} target="_blank" rel="noreferrer">{t.projectDetail.repoBtn}</a>}
                {canEdit && <button className="btn btn-secondary btn-sm" onClick={handleAnalyze} disabled={analyzing}>{analyzing ? t.projectDetail.analyzing : t.projectDetail.reanalyze}</button>}
                {canEdit && <button className="btn btn-danger btn-sm" onClick={handleDelete}>{t.projectDetail.deleteBtn}</button>}
              </div>
            </div>

            <div className="card">
              <div className="section-title">{t.projectDetail.technologiesTitle(project.technologies.length)}</div>
              {project.technologies.length === 0 ? (
                <p style={{ color: 'var(--text2)', fontSize: '0.875rem' }}>{t.projectDetail.noTechnologies}</p>
              ) : (
                project.technologies.sort((a, b) => b.confidence_level - a.confidence_level).map(tech => (
                  <div key={tech.id} className="confidence-bar">
                    <span style={{ minWidth: '120px', fontSize: '0.82rem' }}>{tech.name}</span>
                    <ConfBar confidence={tech.confidence_level} />
                    <span style={{ minWidth: '40px', textAlign: 'right', color: 'var(--text2)' }}>{tech.confidence_level.toFixed(0)}%</span>
                    {tech.category && <span className="badge badge-tech">{tech.category}</span>}
                  </div>
                ))
              )}
            </div>

            <div className="card" style={{ marginTop: '1rem' }}>
              <div className="section-title">{t.projectDetail.aiDocTitle}</div>
              {documentationRows(project, t.projectDetail).map(([label, val]) => (
                <div key={label} style={{ display: 'grid', gridTemplateColumns: 'minmax(160px, 240px) 1fr', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text2)' }}>{label}</span>
                  <span style={{ fontWeight: 500 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="card" style={{ marginBottom: '1rem' }}>
              <div className="section-title">{t.projectDetail.scoringTitle}</div>
              <div style={{ textAlign: 'center', padding: '0.75rem 0' }}>
                <div style={{ fontSize: '2.5rem', fontFamily: 'inherit', color: 'var(--accent)', fontWeight: 600 }}>
                  {project.difficulty_score.toFixed(0)}
                </div>
                <div style={{ color: 'var(--text2)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{t.projectDetail.scoringUnit}</div>
                <DiffBadge level={project.difficulty_level} />
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ background: 'var(--bg3)', borderRadius: '6px', overflow: 'hidden', height: '10px' }}>
                  <div style={{ width: `${project.difficulty_score}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent2), var(--accent4))', transition: 'width 0.8s ease' }} />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="section-title">{t.projectDetail.infoTitle}</div>
              {[
                [t.projectDetail.infoRole, project.role],
                [t.projectDetail.infoTech, project.technologies.length],
                [t.projectDetail.infoCicd, project.has_cicd ? t.projectDetail.yes : t.projectDetail.no],
                [t.projectDetail.infoDocs, project.doc_file_path ? t.projectDetail.yesPdf : t.projectDetail.no],
                [t.projectDetail.infoAdded, new Date(project.created_at).toLocaleDateString(t.dateLocale)],
                [t.projectDetail.infoRepoCreated, formatDate(project.github_repo_created_at, t.dateLocale, t.projectDetail.noData)],
                [t.projectDetail.infoLastActivity, formatDate(project.github_last_commit_at, t.dateLocale, t.projectDetail.noData)],
                [t.projectDetail.infoStars, project.github_stars ?? t.projectDetail.noData],
                [t.projectDetail.infoFiles, formatFileCount(project.github_file_count, t.projectDetail.noData)],
              ].map(([label, val]) => (
                <div key={String(label)} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text2)' }}>{label}</span>
                  <span style={{ fontWeight: 500 }}>{val}</span>
                </div>
              ))}
            </div>

            <div className="card" style={{ marginTop: '1rem' }}>
              <div className="section-title">{t.projectDetail.downloadsTitle}</div>
              {[
                [t.projectDetail.downloadZipLabel, zipUrl, t.projectDetail.downloadZipBtn],
                [t.projectDetail.downloadDocLabel, docUrl, t.projectDetail.downloadDocBtn],
              ].map(([label, url, button]) => (
                <div key={String(label)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.45rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text2)' }}>{label}</span>
                  {url ? (
                    <a className="btn btn-secondary btn-sm" href={url} download target="_blank" rel="noreferrer">{button}</a>
                  ) : (
                    <button className="btn btn-secondary btn-sm" disabled>{t.projectDetail.noFile}</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
