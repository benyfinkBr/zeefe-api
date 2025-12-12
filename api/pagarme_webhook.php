<?php
require 'apiconfig.php';
require_once __DIR__ . '/lib/payment_intents.php';
require_once __DIR__ . '/lib/pagarme_events.php';
require_once __DIR__ . '/lib/mailer.php';
require_once __DIR__ . '/lib/reservations.php';
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  header('Content-Type: application/json');
  echo json_encode([
    'ok' => true,
    'endpoint' => 'pagarme_webhook',
    'ts' => date('c')
  ]);
  exit;
}

$rawBody = file_get_contents('php://input');
$payload = json_decode($rawBody, true);
if (!is_array($payload)) {
  error_log('[PagarMe webhook] Invalid JSON payload: ' . substr($rawBody ?? '', 0, 200));
  header('Content-Type: application/json');
  echo json_encode(['success' => true, 'ignored' => 'invalid_json']);
  exit;
}

$eventType = strtolower($payload['type'] ?? '');
$data      = $payload['data'] ?? [];
$charge    = $data['charge'] ?? null;
$order     = $charge['order'] ?? null;

if (!$eventType || !$data || !$charge || !$order) {
  error_log('[PagarMe webhook] Malformed event: ' . substr($rawBody ?? '', 0, 200));
  header('Content-Type: application/json');
  echo json_encode(['success' => true, 'ignored' => 'malformed_event']);
  exit;
}

$metadata   = $order['metadata'] ?? $charge['metadata'] ?? [];
$orderId    = $order['id'] ?? null;
$paymentId  = $charge['id'] ?? null;
$status     = strtolower($charge['status'] ?? '');
$amountCents = isset($charge['amount']) ? (int) $charge['amount'] : 0;
$amount = $amountCents > 0 ? $amountCents / 100 : null;

$statusMap = 'pending';
if (str_contains($eventType, 'paid') || $status === 'paid') {
  $statusMap = 'paid';
} elseif (str_contains($eventType, 'processing') || $status === 'processing') {
  $statusMap = 'pending';
} elseif (str_contains($eventType, 'refunded') || str_contains($eventType, 'canceled') || $status === 'canceled' || $status === 'refunded') {
  $statusMap = 'canceled';
} elseif (str_contains($eventType, 'failed') || $status === 'failed' || str_contains($eventType, 'underpaid')) {
  $statusMap = 'failed';
}

payment_intents_update_by_order($pdo, $orderId, $paymentId, [
  'status' => $statusMap,
  'pagarme_payment_id' => $paymentId,
  'last_payload' => $rawBody
]);

$entity = $metadata['entity'] ?? null;
$responsePayload = ['success' => true];
$eventId = pagarme_events_store($pdo, [
  'hook_id' => $payload['id'] ?? null,
  'event_type' => $eventType,
  'status_code' => null,
  'status_text' => $status ?: $statusMap,
  'entity' => $entity,
  'context_id' => $metadata['reservation_id'] ?? $metadata['enrollment_id'] ?? null,
  'payload' => $rawBody
]);

$processedOk = true;
try {
  if ($entity === 'reservation' && !empty($metadata['reservation_id'])) {
    $reservationId = (int)$metadata['reservation_id'];
    if ($statusMap === 'paid') {
      $stmt = $pdo->prepare('UPDATE reservations SET payment_status = "confirmado", amount_gross = COALESCE(amount_gross, :amount), updated_at = NOW() WHERE id = :id');
      $stmt->execute([':amount' => $amount, ':id' => $reservationId]);
      enviarEmailPagamentoReserva($pdo, $reservationId, $amount);
      enviarEmailDetalhesReservaPosPagamento($pdo, $reservationId);
    } elseif (in_array($statusMap, ['failed','canceled'], true)) {
      $stmt = $pdo->prepare('UPDATE reservations SET payment_status = "pendente", updated_at = NOW() WHERE id = :id');
      $stmt->execute([':id' => $reservationId]);
      $motivo = $charge['last_transaction']['acquirer_return_message'] ?? ($charge['last_transaction']['status'] ?? $statusMap);
      enviarEmailPagamentoReservaFalhou($pdo, $reservationId, (string)$motivo);
      enviarEmailPagamentoReservaFalhouAnunciante($pdo, $reservationId, (string)$motivo);
    }
    $responsePayload['reservation_id'] = $reservationId;
  } elseif ($entity === 'workshop' && !empty($metadata['enrollment_id'])) {
    $enrollmentId = (int)$metadata['enrollment_id'];
    if ($statusMap === 'paid') {
      $stmt = $pdo->prepare('UPDATE workshop_enrollments SET payment_status = "pago" WHERE id = :id');
      $stmt->execute([':id' => $enrollmentId]);
      enviarEmailPagamentoWorkshop($pdo, $enrollmentId, $amount);
    } elseif (in_array($statusMap, ['failed','canceled'], true)) {
      $stmt = $pdo->prepare('UPDATE workshop_enrollments SET payment_status = "pendente" WHERE id = :id');
      $stmt->execute([':id' => $enrollmentId]);
    }
    $responsePayload['enrollment_id'] = $enrollmentId;
  }
} catch (Throwable $entityErr) {
  error_log('Erro ao sincronizar entidade após webhook: ' . $entityErr->getMessage());
  $processedOk = false;
  $responsePayload['success'] = false;
  $responsePayload['error'] = 'internal_error';
  if (!empty($eventId)) {
    pagarme_events_mark_processed($pdo, $eventId, $entityErr->getMessage(), false);
  }
}

