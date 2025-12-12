<?php
require 'apiconfig.php';
require_once __DIR__ . '/lib/mailer.php';
require_once __DIR__ . '/lib/reservations.php';
require_once __DIR__ . '/lib/pagarme.php';

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
    // Confirma e tenta cobrar automaticamente com o cartão salvo do cliente
    $charge = cobrarReservaComCartaoSalvo($pdo, $reservationId);
    // Se chegou aqui sem exceção, marcou como pago
    $stmtUpd = $pdo->prepare('UPDATE reservations SET status = ?, payment_status = "confirmado", hold_expires_at = NULL, updated_at = NOW() WHERE id = ?');
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
  http_response_code(400);
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
      $detalhes['bloco_informacoes'] = '<p style="margin:0 0 10px;font-size:15px;line-height:1.6;">Sua reserva foi confirmada. Vamos processar o pagamento usando o método principal já cadastrado.</p><p style="margin:0 0 20px;font-size:14px;color:#8A7766;">Após a confirmação do pagamento, você receberá os detalhes e poderá convidar os visitantes.</p>';
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

/**
 * Cobra a reserva no ato da confirmação usando o cartão salvo mais recente do cliente.
 * Lança exceção se não conseguir.
 */
function cobrarReservaComCartaoSalvo(PDO $pdo, int $reservationId): array {
  // Carrega dados essenciais da reserva/cliente
  $stmt = $pdo->prepare('SELECT r.id, r.client_id, r.total_price, r.voucher_amount, r.price, r.room_id, rm.advertiser_id, rm.daily_rate, r.title FROM reservations r LEFT JOIN rooms rm ON rm.id = r.room_id WHERE r.id = ? LIMIT 1');
  $stmt->execute([$reservationId]);
  $res = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$res) {
    throw new RuntimeException('Reserva não encontrada para cobrança.');
  }

  $clientId = (int)$res['client_id'];
  if ($clientId <= 0) {
    throw new RuntimeException('Cliente inválido para esta reserva.');
  }

  // Valor bruto da reserva: tenta total_price > price > daily_rate da sala
  $gross = (float)($res['total_price'] ?? 0.0);
  if ($gross <= 0 && isset($res['price'])) {
    $gross = (float)$res['price'];
  }
  if ($gross <= 0 && isset($res['daily_rate'])) {
    $gross = (float)$res['daily_rate'];
  }
  $voucher = (float)($res['voucher_amount'] ?? 0.0);
  $paid = max(0.0, $gross - $voucher);
  if ($paid <= 0) {
    // Sem valor a cobrar: apenas marca pago
    $pdo->prepare('UPDATE reservations SET payment_status = "confirmado", amount_gross = 0, amount_net = 0, fee_amount = 0 WHERE id = ?')
        ->execute([$reservationId]);
    return ['skipped' => true];
  }
  $amountCents = (int) round($paid * 100);

  // Cartão salvo (mais recente ativo)
  $stmtCard = $pdo->prepare('SELECT * FROM customer_cards WHERE client_id = :cid AND status = "active" ORDER BY updated_at DESC, id DESC LIMIT 1');
  $stmtCard->execute([':cid' => $clientId]);
  $card = $stmtCard->fetch(PDO::FETCH_ASSOC);
  if (!$card || empty($card['pagarme_card_id'])) {
    throw new RuntimeException('Cliente não possui cartão salvo para cobrança automática.');
  }

  // Customer na Pagar.me
  $customerId = $card['pagarme_customer_id'] ?? null;
  if (!$customerId) {
    $stmtCli = $pdo->prepare('SELECT pagarme_customer_id FROM clients WHERE id = ? LIMIT 1');
    $stmtCli->execute([$clientId]);
    $customerId = $stmtCli->fetchColumn();
  }
  if (!$customerId) {
    throw new RuntimeException('Não foi possível localizar o customer na Pagar.me.');
  }

  $metadata = [
    'context' => 'reservation',
    'reservation_id' => $reservationId,
    'client_id' => $clientId,
    'room_id' => $res['room_id'] ?? null
  ];

  // Payload conforme documentação v5 (orders + card_id)
  $payload = [
    'code'        => 'res_' . $reservationId . '_' . uniqid(),
    'currency'    => 'BRL',
    'customer_id' => $customerId,
    'items' => [[
      'amount'      => $amountCents,
      'description' => $res['title'] ?: ('Reserva #' . $reservationId),
      'quantity'    => 1,
      'code'        => 'reservation'
    ]],
    'payments' => [[
      'payment_method' => 'credit_card',
      'amount'         => $amountCents,
      'credit_card'    => [
        'card_id' => $card['pagarme_card_id'],
      ],
      'capture' => true
    ]],
    'metadata' => $metadata
  ];

  $order = pagarme_request('POST', '/orders', $payload);
  $charge = $order['charges'][0] ?? [];
  $status = strtolower($charge['status'] ?? '');

  if (!in_array($status, ['paid','authorized'], true)) {
    $reason = $status ?: 'sem status retornado';
    $lastTx = $charge['last_transaction'] ?? null;
    if ($lastTx) {
      $reason .= ' | transaction_status=' . ($lastTx['status'] ?? 'unknown');
      if (!empty($lastTx['acquirer_return_message'])) {
        $reason .= ' | acquirer_message=' . $lastTx['acquirer_return_message'];
      }
    }
    throw new RuntimeException('Cobrança não concluída: ' . $reason);
  }

  // Fee do anunciante (ou 15% padrão)
  $feePct = 15.0;
  if (!empty($res['advertiser_id'])) {
    try {
      $advSel = $pdo->prepare('SELECT fee_pct FROM advertisers WHERE id = :id LIMIT 1');
      $advSel->execute([':id' => $res['advertiser_id']]);
      $adv = $advSel->fetch(PDO::FETCH_ASSOC);
      if ($adv && $adv['fee_pct'] !== null && $adv['fee_pct'] !== '') {
        $feePct = (float)$adv['fee_pct'];
      }
    } catch (Throwable $ignore) {}
  }
  $feeAmount = round($paid * ($feePct / 100.0), 2);
  $net = round($paid - $feeAmount, 2);

  // Atualiza valores financeiros
  try {
    $updVals = $pdo->prepare('UPDATE reservations SET amount_gross = :g, fee_pct_at_time = :p, fee_amount = :f, amount_net = :n WHERE id = :id');
    $updVals->execute([':g' => $paid, ':p' => $feePct, ':f' => $feeAmount, ':n' => $net, ':id' => $reservationId]);
  } catch (Throwable $ignore) {}

  // Lança crédito no ledger do anunciante
  if (!empty($res['advertiser_id']) && $net > 0) {
    try {
      $ins = $pdo->prepare('INSERT INTO ledger_entries (advertiser_id, reservation_id, type, description, amount, status, available_at, created_at) VALUES (:adv, :res, "credito", :d, :amt, "pendente", DATE_ADD(NOW(), INTERVAL 30 DAY), NOW())');
      $desc = 'Crédito de reserva #' . $reservationId;
      $ins->execute([':adv' => $res['advertiser_id'], ':res' => $reservationId, ':d' => $desc, ':amt' => $net]);
    } catch (Throwable $ignore) {}
  }

  return [
    'order_id' => $order['id'] ?? null,
    'charge_id' => $charge['id'] ?? null,
    'status' => $status
  ];
}
