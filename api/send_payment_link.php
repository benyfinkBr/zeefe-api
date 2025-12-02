<?php
require 'apiconfig.php';
require_once __DIR__ . '/lib/mailer.php';
require_once __DIR__ . '/lib/pagarme.php';
require_once __DIR__ . '/lib/payment_intents.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$reservationId = isset($data['reservation_id']) ? (int) $data['reservation_id'] : 0;

if ($reservationId <= 0) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'Reserva inválida.']);
  exit;
}

function format_phone_payload(?string $phoneDigits): ?array {
  if (!$phoneDigits) return null;
  $digits = preg_replace('/\D/', '', $phoneDigits);
  if (strlen($digits) < 10) return null;
  $country = '55';
  $area = substr($digits, 0, 2);
  $number = substr($digits, 2);
  return [
    'country_code' => $country,
    'area_code' => $area,
    'number' => $number
  ];
}

function build_customer_payload(string $name, string $email, ?string $cpf, ?string $phone): array {
  $document = $cpf ? preg_replace('/\D/', '', $cpf) : '';
  $customer = [
    'name' => $name,
    'email' => $email
  ];
  if ($document && (strlen($document) === 11 || strlen($document) === 14)) {
    $customer['document'] = $document;
    $customer['type'] = strlen($document) === 11 ? 'individual' : 'company';
  }
  $phonePayload = format_phone_payload($phone);
  if ($phonePayload) {
    $customer['phones'] = ['mobile_phone' => $phonePayload];
  }
  return $customer;
}

try {
  $stmt = $pdo->prepare(
    'SELECT r.id, r.date, r.time_start, r.time_end, r.status, r.total_price, r.price,
            c.email, c.name AS client_name, c.cpf AS client_cpf, c.phone AS client_phone,
            rooms.name AS room_name, rooms.daily_rate
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

  $amount = (float)($reservation['total_price'] ?? 0.0);
  if ($amount <= 0) $amount = (float)($reservation['price'] ?? 0.0);
  if ($amount <= 0) $amount = (float)($reservation['daily_rate'] ?? 0.0);
  if ($amount <= 0) {
    echo json_encode(['success' => false, 'error' => 'Não há valor definido para esta reserva.']);
    exit;
  }
  $amountCents = (int)round($amount * 100);

  $customer = build_customer_payload(
    $reservation['client_name'] ?: 'Cliente Ze.EFE',
    $reservation['email'],
    $reservation['client_cpf'] ?? null,
    $reservation['client_phone'] ?? null
  );

  $dateFormatted = '';
  if (!empty($reservation['date'])) {
    $dateFormatted = DateTime::createFromFormat('Y-m-d', $reservation['date'])?->format('d/m/Y') ?? $reservation['date'];
  }
  $description = sprintf(
    'Reserva %s %s',
    $reservation['room_name'] ?: 'Sala Ze.EFE',
    $dateFormatted ?: ''
  );

  $metadata = [
    'entity' => 'reservation',
    'reservation_id' => $reservationId
  ];

  $order = pagarme_create_checkout_order([
    'code' => 'reserva_' . $reservationId . '_' . time(),
    'amount_cents' => $amountCents,
    'description' => $description,
    'customer' => $customer,
    'metadata' => $metadata
  ]);

  $checkoutUrl = pagarme_extract_checkout_url($order);
  if (!$checkoutUrl) {
    throw new RuntimeException('Não foi possível gerar o checkout da Pagar.me.');
  }

  $payment = $order['payments'][0] ?? [];
  $paymentId = $payment['id'] ?? null;
  $expiresSeconds = (int)($config['pagarme']['checkout_expiration_seconds'] ?? 86400);
  $expiresAt = (new DateTimeImmutable())->modify('+' . $expiresSeconds . ' seconds')->format('Y-m-d H:i:s');

  payment_intents_create($pdo, [
    'context' => 'reservation',
    'context_id' => $reservationId,
    'pagarme_order_id' => $order['id'] ?? null,
    'pagarme_payment_id' => $paymentId,
    'checkout_url' => $checkoutUrl,
    'amount' => $amount,
    'status' => 'pending',
    'metadata' => $metadata,
    'expires_at' => $expiresAt,
    'payload' => $order
  ]);

  // atualiza status da reserva para pendente de pagamento
  $stmtUpd = $pdo->prepare('UPDATE reservations SET payment_status = "pendente", updated_at = NOW() WHERE id = ?');
  $stmtUpd->execute([$reservationId]);

  $timeStart = $reservation['time_start'] ?: '08:00';
  $timeEnd = $reservation['time_end'] ?: '20:00';

  $html = mailer_render('payment_link.php', [
    'cliente_nome' => $reservation['client_name'] ?: 'Cliente Ze.EFE',
    'sala_nome' => $reservation['room_name'] ?: 'Sala Ze.EFE',
    'data_formatada' => $dateFormatted,
    'horario' => trim($timeStart . ' - ' . $timeEnd),
    'link_pagamento' => $checkoutUrl
  ]);

  if (!mailer_send($reservation['email'], 'Ze.EFE - finalize o pagamento da sua reserva', $html)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Não foi possível enviar o e-mail com o link de pagamento.']);
    exit;
  }

  echo json_encode([
    'success' => true,
    'message' => 'Link de pagamento gerado.',
    'checkout_url' => $checkoutUrl,
    'order_id' => $order['id'] ?? null
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
