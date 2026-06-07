import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockStats, mockCenters } from '../api/mockData';

interface Workspace {
    id: number;
    name: string;
    type: string;
    capacity: number;
    status: string;
}

interface Center {
    id: number;
    name: string;
    contact_phone: string;
    email: string;
    workspaces: Workspace[];
}

interface Stats {
    active_reservations_today: number;
    free_workspaces: number;
    unpaid_invoices: number;
}

const STAT_CARDS: { key: keyof Stats; label: string; icon: string; color: string }[] = [
    { key: 'active_reservations_today', label: 'Active Reservations Today', icon: '🗓', color: 'var(--primary)' },
    { key: 'free_workspaces',           label: 'Free Workspaces',           icon: '🪑', color: 'var(--green)'   },
    { key: 'unpaid_invoices',           label: 'Unpaid Invoices',           icon: '🧾', color: 'var(--yellow)'  },
];

const statusBadgeClass = (status: string) => {
    if (status === 'available') return 'badge badge--green';
    if (status === 'occupied')  return 'badge badge--red';
    return 'badge badge--yellow';
};

export default function HomePage() {
    const stats: Stats = mockStats;
    const centers: Center[] = mockCenters;
    const [openCenterId, setOpenCenterId] = useState<number | null>(null);
    const navigate = useNavigate();

    return (
        <div className="page">

            <h2 className="page-title" style={{ marginBottom: '1rem' }}>Dashboard</h2>

            {/* Stats */}
            <div className="stat-cards">
                {STAT_CARDS.map(card => (
                    <div key={card.key} className="stat-card" style={{ borderLeftColor: card.color }}>
                        <div className="stat-card__icon">{card.icon}</div>
                        <div className="stat-card__value">{stats[card.key]}</div>
                        <div className="stat-card__label">{card.label}</div>
                    </div>
                ))}
            </div>

            {/* Centers */}
            <h2 className="page-title" style={{ marginBottom: '1rem' }}>Our Locations</h2>
            <div className="centers-grid">
                {centers.map(center => (
                    <div key={center.id} className="card">
                        <h3 className="section-title">{center.name}</h3>
                        <p style={{ color: 'var(--text)', margin: '0.2rem 0' }}>📞 {center.contact_phone}</p>
                        <p style={{ color: 'var(--text)', margin: '0.2rem 0' }}>✉️ {center.email}</p>

                        <button
                            className="btn-primary"
                            style={{ marginTop: '1rem' }}
                            onClick={() => setOpenCenterId(openCenterId === center.id ? null : center.id)}>
                            {openCenterId === center.id ? 'Hide Workspaces ▲' : 'View Workspaces ▼'}
                        </button>

                        {openCenterId === center.id && (
                            <div className="workspace-list">
                                {center.workspaces.map(ws => (
                                    <div key={ws.id} className="workspace-item">
                                        <div className="workspace-item__info">
                                            <strong>{ws.name}</strong>
                                            <p>{ws.type} · {ws.capacity} people</p>
                                        </div>
                                        <div className="workspace-item__actions">
                                            <span className={statusBadgeClass(ws.status)}>{ws.status}</span>
                                            {ws.status === 'available' && (
                                                <button
                                                    className="btn-primary"
                                                    style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem', backgroundColor: 'var(--blue)', color: 'var(--text)' }}
                                                    onClick={() => navigate('/reservations', { state: { workspace_id: ws.id } })}>
                                                    + Add Reservation
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
