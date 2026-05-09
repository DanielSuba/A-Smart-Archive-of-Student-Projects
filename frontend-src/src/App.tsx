import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import type { Lang } from './locales/translations';
import Login from './pages/Login';
import Register from './pages/Register';
import MyProjects from './pages/MyProjects';
import Archive from './pages/Archive';
import ProjectDetail from './pages/ProjectDetail';
import AddProject from './pages/AddProject';
import ProfilePage from './pages/ProfilePage';
import PortfoliosPage from './pages/PortfoliosPage';
import PublicPortfolio from './pages/PublicPortfolio';
import About from './pages/About';
import './App.css';

// Funkcja służy do renderowania przełącznika motywu jasny/ciemny.
function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);
  return (
    <button className="theme-btn" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} title="Zmień motyw">
      {theme === 'light' ? '☾ Ciemny' : '☀ Jasny'}
    </button>
  );
}

// Funkcja służy do renderowania przełącznika języków na pasku nawigacji.
function LangSwitcher() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="lang-switcher">
      {(['pl', 'en', 'lt'] as Lang[]).map(l => (
        <button key={l} className={`lang-btn${lang === l ? ' active' : ''}`} onClick={() => setLang(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

// Funkcja służy do renderowania głównego paska nawigacji aplikacji.
function Nav() {
  const { user, logout, isGuest } = useAuth();
  const { t } = useLanguage();
  const loc = useLocation();
  // Funkcja służy do wyznaczania aktywnej klasy linku nawigacji.
  const active = (p: string) => loc.pathname === p ? 'nav-link active' : 'nav-link';
  return (
    <nav className="navbar">
      <div className="nav-brand">{t.nav.brand}</div>
      <div className="nav-links">
        {!isGuest && <>
          <Link className={active('/my-projects')} to="/my-projects">{t.nav.myProjects}</Link>
          <Link className={active('/archive')} to="/archive">{t.nav.archive}</Link>
          <Link className={active('/profile')} to="/profile">{t.nav.profile}</Link>
          <Link className={active('/portfolios')} to="/portfolios">{t.nav.portfolio}</Link>
          <Link className="nav-link add-btn" to="/add-project">{t.nav.addProject}</Link>
        </>}
        <Link className={active('/about')} to="/about">{t.nav.about}</Link>
      </div>
      <div className="nav-user">
        <ThemeToggle />
        <LangSwitcher />
        {isGuest ? <Link className="nav-link" to="/login">{t.nav.login}</Link>
          : <><span className="user-name">{user?.name}</span><button className="logout-btn" onClick={logout}>{t.nav.logout}</button></>}
      </div>
    </nav>
  );
}

// Funkcja służy do blokowania dostępu gościom do chronionych stron.
function Protected({ children }: { children: React.ReactNode }) {
  const { isGuest } = useAuth();
  return isGuest ? <Navigate to="/login" replace /> : <>{children}</>;
}

// Funkcja służy do definiowania tras i głównego układu aplikacji.
function AppRoutes() {
  return (<>
    <Nav />
    <main className="main-content">
      <Routes>
        <Route path="/" element={<Navigate to="/my-projects" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/portfolio/:slug" element={<PublicPortfolio />} />
        <Route path="/my-projects" element={<Protected><MyProjects /></Protected>} />
        <Route path="/archive" element={<Protected><Archive /></Protected>} />
        <Route path="/project/:id" element={<Protected><ProjectDetail /></Protected>} />
        <Route path="/add-project" element={<Protected><AddProject /></Protected>} />
        <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />
        <Route path="/profile/:userId" element={<Protected><ProfilePage /></Protected>} />
        <Route path="/portfolios" element={<Protected><PortfoliosPage /></Protected>} />
      </Routes>
    </main>
  </>);
}

// Funkcja służy do uruchamiania aplikacji z providerem autoryzacji i routerem.
export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
