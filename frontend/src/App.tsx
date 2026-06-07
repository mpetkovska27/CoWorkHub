import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import ReservationsPage from './pages/ReservationsPage';
import InvoicesPage from './pages/InvoicesPage';
import ReportsPage from './pages/ReportsPage';

const navLinks = [
    { to: '/', label: '🏠 Home' },
    { to: '/reservations', label: '🗓 Reservations' },
    { to: '/invoices', label: '🧾 Invoices' },
    { to: '/reports', label: '📊 Reports' },
];

function Navbar() {
    const location = useLocation();
    return (
        <nav className="navbar">
            <span className="navbar-brand">CoWorkHub</span>
            {navLinks.map(link => (
                <Link
                    key={link.to}
                    to={link.to}
                    className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}>
                    {link.label}
                </Link>
            ))}
        </nav>
    );
}

function App() {
    return (
        <BrowserRouter>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navbar />
                <main style={{ flex: 1, width: '100%' }}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/reservations" element={<ReservationsPage />} />
                        <Route path="/invoices" element={<InvoicesPage />} />
                        <Route path="/reports" element={<ReportsPage />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
