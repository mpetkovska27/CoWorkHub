import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/calendar.css';
import { mockReservations, mockMembers, mockSetups, mockContracts } from '../api/mockData';

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    getDay,
    locales: { 'en-US': enUS },
});

interface Reservation {
    id: number;
    code: string;
    date: string;
    slot: string;
    status: string;
    responsible_member__first_name: string;
    responsible_member__last_name: string;
    workspace_name?: string;
    contract_id?: number | null;
    invoice_id?: number | null;
}

interface Member {
    id: number;
    first_name: string;
    last_name: string;
}

interface Setup {
    id: number;
    version_number: number;
    workspace_id: number;
    price_per_slot: number;
}

interface Contract {
    id: number;
    member_id: number;
    start_date: string;
    end_date: string;
}

export default function ReservationsPage() {
    const location = useLocation();
    const incomingWorkspaceId = (location.state as any)?.workspace_id;

    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [setups, setSetups] = useState<Setup[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');
    const [filterStatus, setFilterStatus] = useState('all');
    const [hoveredRow, setHoveredRow] = useState<number | null>(null);

    const [form, setForm] = useState({
        responsible_member_id: '',
        setup_id: '',
        date: '',
        slot: 'morning',
        contract_id: '',
    });

    const fetchReservations = () => {
        setReservations(mockReservations as any);
        setLoading(false);
    };

    useEffect(() => {
        fetchReservations();
        const loadedSetups = mockSetups;
        setMembers(mockMembers);
        setSetups(loadedSetups);
        setContracts(mockContracts);

        if (incomingWorkspaceId) {
            const matchingSetup = loadedSetups.find(s => s.workspace_id === incomingWorkspaceId);
            if (matchingSetup) {
                setForm(f => ({ ...f, setup_id: String(matchingSetup.id) }));
            }
            setShowModal(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('Reservation created successfully!');
        setMessageType('success');
        setShowModal(false);
        setForm({ responsible_member_id: '', setup_id: '', date: '', slot: 'morning', contract_id: '' });
        setTimeout(() => setMessage(''), 4000);
    };

    const handleCancel = (id: number) => {
        if (!confirm('Cancel this reservation?')) return;
        setReservations(prev =>
            prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r)
        );
    };

    const statusColor = (status: string) => {
        if (status === 'confirmed') return '#74C69D';
        if (status === 'cancelled') return '#C1440E';
        return '#E9C46A';
    };

    const filtered = filterStatus === 'all'
        ? reservations
        : reservations.filter(r => r.status === filterStatus);

    return (
        <div style={{ padding: '2rem', backgroundColor: '#FAFAF7', minHeight: '100vh' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ color: '#3E2723', margin: 0 }}>Reservations</h2>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', backgroundColor: '#F5F0E8', borderRadius: '8px', padding: '3px', gap: '3px' }}>
                        {(['table', 'calendar'] as const).map(mode => (
                            <button key={mode} onClick={() => setViewMode(mode)} style={{
                                padding: '0.4rem 0.9rem',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer',
                                backgroundColor: viewMode === mode ? '#2D6A4F' : 'transparent',
                                color: viewMode === mode ? 'white' : '#3E2723',
                                fontWeight: viewMode === mode ? 600 : 400,
                                fontSize: '0.9rem',
                            }}>
                                {mode === 'table' ? '☰ Table' : '📅 Calendar'}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setShowModal(true)} style={btnPrimary}>
                        + New Reservation
                    </button>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div style={{
                    padding: '0.75rem 1rem',
                    marginBottom: '1rem',
                    backgroundColor: messageType === 'success' ? '#d4edda' : '#f8d7da',
                    borderLeft: `4px solid ${messageType === 'success' ? '#2D6A4F' : '#C1440E'}`,
                    borderRadius: '6px',
                    color: messageType === 'success' ? '#2D6A4F' : '#C1440E',
                    fontWeight: 500,
                }}>
                    {messageType === 'success' ? '✅ ' : '❌ '}{message}
                </div>
            )}

            {/* Filter */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {['all', 'pending', 'confirmed', 'cancelled'].map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)} style={{
                        padding: '0.4rem 1rem',
                        borderRadius: '20px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: filterStatus === s ? 'bold' : 'normal',
                        backgroundColor: filterStatus === s ? '#2D6A4F' : '#F5F0E8',
                        color: filterStatus === s ? 'white' : '#3E2723',
                        transition: 'all 0.2s',
                    }}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
            </div>

            {/* Calendar */}
            {viewMode === 'calendar' && (
                <div style={{ height: '600px' }}>
                    <Calendar
                        localizer={localizer}
                        events={reservations.map(r => ({
                            id: r.id,
                            title: `${r.responsible_member__first_name} ${r.responsible_member__last_name} — ${r.slot}`,
                            start: new Date(r.date),
                            end: new Date(r.date),
                            allDay: true,
                            slot: r.slot,
                        }))}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        date={calendarDate}
                        onNavigate={date => setCalendarDate(date)}
                        eventPropGetter={(event: any) => ({
                            style: {
                                backgroundColor:
                                    event.slot === 'morning' ? '#c8f0dc' :
                                    event.slot === 'afternoon' ? '#fff3cd' : '#fdd5cc',
                                borderLeft: `4px solid ${
                                    event.slot === 'morning' ? '#2D6A4F' :
                                    event.slot === 'afternoon' ? '#d4a017' : '#c0392b'}`,
                                borderRadius: '4px',
                                color: '#1a1a1a',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                            }
                        })}
                    />
                </div>
            )}

            {/* Table */}
            {viewMode === 'table' && loading ? (
                <p style={{ color: '#3E2723' }}>Loading...</p>
            ) : viewMode === 'table' && (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: '8px', overflow: 'hidden' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#2D6A4F', color: 'white' }}>
                                <th style={thStyle}>Code</th>
                                <th style={thStyle}>Member</th>
                                <th style={thStyle}>Workspace</th>
                                <th style={thStyle}>Date</th>
                                <th style={thStyle}>Slot</th>
                                <th style={thStyle}>Contract</th>
                                <th style={thStyle}>Invoice</th>
                                <th style={thStyle}>Status</th>
                                <th style={thStyle}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(r => (
                                <tr key={r.id}
                                    onMouseEnter={() => setHoveredRow(r.id)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                    style={{
                                        borderBottom: '1px solid #e0d8cc',
                                        backgroundColor: r.status === 'cancelled'
                                            ? '#f5f5f5'
                                            : hoveredRow === r.id ? '#EDE8DF' : '#F5F0E8',
                                        opacity: r.status === 'cancelled' ? 0.6 : 1,
                                        transition: 'background-color 0.15s',
                                    }}>
                                    <td style={tdStyle}><strong>{r.code}</strong></td>
                                    <td style={tdStyle}>{r.responsible_member__first_name} {r.responsible_member__last_name}</td>
                                    <td style={tdStyle}>{r.workspace_name ?? '—'}</td>
                                    <td style={tdStyle}>{r.date}</td>
                                    <td style={tdStyle}>{r.slot}</td>
                                    <td style={tdStyle}>
                                        {r.contract_id
                                            ? <span style={{ ...badgeStyle, backgroundColor: '#A8C5DA', color: '#1a1a1a' }}>#{r.contract_id}</span>
                                            : <span style={{ color: '#aaa', fontSize: '0.85rem' }}>—</span>}
                                    </td>
                                    <td style={tdStyle}>
                                        {r.invoice_id
                                            ? <span style={{ ...badgeStyle, backgroundColor: '#E9C46A', color: '#1a1a1a' }}>#{r.invoice_id}</span>
                                            : <span style={{ color: '#aaa', fontSize: '0.85rem' }}>—</span>}
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            backgroundColor: statusColor(r.status),
                                            color: 'white',
                                            padding: '0.2rem 0.7rem',
                                            borderRadius: '12px',
                                            fontSize: '0.78rem',
                                            fontWeight: 600,
                                        }}>{r.status}</span>
                                    </td>
                                    <td style={tdStyle}>
                                        {r.status !== 'cancelled' && (
                                            <button onClick={() => handleCancel(r.id)} style={btnDanger}>
                                                Cancel
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                                        No reservations found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 200,
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '2rem',
                        width: '100%',
                        maxWidth: '560px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ color: '#3E2723', margin: 0 }}>New Reservation</h3>
                            <button onClick={() => setShowModal(false)} style={{
                                background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999'
                            }}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

                                <div style={fieldGroup}>
                                    <label style={labelStyle}>Member *</label>
                                    <select required value={form.responsible_member_id}
                                        onChange={e => setForm({ ...form, responsible_member_id: e.target.value })}
                                        style={inputStyle}>
                                        <option value="">Select member</option>
                                        {members.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>)}
                                    </select>
                                </div>

                                <div style={fieldGroup}>
                                    <label style={labelStyle}>Workspace Setup *</label>
                                    <select required value={form.setup_id}
                                        onChange={e => setForm({ ...form, setup_id: e.target.value })}
                                        style={inputStyle}>
                                        <option value="">Select setup</option>
                                        {setups.map(s => <option key={s.id} value={s.id}>Workspace {s.workspace_id} v{s.version_number}</option>)}
                                    </select>
                                </div>

                                <div style={fieldGroup}>
                                    <label style={labelStyle}>Date *</label>
                                    <input type="date" required value={form.date}
                                        onChange={e => setForm({ ...form, date: e.target.value })}
                                        style={{ ...inputStyle, colorScheme: 'light', cursor: 'pointer' }} />
                                </div>

                                <div style={fieldGroup}>
                                    <label style={labelStyle}>Slot *</label>
                                    <select value={form.slot}
                                        onChange={e => setForm({ ...form, slot: e.target.value })}
                                        style={inputStyle}>
                                        <option value="morning">Morning</option>
                                        <option value="afternoon">Afternoon</option>
                                        <option value="evening">Evening</option>
                                    </select>
                                </div>

                                <div style={{ ...fieldGroup, gridColumn: '1 / -1' }}>
                                    <label style={labelStyle}>Contract (optional)</label>
                                    <select value={form.contract_id}
                                        onChange={e => setForm({ ...form, contract_id: e.target.value })}
                                        style={inputStyle}>
                                        <option value="">No contract</option>
                                        {contracts.map(c => <option key={c.id} value={c.id}>Contract #{c.id} ({c.start_date} → {c.end_date})</option>)}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={btnSecondary}>
                                    Cancel
                                </button>
                                <button type="submit" style={btnPrimary}>
                                    Create Reservation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const btnPrimary: React.CSSProperties = {
    backgroundColor: '#2D6A4F',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '0.6rem 1.2rem',
    cursor: 'pointer',
    fontWeight: 600,
};

const btnSecondary: React.CSSProperties = {
    backgroundColor: '#F5F0E8',
    color: '#3E2723',
    border: '1px solid #ccc',
    borderRadius: '6px',
    padding: '0.6rem 1.2rem',
    cursor: 'pointer',
};

const btnDanger: React.CSSProperties = {
    backgroundColor: '#C1440E',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '0.3rem 0.7rem',
    cursor: 'pointer',
    fontSize: '0.8rem',
};

const inputStyle: React.CSSProperties = {
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #c8b8a2',
    backgroundColor: '#FAFAF7',
    fontSize: '0.95rem',
    width: '100%',
    color: '#3E2723',
    outline: 'none',
};

const fieldGroup: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
};

const labelStyle: React.CSSProperties = {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#3E2723',
};

const thStyle: React.CSSProperties = {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontWeight: 600,
};

const tdStyle: React.CSSProperties = {
    padding: '0.75rem 1rem',
    color: '#3E2723',
};

const badgeStyle: React.CSSProperties = {
    padding: '0.2rem 0.6rem',
    borderRadius: '10px',
    fontSize: '0.78rem',
    fontWeight: 600,
};
