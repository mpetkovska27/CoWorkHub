-- 1. Avtomatsko generiranje na faktura pri rezervacija
CREATE OR REPLACE PROCEDURE generate_single_invoice(p_reservation_id INT, p_setup_id INT, p_member_id INT)
    LANGUAGE plpgsql AS $$
DECLARE
    base_price NUMERIC(10,2);
    discount DECIMAL(5,2) DEFAULT 0;
    final_price NUMERIC(10,2);
    new_invoice_id INT;
BEGIN
    SELECT price_per_slot INTO base_price
    FROM WorkspaceSetup WHERE id = p_setup_id;

    SELECT COALESCE(mp.discount_percentage, 0) INTO discount
    FROM Membership m
             LEFT JOIN MembershipPlan mp ON m.plan_id = mp.id
    WHERE m.member_id = p_member_id
      AND m.status = 'active'
      AND CURRENT_DATE BETWEEN m.start_date AND m.end_date
    LIMIT 1;

    final_price := base_price * (1 - discount / 100);

    INSERT INTO Invoice (total_amount, tax_amount, status, type)
    VALUES (final_price, final_price * 0.18, 'unpaid', 'single')
    RETURNING id INTO new_invoice_id;

    UPDATE Reservation
    SET invoice_id = new_invoice_id
    WHERE id = p_reservation_id;
END;
$$;

--2. Avtomatsko generiranje invoice pri contract
CREATE OR REPLACE PROCEDURE generate_contract_invoice(p_reservation_id INT, p_setup_id INT, p_contract_id INT)
    LANGUAGE plpgsql AS $$
DECLARE
    slot_price NUMERIC(10,2);
    existing_invoice_id INT;
BEGIN
    SELECT price_per_slot INTO slot_price
    FROM WorkspaceSetup WHERE id = p_setup_id;

    SELECT invoice_id INTO existing_invoice_id
    FROM Reservation
    WHERE contract_id = p_contract_id
      AND invoice_id IS NOT NULL
      AND id != p_reservation_id
    LIMIT 1;

    IF existing_invoice_id IS NOT NULL THEN
        UPDATE Invoice
        SET total_amount = total_amount + slot_price,
            tax_amount = tax_amount + (slot_price * 0.18)
        WHERE id = existing_invoice_id;

        UPDATE Reservation
        SET invoice_id = existing_invoice_id
        WHERE id = p_reservation_id;
    ELSE
        INSERT INTO Invoice (total_amount, tax_amount, status, type)
        VALUES (slot_price, slot_price * 0.18, 'unpaid', 'contract')
        RETURNING id INTO existing_invoice_id;

        UPDATE Reservation
        SET invoice_id = existing_invoice_id
        WHERE id = p_reservation_id;
    END IF;
END;
$$;

-- 3. Azuriranje na invoice pri otkaz na rezervacija
CREATE OR REPLACE PROCEDURE cancel_reservation_invoice(
    p_reservation_id INT,
    p_invoice_id INT,
    p_contract_id INT
)
    LANGUAGE plpgsql AS $$
DECLARE
    slot_price NUMERIC(10,2);
    v_setup_id INT;
BEGIN
    IF p_invoice_id IS NULL THEN
        RETURN;
    END IF;

    IF p_contract_id IS NULL THEN
        UPDATE Invoice
        SET total_amount = 0,
            tax_amount = 0,
            status = 'refunded'
        WHERE id = p_invoice_id;
    ELSE
        SELECT setup_id INTO v_setup_id
        FROM Reservation WHERE id = p_reservation_id;

        SELECT price_per_slot INTO slot_price
        FROM WorkspaceSetup WHERE id = v_setup_id;

        UPDATE Invoice
        SET total_amount = GREATEST(total_amount - slot_price, 0),
            tax_amount   = GREATEST(tax_amount - (slot_price * 0.18), 0)
        WHERE id = p_invoice_id;
    END IF;
END;
$$;
