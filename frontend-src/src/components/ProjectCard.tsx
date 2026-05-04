import { Link } from 'react-router-dom';
import type { Project } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  project: Project;
  onDelete?: (id: number) => void;
  showOwner?: boolean;
  selected?: boolean;
  onSelect?: (id: number, checked: boolean) => void;
}

function diffClass(level: string) {
  if (level === 'Początkujący') return 'badge badge-beginner';
  if (level === 'Średni') return 'badge badge-intermediate';
  if (level === 'Zaawansowany') return 'badge badge-advanced';
  return 'badge badge-expert';
}

export default function ProjectCard({ project, onDelete, showOwner, selected, onSelect }: Props) {
  const { user, isAdmin } = useAuth();
  const canEdit = user?.id === project.user_id || isAdmin;

  return (
    <div className="card project-card">
      <div className="project-card-header">
        {onSelect && (
          <label className="checkbox-label" style={{ marginBottom: 0 }}>
            <input type="checkbox" checked={!!selected} onChange={e => onSelect(project.id, e.target.checked)} />
          </label>
        )}
        <Link className="project-title" to={`/project/${project.id}`}>{project.title}</Link>
        <span className={diffClass(project.difficulty_level)}>{project.difficulty_level}</span>
      </div>

      <div className="project-meta">
        {project.year} · {project.role}
        {showOwner && project.owner && <> · <span style={{ color: 'var(--accent)' }}>{project.owner.name}</span></>}
        {project.has_cicd && <> · <span className="badge badge-cicd">CI/CD</span></>}
        <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--text2)' }}>
          [{project.difficulty_score.toFixed(0)} pkt]
        </span>
      </div>

      <p className="project-desc">{project.description}</p>

      <div className="tech-list">
        {project.technologies.slice(0, 6).map(t => (
          <span key={t.id} className="badge badge-tech" title={`Pewność: ${t.confidence_level.toFixed(0)}%`}>
            {t.name}
          </span>
        ))}
        {project.technologies.length > 6 && (
          <span className="badge badge-tech">+{project.technologies.length - 6}</span>
        )}
      </div>

      <div className="card-actions">
        <Link className="btn btn-accent btn-sm" to={`/project/${project.id}`}>Szczegóły</Link>
        {project.repo_url && (
          <a className="btn btn-secondary btn-sm" href={project.repo_url} target="_blank" rel="noreferrer">GitHub</a>
        )}
        {canEdit && onDelete && (
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(project.id)}>Usuń</button>
        )}
      </div>
    </div>
  );
}
