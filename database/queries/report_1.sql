CREATE VIEW view_invoice_ledger AS
SELECT
    DATE_TRUNC('month', i.issue_date)::DATE AS month,
    i.type AS invoice_type,
    SUM(CASE WHEN i.status = 'paid'     THEN i.total_amount ELSE 0 END) AS total_paid,
    SUM(CASE WHEN i.status = 'unpaid'   THEN i.total_amount ELSE 0 END) AS total_unpaid,
    SUM(CASE WHEN i.status = 'refunded' THEN i.total_amount ELSE 0 END) AS total_refunded,
    COUNT(CASE WHEN i.status = 'paid'     THEN 1 END) AS count_paid,
    COUNT(CASE WHEN i.status = 'unpaid'   THEN 1 END) AS count_unpaid,
    COUNT(CASE WHEN i.status = 'refunded' THEN 1 END) AS count_refunded,
    SUM(i.total_amount) AS total_amount,
    SUM(i.tax_amount)   AS total_tax
FROM Invoice i
GROUP BY DATE_TRUNC('month', i.issue_date), i.type
ORDER BY month DESC, i.type;

SELECT * FROM view_invoice_ledger;


