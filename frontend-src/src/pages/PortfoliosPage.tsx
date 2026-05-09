import { useEffect, useState } from 'react';
import { getMyPortfolios, getMyProjects, createPortfolio, deletePortfolio } from '../services/api';
import type { Portfolio, Project } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

// Funkcja służy do renderowania listy portfolio i generatora nowego portfolio.
export default function PortfoliosPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const { t } = useLanguage();
  const [title, setTitle] = useState(t.portfolios.defaultName);
  const [desc, setDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => { loadAll(); }, []);

  // Funkcja służy do pobierania portfolio i projektów użytkownika.
  async function loadAll() {
    setLoading(true);
    const [pf, pr] = await Promise.all([getMyPortfolios(), getMyProjects({ per_page: 50 })]);
    setPortfolios(pf.data);
    setProjects(pr.data.items);
    setLoading(false);
  }

  // Funkcja służy do zaznaczania lub odznaczania projektu w generatorze portfolio.
  function toggleSelect(id: number) {
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  // Funkcja służy do tworzenia nowego portfolio z wybranych projektów.
  async function handleCreate() {
    if (selected.size === 0) { toast.error(t.portfolios.selectError); return; }
    setCreating(true);
    try {
      const res = await createPortfolio({ title, description: desc, project_ids: Array.from(selected) });
      toast.success(t.portfolios.successToast);
      setShowModal(false);
      setSelected(new Set());
      loadAll();
      window.open(`/portfolio/${res.data.public_slug}`, '_blank');
    } catch { toast.error(t.portfolios.errorToast); }
    finally { setCreating(false); }
  }

  // Funkcja służy do usuwania wybranego portfolio.
  async function handleDelete(id: number) {
    if (!confirm(t.portfolios.deleteConfirm)) return;
    await deletePortfolio(id);
    toast.success(t.portfolios.deleteSuccess);
    loadAll();
  }

  // Funkcja służy do budowania publicznego adresu portfolio.
  const portfolioUrl = (slug: string) => `${window.location.origin}/portfolio/${slug}`;

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">{t.portfolios.title}</h1>
          <p className="page-subtitle">{t.portfolios.subtitle(portfolios.length)}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>{t.portfolios.generateBtn}</button>
      </div>

      {portfolios.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">{t.portfolios.emptyIcon}</div>
          <h3>{t.portfolios.emptyTitle}</h3>
          <p>{t.portfolios.emptyText}</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowModal(true)}>{t.portfolios.generate}</button>
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
                <span className="badge badge-tech">{t.portfolios.projects(p.projects.length)}</span>
              </div>
              {p.description && <p style={{ color: 'var(--text2)', fontSize: '0.83rem', margin: '0.5rem 0' }}>{p.description}</p>}
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <a className="btn btn-accent btn-sm" href={portfolioUrl(p.public_slug)} target="_blank" rel="noreferrer">{t.portfolios.open}</a>
                <button className="btn btn-secondary btn-sm" onClick={() => {
                  navigator.clipboard.writeText(portfolioUrl(p.public_slug));
                  toast.success(t.portfolios.linkCopied);
                }}>{t.portfolios.copyLink}</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>{t.portfolios.delete}</button>
              </div>
              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text2)' }}>
                {t.portfolios.created} {new Date(p.created_at).toLocaleDateString(t.dateLocale)}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-title">{t.portfolios.modalTitle}</div>

            <div className="form-group">
              <label className="form-label">{t.portfolios.labelName}</label>
              <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{t.portfolios.labelDesc}</label>
              <textarea className="form-textarea" value={desc} onChange={e => setDesc(e.target.value)} rows={2} style={{ minHeight: '60px' }} />
            </div>

            <div className="section-title">{t.portfolios.selectTitle(selected.size)}</div>
            <div style={{ maxHeight: '280px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.5rem' }}>
              {projects.length === 0 ? (
                <p style={{ color: 'var(--text2)', padding: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>
                  {t.portfolios.noProjects}
                </p>
              ) : projects.map(p => (
                <label key={p.id} className="checkbox-label" style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)', display: 'flex' }}>
                  <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} />
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.88rem' }}>{p.title}</div>
                    <div style={{ color: 'var(--text2)', fontSize: '0.75rem' }}>{t.difficulty[p.difficulty_level] || p.difficulty_level}</div>
                  </div>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button className="btn btn-primary" onClick={handleCreate} disabled={creating || selected.size === 0}>
                {creating ? t.portfolios.generating : t.portfolios.generate}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>{t.portfolios.cancel}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
