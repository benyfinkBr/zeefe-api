<?php
function ledger_table_exists(PDO $pdo): bool {
  try {
    $stmt = $pdo->query("SHOW TABLES LIKE 'ledger_entries'");
    return (bool)$stmt->fetch();
  } catch (Throwable $e) {
    return false;
  }
}

function ledger_entry_exists_by_reservation(PDO $pdo, int $reservationId): bool {
  try {
    $stmt = $pdo->prepare('SELECT id FROM ledger_entries WHERE reservation_id = :res LIMIT 1');
    $stmt->execute([':res' => $reservationId]);
    return (bool)$stmt->fetch(PDO::FETCH_ASSOC);
  } catch (Throwable $e) {
    return false;
  }
}

function ledger_entry_exists_by_txid(PDO $pdo, string $txid): bool {
  try {
    $stmt = $pdo->prepare('SELECT id FROM ledger_entries WHERE txid = :tx LIMIT 1');
    $stmt->execute([':tx' => $txid]);
    return (bool)$stmt->fetch(PDO::FETCH_ASSOC);
  } catch (Throwable $e) {
    return false;
  }
}

function ledger_compute_reservation_net(array $reservation): float {
  $gross = (float)($reservation['amount_gross'] ?? 0.0);
  if ($gross <= 0 && isset($reservation['total_price'])) {
    $gross = (float)$reservation['total_price'];
  }
  if ($gross <= 0 && isset($reservation['daily_rate'])) {
    $gross = (float)$reservation['daily_rate'];
  }
  $voucher = (float)($reservation['voucher_amount'] ?? 0.0);
  $paid = max(0.0, $gross - $voucher);

  $feeAmount = (float)($reservation['fee_amount'] ?? 0.0);
  if ($feeAmount <= 0) {
    $feePct = (float)($reservation['fee_pct_at_time'] ?? 0.0);
    if ($feePct <= 0) {
      $feePct = (float)($reservation['advertiser_fee_pct_room'] ?? 0.0);
    }
    if ($feePct <= 0) {
      $feePct = (float)($reservation['advertiser_fee_pct'] ?? 0.0);
    }
    $feeAmount = round($paid * ($feePct / 100.0), 2);
  }
  $net = max(0.0, $paid - $feeAmount);
  return $net;
}

function ledger_insert_reservation_credit(PDO $pdo, array $reservation, ?string $paidAt = null, ?string $txid = null): void {
  if (!ledger_table_exists($pdo)) return;
  $reservationId = (int)($reservation['id'] ?? 0);
  $advertiserId = (int)($reservation['advertiser_id'] ?? 0);
  if ($reservationId <= 0 || $advertiserId <= 0) return;
  if (ledger_entry_exists_by_reservation($pdo, $reservationId)) return;

  $net = ledger_compute_reservation_net($reservation);
  if ($net <= 0) return;

  $paidAt = $paidAt ?: date('Y-m-d H:i:s');
  $availableAt = (new DateTime($paidAt))->modify('+30 days')->format('Y-m-d H:i:s');
  $desc = 'Crédito de reserva #' . $reservationId;
  $txid = $txid ?: ('reservation_' . $reservationId);

  $stmt = $pdo->prepare('INSERT INTO ledger_entries (advertiser_id, reservation_id, type, description, amount, status, available_at, paid_at, txid, created_at) VALUES (:adv, :res, "credito", :d, :amt, "pendente", :avail, :paid, :tx, NOW())');
  $stmt->execute([
    ':adv' => $advertiserId,
    ':res' => $reservationId,
    ':d' => $desc,
    ':amt' => $net,
    ':avail' => $availableAt,
    ':paid' => $paidAt,
    ':tx' => $txid
  ]);
}

function ledger_compute_workshop_net(float $amountDue, float $feePct): float {
  $fee = round($amountDue * ($feePct / 100.0), 2);
  return max(0.0, $amountDue - $fee);
}

function ledger_insert_workshop_credit(PDO $pdo, array $workshop, array $enrollment, float $feePct, ?string $paidAt = null): void {
  if (!ledger_table_exists($pdo)) return;
  $advertiserId = (int)($workshop['advertiser_id'] ?? 0);
  if ($advertiserId <= 0) return;
  $amountDue = (float)($enrollment['amount_due'] ?? 0.0);
  if ($amountDue <= 0) return;
  $txid = 'workshop_enrollment_' . ($enrollment['id'] ?? '');
  if ($txid === 'workshop_enrollment_' || ledger_entry_exists_by_txid($pdo, $txid)) return;

  $net = ledger_compute_workshop_net($amountDue, $feePct);
  if ($net <= 0) return;
  $paidAt = $paidAt ?: date('Y-m-d H:i:s');
  $availableAt = (new DateTime($paidAt))->modify('+30 days')->format('Y-m-d H:i:s');
  $desc = 'Crédito workshop: ' . ($workshop['title'] ?? 'Evento');

  $stmt = $pdo->prepare('INSERT INTO ledger_entries (advertiser_id, reservation_id, type, description, amount, status, available_at, paid_at, txid, created_at) VALUES (:adv, NULL, "credito", :d, :amt, "pendente", :avail, :paid, :tx, NOW())');
  $stmt->execute([
    ':adv' => $advertiserId,
    ':d' => $desc,
    ':amt' => $net,
    ':avail' => $availableAt,
    ':paid' => $paidAt,
    ':tx' => $txid
  ]);
}
