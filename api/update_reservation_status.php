<?php
require 'apiconfig.php';
require_once __DIR__ . '/lib/mailer.php';
require_once __DIR__ . '/lib/reservations.php';

$data = getJsonInput();
$reservationId = isset($data['id']) ? (int) $data['id'] : 0;
$action = trim($data['action'] ?? '');

if ($reservationId <= 0 || $action === '') {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Parâmetros inválidos.']);
  exit;
}

$actions = [
  'confirm' => ['from' => ['pendente'], 'to' => 'confirmada', 'message' => 'Reserva confirmada.'],
  'deny'    => ['from' => ['pendente'], 'to' => 'cancelada',  'message' => 'Reserva negada.'],
  'cancel'  => ['from' => ['pendente', 'confirmada'], 'to' => 'cancelada', 'message' => 'Reserva cancelada.']
];

if (!isset($actions[$action])) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Ação inválida.']);
  exit;
}

try {
  $stmt = $pdo->prepare('SELECT status FROM reservations WHERE id = ? LIMIT 1');
  $stmt->execute([$reservationId]);
  $current = $stmt->fetchColumn();

  if ($current === false) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Reserva não encontrada.']);
    exit;
  }

  if (!in_array($current, $actions[$action]['from'], true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Transição de status não permitida.']);
    exit;
  }

  $newStatus = $actions[$action]['to'];
  $stmtUpd = $pdo->prepare('UPDATE reservations SET status = ?, updated_at = NOW() WHERE id = ?');
  $stmtUpd->execute([$newStatus, $reservationId]);

  try {
    enviarEmailStatusReserva($pdo, $reservationId, $action, $newStatus);
  } catch (Throwable $mailError) {
    error_log('Falha ao enviar e-mail de status de reserva: ' . $mailError->getMessage());
  }

  echo json_encode(['success' => true, 'status' => $newStatus, 'message' => $actions[$action]['message']]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

function enviarEmailStatusReserva(PDO $pdo, int $reservationId, string $action, string $status): void {
  $dados = reservation_load($pdo, $reservationId);
  if (!$dados || empty($dados['client_email'])) {
    return;
  }
  $visitantes = $dados['visitor_names'] ? implode(', ', $dados['visitor_names']) : 'Sem visitantes cadastrados';
  $detalhes = [
    'cliente_nome' => $dados['client_name'] ?? '',
    'sala_nome' => $dados['room_name'] ?? '',
    'data_formatada' => reservation_format_date($dados['date']),
    'hora_inicio' => reservation_format_time($dados['time_start'] ?? null),
    'hora_fim' => reservation_format_time($dados['time_end'] ?? null),
    'visitantes' => $visitantes,
    'link_portal' => 'https://zeefe.com.br/clientes.html'
  ];

  switch ($action) {
    case 'confirm':
      $detalhes['bloco_informacoes'] = '<p style="margin:0 0 20px;font-size:15px;line-height:1.6;">Sua reserva foi confirmada. Efetue o pagamento em até 24h para garantir o espaço. Você pode acessar o portal para emitir o comprovante e convidar visitantes.</p>';
      $html = mailer_render('reservation_confirmed.php', $detalhes);
      mailer_send($dados['client_email'], 'Ze.EFE - Sua reserva foi confirmada', $html);
      break;
    case 'deny':
      $detalhes['motivo'] = 'Solicitação não aprovada para a data escolhida.';
      $html = mailer_render('reservation_cancelled.php', $detalhes);
      mailer_send($dados['client_email'], 'Ze.EFE - Solicitação de reserva não aprovada', $html);
      break;
    case 'cancel':
      $detalhes['motivo'] = 'Reserva cancelada a pedido do organizador.';
      $html = mailer_render('reservation_cancelled.php', $detalhes);
      mailer_send($dados['client_email'], 'Ze.EFE - Reserva cancelada', $html);
      break;
  }
}
