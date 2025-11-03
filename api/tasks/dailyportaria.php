<?php
require_once '../apiconfig.php';

$today = date('Y-m-d');

$stmt = $pdo->prepare("SELECT r.date, r.title, c.nome as client, rm.name as room FROM reservations r JOIN clients c ON r.client_id=c.id JOIN rooms rm ON r.room_id=rm.id WHERE r.date = :today AND r.status='confirmada'");
$stmt->execute(['today' => $today]);
$reservas = $stmt->fetchAll();

header('Content-Type: application/json');
echo json_encode(['date' => $today, 'reservas' => $reservas]);
?>