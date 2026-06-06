import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
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
        <nav style={{
            backgroundColor: '#3E2723',
            padding: '0 2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            height: '60px',
            position: 'sticky',
            top: 0,
            zIndex: 100,
        }}>
            <span style={{ color: '#74C69D', fontWeight: 'bold', fontSize: '1.2rem', marginRight: '2rem' }}>
                CoWorkHub
            </span>
            {navLinks.map(link => (
                <Link
                    key={link.to}
                    to={link.to}
                    style={{
                        color: location.pathname === link.to ? '#74C69D' : '#F5F0E8',
                        textDecoration: 'none',
                        padding: '0.4rem 1rem',
                        borderRadius: '6px',
                        backgroundColor: location.pathname === link.to ? 'rgba(116,198,157,0.15)' : 'transparent',
                        fontWeight: location.pathname === link.to ? 'bold' : 'normal',
                        transition: 'all 0.2s',
                    }}>
                    {link.label}
                </Link>
            ))}
        </nav>
    );
}

function App() {
    return (
        <BrowserRouter>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', margin: 0 }}>
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
