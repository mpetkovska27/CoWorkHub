INSERT INTO Location (name, address, city)
VALUES ('Centar', 'Macedonia Square 1', 'Skopje'),
       ('Karposh', 'Boris Trajkovski Blvd 15', 'Skopje'),
       ('Aerodrom', 'Jane Sandanski 32', 'Skopje'),
       ('Kisela Voda', 'Pariska 8', 'Skopje');

INSERT INTO Equipment (name, type)
VALUES ('Dell Monitor 27"', 'Computer Equipment'),
       ('Ergonomic Chair X-1', 'Furniture'),
       ('Electric Standing Desk', 'Furniture'),
       ('WiFi Booster', 'Network Equipment'),
       ('Logitech Keyboard & Mouse', 'Computer Equipment'),
       ('Whiteboard 200x100', 'Office Supply');

INSERT INTO Member (first_name, last_name)
VALUES ('Petar', 'Petrovski'),
       ('Martina', 'Petkovska'),
       ('Ana', 'Angelovska'),
       ('Mihail', 'Georgiev'),
       ('Stefan', 'Trajkovski');

INSERT INTO MembershipPlan (type, price, discount_percentage)
VALUES ('Basic', 29.99, 5),
       ('Professional', 79.99, 15),
       ('Business', 149.99, 25),
       ('Enterprise', 299.99, 35),
       ('Student', 19.99, 10);

INSERT INTO Membership (member_id, plan_id, start_date, end_date, status)
VALUES (1, 3, '2026-01-01', '2026-12-31', 'active'),
       (2, 2, '2026-01-01', '2026-12-31', 'active'),
       (3, 1, '2026-01-01', '2026-12-31', 'active'),
       (4, 4, '2026-01-01', '2026-12-31', 'active'),
       (5, 5, '2026-01-01', '2026-12-31', 'active');

INSERT INTO CoworkingCenter (name, contact_phone, email, location_id)
VALUES ('Hub Skopje Centar', '+389-2-555-0100', 'info@hubskopje.mk', 1),
       ('Innovation Lab Karposh', '+389-2-555-0200', 'karposh@innovationlab.mk', 2),
       ('WorkSpace Aerodrom', '+389-2-555-0300', 'hello@workspace.mk', 3),
       ('The Office Kisela Voda', '+389-2-555-0400', 'contact@theoffice.mk', 4);

INSERT INTO Workspace (name, type, capacity, status, coworking_center_id)
VALUES ('Room 101', 'Private Office', 4, 'available', 1),
       ('Open Desk A', 'Hot Desk', 1, 'available', 1),
       ('Conference Room Alpha', 'Meeting Room', 12, 'available', 2);

INSERT INTO WorkspaceSetup (workspace_id, version_number, price_per_slot, description)
VALUES (1, 1, 500.00, 'Standard 4-person office setup'),
       (2, 1, 150.00, 'Single desk with monitor'),
       (3, 1, 1200.00, 'Full meeting setup with projector');

INSERT INTO SetupEquipment (setup_id, equipment_id, quantity)
VALUES (1, 1, 2),
       (1, 2, 4),
       (1, 3, 2),
       (2, 1, 1),
       (2, 5, 1),
       (3, 6, 2),
       (3, 2, 12);

INSERT INTO Contract (fixed_price, status, start_date, end_date, member_id)
VALUES (25000.00, 'active', '2026-01-01', '2026-06-30', 1),
       (18000.00, 'active', '2026-02-01', '2026-07-31', 2),
       (10000.00, 'terminated', '2025-09-01', '2025-12-31', 3),
       (45000.00, 'active', '2026-04-01', '2026-09-30', 4),
       (15000.00, 'active', '2026-03-01', '2026-08-31', 3);

INSERT INTO Reservation (date, slot, status, code, responsible_member_id, setup_id, contract_id)
VALUES ('2026-05-25', 'morning', 'confirmed', 'RES-SKP-015', 1, 2, NULL),
       ('2026-05-27', 'afternoon', 'pending', 'RES-SKP-020', 5, 2, NULL),
       ('2026-05-28', 'morning', 'confirmed', 'RES-SKP-021', 3, 3, NULL),
       ('2026-05-28', 'afternoon', 'confirmed', 'RES-SKP-022', 4, 3, NULL);

INSERT INTO Reservation (date, slot, status, code, responsible_member_id, setup_id, contract_id)
VALUES ('2026-06-01', 'morning', 'confirmed', 'RES-SKP-025', 1, 1, 1),
       ('2026-06-01', 'afternoon', 'confirmed', 'RES-SKP-026', 2, 1, 2),
       ('2026-06-02', 'morning', 'confirmed', 'RES-SKP-027', 1, 1, 1),
       ('2026-06-02', 'afternoon', 'confirmed', 'RES-SKP-028', 4, 1, 4),
       ('2026-06-03', 'morning', 'confirmed', 'RES-SKP-029', 2, 3, 2);