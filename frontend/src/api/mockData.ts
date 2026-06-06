export const mockStats = {
    active_reservations_today: 5,
    free_workspaces: 8,
    unpaid_invoices: 3,
};

export const mockCenters = [
    {
        id: 1,
        name: 'CoWork Downtown',
        contact_phone: '+389 2 123 456',
        email: 'downtown@coworkhub.mk',
        workspaces: [
            { id: 1, name: 'The Library', type: 'quiet room', capacity: 4, status: 'available' },
            { id: 2, name: 'Board Room', type: 'meeting room', capacity: 10, status: 'occupied' },
            { id: 3, name: 'Open Desk A', type: 'open space', capacity: 20, status: 'available' },
        ],
    },
    {
        id: 2,
        name: 'CoWork Kapishtec',
        contact_phone: '+389 2 654 321',
        email: 'kapishtec@coworkhub.mk',
        workspaces: [
            { id: 4, name: 'Studio 1', type: 'private office', capacity: 2, status: 'available' },
            { id: 5, name: 'The Lab', type: 'workshop', capacity: 8, status: 'maintenance' },
        ],
    },
    {
        id: 3,
        name: 'CoWork Aerodrom',
        contact_phone: '+389 2 789 000',
        email: 'aerodrom@coworkhub.mk',
        workspaces: [
            { id: 6, name: 'Zen Room', type: 'quiet room', capacity: 3, status: 'available' },
            { id: 7, name: 'Conference A', type: 'meeting room', capacity: 12, status: 'occupied' },
            { id: 8, name: 'Hot Desk B', type: 'open space', capacity: 15, status: 'available' },
            { id: 9, name: 'Phone Booth', type: 'private office', capacity: 1, status: 'available' },
        ],
    },
];

export const mockReservations = [
    { id: 1, code: 'RES-A1B2C3D4', date: '2026-06-06', slot: 'morning', status: 'confirmed', responsible_member__first_name: 'Ana', responsible_member__last_name: 'Petrovska', workspace_name: 'The Library', contract_id: 1, invoice_id: 1 },
    { id: 2, code: 'RES-E5F6G7H8', date: '2026-06-06', slot: 'afternoon', status: 'pending', responsible_member__first_name: 'Marko', responsible_member__last_name: 'Ilievski', workspace_name: 'Board Room', contract_id: null, invoice_id: 2 },
    { id: 3, code: 'RES-I9J0K1L2', date: '2026-06-07', slot: 'morning', status: 'pending', responsible_member__first_name: 'Sara', responsible_member__last_name: 'Nikolovska', workspace_name: 'Open Desk A', contract_id: 2, invoice_id: 3 },
    { id: 4, code: 'RES-M3N4O5P6', date: '2026-06-05', slot: 'evening', status: 'cancelled', responsible_member__first_name: 'Petar', responsible_member__last_name: 'Georgievski', workspace_name: 'Studio 1', contract_id: null, invoice_id: 4 },
    { id: 5, code: 'RES-Q7R8S9T0', date: '2026-06-08', slot: 'afternoon', status: 'confirmed', responsible_member__first_name: 'Elena', responsible_member__last_name: 'Todorovska', workspace_name: 'Zen Room', contract_id: 1, invoice_id: 5 },
    { id: 6, code: 'RES-U1V2W3X4', date: '2026-06-09', slot: 'morning', status: 'pending', responsible_member__first_name: 'Ivan', responsible_member__last_name: 'Stojanovoski', workspace_name: 'Conference A', contract_id: null, invoice_id: null },
];

export const mockInvoices = [
    { id: 1, issue_date: '2026-06-06T09:00:00', total_amount: 1200, tax_amount: 120, status: 'paid', type: 'single' },
    { id: 2, issue_date: '2026-06-06T10:30:00', total_amount: 850, tax_amount: 85, status: 'unpaid', type: 'single' },
    { id: 3, issue_date: '2026-06-05T14:00:00', total_amount: 5000, tax_amount: 500, status: 'unpaid', type: 'contract' },
    { id: 4, issue_date: '2026-06-04T11:00:00', total_amount: 960, tax_amount: 96, status: 'refunded', type: 'single' },
    { id: 5, issue_date: '2026-06-03T09:00:00', total_amount: 3200, tax_amount: 320, status: 'paid', type: 'contract' },
];

export const mockReports = {
    invoice_ledger: [
        { status: 'paid', count: 12, total_amount: 14400 },
        { status: 'unpaid', count: 3, total_amount: 5850 },
        { status: 'refunded', count: 2, total_amount: 1960 },
    ],
    center_occupancy_today: [
        { center_name: 'CoWork Downtown', reservation_date: '2026-06-06', total_bookings: 2, total_capacity_used: 14, total_capacity: 34 },
        { center_name: 'CoWork Aerodrom', reservation_date: '2026-06-06', total_bookings: 1, total_capacity_used: 8, total_capacity: 31 },
    ],
    center_occupancy_week: [
        { center_name: 'CoWork Downtown', reservation_date: '2026-06-06', total_bookings: 2, total_capacity_used: 14, total_capacity: 34 },
        { center_name: 'CoWork Downtown', reservation_date: '2026-06-05', total_bookings: 3, total_capacity_used: 20, total_capacity: 34 },
        { center_name: 'CoWork Kapishtec', reservation_date: '2026-06-05', total_bookings: 1, total_capacity_used: 4, total_capacity: 10 },
        { center_name: 'CoWork Aerodrom', reservation_date: '2026-06-06', total_bookings: 1, total_capacity_used: 8, total_capacity: 31 },
        { center_name: 'CoWork Aerodrom', reservation_date: '2026-06-04', total_bookings: 2, total_capacity_used: 15, total_capacity: 31 },
        { center_name: 'CoWork Aerodrom', reservation_date: '2026-06-03', total_bookings: 1, total_capacity_used: 6, total_capacity: 31 },
    ],
    center_occupancy: [
        { center_name: 'CoWork Downtown', total_workspaces: 3, occupied: 1, available: 2, total_capacity: 34, total_capacity_used: 10 },
        { center_name: 'CoWork Kapishtec', total_workspaces: 2, occupied: 0, available: 1, total_capacity: 10, total_capacity_used: 0 },
        { center_name: 'CoWork Aerodrom', total_workspaces: 4, occupied: 1, available: 3, total_capacity: 31, total_capacity_used: 12 },
    ],
};

export const mockMembers = [
    { id: 1, first_name: 'Ana', last_name: 'Petrovska' },
    { id: 2, first_name: 'Marko', last_name: 'Ilievski' },
    { id: 3, first_name: 'Sara', last_name: 'Nikolovska' },
    { id: 4, first_name: 'Petar', last_name: 'Georgievski' },
    { id: 5, first_name: 'Elena', last_name: 'Todorovska' },
];

export const mockSetups = [
    { id: 1, version_number: 1, workspace_id: 1, price_per_slot: 400 },
    { id: 2, version_number: 1, workspace_id: 3, price_per_slot: 300 },
    { id: 3, version_number: 2, workspace_id: 3, price_per_slot: 350 },
    { id: 4, version_number: 1, workspace_id: 6, price_per_slot: 450 },
];

export const mockContracts = [
    { id: 1, member_id: 1, start_date: '2026-01-01', end_date: '2026-12-31' },
    { id: 2, member_id: 3, start_date: '2026-03-01', end_date: '2026-08-31' },
];
