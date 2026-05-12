-- 1. Avtomatsko generiranje na faktura pri rezervacija
CREATE OR REPLACE FUNCTION auto_generate_invoice()
    RETURNS TRIGGER AS $$
DECLARE
    base_price NUMERIC(10,2);
    discount DECIMAL(5,2) DEFAULT 0;
    final_price NUMERIC(10,2);
    invoice_id INT;
BEGIN
    IF NEW.invoice_id IS NULL THEN
        SELECT price_per_slot INTO base_price
        FROM workspacesetup WHERE id = NEW.setup_id;

        SELECT COALESCE(mp.discount_percentage, 0) INTO discount
        FROM Membership m
                 LEFT JOIN MembershipPlan mp ON m.plan_id = mp.id
        WHERE m.member_id = NEW.responsible_member_id
          AND m.status = 'active'
          AND CURRENT_DATE BETWEEN m.start_date AND m.end_date
        LIMIT 1;

        final_price := base_price * (1 - discount / 100);

        INSERT INTO Invoice (total_amount, tax_amount, status, type)
        VALUES (final_price, final_price * 0.18, 'unpaid', 'single')
        RETURNING id INTO invoice_id;

        NEW.invoice_id := invoice_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_generate_invoice
    BEFORE INSERT ON reservation
    FOR EACH ROW
    WHEN (NEW.contract_id IS NULL)
EXECUTE FUNCTION auto_generate_invoice();

--2. Avtomatsko generiranje invoice pri contract
CREATE OR REPLACE FUNCTION auto_generate_invoice_on_contract()
    RETURNS TRIGGER AS $$
DECLARE
    slot_price NUMERIC(10,2);
    existing_invoice_id INT;
BEGIN
    SELECT price_per_slot INTO slot_price
    FROM workspacesetup WHERE id = NEW.setup_id;

    SELECT invoice_id INTO existing_invoice_id
    FROM Reservation
    WHERE contract_id = NEW.contract_id
      AND invoice_id IS NOT NULL
    LIMIT 1;

    IF existing_invoice_id IS NOT NULL THEN
        UPDATE Invoice
        SET total_amount = total_amount + slot_price,
            tax_amount = tax_amount + (slot_price * 0.18)
        WHERE id = existing_invoice_id;

        NEW.invoice_id := existing_invoice_id;
    ELSE
        INSERT INTO Invoice (total_amount, tax_amount, status, type)
        VALUES (slot_price, slot_price * 0.18, 'unpaid', 'contract')
        RETURNING id INTO existing_invoice_id;

        NEW.invoice_id := existing_invoice_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_generate_invoice_on_contract
    BEFORE INSERT ON Reservation
    FOR EACH ROW
    WHEN (NEW.contract_id IS NOT NULL)
EXECUTE FUNCTION auto_generate_invoice_on_contract();

-- 3. Azuriranje na invoice pri otkaz na rezervacija
CREATE OR REPLACE FUNCTION update_invoice_on_cancel()
RETURNS TRIGGER AS $$
DECLARE
    slot_price NUMERIC(10,2);
BEGIN
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        IF OLD.contract_id IS NULL THEN
            UPDATE invoice
            SET total_amount = 0, tax_amount = 0, status = 'refunded'
            WHERE id = NEW.invoice_id;
        ELSE
            SELECT price_per_slot INTO slot_price
            FROM WorkspaceSetup WHERE id = NEW.setup_id;

            UPDATE Invoice
            SET total_amount = total_amount - slot_price,
                tax_amount = tax_amount - (slot_price * 0.18)
            WHERE id = NEW.invoice_id
              AND total_amount >= slot_price;
        end if;
    end if;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_update_invoice_on_cancel
AFTER UPDATE ON reservation
FOR EACH ROW
EXECUTE PROCEDURE update_invoice_on_cancel();