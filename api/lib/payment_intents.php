<?php

/**
 * Helper responsável por registrar e sincronizar intentos de pagamento
 * (checkout da Pagar.me) vinculados às reservas e workshops.
 */

function payment_intents_ensure_table(PDO $pdo): void {
  static $ensured = false;
  if ($ensured) return;
  $sql = "
    CREATE TABLE IF NOT EXISTS payment_intents (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      context ENUM('reservation','workshop') NOT NULL,
      context_id BIGINT UNSIGNED NOT NULL,
      pagarme_order_id VARCHAR(80) DEFAULT NULL,
      pagarme_payment_id VARCHAR(80) DEFAULT NULL,
      checkout_url TEXT,
      amount DECIMAL(10,2) NOT NULL DEFAULT 0,
      status ENUM('pending','paid','failed','canceled','expired') NOT NULL DEFAULT 'pending',
      metadata TEXT NULL,
      expires_at DATETIME DEFAULT NULL,
      last_payload TEXT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_context_order (context, context_id, pagarme_order_id),
      KEY idx_order (pagarme_order_id),
      KEY idx_payment (pagarme_payment_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  ";
  $pdo->exec($sql);
  $ensured = true;
}

function payment_intents_create(PDO $pdo, array $data): int {
  payment_intents_ensure_table($pdo);
  $stmt = $pdo->prepare("
    INSERT INTO payment_intents
      (context, context_id, pagarme_order_id, pagarme_payment_id, checkout_url, amount, status, metadata, expires_at, last_payload)
    VALUES
      (:context, :context_id, :order_id, :payment_id, :url, :amount, :status, :metadata, :expires, :payload)
  ");
  $stmt->execute([
    ':context' => $data['context'],
    ':context_id' => $data['context_id'],
    ':order_id' => $data['pagarme_order_id'] ?? null,
    ':payment_id' => $data['pagarme_payment_id'] ?? null,
    ':url' => $data['checkout_url'] ?? null,
    ':amount' => $data['amount'] ?? 0,
    ':status' => $data['status'] ?? 'pending',
    ':metadata' => isset($data['metadata']) ? json_encode($data['metadata']) : null,
    ':expires' => $data['expires_at'] ?? null,
    ':payload' => isset($data['payload']) ? json_encode($data['payload']) : null
  ]);
  return (int)$pdo->lastInsertId();
}

function payment_intents_update_by_order(PDO $pdo, string $orderId = null, string $paymentId = null, array $fields = []): void {
  if (!$orderId && !$paymentId) return;
  payment_intents_ensure_table($pdo);
  $clauses = [];
  $params = [];
  if ($fields) {
    foreach ($fields as $key => $value) {
      $clauses[] = "$key = :$key";
      $params[":$key"] = $value;
    }
  }
  if (!$clauses) return;
  $sql = 'UPDATE payment_intents SET ' . implode(', ', $clauses) . ' WHERE ';
  if ($orderId && $paymentId) {
    $sql .= '(pagarme_order_id = :oid OR pagarme_payment_id = :pid)';
    $params[':oid'] = $orderId;
    $params[':pid'] = $paymentId;
  } elseif ($orderId) {
    $sql .= 'pagarme_order_id = :oid';
    $params[':oid'] = $orderId;
  } else {
    $sql .= 'pagarme_payment_id = :pid';
    $params[':pid'] = $paymentId;
  }
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
}

function payment_intents_find(PDO $pdo, string $orderId = null, string $paymentId = null) {
  if (!$orderId && !$paymentId) return null;
  payment_intents_ensure_table($pdo);
  if ($orderId) {
    $stmt = $pdo->prepare('SELECT * FROM payment_intents WHERE pagarme_order_id = ? LIMIT 1');
    $stmt->execute([$orderId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row) return $row;
  }
  if ($paymentId) {
    $stmt = $pdo->prepare('SELECT * FROM payment_intents WHERE pagarme_payment_id = ? LIMIT 1');
    $stmt->execute([$paymentId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row) return $row;
  }
  return null;
}
