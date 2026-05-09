import { useEffect, useState } from 'react';
import { getMyProfile } from '../services/api';
import type { Profile } from '../types';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';

// Funkcja służy do renderowania profilu kompetencji użytkownika.
export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyProfile().then(r => setProfile(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;
  if (!profile) return null;

  const maxWeight = Math.max(...profile.skills.map(s => s.weight), 1);
  const radarData = profile.skills.slice(0, 8).map(s => ({
    tech: s.technology,
    value: Math.round((s.weight / maxWeight) * 100),
  }));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Profil Kompetencji</h1>
        <p className="page-subtitle">{profile.user.name} · {profile.user.email}</p>
      </div>

      <div className="stats-row">
        {[
          { n: profile.total_projects, l: 'Projektów' },
          { n: profile.skills.length, l: 'Technologii' },
          { n: profile.top_technologies.length, l: 'Top Skills' },
          { n: profile.recommendations.length, l: 'Rekomendacji' },
        ].map(({ n, l }) => (
          <div key={l} className="card stat-card">
            <div className="stat-number">{n}</div>
            <div className="stat-label">{l}</div>
          </div>
        ))}
      </div>

      <div className="profile-grid">
        <div className="card">
          <div className="section-title">Mapa Umiejętności (Radar)</div>
          {radarData.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">Brak</div>
              <h3>Brak danych</h3>
              <p>Dodaj projekty, aby zbudować profil kompetencji.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="tech" tick={{ fill: 'var(--text2)', fontSize: 11 }} />
                <Radar dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.25} strokeWidth={2} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '8px' }}
                  formatter={(v: any) => [`${v}%`, 'Siła']}
                />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="section-title">Siła technologii</div>
          {profile.skills.slice(0, 10).map(s => (
            <div key={s.technology} className="skill-bar">
              <div className="skill-bar-label">
                <span>{s.technology}</span>
                <span style={{ color: 'var(--text2)', fontSize: '0.75rem' }}>
                  {s.project_count} proj · Ø {s.avg_difficulty.toFixed(0)} pkt
                </span>
              </div>
              <div className="skill-bar-track">
                <div className="skill-bar-fill" style={{ width: `${Math.min((s.weight / maxWeight) * 100, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="section-title">Top technologie</div>
          <div className="tag-cloud">
            {profile.top_technologies.map((t, i) => (
              <span key={t} className="badge" style={{
                background: `rgba(88,166,255,${0.3 - i * 0.04})`,
                color: 'var(--accent)',
                border: '1px solid rgba(88,166,255,0.3)',
                fontSize: `${0.9 - i * 0.05}rem`,
              }}>{t}</span>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-title">Rekomendowane do nauki</div>
          <p style={{ color: 'var(--text2)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
            Na podstawie Twojego profilu, warto poznać:
          </p>
          <div className="tag-cloud">
            {profile.recommendations.map(r => (
              <span key={r} className="rec-tag">{r}</span>
            ))}
          </div>
          {profile.recommendations.length === 0 && (
            <p style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>Dodaj więcej projektów, aby uzyskać rekomendacje.</p>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="section-title">Wszystkie technologie ({profile.skills.length})</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
          {profile.skills.map(s => (
            <div key={s.technology} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', background: 'var(--bg3)', borderRadius: '6px', fontSize: '0.82rem' }}>
              <span>{s.technology}</span>
              <span style={{ color: 'var(--text2)' }}>{s.project_count}×</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
