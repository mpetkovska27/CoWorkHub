import { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import { mockReports } from '../api/mockData';

const PIE_COLORS = ['#74C69D', '#E9C46A', '#A8C5DA'];

type Row = Record<string, string | number>;

const renderPieLabel = ({ name, percent }: PieLabelRenderProps) =>
    `${String(name)} ${(((percent ?? 0) as number) * 100).toFixed(0)}%`;

export default function ReportsPage() {
    const [period, setPeriod] = useState<'today' | 'week'>('today');

    const ledger: Row[]    = mockReports.invoice_ledger;
    const occupancy: Row[] = period === 'today'
        ? mockReports.center_occupancy_today
        : mockReports.center_occupancy_week;

    return (
        <div className="page">
            <h2 className="page-title" style={{ marginBottom: '2rem' }}>Reports</h2>

            {/* Charts */}
            <div className="charts-grid">
                <div className="chart-card">
                    <h3 className="section-title">Invoice Status</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie
                                data={ledger}
                                dataKey="total_amount"
                                nameKey="status"
                                cx="50%"
                                cy="50%"
                                outerRadius={90}
                                label={renderPieLabel}
                            >
                                {ledger.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(val) => `$${val}`} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3 className="section-title">Center Occupancy</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={occupancy} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="center_name" tick={{ fontSize: 11, fill: 'var(--text)' }} angle={-20} textAnchor="end" />
                            <YAxis tick={{ fontSize: 11, fill: 'var(--text)' }} />
                            <Tooltip />
                            <Legend wrapperStyle={{ paddingTop: '1rem' }} />
                            <Bar dataKey="total_capacity_used" fill="var(--red)"   name="Capacity Used" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="total_bookings"      fill="var(--green)" name="Bookings"      radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Invoice Ledger table */}
            <h3 className="section-title">Invoice Status Ledger</h3>
            <div className="table-wrap" style={{ marginBottom: '3rem' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            {ledger.length > 0 && Object.keys(ledger[0]).map(col => (
                                <th key={col}>{col.replace(/_/g, ' ')}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {ledger.map((row, i) => (
                            <tr key={i}>
                                {Object.values(row).map((val, j) => <td key={j}>{val}</td>)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Center Occupancy table */}
            <div className="page-header" style={{ marginBottom: '1rem' }}>
                <h3 className="section-title" style={{ marginBottom: 0 }}>Center Occupancy</h3>
                <div className="toggle-group">
                    {(['today', 'week'] as const).map(p => (
                        <button
                            key={p}
                            className={`toggle-btn ${period === p ? 'active' : ''}`}
                            onClick={() => setPeriod(p)}>
                            {p === 'today' ? 'Today' : 'This Week'}
                        </button>
                    ))}
                </div>
            </div>
            <div className="table-wrap">
                <table className="data-table">
                    <thead>
                        <tr>
                            {occupancy.length > 0 && Object.keys(occupancy[0]).map(col => (
                                <th key={col}>{col.replace(/_/g, ' ')}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {occupancy.map((row, i) => (
                            <tr key={i}>
                                {Object.values(row).map((val, j) => <td key={j}>{val}</td>)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
