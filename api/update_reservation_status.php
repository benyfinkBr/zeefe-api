<?php
require 'apiconfig.php';
require_once __DIR__ . '/lib/mailer.php';
require_once __DIR__ . '/lib/reservations.php';
require_once __DIR__ . '/lib/reservation_email_helpers.php';
require_once __DIR__ . '/lib/stripe_helpers.php';

$data = getJsonInput();
$reservationId = isset($data['id']) ? (int)$data['id'] : 0;
$action = trim($data['action'] ?? '');

if ($reservationId <= 0 || $action === '') {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Parâmetros inválidos.']);
  exit;
}

$actions = [
  'confirm' => ['from' => ['pendente'], 'to' => 'confirmada', 'message' => 'Reserva confirmada e pagamento aprovado.'],
  'deny'    => ['from' => ['pendente'], 'to' => 'cancelada',  'message' => 'Reserva negada.'],
  'cancel'  => ['from' => ['pendente', 'confirmada'], 'to' => 'cancelada', 'message' => 'Reserva cancelada.']
];

if (!isset($actions[$action])) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Ação inválida.']);
  exit;
}

try {
  $dados = reservation_load($pdo, $reservationId);
  if (!$dados) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Reserva não encontrada.']);
    exit;
  }

  $current = $dados['status'] ?? '';
  if (!in_array($current, $actions[$action]['from'], true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Transição de status não permitida.']);
    exit;
  }

  if ($action === 'confirm') {
    try {
      $chargeResult = stripeConfirmReservation($pdo, $config, $dados);
      try {
        emailPagamentoConfirmadoCliente($pdo, $reservationId);
        emailDetalhesPosPagamento($pdo, $reservationId);
      } catch (Throwable $mailError) {
        error_log('[Stripe] Falha ao enviar e-mails pós-pagamento: ' . $mailError->getMessage());
      }

      echo json_encode([
        'success' => true,
        'status' => 'confirmada',
        'payment_intent' => $chargeResult['payment_intent_id'],
        'charge_id' => $chargeResult['charge_id'],
        'message' => $actions[$action]['message']
      ]);
    } catch (Throwable $paymentError) {
      try {
        emailPagamentoFalhouCliente($pdo, $reservationId, $paymentError->getMessage());
      } catch (Throwable $clientMailError) {
        error_log('[Stripe] Falha ao enviar e-mail de falha (cliente): ' . $clientMailError->getMessage());
      }
      try {
        emailPagamentoFalhouAnunciante($pdo, $reservationId, $paymentError->getMessage());
      } catch (Throwable $advMailError) {
        error_log('[Stripe] Falha ao enviar e-mail de falha (anunciante): ' . $advMailError->getMessage());
      }
      http_response_code(400);
      echo json_encode(['success' => false, 'error' => $paymentError->getMessage()]);
    }
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
} catch (Throwable $e) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

function enviarEmailStatusReserva(PDO $pdo, int $reservationId, string $action, string $status): void {
  if (!in_array($action, ['deny', 'cancel'], true)) {
    return;
  }
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
    case 'deny':
      $detalhes['motivo'] = 'Solicitação não aprovada para a data escolhida.';
      $html = mailer_render('reservation_cancelled.php', $detalhes);
      mailer_send($dados['client_email'], 'Ze.EFE - Solicitação de reserva não aprovada', $html);
      break;
    case 'cancel':
      $detalhes['motivo'] = 'Reserva cancelada a pedido do organizador.';
      $html = mailer_render('reservation_cancelled.php', $detalhes);
      mailer_send($dados['client_email'], 'Ze.EFE - Reserva cancelada', $html);
      $adminHtml = '<p>Uma reserva foi cancelada pelo anunciante.</p>'
        . '<p><strong>Reserva:</strong> #' . (int) $reservationId . '</p>'
        . '<p><strong>Cliente:</strong> ' . htmlspecialchars($detalhes['cliente_nome']) . '</p>'
        . '<p><strong>Sala:</strong> ' . htmlspecialchars($detalhes['sala_nome']) . '</p>'
        . '<p><strong>Data:</strong> ' . htmlspecialchars($detalhes['data_formatada']) . '</p>'
        . '<p><strong>Horário:</strong> ' . htmlspecialchars(trim($detalhes['hora_inicio'] . ' - ' . $detalhes['hora_fim'])) . '</p>';
      mailer_send(MAIL_FROM_ADDRESS, 'Ze.EFE - Reserva cancelada (aviso interno)', $adminHtml);
      break;
  }
}