header('Content-Type: application/json');
echo json_encode($responsePayload);
if (!empty($eventId) && $processedOk) {
  pagarme_events_mark_processed($pdo, $eventId, $statusMap, true);
}

function enviarEmailPagamentoReserva(PDO $pdo, int $reservationId, ?float $amount): void {
  $dados = reservation_load($pdo, $reservationId);
  if (!$dados || empty($dados['client_email'])) {
    return;
  }
  $valorFormatado = $amount !== null ? 'R$ ' . number_format($amount, 2, ',', '.') : 'Confirmado';
  $placeholders = [
    'cliente_nome' => $dados['client_name'] ?? 'Cliente Ze.EFE',
    'sala_nome' => $dados['room_name'] ?? 'Sala Ze.EFE',
    'data_formatada' => reservation_format_date($dados['date'] ?? ''),
    'hora_inicio' => reservation_format_time($dados['time_start'] ?? null),
    'hora_fim' => reservation_format_time($dados['time_end'] ?? null),
    'valor_pago' => $valorFormatado,
    'link_portal' => 'https://zeefe.com/clientes.html'
  ];
  try {
    $html = mailer_render('payment_reservation_confirmed.php', $placeholders);
    mailer_send($dados['client_email'], 'Ze.EFE - Pagamento confirmado', $html);
  } catch (Throwable $e) {
    error_log('Erro ao enviar e-mail de pagamento da reserva: ' . $e->getMessage());
  }
}

function enviarEmailPagamentoReservaFalhou(PDO $pdo, int $reservationId, string $motivo = ''): void {
  $dados = reservation_load($pdo, $reservationId);
  if (!$dados || empty($dados['client_email'])) {
    return;
  }
  $placeholders = [
    'cliente_nome' => $dados['client_name'] ?? 'Cliente Ze.EFE',
    'sala_nome' => $dados['room_name'] ?? 'Sala Ze.EFE',
    'data_formatada' => reservation_format_date($dados['date'] ?? ''),
    'hora_inicio' => reservation_format_time($dados['time_start'] ?? null),
    'hora_fim' => reservation_format_time($dados['time_end'] ?? null),
    'motivo' => $motivo ?: 'A operadora não aprovou a cobrança. Confira os dados do cartão ou cadastre um novo método.',
    'link_portal' => 'https://zeefe.com/clientes.html'
  ];
  try {
    $html = mailer_render('payment_reservation_failed.php', $placeholders);
    mailer_send($dados['client_email'], 'Ze.EFE - Pagamento não aprovado', $html);
  } catch (Throwable $e) {
    error_log('Erro ao enviar e-mail de pagamento (falha) da reserva: ' . $e->getMessage());
  }
}

