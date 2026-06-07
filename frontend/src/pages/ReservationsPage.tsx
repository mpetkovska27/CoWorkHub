import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import type { Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/calendar.css';
import api from '../api/axios';

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

interface Member   { id: number; first_name: string; last_name: string; }
interface Setup    { id: number; version_number: number; workspace_id: number; price_per_slot: number; }
interface Contract { id: number; member_id: number; start_date: string; end_date: string; }

interface CalendarEvent extends Event {
    id: number;
    slot: string;
}

const slotColors: Record<string, { bg: string; border: string }> = {
    morning:   { bg: '#c8f0dc', border: '#2D6A4F' },
    afternoon: { bg: '#fff3cd', border: '#d4a017' },
    evening:   { bg: '#fdd5cc', border: '#C1440E' },
};

export default function ReservationsPage() {
    const location = useLocation();
    const incomingWorkspaceId = (location.state as { workspace_id?: number } | null)?.workspace_id;

    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [members, setMembers]     = useState<Member[]>([]);
    const [setups, setSetups]       = useState<Setup[]>([]);
    const [contracts, setContracts] = useState<Contract[]>([]);

    const [showModal, setShowModal]       = useState(false);
    const [viewMode, setViewMode]         = useState<'table' | 'calendar'>('table');
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [message, setMessage]           = useState('');
    const [messageType, setMessageType]   = useState<'success' | 'error'>('success');
    const [filterStatus, setFilterStatus] = useState('all');

    const [form, setForm] = useState({
        responsible_member_id: '',
        setup_id: '',
        date: '',
        slot: 'morning',
        contract_id: '',
    });

    useEffect(() => {
        api.get('/reservations/').then(res => setReservations(res.data.reservations));
        api.get('/members/').then(res => setMembers(res.data.members));
        api.get('/setups/').then(res => {
            const loadedSetups: Setup[] = res.data.setups;
            setSetups(loadedSetups);
            if (incomingWorkspaceId) {
                const match = loadedSetups.find(s => s.workspace_id === incomingWorkspaceId);
                if (match) setForm(f => ({ ...f, setup_id: String(match.id) }));
                setShowModal(true);
            }
        });
        api.get('/contracts/').then(res => setContracts(res.data.contracts));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/reservations/', {
                responsible_member_id: Number(form.responsible_member_id),
                setup_id: Number(form.setup_id),
                date: form.date,
                slot: form.slot,
                contract_id: form.contract_id ? Number(form.contract_id) : null,
            });
            await api.get('/reservations/').then(res => setReservations(res.data.reservations));
            setMessage('Reservation created successfully!');
            setMessageType('success');
            setShowModal(false);
            setForm({ responsible_member_id: '', setup_id: '', date: '', slot: 'morning', contract_id: '' });
        } catch {
            setMessage('Failed to create reservation.');
            setMessageType('error');
        }
        setTimeout(() => setMessage(''), 4000);
    };

    const handleCancel = async (id: number) => {
        if (!confirm('Cancel this reservation?')) return;
        await api.patch(`/reservations/${id}/cancel/`);
        setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));
    };

    const filtered = filterStatus === 'all'
        ? reservations
        : reservations.filter(r => r.status === filterStatus);

    const calendarEvents: CalendarEvent[] = reservations.map(r => ({
        id: r.id,
        title: `${r.responsible_member__first_name} ${r.responsible_member__last_name} — ${r.slot}`,
        start: new Date(r.date),
        end: new Date(r.date),
        allDay: true,
        slot: r.slot,
    }));

    return (
        <div className="page">

            {/* Header */}
            <div className="page-header">
                <h2 className="page-title">Reservations</h2>
                <div className="page-actions">
                    <div className="toggle-group">
                        {(['table', 'calendar'] as const).map(mode => (
                            <button
                                key={mode}
                                className={`toggle-btn ${viewMode === mode ? 'active' : ''}`}
                                onClick={() => setViewMode(mode)}>
                                {mode === 'table' ? '☰ Table' : '📅 Calendar'}
                            </button>
                        ))}
                    </div>
                    <button className="btn-primary" onClick={() => setShowModal(true)}>
                        + New Reservation
                    </button>
                </div>
            </div>

            {/* Alert */}
            {message && (
                <div className={`alert alert--${messageType}`}>
                    {messageType === 'success' ? '✅ ' : '❌ '}{message}
                </div>
            )}

            {/* Filter pills */}
            <div className="filter-pills">
                {['all', 'pending', 'confirmed', 'cancelled'].map(s => (
                    <button
                        key={s}
                        className={`filter-pill ${filterStatus === s ? 'active' : ''}`}
                        onClick={() => setFilterStatus(s)}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
            </div>

            {/* Calendar */}
            {viewMode === 'calendar' && (
                <div style={{ height: '600px' }}>
                    <Calendar
                        localizer={localizer}
                        events={calendarEvents}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%' }}
                        date={calendarDate}
                        onNavigate={(date: Date) => setCalendarDate(date)}
                        eventPropGetter={(event: CalendarEvent) => {
                            const colors = slotColors[event.slot] ?? slotColors.morning;
                            return {
                                style: {
                                    backgroundColor: colors.bg,
                                    borderLeft: `4px solid ${colors.border}`,
                                    borderRadius: '4px',
                                    color: '#1a1a1a',
                                    fontSize: '0.82rem',
                                    fontWeight: 600,
                                }
                            };
                        }}
                    />
                </div>
            )}

            {/* Table */}
            {viewMode === 'table' && (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Member</th>
                                <th>Workspace</th>
                                <th>Date</th>
                                <th>Slot</th>
                                <th>Contract</th>
                                <th>Invoice</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(r => (
                                <tr key={r.id} className={r.status === 'cancelled' ? 'cancelled' : ''}>
                                    <td><strong>{r.code}</strong></td>
                                    <td>{r.responsible_member__first_name} {r.responsible_member__last_name}</td>
                                    <td>{r.workspace_name ?? '—'}</td>
                                    <td>{r.date}</td>
                                    <td>{r.slot}</td>
                                    <td>
                                        {r.contract_id
                                            ? <span className="id-badge id-badge--blue">#{r.contract_id}</span>
                                            : <span style={{ color: '#aaa' }}>—</span>}
                                    </td>
                                    <td>
                                        {r.invoice_id
                                            ? <span className="id-badge id-badge--yellow">#{r.invoice_id}</span>
                                            : <span style={{ color: '#aaa' }}>—</span>}
                                    </td>
                                    <td>
                                        <span className={`badge badge--${r.status}`}>{r.status}</span>
                                    </td>
                                    <td>
                                        {r.status !== 'cancelled' && (
                                            <button className="btn-danger" onClick={() => handleCancel(r.id)}>
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
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3 className="modal-title">New Reservation</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="field-group">
                                    <label className="field-label">Member *</label>
                                    <select required className="field-input" value={form.responsible_member_id}
                                        onChange={e => setForm({ ...form, responsible_member_id: e.target.value })}>
                                        <option value="">Select member</option>
                                        {members.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>)}
                                    </select>
                                </div>

                                <div className="field-group">
                                    <label className="field-label">Workspace Setup *</label>
                                    <select required className="field-input" value={form.setup_id}
                                        onChange={e => setForm({ ...form, setup_id: e.target.value })}>
                                        <option value="">Select setup</option>
                                        {setups.map(s => <option key={s.id} value={s.id}>Workspace {s.workspace_id} v{s.version_number}</option>)}
                                    </select>
                                </div>

                                <div className="field-group">
                                    <label className="field-label">Date *</label>
                                    <input type="date" required className="field-input" value={form.date}
                                        onChange={e => setForm({ ...form, date: e.target.value })} />
                                </div>

                                <div className="field-group">
                                    <label className="field-label">Slot *</label>
                                    <select className="field-input" value={form.slot}
                                        onChange={e => setForm({ ...form, slot: e.target.value })}>
                                        <option value="morning">Morning</option>
                                        <option value="afternoon">Afternoon</option>
                                        <option value="evening">Evening</option>
                                    </select>
                                </div>

                                <div className="field-group full-width">
                                    <label className="field-label">Contract (optional)</label>
                                    <select className="field-input" value={form.contract_id}
                                        onChange={e => setForm({ ...form, contract_id: e.target.value })}>
                                        <option value="">No contract</option>
                                        {contracts.map(c => <option key={c.id} value={c.id}>Contract #{c.id} ({c.start_date} → {c.end_date})</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
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
