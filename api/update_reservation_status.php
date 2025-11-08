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
  if ($action === 'confirm') {
    // Ao confirmar: inicia janela de pagamento de 24h (fictício por enquanto)
    $stmtUpd = $pdo->prepare('UPDATE reservations SET status = ?, payment_status = "pendente", hold_expires_at = DATE_ADD(NOW(), INTERVAL 24 HOUR), updated_at = NOW() WHERE id = ?');
    $stmtUpd->execute([$newStatus, $reservationId]);
  } else {
    $stmtUpd = $pdo->prepare('UPDATE reservations SET status = ?, updated_at = NOW() WHERE id = ?');
    $stmtUpd->execute([$newStatus, $reservationId]);
  }

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
      // Link fictício que marca a reserva como paga (mock)
      $scheme = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? 'https://' : 'http://';
      $host = $_SERVER['HTTP_HOST'] ?? 'zeefe.com.br';
      $base = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');
      $link = $scheme . $host . $base . '/mock_payment_confirm.php?reservation=' . (int)$reservationId;
      $btn = '<div style="text-align:center;margin:18px 0 26px;"><a href="' . htmlspecialchars($link) . '" style="background:#1D413A;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600;display:inline-block">Pagar agora</a></div>';
      $detalhes['bloco_informacoes'] = '<p style="margin:0 0 10px;font-size:15px;line-height:1.6;">Sua reserva foi confirmada. Efetue o pagamento em até 24h para garantir o espaço.</p>' . $btn . '<p style="margin:0 0 20px;font-size:14px;color:#8A7766;">Após a confirmação do pagamento, você receberá os detalhes e poderá convidar os visitantes.</p>';
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
