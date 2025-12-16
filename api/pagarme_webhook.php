<?php
// Always resolve config relative to this file (important when this handler is included from a public router).
require __DIR__ . '/apiconfig.php';
require_once __DIR__ . '/lib/payment_intents.php';
require_once __DIR__ . '/lib/pagarme_events.php';
require_once __DIR__ . '/lib/mailer.php';
require_once __DIR__ . '/lib/reservations.php';

// Force PDO to throw exceptions so DB errors don't fail silently
if (isset($pdo) && $pdo instanceof PDO) {
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
}

function _pagarme_diag_log(string $msg): void {
  error_log('[PAGARME_DIAG] ' . $msg);
}

// Optional diagnostic endpoint
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET' && isset($_GET['diag'])) {
  header('Content-Type: application/json; charset=utf-8');
  header('X-Zeefe-Webhook-Handler: api/pagarme_webhook.php');
  try {
    $db = $pdo->query('SELECT DATABASE() AS db')->fetch(PDO::FETCH_ASSOC);
    $host = $pdo->query('SELECT @@hostname AS host')->fetch(PDO::FETCH_ASSOC);
    $user = $pdo->query('SELECT USER() AS user')->fetch(PDO::FETCH_ASSOC);
    $hasTable = $pdo->query("SHOW TABLES LIKE 'pagarme_events'")->fetch(PDO::FETCH_NUM);
    $count = $hasTable ? $pdo->query('SELECT COUNT(*) AS c FROM pagarme_events')->fetch(PDO::FETCH_ASSOC) : ['c' => null];
    echo json_encode([
      'ok' => true,
      'db' => $db['db'] ?? null,
      'host' => $host['host'] ?? null,
      'user' => $user['user'] ?? null,
      'has_pagarme_events' => (bool)$hasTable,
      'pagarme_events_count' => isset($count['c']) ? (int)$count['c'] : null,
      'ts' => date('c'),
    ]);
  } catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
  }
  exit;
}

// Healthcheck (GET)
if (($_SERVER['REQUEST_METHOD'] ?? 'POST') === 'GET') {
  _pagarme_diag_log('GET healthcheck hit uri=' . ($_SERVER['REQUEST_URI'] ?? '') . ' ip=' . ($_SERVER['REMOTE_ADDR'] ?? '')); 
  header('Content-Type: application/json; charset=utf-8');
  header('X-Zeefe-Webhook-Handler: api/pagarme_webhook.php');
  http_response_code(200);
  echo json_encode(['ok' => true, 'endpoint' => 'pagarme_webhook', 'ts' => date('c')]);
  exit;
}

$rawBody = file_get_contents('php://input');
_pagarme_diag_log('POST hit uri=' . ($_SERVER['REQUEST_URI'] ?? '') . ' ip=' . ($_SERVER['REMOTE_ADDR'] ?? '') . ' ua=' . ($_SERVER['HTTP_USER_AGENT'] ?? '')); 
_pagarme_diag_log('POST rawBody_len=' . strlen((string)$rawBody));

$payload = json_decode($rawBody, true);
if ($rawBody && $payload === null && json_last_error() !== JSON_ERROR_NONE) {
  _pagarme_diag_log('json_decode_error=' . json_last_error_msg());
}
if (!$payload) {
  header('Content-Type: application/json; charset=utf-8');
  header('X-Zeefe-Webhook-Handler: api/pagarme_webhook.php');
  error_log('[PAGARME_WEBHOOK] Payload inválido (json_decode). Body(200)=' . substr((string)$rawBody, 0, 200));
  http_response_code(200);
  echo json_encode(['success' => true, 'ignored' => 'invalid_json']);
  exit;
}

$eventType = strtolower($payload['type'] ?? '');
$data      = $payload['data'] ?? [];

// Webhook v5 pode vir como:
// A) data: { charge: { ... , order: {...} } }
// B) data: { ...campos da charge..., order: {...} }
$charge = $data['charge'] ?? $data;
$order  = $charge['order'] ?? ($data['order'] ?? null);

_pagarme_diag_log('parsed type=' . ($eventType ?: 'null') . ' hasData=' . (is_array($data) ? 'yes' : 'no') . ' hasOrder=' . ($order ? 'yes' : 'no'));

if (!$eventType || !$data || !is_array($charge) || !$order) {
  header('Content-Type: application/json; charset=utf-8');
  $dataKeys = is_array($data) ? implode(',', array_keys($data)) : 'not_array';
  error_log('[PAGARME_WEBHOOK] Evento mal formatado. type=' . ($eventType ?: 'null') . ' | payload_keys=' . implode(',', array_keys($payload)) . ' | data_keys=' . $dataKeys);
  http_response_code(200);
  echo json_encode(['success' => true, 'ignored' => 'malformed_event']);
  exit;
}

