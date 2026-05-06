CREATE VIEW view_revenue_by_client_type AS
SELECT
    i.type AS invoice_type,
    COUNT(r.id) AS total_reservations,
    SUM(i.total_amount) AS total_revenue,
    AVG(i.total_amount) AS average_invoice_value
FROM Invoice i
         JOIN Reservation r ON i.id = r.invoice_id
GROUP BY i.type;

SELECT * FROM view_revenue_by_client_type;


