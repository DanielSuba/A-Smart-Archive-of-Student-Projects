import { useEffect, useState } from 'react';
import { getMyPortfolios, getMyProjects, createPortfolio, deletePortfolio } from '../services/api';
import type { Portfolio, Project } from '../types';
import toast from 'react-hot-toast';

export default function PortfoliosPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [title, setTitle] = useState('Moje Portfolio');
  const [desc, setDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const [pf, pr] = await Promise.all([getMyPortfolios(), getMyProjects({ per_page: 50 })]);
    setPortfolios(pf.data);
    setProjects(pr.data.items);
    setLoading(false);
  }

  function toggleSelect(id: number) {
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  async function handleCreate() {
    if (selected.size === 0) { toast.error('Wybierz co najmniej jeden projekt'); return; }
    setCreating(true);
    try {
      const res = await createPortfolio({ title, description: desc, project_ids: Array.from(selected) });
      toast.success('Portfolio wygenerowane!');
      setShowModal(false);
      setSelected(new Set());
      loadAll();
      window.open(`/portfolio/${res.data.public_slug}`, '_blank');
    } catch { toast.error('Błąd generowania portfolio'); }
    finally { setCreating(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm('Usunąć portfolio?')) return;
    await deletePortfolio(id);
    toast.success('Portfolio usunięte');
    loadAll();
  }

  const portfolioUrl = (slug: string) => `${window.location.origin}/portfolio/${slug}`;

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Portfolio</h1>
          <p className="page-subtitle">{portfolios.length} wygenerowanych portfolio</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Generuj Portfolio</button>
      </div>

      {portfolios.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">Brak</div>
          <h3>Brak portfolio</h3>
          <p>Wybierz projekty i wygeneruj swoje pierwsze portfolio.</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowModal(true)}>Generuj Portfolio</button>
        </div>
      ) : (
        <div className="portfolio-list">
          {portfolios.map(p => (
            <div key={p.id} className="card portfolio-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{p.title}</div>
                  <div className="portfolio-slug">/{p.public_slug}</div>
                </div>
                <span className="badge badge-tech">{p.projects.length} projektów</span>
              </div>
              {p.description && <p style={{ color: 'var(--text2)', fontSize: '0.83rem', margin: '0.5rem 0' }}>{p.description}</p>}
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <a className="btn btn-accent btn-sm" href={portfolioUrl(p.public_slug)} target="_blank" rel="noreferrer">Otwórz</a>
                <button className="btn btn-secondary btn-sm" onClick={() => {
                  navigator.clipboard.writeText(portfolioUrl(p.public_slug));
                  toast.success('Link skopiowany!');
                }}>Kopiuj link</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Usuń</button>
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text2)' }}>
                Utworzono: {new Date(p.created_at).toLocaleDateString('pl')}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">Generuj nowe portfolio</div>

            <div className="form-group">
              <label className="form-label">Nazwa portfolio</label>
              <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Opis (opcjonalny)</label>
              <textarea className="form-textarea" value={desc} onChange={e => setDesc(e.target.value)} rows={2} style={{ minHeight: '60px' }} />
            </div>

            <div className="section-title">Wybierz projekty ({selected.size} zaznaczonych)</div>
            <div style={{ maxHeight: '280px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.5rem' }}>
              {projects.length === 0 ? (
                <p style={{ color: 'var(--text2)', padding: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>
                  Brak projektów. Dodaj projekty, aby wygenerować portfolio.
                </p>
              ) : projects.map(p => (
                <label key={p.id} className="checkbox-label" style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)', display: 'flex' }}>
                  <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} />
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.88rem' }}>{p.title}</div>
                    <div style={{ color: 'var(--text2)', fontSize: '0.75rem' }}>{p.difficulty_level}</div>
                  </div>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button className="btn btn-primary" onClick={handleCreate} disabled={creating || selected.size === 0}>
                {creating ? 'Generowanie...' : 'Generuj Portfolio'}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Anuluj</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
