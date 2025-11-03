<?php
require 'apiconfig.php';
require_once __DIR__ . '/lib/mailer.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$reservationId = isset($data['reservation_id']) ? (int) $data['reservation_id'] : 0;

if ($reservationId <= 0) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Reserva inválida.']);
  exit;
}

try {
  $stmt = $pdo->prepare(
    'SELECT r.id, r.date, r.time_start, r.time_end, r.status, c.email, c.name AS client_name, rooms.name AS room_name
     FROM reservations r
     INNER JOIN clients c ON c.id = r.client_id
     LEFT JOIN rooms ON rooms.id = r.room_id
     WHERE r.id = :id
     LIMIT 1'
  );
  $stmt->execute([':id' => $reservationId]);
  $reservation = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$reservation) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Reserva não encontrada.']);
    exit;
  }

  if (empty($reservation['email'])) {
    echo json_encode(['success' => false, 'error' => 'Cliente sem e-mail cadastrado.']);
    exit;
  }

  $dateFormatted = '';
  if (!empty($reservation['date'])) {
    $dateFormatted = DateTime::createFromFormat('Y-m-d', $reservation['date'])?->format('d/m/Y') ?? $reservation['date'];
  }

  $timeStart = $reservation['time_start'] ?: '08:00';
  $timeEnd = $reservation['time_end'] ?: '20:00';

  $paymentLink = sprintf('https://zeefe.com.br/pagamento?reserva=%d', (int) $reservation['id']);

  $html = mailer_render('payment_link.php', [
    'cliente_nome' => $reservation['client_name'] ?: 'Cliente Ze.EFE',
    'sala_nome' => $reservation['room_name'] ?: 'Sala Ze.EFE',
    'data_formatada' => $dateFormatted,
    'horario' => trim($timeStart . ' - ' . $timeEnd),
    'link_pagamento' => $paymentLink
  ]);

  if (!mailer_send($reservation['email'], 'Ze.EFE - finalize o pagamento da sua reserva', $html)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Não foi possível enviar o e-mail.']);
    exit;
  }

  echo json_encode(['success' => true, 'message' => 'Link de pagamento enviado.']);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
