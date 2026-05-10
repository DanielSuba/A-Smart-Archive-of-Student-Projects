import { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPortfolio } from '../services/api';
import type { Portfolio } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

// Funkcja służy do renderowania publicznego widoku portfolio.
export default function PublicPortfolio() {
  const { slug } = useParams<{ slug: string }>();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const printRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    getPortfolio(slug!).then(r => setPortfolio(r.data)).catch(() => setError(t.publicPortfolio.errorMsg)).finally(() => setLoading(false));
  }, [slug]);

  // Funkcja służy do uruchamiania drukowania lub zapisu portfolio do PDF.
  const handlePrint = () => window.print();

  if (loading) return <div className="spinner" />;
  if (error) return (
    <div style={{ maxWidth: 600, margin: '4rem auto', textAlign: 'center' }}>
      <div style={{ fontSize: '1rem', marginBottom: '1rem' }}>{t.publicPortfolio.notFoundIcon}</div>
      <h2 style={{ marginBottom: '0.5rem' }}>{t.publicPortfolio.notFound}</h2>
      <p style={{ color: 'var(--text2)' }}>{error}</p>
    </div>
  );
  if (!portfolio) return null;

  // Funkcja służy do renderowania tekstowej etykiety poziomu trudności w portfolio.
  const diffBadge = (level: string) => {
    const colors: Record<string, string> = {
      'Początkujący': '#3fb950', 'Średni': '#58a6ff', 'Zaawansowany': '#d2a8ff', 'Ekspert': '#f78166'
    };
    return <span style={{ color: colors[level] || '#888', fontWeight: 500, fontSize: '0.8rem' }}>{t.difficulty[level] || level}</span>;
  };

  return (
    <div className="public-portfolio main-content">
      <style>{`@media print { .navbar, .no-print { display: none !important; } .main-content { padding: 0 !important; } body { background: #fff !important; } .public-portfolio { max-width: none !important; padding: 0 !important; } .pub-header, .card { box-shadow: none !important; break-inside: avoid; } }`}</style>

      <div className="pub-header">
        <div className="pub-badge no-print">{t.publicPortfolio.badge}</div>
        <h1 className="pub-title" style={{ marginTop: '0.75rem' }}>{portfolio.title}</h1>
        <p style={{ color: 'var(--text2)', marginTop: '0.5rem' }}>
          {portfolio.owner.name} · {t.publicPortfolio.projectsCount(portfolio.projects.length)}
        </p>
        {portfolio.description && <p style={{ color: 'var(--text2)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{portfolio.description}</p>}
        {portfolio.ai_description && (
          <div style={{ margin: '1.25rem auto 0', maxWidth: 820, textAlign: 'left', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text2)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0, marginBottom: '0.5rem' }}>
              {t.publicPortfolio.aiDescriptionTitle}
            </div>
            <div style={{ color: 'var(--text)', fontSize: '0.92rem', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
              {portfolio.ai_description}
            </div>
          </div>
        )}
        <div style={{ marginTop: '1rem' }} className="no-print">
          <button className="btn btn-primary" onClick={handlePrint}>
            {t.publicPortfolio.downloadPdf}
          </button>
        </div>
      </div>

      <div ref={printRef}>
        {portfolio.projects.length === 0 ? (
          <div className="empty-state"><h3>{t.publicPortfolio.noProjects}</h3></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[...portfolio.projects].sort((a, b) => a.order_index - b.order_index).map(({ project: p }, idx) => (
              <div key={p.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--text2)', fontSize: '0.8rem' }}>#{idx + 1}</span>
                      <h2 style={{ fontFamily: 'inherit', fontSize: '1.2rem' }}>{p.title}</h2>
                    </div>
                    <div style={{ color: 'var(--text2)', fontSize: '0.83rem' }}>{p.role}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {diffBadge(p.difficulty_level)}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text2)', marginTop: '0.25rem' }}>
                      Score: {p.difficulty_score.toFixed(0)}/100
                    </div>
                  </div>
                </div>

                <p style={{ color: 'var(--text2)', lineHeight: 1.7, marginBottom: '0.75rem', fontSize: '0.9rem' }}>{p.description}</p>

                {p.technologies.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text2)', marginBottom: '0.4rem', fontWeight: 500 }}>{t.publicPortfolio.technologies}</div>
                    <div className="tech-list">
                      {p.technologies.slice(0, 8).map(tech => (
                        <span key={tech.id} className="badge badge-tech" title={`${tech.confidence_level.toFixed(0)}%`}>{tech.name}</span>
                      ))}
                      {p.technologies.length > 8 && <span className="badge badge-tech">+{p.technologies.length - 8}</span>}
                    </div>
                  </div>
                )}

                {p.repo_url && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.82rem' }}>
                    <a href={p.repo_url} className="public-link" target="_blank" rel="noreferrer">{p.repo_url}</a>
                  </div>
                )}

                <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <Link to={`/project/${p.id}`} className="btn btn-primary">
                    {t.projectCard.details}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem', padding: '1rem 0', borderTop: '1px solid var(--border)', color: 'var(--text2)', fontSize: '0.8rem' }} className="no-print">
        {t.publicPortfolio.footer(new Date(portfolio.created_at).toLocaleDateString(t.dateLocale))}
      </div>
    </div>
  );
}
