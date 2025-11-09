<?php
require 'apiconfig.php';
require_once __DIR__ . '/lib/ics.php';

$id = isset($_GET['reservation']) ? (int) $_GET['reservation'] : 0;
if ($id <= 0) {
  http_response_code(400);
  echo 'Reserva inválida';
  exit;
}

$stmt = $pdo->prepare('SELECT r.*, rooms.name AS room_name, rooms.location AS room_location, rooms.city, rooms.state FROM reservations r LEFT JOIN rooms ON rooms.id = r.room_id WHERE r.id = ? LIMIT 1');
$stmt->execute([$id]);
$res = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$res) {
  http_response_code(404);
  echo 'Reserva não encontrada';
  exit;
}

$date = $res['date'] ?? date('Y-m-d');
$start = trim($res['time_start'] ?? '08:00');
$end = trim($res['time_end'] ?? '20:00');

$startTs = strtotime($date . ' ' . $start . ':00');
$endTs = strtotime($date . ' ' . $end . ':00');

$summary = 'Reserva Ze.EFE - ' . ($res['room_name'] ?: 'Sala');
$desc = ($res['title'] ? ($res['title'] . "\n\n") : '') . ($res['description'] ?? '');
$location = $res['room_location'] ?: trim(($res['city'] ?: '') . ' - ' . strtoupper($res['state'] ?: ''));

$ics = ics_generate([
  'summary' => $summary,
  'description' => $desc,
  'location' => $location,
  'start' => $startTs,
  'end' => $endTs,
  'uid' => 'zeefe-' . $id . '-' . md5($summary . $date)
]);

header('Content-Type: text/calendar; charset=UTF-8');
header('Content-Disposition: attachment; filename="reserva-' . $id . '.ics"');
echo $ics;