function stripeConfirmReservation(PDO $pdo, array $config, array $reservation): array {
  zeefe_stripe_ensure_schema($pdo);
  $clientId = (int)($reservation['client_id'] ?? 0);
  if ($clientId <= 0) {
    throw new RuntimeException('Reserva sem cliente associado.');
  }

  $stripe = zeefe_stripe_client($config);
  $client = zeefe_stripe_fetch_client($pdo, $clientId);
  $customerId = zeefe_stripe_ensure_customer($pdo, $stripe, $client);
  $card = zeefe_stripe_find_active_card($pdo, $clientId);
  if (!$card) {
    throw new RuntimeException('Não há cartão salvo para este cliente.');
  }

  $amountCents = zeefe_stripe_reservation_amount_cents($reservation);
  if ($amountCents <= 0) {
    throw new RuntimeException('Valor da reserva inválido para cobrança.');
  }

  $metadata = [
    'context' => 'reservation',
    'reservation_id' => (int)$reservation['id'],
    'client_id' => $clientId,
    'room_id' => (int)($reservation['room_id'] ?? 0)
  ];
  $description = sprintf('Reserva #%d - %s', $reservation['id'], $reservation['room_name'] ?? 'Ze.EFE');

  try {
    $intent = $stripe->paymentIntents->create([
      'amount' => $amountCents,
      'currency' => 'brl',
      'customer' => $customerId,
      'payment_method' => $card['stripe_payment_method_id'],
      'off_session' => true,
      'confirm' => true,
      'payment_method_types' => ['card'],
      'metadata' => $metadata,
      'description' => $description
    ], [
      'idempotency_key' => 'reservation_confirm_' . $reservation['id']
    ]);
  } catch (\Stripe\Exception\ApiErrorException $e) {
    $pi = $e->getError()->payment_intent ?? null;
    $intentId = null;
    $chargeId = null;
    if ($pi instanceof \Stripe\PaymentIntent) {
      $intentId = $pi->id;
      $chargeId = $pi->latest_charge ?? null;
    } elseif (is_array($pi)) {
      $intentId = $pi['id'] ?? null;
      $chargeId = $pi['latest_charge'] ?? null;
    }
    persistStripePaymentAttempt($pdo, $reservation, [
      'amount_cents' => $amountCents,
      'currency' => 'brl',
      'payment_intent_id' => $intentId,
      'charge_id' => $chargeId,
      'payment_method_id' => $card['stripe_payment_method_id'],
      'customer_id' => $customerId,
      'failure_code' => $e->getError()->code ?? $e->getStripeCode(),
      'failure_message' => $e->getError()->message ?? $e->getMessage()
    ], false);
    throw new RuntimeException($e->getError()->message ?? $e->getMessage());
  }

  if ($intent->status !== 'succeeded') {
    $lastError = $intent->last_payment_error;
    $message = $lastError->message ?? 'Pagamento não pôde ser concluído automaticamente.';
    persistStripePaymentAttempt($pdo, $reservation, [
      'amount_cents' => $amountCents,
      'currency' => $intent->currency ?? 'brl',
      'payment_intent_id' => $intent->id,
      'charge_id' => $intent->latest_charge ?? null,
      'payment_method_id' => $card['stripe_payment_method_id'],
      'customer_id' => $customerId,
      'failure_code' => $lastError->code ?? null,
      'failure_message' => $message
    ], false);
    throw new RuntimeException($message);
  }

  $chargeId = null;
  $paidAt = null;
  if (!empty($intent->charges) && isset($intent->charges->data[0])) {
    $charge = $intent->charges->data[0];
    $chargeId = $charge->id ?? null;
    if (isset($charge->created)) {
      $paidAt = normalizeStripePaidAt($charge->created);
    }
  }

  persistStripePaymentAttempt($pdo, $reservation, [
    'amount_cents' => $amountCents,
    'currency' => $intent->currency ?? 'brl',
    'payment_intent_id' => $intent->id,
    'charge_id' => $chargeId,
    'payment_method_id' => $card['stripe_payment_method_id'],
    'customer_id' => $customerId,
    'paid_at' => $paidAt
  ], true);

  return [
    'payment_intent_id' => $intent->id,
    'charge_id' => $chargeId,
    'amount_cents' => $amountCents,
    'paid_at' => $paidAt
  ];
}

