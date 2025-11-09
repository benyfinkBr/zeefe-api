<?php
require 'apiconfig.php';
require_once __DIR__ . '/lib/mailer.php';
require_once __DIR__ . '/lib/ics.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$id = isset($data['reservation_id']) ? (int) $data['reservation_id'] : 0;
if ($id <= 0) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Reserva inválida.']);
  exit;
}

// Carregar reserva + emails dos visitantes e do cliente
$stmt = $pdo->prepare('SELECT r.*, c.email AS client_email, c.name AS client_name, rooms.name AS room_name, rooms.location AS room_location, rooms.city, rooms.state FROM reservations r JOIN clients c ON c.id = r.client_id LEFT JOIN rooms ON rooms.id = r.room_id WHERE r.id = ? LIMIT 1');
$stmt->execute([$id]);
$res = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$res || empty($res['client_email'])) {
  http_response_code(404);
  echo json_encode(['success' => false, 'error' => 'Reserva/cliente não encontrado.']);
  exit;
}

$visitorsStmt = $pdo->prepare('SELECT v.email, v.name FROM reservation_visitors rv JOIN visitors v ON v.id = rv.visitor_id WHERE rv.reservation_id = ? AND (v.email IS NOT NULL AND v.email <> "")');
$visitorsStmt->execute([$id]);
$visitors = $visitorsStmt->fetchAll(PDO::FETCH_ASSOC);

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

$html = mailer_render('reservation_confirmed.php', [
  'cliente_nome' => $res['client_name'] ?? 'Cliente Ze.EFE',
  'sala_nome' => $res['room_name'] ?? 'Sala Ze.EFE',
  'data_formatada' => date('d/m/Y', strtotime($date)),
  'hora_inicio' => $start,
  'hora_fim' => $end,
  'visitantes' => ($visitors ? implode(', ', array_filter(array_map(fn($v) => $v['name'] ?? '', $visitors))) : 'Sem visitantes cadastrados'),
  'link_portal' => 'https://zeefe.com.br/clientes.html',
  'bloco_informacoes' => '<p style="margin:0 0 12px;">Anexamos um convite de calendário (.ics) para adicionar à sua agenda.</p>'
]);

$recipients = [['email' => $res['client_email'], 'name' => $res['client_name'] ?? '']];
foreach ($visitors as $v) {
  $recipients[] = ['email' => $v['email'], 'name' => $v['name'] ?? ''];
}

$ok = mailer_send($recipients, 'Ze.EFE - Detalhes da sua reserva (convite de calendário)', $html, '', [
  ['data' => $ics, 'name' => 'reserva.ics', 'type' => 'text/calendar']
]);

if (!$ok) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Falha ao enviar convites.']);
  exit;
}

echo json_encode(['success' => true]);

