import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyProjects, deleteProject } from '../services/api';
import type { Project } from '../types';
import ProjectCard from '../components/ProjectCard';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

const CACHE_KEY = 'cached_my_projects';

// Funkcja służy do renderowania listy projektów aktualnego użytkownika.
export default function MyProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(!navigator.onLine);
  const { t } = useLanguage();

  useEffect(() => {
    // Funkcja służy do ustawiania trybu online po odzyskaniu połączenia.
    const onOnline = () => setOffline(false);
    // Funkcja służy do ustawiania trybu offline po utracie połączenia.
    const onOffline = () => setOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  useEffect(() => { load(page); }, [page]);

  // Funkcja służy do pobierania projektów użytkownika lub wersji zapisanej offline.
  async function load(p: number) {
    setLoading(true);
    if (!navigator.onLine) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) setProjects(JSON.parse(cached));
      setLoading(false);
      return;
    }
    try {
      const res = await getMyProjects({ page: p, per_page: 10 });
      setProjects(res.data.items);
      setTotal(res.data.total);
      setPages(res.data.pages);
      localStorage.setItem(CACHE_KEY, JSON.stringify(res.data.items));
    } catch {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) setProjects(JSON.parse(cached));
    } finally {
      setLoading(false);
    }
  }

  // Funkcja służy do usuwania projektu użytkownika.
  async function handleDelete(id: number) {
    if (!confirm(t.myProjects.deleteConfirm)) return;
    try {
      await deleteProject(id);
      toast.success(t.myProjects.deleteSuccess);
      load(page);
    } catch { toast.error(t.myProjects.deleteError); }
  }

  return (
    <div>
      {offline && <div className="offline-banner">{t.myProjects.offlineBanner}</div>}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">{t.myProjects.title}</h1>
          <p className="page-subtitle">{t.myProjects.subtitle(total)}</p>
        </div>
        <Link className="btn btn-primary" to="/add-project">{t.myProjects.addProject}</Link>
      </div>

      {loading ? <div className="spinner" /> : projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">{t.myProjects.emptyIcon}</div>
          <h3>{t.myProjects.emptyTitle}</h3>
          <p>{t.myProjects.emptyText}</p>
          <Link className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }} to="/add-project">{t.myProjects.addProject}</Link>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map(p => <ProjectCard key={p.id} project={p} onDelete={handleDelete} />)}
        </div>
      )}

      {pages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
          {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
            <button key={n} className={`page-btn ${n === page ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
          ))}
          <button className="page-btn" disabled={page === pages} onClick={() => setPage(p => p + 1)}>›</button>
        </div>
      )}
    </div>
  );
}
