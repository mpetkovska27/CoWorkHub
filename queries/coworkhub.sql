--PARENT TABELI

CREATE TABLE Location (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    address VARCHAR (255) NOT NULL,
    city VARCHAR (255) NOT NULL,
    capacity INTEGER NOT NULL
        CHECK (capacity > 0)
);

CREATE TABLE Equipment (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    manufacturer VARCHAR(100) NOT NULL
);

CREATE TABLE Member (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive'))
);

CREATE TABLE MembershipPlan (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL
);
CREATE TABLE PromoCode (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    discount_percentage DECIMAL(5,2) NOT NULL
        CHECK (discount_percentage > 0 AND discount_percentage <= 100),
    valid_until DATE NOT NULL,
    active BOOLEAN DEFAULT TRUE
);

-- COWORKING TABELI

CREATE TABLE CoworkingCenter (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location_id INT NOT NULL,
    FOREIGN KEY (location_id) REFERENCES Location(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE Corporate (
    coworking_center_id INT PRIMARY KEY,
    private_offices_count INT NOT NULL
        CHECK (private_offices_count >= 0),
    FOREIGN KEY (coworking_center_id) REFERENCES CoworkingCenter(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE StartupHub (
    coworking_center_id INT PRIMARY KEY,
    events_per_month INT NOT NULL
        CHECK (events_per_month >= 0),
    FOREIGN KEY (coworking_center_id) REFERENCES CoworkingCenter(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Workspace (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    capacity INT NOT NULL
        CHECK (capacity > 0),
    price_per_slot NUMERIC(10,2) NOT NULL
        CHECK (price_per_slot > 0),
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
    valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    FOREIGN KEY (workspace_id) REFERENCES Workspace(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE (workspace_id, version_number)
);

-- REZERVACII

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
    promo_code_id INT,
    FOREIGN KEY (responsible_member_id) REFERENCES Member(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (setup_id) REFERENCES WorkspaceSetup(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE (setup_id, date, slot),
    FOREIGN KEY (promo_code_id) REFERENCES PromoCode(id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE Invoice (
    id SERIAL PRIMARY KEY,
    reservation_id INT NOT NULL UNIQUE,
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount NUMERIC(10,2) NOT NULL
        CHECK (total_amount >= 0),
    tax_amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'unpaid'
        CHECK (status IN ('paid', 'unpaid', 'refunded')),
    FOREIGN KEY (reservation_id) REFERENCES Reservation(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

--M:N RELACII

CREATE TABLE SetupEquipment (
    setup_id INT NOT NULL,
    equipment_id INT NOT NULL,
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
    plan_id INT NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE NOT NULL,
    FOREIGN KEY (member_id) REFERENCES Member(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES MembershipPlan(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CHECK ( start_date < end_date )
);

CREATE TABLE MemberEmail (
    member_id INT NOT NULL,
    email VARCHAR (100) NOT NULL,
    PRIMARY KEY (member_id, email),
    FOREIGN KEY (member_id) REFERENCES Member(id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

