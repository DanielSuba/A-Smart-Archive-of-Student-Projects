import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getPortfolio } from '../services/api';
import type { Portfolio } from '../types';

export default function PublicPortfolio() {
  const { slug } = useParams<{ slug: string }>();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getPortfolio(slug!).then(r => setPortfolio(r.data)).catch(() => setError('Portfolio nie istnieje lub zostało usunięte.')).finally(() => setLoading(false));
  }, [slug]);

  const handlePrint = () => window.print();

  if (loading) return <div className="spinner" />;
  if (error) return (
    <div style={{ maxWidth: 600, margin: '4rem auto', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
      <h2 style={{ marginBottom: '0.5rem' }}>Nie znaleziono portfolio</h2>
      <p style={{ color: 'var(--text2)' }}>{error}</p>
    </div>
  );
  if (!portfolio) return null;

  const diffBadge = (level: string) => {
    const colors: Record<string, string> = {
      'Początkujący': '#3fb950', 'Średni': '#58a6ff', 'Zaawansowany': '#d2a8ff', 'Ekspert': '#f78166'
    };
    return <span style={{ color: colors[level] || '#888', fontWeight: 500, fontSize: '0.8rem' }}>{level}</span>;
  };

  return (
    <div className="public-portfolio main-content">
      <style>{`@media print { .no-print { display: none !important; } .card { break-inside: avoid; } }`}</style>

      <div className="pub-header">
        <div className="pub-badge no-print">🌐 Publiczne Portfolio · Read-Only</div>
        <h1 className="pub-title" style={{ marginTop: '0.75rem' }}>{portfolio.title}</h1>
        <p style={{ color: 'var(--text2)', marginTop: '0.5rem' }}>
          {portfolio.owner.name} · {portfolio.projects.length} projektów
        </p>
        {portfolio.description && <p style={{ color: 'var(--text2)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{portfolio.description}</p>}
        <div style={{ marginTop: '1rem' }} className="no-print">
          <button className="btn btn-primary" onClick={handlePrint}>
            📄 Pobierz jako PDF (Ctrl+P)
          </button>
        </div>
      </div>

      <div ref={printRef}>
        {portfolio.projects.length === 0 ? (
          <div className="empty-state"><h3>Brak projektów</h3></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {portfolio.projects.sort((a, b) => a.order_index - b.order_index).map(({ project: p }, idx) => (
              <div key={p.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontFamily: 'monospace', color: 'var(--text2)', fontSize: '0.8rem' }}>#{idx + 1}</span>
                      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem' }}>{p.title}</h2>
                    </div>
                    <div style={{ color: 'var(--text2)', fontSize: '0.83rem' }}>{p.year} · {p.role}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {diffBadge(p.difficulty_level)}
                    <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text2)', marginTop: '0.25rem' }}>
                      Score: {p.difficulty_score.toFixed(0)}/100
                    </div>
                  </div>
                </div>

                <p style={{ color: 'var(--text2)', lineHeight: 1.7, marginBottom: '0.75rem', fontSize: '0.9rem' }}>{p.description}</p>

                {p.technologies.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text2)', marginBottom: '0.4rem', fontWeight: 500 }}>TECHNOLOGIE</div>
                    <div className="tech-list">
                      {p.technologies.slice(0, 8).map(t => (
                        <span key={t.id} className="badge badge-tech" title={`${t.confidence_level.toFixed(0)}%`}>{t.name}</span>
                      ))}
                      {p.technologies.length > 8 && <span className="badge badge-tech">+{p.technologies.length - 8}</span>}
                    </div>
                  </div>
                )}

                {p.repo_url && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.82rem' }}>
                    <a href={p.repo_url} className="public-link" target="_blank" rel="noreferrer">🔗 {p.repo_url}</a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem', padding: '1rem 0', borderTop: '1px solid var(--border)', color: 'var(--text2)', fontSize: '0.8rem' }} className="no-print">
        Wygenerowano przez Archiwum Projektów Studenta · {new Date(portfolio.created_at).toLocaleDateString('pl')}
      </div>
    </div>
  );
}
