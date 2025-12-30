<?php
declare(strict_types=1);

/**
 * Garante a existência de colunas usadas pela migração Stripe/Pagar.me.
 * Evita placeholders em DDL e mantém compatibilidade com MySQL compartilhado.
 */
function ensureColumn(PDO $pdo, string $table, string $column, string $definition, ?string $after = null): void {
  static $allowedTables = ['clients', 'customer_cards', 'reservations', 'payments', 'payment_intents'];
  static $allowedColumns = [
    'clients' => ['stripe_customer_id', 'pagarme_customer_id'],
    'customer_cards' => [
      'stripe_customer_id',
      'stripe_payment_method_id',
      'card_nickname',
      'billing_name',
      'billing_email',
      'billing_zip',
      'fingerprint',
      'pagarme_card_id'
    ],
    'reservations' => [
      'stripe_payment_intent_id',
      'stripe_charge_id',
      'payment_confirmed_at'
    ],
    'payments' => [
      'provider',
      'currency',
      'amount_cents',
      'stripe_payment_intent_id',
      'stripe_charge_id',
      'stripe_customer_id',
      'stripe_payment_method_id',
      'failure_code',
      'failure_message'
    ],
    'payment_intents' => [
      'stripe_payment_intent_id',
      'stripe_setup_intent_id',
      'stripe_checkout_session_id',
      'stripe_client_secret',
      'stripe_status'
    ],
  ];

  if (!in_array($table, $allowedTables, true)) {
    throw new RuntimeException("Tabela não permitida: {$table}");
  }
  if (!in_array($column, $allowedColumns[$table] ?? [], true)) {
    throw new RuntimeException("Coluna não permitida: {$table}.{$column}");
  }

  $check = $pdo->prepare(
    "SELECT 1
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?
     LIMIT 1"
  );
  $check->execute([$table, $column]);
  if ($check->fetchColumn()) {
    return;
  }

  $sql = sprintf('ALTER TABLE `%s` ADD COLUMN `%s` %s', $table, $column, $definition);
  if ($after) {
    $sql .= sprintf(' AFTER `%s`', $after);
  }

  $pdo->exec($sql);
}

function db_table_exists(PDO $pdo, string $table): bool {
  $stmt = $pdo->prepare(
    "SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? LIMIT 1"
  );
  $stmt->execute([$table]);
  return (bool)$stmt->fetchColumn();
}

function zeefe_stripe_ensure_events_table(PDO $pdo): void {
  static $ensured = false;
  if ($ensured) {
    return;
  }

  try {
    if (!db_table_exists($pdo, 'stripe_events') && db_table_exists($pdo, 'pagarme_events')) {
      $pdo->exec('RENAME TABLE `pagarme_events` TO `stripe_events`');
    }
  } catch (Throwable $e) {
    error_log('[Stripe] Falha ao renomear tabela de eventos: ' . $e->getMessage());
  }

  if (!db_table_exists($pdo, 'stripe_events')) {
    $sql = "
      CREATE TABLE stripe_events (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        event_id VARCHAR(80) NULL,
        event_type VARCHAR(80) NOT NULL,
        status_code INT NULL,
        status_text VARCHAR(120) NULL,
        entity VARCHAR(40) NULL,
        context_id BIGINT NULL,
        payload LONGTEXT NOT NULL,
        received_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        processed_at DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    try {
      $pdo->exec($sql);
    } catch (Throwable $e) {
      error_log('[Stripe] Falha ao criar tabela stripe_events: ' . $e->getMessage());
    }
  }

  $ensured = true;
}
