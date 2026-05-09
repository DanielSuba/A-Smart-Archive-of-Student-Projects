import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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

// Funkcja służy do renderowania głównego paska nawigacji aplikacji.
function Nav() {
  const { user, logout, isGuest } = useAuth();
  const loc = useLocation();
  // Funkcja służy do wyznaczania aktywnej klasy linku nawigacji.
  const active = (p: string) => loc.pathname === p ? 'nav-link active' : 'nav-link';
  return (
    <nav className="navbar">
      <div className="nav-brand">Archiwum Projektów</div>
      <div className="nav-links">
        {!isGuest && <>
          <Link className={active('/my-projects')} to="/my-projects">Moje Projekty</Link>
          <Link className={active('/archive')} to="/archive">Archiwum</Link>
          <Link className={active('/profile')} to="/profile">Profil</Link>
          <Link className={active('/portfolios')} to="/portfolios">Portfolio</Link>
          <Link className="nav-link add-btn" to="/add-project">+ Dodaj Projekt</Link>
        </>}
        <Link className={active('/about')} to="/about">About</Link>
      </div>
      <div className="nav-user">
        {isGuest ? <Link className="nav-link" to="/login">Zaloguj się</Link>
          : <><span className="user-name">{user?.name}</span><button className="logout-btn" onClick={logout}>Wyloguj</button></>}
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
        <Route path="/portfolios" element={<Protected><PortfoliosPage /></Protected>} />
      </Routes>
    </main>
  </>);
}

// Funkcja służy do uruchamiania aplikacji z providerem autoryzacji i routerem.
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}