$metadata   = $order['metadata'] ?? $charge['metadata'] ?? [];
$orderId    = $order['id'] ?? null;
$paymentId  = $charge['id'] ?? null;
$status     = strtolower($charge['status'] ?? '');
$amountCents = isset($charge['paid_amount']) ? (int)$charge['paid_amount'] : (isset($charge['amount']) ? (int)$charge['amount'] : 0);
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

try {
  payment_intents_update_by_order($pdo, $orderId, $paymentId, [
    'status' => $statusMap,
    'pagarme_payment_id' => $paymentId,
    'last_payload' => $rawBody
  ]);
  _pagarme_diag_log('payment_intents_update_by_order ok orderId=' . ($orderId ?: 'null') . ' paymentId=' . ($paymentId ?: 'null') . ' status=' . $statusMap);
} catch (Throwable $e) {
  _pagarme_diag_log('payment_intents_update_by_order FAILED err=' . $e->getMessage());
}

$entity = $metadata['entity'] ?? null;
$response = ['success' => true];
$eventId = null;
try {
  $eventId = pagarme_events_store($pdo, [
    'hook_id' => $payload['id'] ?? null,
    'event_type' => $eventType,
    'status_code' => null,
    'status_text' => $status ?: $statusMap,
    'entity' => $entity,
    'context_id' => $metadata['reservation_id'] ?? $metadata['enrollment_id'] ?? null,
    'payload' => $rawBody
  ]);
  _pagarme_diag_log('pagarme_events_store ok eventId=' . ($eventId ?: 'null'));
  $response['event_id'] = $eventId;
} catch (Throwable $e) {
  _pagarme_diag_log('pagarme_events_store FAILED err=' . $e->getMessage());
  $response['event_store_error'] = $e->getMessage();
}

$processedOk = true;
try {
  if ($entity === 'reservation' && !empty($metadata['reservation_id'])) {
    $reservationId = (int)$metadata['reservation_id'];
    if ($statusMap === 'paid') {
      $stmt = $pdo->prepare('UPDATE reservations SET payment_status = "confirmado", amount_gross = COALESCE(amount_gross, :amount), updated_at = NOW() WHERE id = :id');
      $stmt->execute([':amount' => $amount, ':id' => $reservationId]);
      $fallbackEmail = $charge['customer']['email'] ?? null;
      enviarEmailPagamentoReserva($pdo, $reservationId, $amount, $fallbackEmail);
      enviarEmailDetalhesReservaPosPagamento($pdo, $reservationId, $fallbackEmail);
    } elseif (in_array($statusMap, ['failed','canceled'], true)) {
      $stmt = $pdo->prepare('UPDATE reservations SET payment_status = "pendente", updated_at = NOW() WHERE id = :id');
      $stmt->execute([':id' => $reservationId]);
      $motivo = $charge['last_transaction']['acquirer_return_message'] ?? ($charge['last_transaction']['status'] ?? $statusMap);
      $fallbackEmail = $charge['customer']['email'] ?? null;
      enviarEmailPagamentoReservaFalhou($pdo, $reservationId, (string)$motivo, $fallbackEmail);
      enviarEmailPagamentoReservaFalhouAnunciante($pdo, $reservationId, (string)$motivo);
    }
    $response['reservation_id'] = $reservationId;

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
    $response['enrollment_id'] = $enrollmentId;
  }
} catch (Throwable $entityErr) {
  error_log('Erro ao sincronizar entidade após webhook: ' . $entityErr->getMessage());
  $processedOk = false;
  $response['entity_process_error'] = $entityErr->getMessage();
  if (!empty($eventId)) {
    pagarme_events_mark_processed($pdo, $eventId, $entityErr->getMessage(), false);
  }
}

header('Content-Type: application/json; charset=utf-8');
header('X-Zeefe-Webhook-Handler: api/pagarme_webhook.php');
_pagarme_diag_log('response success=1 reservation=' . ($response['reservation_id'] ?? 'null') . ' enrollment=' . ($response['enrollment_id'] ?? 'null'));
echo json_encode($response);
if (!empty($eventId) && $processedOk) {
  pagarme_events_mark_processed($pdo, $eventId, $statusMap, true);
}

function enviarEmailPagamentoReserva(PDO $pdo, int $reservationId, ?float $amount, ?string $fallbackEmail = null): void {
  $dados = reservation_load($pdo, $reservationId);
  if (!$dados) {
    error_log('[MAIL][client] reservation_load vazio para reserva #' . $reservationId);
    return;
  }
  $emailCliente =
    $dados['client_email']
    ?? $dados['login_email']
    ?? $dados['email']
    ?? $fallbackEmail
    ?? null;

  $emailCliente = is_string($emailCliente) ? trim($emailCliente) : null;
  error_log('[MAIL][client] Reserva #' . $reservationId . ' destinatario_resolvido=' . ($emailCliente ?: 'null'));

  if (empty($emailCliente) || !filter_var($emailCliente, FILTER_VALIDATE_EMAIL)) {
    error_log('[MAIL][client] Sem e-mail válido para reserva #' . $reservationId);
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
    'link_portal' => 'https://zeefe.com.br/clientes.html'
  ];
  try {
    $html = mailer_render('payment_reservation_confirmed.php', $placeholders);
    $sent = mailer_send($emailCliente, 'Ze.EFE - Pagamento confirmado', $html);
    if ($sent === false) {
      error_log('[MAIL][client] mailer_send retornou false (pagamento confirmado) para ' . $emailCliente . ' | reserva #' . $reservationId);
    }
  } catch (Throwable $e) {
    error_log('Erro ao enviar e-mail de pagamento da reserva: ' . $e->getMessage());
  }
}

