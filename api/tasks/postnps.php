```php
<?php
require_once '../apiconfig.php';

$time_now = date('Y-m-d H:i:s');
$time_4h_ago = date('Y-m-d H:i:s', strtotime('-4 hours'));

$sql = "
SELECT r.id, r.date, r.title, c.nome AS client_name, c.email AS client_email, rm.name AS room_name 
FROM reservations r
JOIN clients c ON r.client_id = c.id
JOIN rooms rm ON r.room_id = rm.id
LEFT JOIN feedback_nps f ON f.reservation_id = r.id
WHERE r.status = 'concluida'
AND r.date BETWEEN :start AND :end
AND f.id IS NULL
";

$stmt = $pdo->prepare($sql);
$stmt->execute(['start' => $time_4h_ago, 'end' => $time_now]);
$reservas = $stmt->fetchAll();

header('Content-Type: application/json');
echo json_encode([
    'message' => 'Disparo de NPS para reservas concluídas há 4 horas',
    'count' => count($reservas),
    'reservas' => $reservas
]);
?>