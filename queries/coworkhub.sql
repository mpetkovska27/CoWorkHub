CREATE TABLE Location (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    address VARCHAR (255) NOT NULL,
    city VARCHAR (100) NOT NULL
);

CREATE TABLE Equipment (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50)
);

CREATE TABLE Member (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL
);

CREATE TABLE MembershipPlan (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0
);

CREATE TABLE Invoice(
    id SERIAL PRIMARY KEY,
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount NUMERIC(10,2) NOT NULL
        CHECK (total_amount >= 0),
    tax_amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'unpaid'
        CHECK (status IN ('paid', 'unpaid', 'refunded')),
    type VARCHAR(50)
        CHECK (type IN ('single', 'contract'))
);

CREATE TABLE CoworkingCenter (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location_id INT NOT NULL,
    FOREIGN KEY (location_id) REFERENCES Location(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE Workspace (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    capacity INT
        CHECK (capacity > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'available'
        CHECK (status IN ('available', 'occupied', 'maintenance')),
    coworking_center_id INT NOT NULL,
    FOREIGN KEY (coworking_center_id) REFERENCES CoworkingCenter(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE WorkspaceSetup (
    id SERIAL PRIMARY KEY,
    workspace_id INT NOT NULL,
    version_number INT NOT NULL
        CHECK (version_number > 0),
    valid_from DATE DEFAULT CURRENT_DATE,
    price_per_slot NUMERIC(10,2)
        CHECK (price_per_slot > 0),
    description TEXT,
    FOREIGN KEY (workspace_id) REFERENCES Workspace(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE (workspace_id, version_number)
);
CREATE TABLE Contract (
    id SERIAL PRIMARY KEY,
    fixed_price NUMERIC(10,2),
    status VARCHAR(20)
        CHECK (status IN ('active','inactive','terminated')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    member_id INT NOT NULL,
    FOREIGN KEY (member_id) REFERENCES Member(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CHECK (start_date < end_date)
);

CREATE TABLE Reservation (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    slot VARCHAR(20) NOT NULL
        CHECK (slot IN ('morning', 'afternoon', 'evening')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    code VARCHAR(20) NOT NULL UNIQUE,
    responsible_member_id INT NOT NULL,
    setup_id INT NOT NULL,
    invoice_id INT NOT NULL,
    contract_id INT NULL,
    FOREIGN KEY (responsible_member_id) REFERENCES Member(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (setup_id) REFERENCES WorkspaceSetup(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (invoice_id) REFERENCES Invoice(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (contract_id) REFERENCES Contract(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE (setup_id, date, slot)
);

CREATE TABLE SetupEquipment (
    setup_id INT NOT NULL,
    equipment_id INT NULL,
    quantity INT NOT NULL DEFAULT 1
        CHECK ( quantity > 0 ),
    PRIMARY KEY (setup_id, equipment_id),
    FOREIGN KEY (setup_id) REFERENCES WorkspaceSetup(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (equipment_id) REFERENCES Equipment(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE EquipmentComposition (
    parent_equipment_id INT NOT NULL,
    child_equipment_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1
        CHECK ( quantity >0 ),
    PRIMARY KEY (parent_equipment_id, child_equipment_id),
    FOREIGN KEY (parent_equipment_id) REFERENCES Equipment(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (child_equipment_id) REFERENCES Equipment(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE ReservationParticipants (
    reservation_id INT NOT NULL,
    member_id INT NOT NULL,
    PRIMARY KEY (reservation_id, member_id),
    FOREIGN KEY (reservation_id) REFERENCES Reservation(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (member_id) REFERENCES Member(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Membership (
    id SERIAL PRIMARY KEY,
    member_id INT NOT NULL,
    plan_id INT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive')),
    FOREIGN KEY (member_id) REFERENCES Member(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES MembershipPlan(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CHECK ( start_date < end_date )
);

CREATE TABLE MemberEmail (
    member_id INT NOT NULL,
    email VARCHAR (100) NOT NULL UNIQUE,
    PRIMARY KEY (member_id, email),
    FOREIGN KEY (member_id) REFERENCES Member(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