function enviarEmailPagamentoReservaFalhou(PDO $pdo, int $reservationId, string $motivo = '', ?string $fallbackEmail = null): void {
  $dados = reservation_load($pdo, $reservationId);
  if (!$dados) {
    error_log('[MAIL][client] reservation_load vazio para reserva #' . $reservationId);
    return;
  }
  $emailCliente =
    $dados['client_email']
    ?? $dados['login_email']
    ?? $dados['email']
    ?? $fallbackEmail
    ?? null;

  $emailCliente = is_string($emailCliente) ? trim($emailCliente) : null;
  error_log('[MAIL][client] Reserva #' . $reservationId . ' destinatario_resolvido=' . ($emailCliente ?: 'null'));

  if (empty($emailCliente) || !filter_var($emailCliente, FILTER_VALIDATE_EMAIL)) {
    error_log('[MAIL][client] Sem e-mail válido para reserva #' . $reservationId);
    return;
  }
  $placeholders = [
    'cliente_nome' => $dados['client_name'] ?? 'Cliente Ze.EFE',
    'sala_nome' => $dados['room_name'] ?? 'Sala Ze.EFE',
    'data_formatada' => reservation_format_date($dados['date'] ?? ''),
    'hora_inicio' => reservation_format_time($dados['time_start'] ?? null),
    'hora_fim' => reservation_format_time($dados['time_end'] ?? null),
    'motivo' => $motivo ?: 'A operadora não aprovou a cobrança. Confira os dados do cartão ou cadastre um novo método.',
    'link_portal' => 'https://zeefe.com.br/clientes.html'
  ];
  try {
    $html = mailer_render('payment_reservation_failed.php', $placeholders);
    $sent = mailer_send($emailCliente, 'Ze.EFE - Pagamento não aprovado', $html);
    if ($sent === false) {
      error_log('[MAIL][client] mailer_send retornou false (pagamento nao aprovado) para ' . $emailCliente . ' | reserva #' . $reservationId);
    }
  } catch (Throwable $e) {
    error_log('Erro ao enviar e-mail de pagamento (falha) da reserva: ' . $e->getMessage());
  }
}

function enviarEmailPagamentoReservaFalhouAnunciante(PDO $pdo, int $reservationId, string $motivo = ''): void {
  $stmt = $pdo->prepare('SELECT r.date, r.time_start, r.time_end,
    rooms.name AS room_name,
    rooms.advertiser_id,
    COALESCE(a.display_name, a.name) AS advertiser_name,
    COALESCE(a.login_email, a.email) AS advertiser_email,
    c.name AS client_name
    FROM reservations r
    JOIN rooms ON rooms.id = r.room_id
    JOIN clients c ON c.id = r.client_id
    LEFT JOIN companies a ON a.id = rooms.advertiser_id
    WHERE r.id = ?
    LIMIT 1');
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

function enviarEmailDetalhesReservaPosPagamento(PDO $pdo, int $reservationId, ?string $fallbackEmail = null): void {
  $dados = reservation_load($pdo, $reservationId);
  if (!$dados) {
    error_log('[MAIL][client] reservation_load vazio para reserva #' . $reservationId);
    return;
  }
  $emailCliente =
    $dados['client_email']
    ?? $dados['login_email']
    ?? $dados['email']
    ?? $fallbackEmail
    ?? null;

  $emailCliente = is_string($emailCliente) ? trim($emailCliente) : null;
  error_log('[MAIL][client] Reserva #' . $reservationId . ' destinatario_resolvido=' . ($emailCliente ?: 'null'));

  if (empty($emailCliente) || !filter_var($emailCliente, FILTER_VALIDATE_EMAIL)) {
    error_log('[MAIL][client] Sem e-mail válido para reserva #' . $reservationId);
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
    $sent = mailer_send($emailCliente, 'Ze.EFE - Detalhes da sua reserva', $html);
    if ($sent === false) {
      error_log('[MAIL][client] mailer_send retornou false (detalhes reserva) para ' . $emailCliente . ' | reserva #' . $reservationId);
    }
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
    'link_portal' => 'https://zeefe.com.br/clientes.html'
  ];
  try {
    $html = mailer_render('payment_workshop_confirmed.php', $placeholders);
    mailer_send($row['participante_email'], 'Ze.EFE - Pagamento confirmado', $html);
  } catch (Throwable $e) {
    error_log('Erro ao enviar e-mail de pagamento do workshop: ' . $e->getMessage());
  }
}
