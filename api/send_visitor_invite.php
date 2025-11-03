<?php
require 'apiconfig.php';
require_once __DIR__ . '/lib/mailer.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$visitorId = isset($data['visitor_id']) ? (int) $data['visitor_id'] : 0;
$reservationId = isset($data['reservation_id']) ? (int) $data['reservation_id'] : 0;

if ($visitorId <= 0) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Visitante inválido.']);
  exit;
}

try {
  $stmt = $pdo->prepare('SELECT name, email FROM visitors WHERE id = ? LIMIT 1');
  $stmt->execute([$visitorId]);
  $visitor = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$visitor) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Visitante não encontrado.']);
    exit;
  }

  if (empty($visitor['email'])) {
    echo json_encode(['success' => true, 'message' => 'Visitante sem e-mail cadastrado. Convite não enviado.']);
    exit;
  }

  $clientName = 'nosso cliente';
  $roomName = 'Sala Ze.EFE';
  $dateFormatted = '';
  if ($reservationId) {
    $stmtInfo = $pdo->prepare('SELECT r.date, rooms.name AS room_name, clients.name AS client_name FROM reservations r JOIN rooms ON rooms.id = r.room_id JOIN clients ON clients.id = r.client_id WHERE r.id = ? LIMIT 1');
    $stmtInfo->execute([$reservationId]);
    if ($info = $stmtInfo->fetch(PDO::FETCH_ASSOC)) {
      $roomName = $info['room_name'] ?? $roomName;
      $clientName = $info['client_name'] ?? $clientName;
      if (!empty($info['date'])) {
        $dateFormatted = DateTime::createFromFormat('Y-m-d', $info['date'])?->format('d/m/Y') ?? '';
      }
    }
  }

  try {
    $html = mailer_render('visitor_invite.php', [
      'visitante_nome' => $visitor['name'],
      'cliente_nome' => $clientName,
      'sala_nome' => $roomName,
      'data_formatada' => $dateFormatted,
      'link_confirmacao' => 'https://zeefe.com.br/clientes.html'
    ]);
    mailer_send($visitor['email'], 'Ze.EFE - convite para visita', $html);
  } catch (Throwable $mailError) {
    error_log('Erro ao enviar convite de visitante: ' . $mailError->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Não foi possível enviar o convite.']);
    exit;
  }

  echo json_encode(['success' => true, 'message' => 'Convite enviado.']);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
