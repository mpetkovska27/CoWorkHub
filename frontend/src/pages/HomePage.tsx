import { useEffect, useState } from 'react';
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

export default function HomePage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [centers, setCenters] = useState<Center[]>([]);
    const [openCenterId, setOpenCenterId] = useState<number | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        setStats(mockStats);
        setCenters(mockCenters);
    }, []);

    const toggleCenter = (id: number) => {
        setOpenCenterId(openCenterId === id ? null : id);
    };

    const statusColor = (status: string) => {
        if (status === 'available') return '#74C69D';
        if (status === 'occupied') return '#C1440E';
        return '#E9C46A';
    };

    return (
        <div style={{ padding: '2rem', backgroundColor: '#FAFAF7', minHeight: '100vh' }}>

            {/* Stats */}
            <h2 style={{ color: '#3E2723', marginBottom: '1rem' }}>Dashboard</h2>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Active Reservations Today', value: stats?.active_reservations_today, icon: '🗓' },
                    { label: 'Free Workspaces', value: stats?.free_workspaces, icon: '🪑' },
                    { label: 'Unpaid Invoices', value: stats?.unpaid_invoices, icon: '🧾' },
                ].map((card) => (
                    <div key={card.label} style={{
                        flex: 1,
                        backgroundColor: '#F5F0E8',
                        borderLeft: '4px solid #2D6A4F',
                        borderRadius: '8px',
                        padding: '1.5rem',
                    }}>
                        <div style={{ fontSize: '2rem' }}>{card.icon}</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2D6A4F' }}>{card.value ?? '...'}</div>
                        <div style={{ color: '#3E2723' }}>{card.label}</div>
                    </div>
                ))}
            </div>

            {/* Centers */}
            <h2 style={{ color: '#3E2723', marginBottom: '1rem' }}>Our Locations</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {centers.map(center => (
                    <div key={center.id} style={{
                        backgroundColor: '#F5F0E8',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                    }}>
                        <h3 style={{ color: '#2D6A4F', marginBottom: '0.5rem' }}>{center.name}</h3>
                        <p style={{ color: '#3E2723', margin: '0.2rem 0' }}>📞 {center.contact_phone}</p>
                        <p style={{ color: '#3E2723', margin: '0.2rem 0' }}>✉️ {center.email}</p>

                        <button
                            onClick={() => toggleCenter(center.id)}
                            style={{
                                marginTop: '1rem',
                                backgroundColor: '#2D6A4F',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '0.5rem 1rem',
                                cursor: 'pointer',
                            }}>
                            {openCenterId === center.id ? 'Hide Workspaces ▲' : 'View Workspaces ▼'}
                        </button>

                        {/* Workspaces */}
                        {openCenterId === center.id && (
                            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {center.workspaces.map(ws => (
                                    <div key={ws.id} style={{
                                        backgroundColor: 'white',
                                        borderRadius: '6px',
                                        padding: '0.75rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}>
                                        <div>
                                            <strong style={{ color: '#3E2723' }}>{ws.name}</strong>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>{ws.type} · {ws.capacity} people</p>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                                            <span style={{
                                                backgroundColor: statusColor(ws.status),
                                                color: 'white',
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                            }}>{ws.status}</span>
                                            {ws.status === 'available' && (
                                                <button
                                                    onClick={() => navigate('/reservations', { state: { workspace_id: ws.id } })}
                                                    style={{
                                                        backgroundColor: '#A8C5DA',
                                                        color: '#3E2723',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        padding: '0.3rem 0.7rem',
                                                        cursor: 'pointer',
                                                        fontSize: '0.8rem',
                                                    }}>
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
