import { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts';
import { mockReports } from '../api/mockData';

const PIE_COLORS = ['#74C69D', '#E9C46A', '#A8C5DA'];

export default function ReportsPage() {
    const [ledger, setLedger] = useState<any[]>([]);
    const [occupancy, setOccupancy] = useState<any[]>([]);
    const [period, setPeriod] = useState<'today' | 'week'>('today');

    useEffect(() => {
        setLedger(mockReports.invoice_ledger);
    }, []);

    useEffect(() => {
        setOccupancy(period === 'today' ? mockReports.center_occupancy_today : mockReports.center_occupancy_week);
    }, [period]);

    return (
        <div style={{ padding: '2rem', backgroundColor: '#FAFAF7', minHeight: '100vh' }}>
            <h2 style={{ color: '#3E2723', marginBottom: '2rem' }}>Reports</h2>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>

                {/* Pie chart — Invoice Ledger */}
                <div style={cardStyle}>
                    <h3 style={sectionTitle}>Invoice Status</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie
                                data={ledger}
                                dataKey="total_amount"
                                nameKey="status"
                                cx="50%"
                                cy="50%"
                                outerRadius={90}
                                label={({ status, percent }) =>
                                    `${status} ${(percent * 100).toFixed(0)}%`
                                }
                            >
                                {ledger.map((_, i) => (
                                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(val: any) => `$${val}`} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Bar chart — Center Occupancy */}
                <div style={cardStyle}>
                    <h3 style={sectionTitle}>Center Occupancy</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={occupancy} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0d8cc" />
                            <XAxis
                                dataKey="center_name"
                                tick={{ fontSize: 11, fill: '#3E2723' }}
                                angle={-20}
                                textAnchor="end"
                            />
                            <YAxis tick={{ fontSize: 11, fill: '#3E2723' }} />
                            <Tooltip />
                            <Legend wrapperStyle={{ paddingTop: '1rem' }} />
                            <Bar dataKey="total_capacity_used" fill="#C1440E" name="Capacity Used" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="total_bookings" fill="#74C69D" name="Bookings" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Invoice Ledger table */}
            <h3 style={sectionTitle}>Invoice Status Ledger</h3>
            <div style={{ overflowX: 'auto', marginBottom: '3rem' }}>
                <table style={tableStyle}>
                    <thead>
                        <tr style={{ backgroundColor: '#2D6A4F', color: 'white' }}>
                            {ledger.length > 0 && Object.keys(ledger[0]).map(col => (
                                <th key={col} style={thStyle}>{col.replace(/_/g, ' ')}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {ledger.map((row, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #e0d8cc' }}>
                                {Object.values(row).map((val: any, j) => (
                                    <td key={j} style={tdStyle}>{val}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Center Occupancy table */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ ...sectionTitle, marginBottom: 0 }}>Center Occupancy</h3>
                <div style={{ display: 'flex', backgroundColor: '#F5F0E8', borderRadius: '8px', padding: '3px', gap: '3px' }}>
                    {(['today', 'week'] as const).map(p => (
                        <button key={p} onClick={() => setPeriod(p)} style={{
                            padding: '0.4rem 1rem',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: period === p ? '#2D6A4F' : 'transparent',
                            color: period === p ? 'white' : '#3E2723',
                            fontWeight: period === p ? 600 : 400,
                            fontSize: '0.9rem',
                        }}>
                            {p === 'today' ? 'Today' : 'This Week'}
                        </button>
                    ))}
                </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table style={tableStyle}>
                    <thead>
                        <tr style={{ backgroundColor: '#2D6A4F', color: 'white' }}>
                            {occupancy.length > 0 && Object.keys(occupancy[0]).map(col => (
                                <th key={col} style={thStyle}>{col.replace(/_/g, ' ')}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {occupancy.map((row, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #e0d8cc' }}>
                                {Object.values(row).map((val: any, j) => (
                                    <td key={j} style={tdStyle}>{val}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const cardStyle: React.CSSProperties = {
    backgroundColor: '#F5F0E8',
    borderRadius: '10px',
    padding: '1.5rem',
    boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
};

const sectionTitle: React.CSSProperties = {
    color: '#2D6A4F',
    marginBottom: '1rem',
    marginTop: 0,
};

const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#F5F0E8',
    borderRadius: '8px',
    overflow: 'hidden',
};

const thStyle: React.CSSProperties = {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    textTransform: 'capitalize',
};

const tdStyle: React.CSSProperties = {
    padding: '0.75rem 1rem',
    color: '#3E2723',
};
