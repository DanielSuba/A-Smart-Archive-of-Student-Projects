import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMyProfile, getUserProfile, updateMyContacts } from '../services/api';
import type { Profile } from '../types';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

// Funkcja służy do renderowania profilu kompetencji użytkownika.
export default function ProfilePage() {
  const { userId } = useParams<{ userId?: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingContacts, setEditingContacts] = useState(false);
  const [contacts, setContacts] = useState({ facebook: '', discord: '', github: '', linkedin: '' });
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();

  // Funkcja służy do pobrania profilu zalogowanego lub wybranego użytkownika.
  const loadProfile = () => {
    setLoading(true);
    const promise = userId ? getUserProfile(Number(userId)) : getMyProfile();
    promise.then(r => {
      setProfile(r.data);
      setContacts({
        facebook: r.data.user.facebook || '',
        discord: r.data.user.discord || '',
        github: r.data.user.github || '',
        linkedin: r.data.user.linkedin || '',
      });
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadProfile(); }, [userId]);

  const isOwner = profile && currentUser && profile.user.id === currentUser.id;

  // Funkcja służy do zapisywania kontaktów aktualnego użytkownika.
  const saveContacts = async () => {
    try {
      await updateMyContacts(contacts);
      toast.success(t.profile.contactsSaved);
      setEditingContacts(false);
      loadProfile();
    } catch { toast.error(t.profile.contactsError); }
  };

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
        <h1 className="page-title">{t.profile.title}</h1>
        <p className="page-subtitle">{profile.user.name} · {profile.user.email}</p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{t.profile.contactsTitle}</span>
          {isOwner && !editingContacts && (
            <button className="btn btn-secondary btn-sm" onClick={() => setEditingContacts(true)}>{t.profile.contactsEdit}</button>
          )}
        </div>
        {editingContacts ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {(['linkedin', 'github', 'facebook', 'discord'] as const).map(k => (
              <div key={k} className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ textTransform: 'capitalize' }}>{k}</label>
                <input className="form-input" value={contacts[k]}
                  onChange={e => setContacts(c => ({ ...c, [k]: e.target.value }))}
                  placeholder={k === 'discord' ? 'username#1234' : `https://${k}.com/...`} />
              </div>
            ))}
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-primary btn-sm" onClick={saveContacts}>{t.profile.contactsSave}</button>
              <button className="btn btn-secondary btn-sm" onClick={() => { setEditingContacts(false); loadProfile(); }}>{t.profile.contactsCancel}</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem 1.5rem', fontSize: '0.88rem' }}>
            {(['linkedin', 'github', 'facebook', 'discord'] as const).map(k => {
              const v = profile.user[k];
              const isUrl = !!v && (v.startsWith('http://') || v.startsWith('https://'));
              return (
                <div key={k}>
                  <span style={{ color: 'var(--text2)', textTransform: 'capitalize' }}>{k}: </span>
                  {v ? (
                    isUrl ? <a href={v} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>{v}</a> : <span>{v}</span>
                  ) : <span style={{ color: 'var(--text2)' }}>—</span>}
                </div>
              );
            })}
            {!profile.user.facebook && !profile.user.discord && !profile.user.github && !profile.user.linkedin && (
              <span style={{ color: 'var(--text2)', gridColumn: '1 / -1' }}>{t.profile.contactsEmpty}</span>
            )}
          </div>
        )}
      </div>

      <div className="stats-row">
        {[
          { n: profile.total_projects, l: t.profile.statProjects },
          { n: profile.skills.length, l: t.profile.statTechnologies },
          { n: profile.top_technologies.length, l: t.profile.statTopSkills },
          { n: profile.recommendations.length, l: t.profile.statRecommendations },
        ].map(({ n, l }) => (
          <div key={l} className="card stat-card">
            <div className="stat-number">{n}</div>
            <div className="stat-label">{l}</div>
          </div>
        ))}
      </div>

      <div className="profile-grid">
        <div className="card">
          <div className="section-title">{t.profile.radarTitle}</div>
          {radarData.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">{t.profile.emptyIcon}</div>
              <h3>{t.profile.emptyTitle}</h3>
              <p>{t.profile.emptyText}</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="tech" tick={{ fill: 'var(--text2)', fontSize: 11 }} />
                <Radar dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.25} strokeWidth={2} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '8px' }}
                  formatter={(v: any) => [`${v}%`, t.profile.tooltipStrength]}
                />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="section-title">{t.profile.strengthTitle}</div>
          {profile.skills.slice(0, 10).map(s => (
            <div key={s.technology} className="skill-bar">
              <div className="skill-bar-label">
                <span>{s.technology}</span>
                <span style={{ color: 'var(--text2)', fontSize: '0.75rem' }}>
                  {t.profile.skillStat(s.project_count, Number(s.avg_difficulty.toFixed(0)))}
                </span>
              </div>
              <div className="skill-bar-track">
                <div className="skill-bar-fill" style={{ width: `${Math.min((s.weight / maxWeight) * 100, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="section-title">{t.profile.topTitle}</div>
          <div className="tag-cloud">
            {profile.top_technologies.map((tech, i) => (
              <span key={tech} className="badge" style={{
                background: `rgba(88,166,255,${0.3 - i * 0.04})`,
                color: 'var(--accent)',
                border: '1px solid rgba(88,166,255,0.3)',
                fontSize: `${0.9 - i * 0.05}rem`,
              }}>{tech}</span>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-title">{t.profile.recoTitle}</div>
          <p style={{ color: 'var(--text2)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
            {t.profile.recoText}
          </p>
          <div className="tag-cloud">
            {profile.recommendations.map(r => (
              <span key={r} className="rec-tag">{r}</span>
            ))}
          </div>
          {profile.recommendations.length === 0 && (
            <p style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>{t.profile.recoEmpty}</p>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="section-title">{t.profile.allTechTitle(profile.skills.length)}</div>
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
