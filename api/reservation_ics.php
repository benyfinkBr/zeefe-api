<?php
require 'apiconfig.php';
require_once __DIR__ . '/lib/ics.php';

$id = isset($_GET['reservation']) ? (int) $_GET['reservation'] : 0;
if ($id <= 0) {
  http_response_code(400);
  echo 'Reserva inválida';
  exit;
}

$stmt = $pdo->prepare('SELECT r.*, rooms.name AS room_name, rooms.location AS room_location, rooms.city, rooms.state, rooms.street, rooms.complement, rooms.cep FROM reservations r LEFT JOIN rooms ON rooms.id = r.room_id WHERE r.id = ? LIMIT 1');
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

// Normaliza horas (aceita HH:MM ou HH:MM:SS)
$normalizeTime = static function(string $t): string {
  $t = trim($t);
  if (preg_match('/^\d{2}:\d{2}:\d{2}$/', $t)) return $t;
  if (preg_match('/^\d{2}:\d{2}$/', $t)) return $t . ':00';
  // fallback: tenta parsear
  $dt = DateTime::createFromFormat('H:i:s', $t) ?: DateTime::createFromFormat('H:i', $t);
  return $dt ? $dt->format('H:i:s') : '00:00:00';
};

$startTs = strtotime($date . ' ' . $normalizeTime($start));
$endTs = strtotime($date . ' ' . $normalizeTime($end));

$summary = 'Reserva Ze.EFE - ' . ($res['room_name'] ?: 'Sala');
$desc = ($res['title'] ? ($res['title'] . "\n\n") : '') . trim($res['description'] ?? '');
// Monta endereço completo: Rua/compl, Cidade-UF, CEP
$street = trim((string)($res['street'] ?? ''));
$compl = trim((string)($res['complement'] ?? ''));
$addr1 = $street ? ($street . ($compl ? ' - ' . $compl : '')) : '';
$cityState = trim((string)($res['city'] ?? '')) . (empty($res['state']) ? '' : ' - ' . strtoupper((string)$res['state']));
$cep = trim((string)($res['cep'] ?? ''));
$parts = array_filter([$addr1 ?: null, $cityState ?: null, ($cep ? ('CEP ' . $cep) : null)]);
$location = $parts ? implode(', ', $parts) : ($res['room_location'] ?: trim(($res['city'] ?: '') . ' - ' . strtoupper($res['state'] ?: '')));

$ics = ics_generate([
  'summary' => $summary,
  'description' => $desc,
  'location' => $location,
  'start' => $startTs,
  'end' => $endTs,
  'uid' => 'zeefe-' . $id . '-' . md5($summary . $date),
  'tz' => 'America/Sao_Paulo'
]);

header('Content-Type: text/calendar; charset=UTF-8');
header('Content-Disposition: attachment; filename="reserva-' . $id . '.ics"');
echo $ics;
