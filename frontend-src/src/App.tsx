import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';

import './App.css';

function Nav() {
  const { user, logout, isGuest } = useAuth();
  const loc = useLocation();
  const active = (p: string) => loc.pathname === p ? 'nav-link active' : 'nav-link';
  return (
    <nav className="navbar">
      <div className="nav-brand">📚 Archiwum Projektów</div>
      <div className="nav-links">
        {!isGuest && <>
          <Link className={active('/my-projects')} to="/my-projects">Moje Projekty</Link>
          
		  
        </>}
      </div>
      <div className="nav-user">
        {isGuest ? <Link className="nav-link" to="/login">Zaloguj się</Link>
          : <><span className="user-name">{user?.name}</span><button className="logout-btn" onClick={logout}>Wyloguj</button></>}
      </div>
    </nav>
  );
}

function Protected({ children }: { children: React.ReactNode }) {
  const { isGuest } = useAuth();
  return isGuest ? <Navigate to="/login" replace /> : <>{children}</>;
}

function AppRoutes() {
  return (<>
    <Nav />
    <main className="main-content">
      <Routes>
        <Route path="/" element={<Navigate to="/my-projects" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
		
      </Routes>
    </main>
  </>);
}

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
