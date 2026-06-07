import { useEffect, useState } from 'react';
import api from '../api/axios';

interface Invoice {
    id: number;
    issue_date: string;
    total_amount: number;
    tax_amount: number;
    status: string;
    type: string;
}

const SUMMARY_CARDS: { key: string; label: string; icon: string; color: string }[] = [
    { key: 'paid',     label: 'Total Paid',     icon: '✅', color: 'var(--green)'  },
    { key: 'unpaid',   label: 'Total Unpaid',   icon: '⏳', color: 'var(--yellow)' },
    { key: 'refunded', label: 'Total Refunded', icon: '↩️', color: 'var(--blue)'   },
];

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);

    useEffect(() => {
        api.get('/invoices/').then(res => setInvoices(res.data.invoices));
    }, []);

    const handleStatusChange = async (id: number, newStatus: string) => {
        await api.patch(`/invoices/${id}/status/`, { status: newStatus });
        setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv));
    };

    const totalByStatus = (status: string) =>
        invoices.filter(i => i.status === status).reduce((s, i) => s + i.total_amount, 0);

    return (
        <div className="page">
            <h2 className="page-title" style={{ marginBottom: '1.5rem' }}>Invoices</h2>

            {/* Summary cards */}
            <div className="stat-cards">
                {SUMMARY_CARDS.map(card => (
                    <div key={card.key} className="stat-card" style={{ borderLeftColor: card.color }}>
                        <div className="stat-card__icon">{card.icon}</div>
                        <div className="stat-card__value">${totalByStatus(card.key).toLocaleString()}</div>
                        <div className="stat-card__label">{card.label}</div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="table-wrap">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Issue Date</th>
                            <th>Total Amount</th>
                            <th>Tax Amount</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Change Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map(inv => (
                            <tr key={inv.id}>
                                <td>#{inv.id}</td>
                                <td>{new Date(inv.issue_date).toLocaleDateString()}</td>
                                <td><strong>${inv.total_amount.toLocaleString()}</strong></td>
                                <td>${inv.tax_amount.toLocaleString()}</td>
                                <td>{inv.type}</td>
                                <td>
                                    <span className={`badge badge--${inv.status}`}>{inv.status}</span>
                                </td>
                                <td>
                                    <select
                                        className="field-input"
                                        style={{ width: 'auto', cursor: 'pointer' }}
                                        value={inv.status}
                                        onChange={e => handleStatusChange(inv.id, e.target.value)}>
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