function persistStripePaymentAttempt(PDO $pdo, array $reservation, array $data, bool $success): void {
  $amountCents = $data['amount_cents'] ?? null;
  $amountDecimal = $amountCents !== null ? number_format($amountCents / 100, 2, '.', '') : '0.00';
  $status = $success ? 'pago' : 'falhou';
  $paidAt = $success ? ($data['paid_at'] ?? date('Y-m-d H:i:s')) : null;
  $transactionCode = $data['charge_id'] ?: ($data['payment_intent_id'] ?? null);

  $pdo->beginTransaction();
  try {
    $stmt = $pdo->prepare('INSERT INTO payments (reservation_id, method, amount, status, transaction_code, paid_at, created_at, updated_at, provider, currency, amount_cents, stripe_payment_intent_id, stripe_charge_id, stripe_customer_id, stripe_payment_method_id, failure_code, failure_message) VALUES (:reservation_id, :method, :amount, :status, :transaction_code, :paid_at, NOW(), NOW(), :provider, :currency, :amount_cents, :pi, :charge, :customer, :pm, :failure_code, :failure_message)');
    $stmt->execute([
      ':reservation_id' => $reservation['id'],
      ':method' => 'cartao',
      ':amount' => $amountDecimal,
      ':status' => $status,
      ':transaction_code' => $transactionCode,
      ':paid_at' => $paidAt,
      ':provider' => 'stripe',
      ':currency' => strtoupper($data['currency'] ?? 'BRL'),
      ':amount_cents' => $amountCents,
      ':pi' => $data['payment_intent_id'] ?? null,
      ':charge' => $data['charge_id'] ?? null,
      ':customer' => $data['customer_id'] ?? null,
      ':pm' => $data['payment_method_id'] ?? null,
      ':failure_code' => $success ? null : ($data['failure_code'] ?? null),
      ':failure_message' => $success ? null : ($data['failure_message'] ?? null)
    ]);

    if ($success) {
      $stmt = $pdo->prepare('UPDATE reservations SET status = "confirmada", payment_status = "confirmado", stripe_payment_intent_id = :pi, stripe_charge_id = :charge, payment_confirmed_at = :paid_at, hold_expires_at = NULL, updated_at = NOW() WHERE id = :id');
      $stmt->execute([
        ':pi' => $data['payment_intent_id'] ?? null,
        ':charge' => $data['charge_id'] ?? null,
        ':paid_at' => $paidAt,
        ':id' => $reservation['id']
      ]);
    } else {
      $stmt = $pdo->prepare('UPDATE reservations SET stripe_payment_intent_id = :pi, stripe_charge_id = :charge, payment_status = "pendente", updated_at = NOW() WHERE id = :id');
      $stmt->execute([
        ':pi' => $data['payment_intent_id'] ?? null,
        ':charge' => $data['charge_id'] ?? null,
        ':id' => $reservation['id']
      ]);
    }

    $pdo->commit();
  } catch (Throwable $e) {
    $pdo->rollBack();
    throw $e;
  }
}

function normalizeStripePaidAt($timestamp): ?string {
  if ($timestamp === null) {
    return null;
  }
  if ($timestamp instanceof DateTimeInterface) {
    return $timestamp->format('Y-m-d H:i:s');
  }
  if (is_numeric($timestamp)) {
    return date('Y-m-d H:i:s', (int)$timestamp);
  }
  return null;
}
