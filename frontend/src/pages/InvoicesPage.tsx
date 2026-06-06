import { useEffect, useState } from 'react';
import { mockInvoices } from '../api/mockData';

interface Invoice {
    id: number;
    issue_date: string;
    total_amount: number;
    tax_amount: number;
    status: string;
    type: string;
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);

    useEffect(() => {
        setInvoices(mockInvoices);
    }, []);

    const handleStatusChange = (id: number, newStatus: string) => {
        setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv));
    };

    const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total_amount, 0);
    const totalUnpaid = invoices.filter(i => i.status === 'unpaid').reduce((s, i) => s + i.total_amount, 0);
    const totalRefunded = invoices.filter(i => i.status === 'refunded').reduce((s, i) => s + i.total_amount, 0);

    const statusColor = (status: string) => {
        if (status === 'paid') return '#74C69D';
        if (status === 'refunded') return '#A8C5DA';
        return '#E9C46A';
    };

    return (
        <div style={{ padding: '2rem', backgroundColor: '#FAFAF7', minHeight: '100vh' }}>
            <h2 style={{ color: '#3E2723', marginBottom: '1.5rem' }}>Invoices</h2>

            {/* Summary cards */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Total Paid', value: totalPaid, color: '#74C69D', icon: '✅' },
                    { label: 'Total Unpaid', value: totalUnpaid, color: '#E9C46A', icon: '⏳' },
                    { label: 'Total Refunded', value: totalRefunded, color: '#A8C5DA', icon: '↩️' },
                ].map(card => (
                    <div key={card.label} style={{
                        flex: 1,
                        backgroundColor: '#F5F0E8',
                        borderLeft: `4px solid ${card.color}`,
                        borderRadius: '8px',
                        padding: '1.25rem 1.5rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                    }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{card.icon}</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#2D6A4F' }}>
                            ${card.value.toLocaleString()}
                        </div>
                        <div style={{ color: '#3E2723', fontSize: '0.9rem' }}>{card.label}</div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#F5F0E8', borderRadius: '8px', overflow: 'hidden' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#2D6A4F', color: 'white' }}>
                            <th style={thStyle}>#</th>
                            <th style={thStyle}>Issue Date</th>
                            <th style={thStyle}>Total Amount</th>
                            <th style={thStyle}>Tax Amount</th>
                            <th style={thStyle}>Type</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Change Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map(inv => (
                            <tr key={inv.id} style={{ borderBottom: '1px solid #e0d8cc' }}>
                                <td style={tdStyle}>#{inv.id}</td>
                                <td style={tdStyle}>{new Date(inv.issue_date).toLocaleDateString()}</td>
                                <td style={tdStyle}><strong>${inv.total_amount.toLocaleString()}</strong></td>
                                <td style={tdStyle}>${inv.tax_amount.toLocaleString()}</td>
                                <td style={tdStyle}>{inv.type}</td>
                                <td style={tdStyle}>
                                    <span style={{
                                        backgroundColor: statusColor(inv.status),
                                        color: 'white',
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '12px',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                    }}>{inv.status}</span>
                                </td>
                                <td style={tdStyle}>
                                    <select
                                        value={inv.status}
                                        onChange={e => handleStatusChange(inv.id, e.target.value)}
                                        style={{
                                            padding: '0.3rem 0.5rem',
                                            borderRadius: '6px',
                                            border: '1px solid #c8b8a2',
                                            backgroundColor: '#FAFAF7',
                                            color: '#3E2723',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                        }}>
                                        <option value="paid">paid</option>
                                        <option value="unpaid">unpaid</option>
                                        <option value="refunded">refunded</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const thStyle: React.CSSProperties = { padding: '0.75rem 1rem', textAlign: 'left' };
const tdStyle: React.CSSProperties = { padding: '0.75rem 1rem', color: '#3E2723' };