function enviarEmailPagamentoReservaFalhouAnunciante(PDO $pdo, int $reservationId, string $motivo = ''): void {
  $stmt = $pdo->prepare('SELECT r.date, r.time_start, r.time_end, rooms.name AS room_name, rooms.advertiser_id, a.display_name AS advertiser_name, a.login_email AS advertiser_email, c.name AS client_name FROM reservations r JOIN rooms ON rooms.id = r.room_id JOIN clients c ON c.id = r.client_id LEFT JOIN advertisers a ON a.id = rooms.advertiser_id WHERE r.id = ? LIMIT 1');
  $stmt->execute([$reservationId]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$row || empty($row['advertiser_email'])) {
    return;
  }
  $placeholders = [
    'sala_nome' => $row['room_name'] ?? '',
    'data_formatada' => reservation_format_date($row['date'] ?? ''),
    'cliente_nome' => $row['client_name'] ?? 'Cliente',
    'motivo' => $motivo ?: 'Não autorizado',
    'link_portal' => 'https://zeefe.com.br/anunciante.html'
  ];
  try {
    $html = mailer_render('payment_reservation_failed_advertiser.php', $placeholders);
    mailer_send($row['advertiser_email'], 'Ze.EFE - Pagamento do cliente não aprovado', $html);
  } catch (Throwable $e) {
    error_log('Erro ao enviar e-mail de pagamento (falha) para anunciante: ' . $e->getMessage());
  }
}

function enviarEmailDetalhesReservaPosPagamento(PDO $pdo, int $reservationId): void {
  $dados = reservation_load($pdo, $reservationId);
  if (!$dados || empty($dados['client_email'])) {
    return;
  }
  $publicCode = reservation_get_public_code($pdo, $dados);
  $enderecoPartes = [];
  $map = [
    $dados['room_street'] ?? null,
    $dados['room_complement'] ?? null,
    $dados['room_city'] ?? null,
    $dados['room_state'] ?? null
  ];
  foreach ($map as $parte) {
    if (!empty($parte)) {
      $enderecoPartes[] = $parte;
    }
  }
  $endereco = $enderecoPartes ? implode(', ', $enderecoPartes) : 'Disponível no portal';
  $placeholders = [
    'cliente_nome' => $dados['client_name'] ?? '',
    'sala_nome' => $dados['room_name'] ?? '',
    'data_formatada' => reservation_format_date($dados['date'] ?? ''),
    'hora_inicio' => reservation_format_time($dados['time_start'] ?? null),
    'hora_fim' => reservation_format_time($dados['time_end'] ?? null),
    'endereco' => $endereco,
    'codigo_publico' => $publicCode,
    'link_portal' => 'https://zeefe.com.br/clientes.html'
  ];
  try {
    $html = mailer_render('reservation_details_after_payment.php', $placeholders);
    mailer_send($dados['client_email'], 'Ze.EFE - Detalhes da sua reserva', $html);
  } catch (Throwable $e) {
    error_log('Erro ao enviar e-mail com detalhes da reserva: ' . $e->getMessage());
  }
}

function enviarEmailPagamentoWorkshop(PDO $pdo, int $enrollmentId, ?float $amount): void {
  $stmt = $pdo->prepare("
    SELECT e.id, e.public_code, e.payment_status,
           p.name AS participante_nome, p.email AS participante_email,
           w.title AS workshop_title, w.date AS workshop_date, w.time_start, w.time_end
    FROM workshop_enrollments e
    JOIN workshop_participants p ON p.id = e.participant_id
    JOIN workshops w ON w.id = e.workshop_id
    WHERE e.id = ?
    LIMIT 1
  ");
  $stmt->execute([$enrollmentId]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$row || empty($row['participante_email'])) {
    return;
  }
  $valorFormatado = $amount !== null ? 'R$ ' . number_format($amount, 2, ',', '.') : '';
  $dateFormatted = reservation_format_date($row['workshop_date'] ?? '');
  $timeRange = trim(reservation_format_time($row['time_start'] ?? '') . ' - ' . reservation_format_time($row['time_end'] ?? ''));
  $checkinUrl = sprintf(
    '%s/api/workshop_checkin.php?code=%s',
    rtrim((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'zeefe.com'), '/'),
    urlencode($row['public_code'] ?? '')
  );
  $placeholders = [
    'cliente_nome' => $row['participante_nome'] ?? 'Participante',
    'curso_nome' => $row['workshop_title'] ?? 'Workshop Ze.EFE',
    'data_formatada' => $dateFormatted,
    'horario' => $timeRange,
    'valor_pago' => $valorFormatado,
    'codigo_ingresso' => $row['public_code'] ?? '',
    'checkin_url' => $checkinUrl,
    'link_portal' => 'https://zeefe.com/clientes.html'
  ];
  try {
    $html = mailer_render('payment_workshop_confirmed.php', $placeholders);
    mailer_send($row['participante_email'], 'Ze.EFE - Pagamento confirmado', $html);
  } catch (Throwable $e) {
    error_log('Erro ao enviar e-mail de pagamento do workshop: ' . $e->getMessage());
  }
}
