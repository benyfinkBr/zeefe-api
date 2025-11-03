<?php
require_once '../apiconfig.php';

$target_time_start = date('Y-m-d H:i:s', strtotime('+12 hours'));
$target_time_end = date('Y-m-d H:i:s', strtotime('+12 hours +1 hour'));

$sql = "
SELECT r.id, r.date, r.title, c.nome as client_name, c.email as client_email, rm.name as room_name 
FROM reservations r
JOIN clients c ON r.client_id = c.id
JOIN rooms rm ON r.room_id = rm.id
WHERE r.status = 'confirmada' 
AND r.date BETWEEN :start AND :end
";

$stmt = $pdo->prepare($sql);
$stmt->execute(['start' => $target_time_start, 'end' => $target_time_end]);
$reservas = $stmt->fetchAll();

header('Content-Type: application/json');
echo json_encode([
    'message' => 'Lembretes agendados para reservas em 12h',
    'count' => count($reservas),
    'reservas' => $reservas
]);
?>