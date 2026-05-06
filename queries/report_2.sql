CREATE VIEW center_occupancy AS
SELECT
    cc.id AS center_id,
    cc.name AS center_name,
    l.city,
    r.date AS reservation_date,
    COUNT(r.id) AS total_bookings,
    SUM(w.capacity) AS total_capacity_used,
    (SELECT SUM(capacity) FROM Workspace WHERE coworking_center_id = cc.id) AS total_capacity
FROM CoworkingCenter cc
         JOIN Location l ON cc.location_id = l.id
         JOIN Workspace w ON w.coworking_center_id = cc.id
         JOIN WorkspaceSetup ws ON ws.workspace_id = w.id
         JOIN Reservation r ON r.setup_id = ws.id
WHERE r.status = 'confirmed'
GROUP BY cc.id, l.city, r.date
ORDER BY r.date DESC, total_bookings DESC;

SELECT * FROM center_occupancy
WHERE reservation_date = CURRENT_DATE;

