import { useEffect, useState } from 'react';
import { getProjects, deleteProject, getTechnologies } from '../services/api';
import type { Project } from '../types';
import ProjectCard from '../components/ProjectCard';
import toast from 'react-hot-toast';

const DIFFICULTIES = ['', 'Początkujący', 'Średni', 'Zaawansowany', 'Ekspert'];
const YEARS = ['', ...Array.from({ length: 6 }, (_, i) => String(new Date().getFullYear() - i))];

export default function Archive() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [technology, setTechnology] = useState('');
  const [year, setYear] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [technologies, setTechnologies] = useState<any[]>([]);

  useEffect(() => { getTechnologies().then(r => setTechnologies(r.data)); }, []);

  useEffect(() => {
    load(1);
    setPage(1);
  }, [search, technology, year, difficulty]);

  useEffect(() => { load(page); }, [page]);

  async function load(p: number) {
    setLoading(true);
    try {
      const params: any = { page: p, per_page: 10 };
      if (search) params.search = search;
      if (technology) params.technology = technology;
      if (year) params.year = parseInt(year);
      if (difficulty) params.difficulty = difficulty;
      const res = await getProjects(params);
      setProjects(res.data.items);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } finally { setLoading(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm('Usunąć projekt?')) return;
    try { await deleteProject(id); toast.success('Projekt usunięty'); load(page); }
    catch { toast.error('Błąd usuwania'); }
  }

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSearch(searchInput); };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Archiwum Globalne</h1>
        <p className="page-subtitle">{total} projektów od wszystkich studentów</p>
      </div>

      <div className="search-bar">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
          <input className="form-input search-input" placeholder="Szukaj po nazwie lub opisie..."
            value={searchInput} onChange={e => setSearchInput(e.target.value)} />
          <button className="btn btn-secondary" type="submit">Szukaj</button>
          {search && <button className="btn btn-secondary" type="button" onClick={() => { setSearch(''); setSearchInput(''); }}>✕ Wyczyść</button>}
        </form>

        <select className="form-select" style={{ width: 'auto', minWidth: '150px' }}
          value={technology} onChange={e => setTechnology(e.target.value)}>
          <option value="">Wszystkie technologie</option>
          {technologies.map((t: any) => <option key={t.id} value={t.name}>{t.name}</option>)}
        </select>

        <select className="form-select" style={{ width: 'auto', minWidth: '100px' }}
          value={year} onChange={e => setYear(e.target.value)}>
          {YEARS.map(y => <option key={y} value={y}>{y || 'Wszystkie lata'}</option>)}
        </select>

        <select className="form-select" style={{ width: 'auto', minWidth: '160px' }}
          value={difficulty} onChange={e => setDifficulty(e.target.value)}>
          {DIFFICULTIES.map(d => <option key={d} value={d}>{d || 'Wszystkie poziomy'}</option>)}
        </select>
      </div>

      {loading ? <div className="spinner" /> : projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>Brak wyników</h3>
          <p>Spróbuj zmienić kryteria wyszukiwania.</p>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map(p => <ProjectCard key={p.id} project={p} onDelete={handleDelete} showOwner />)}
        </div>
      )}

      {pages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
          {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
            const n = page <= 4 ? i + 1 : page + i - 3;
            return n > 0 && n <= pages ? (
              <button key={n} className={`page-btn ${n === page ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
            ) : null;
          })}
          <button className="page-btn" disabled={page === pages} onClick={() => setPage(p => p + 1)}>›</button>
        </div>
      )}
    </div>
  );
}
