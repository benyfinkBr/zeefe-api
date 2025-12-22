<?php
declare(strict_types=1);

/**
 * Garante a existência de colunas usadas pela migração Stripe/Pagar.me.
 * Evita placeholders em DDL e mantém compatibilidade com MySQL compartilhado.
 */
function ensureColumn(PDO $pdo, string $table, string $column, string $definition, ?string $after = null): void {
  static $allowedTables = ['clients', 'customer_cards'];
  static $allowedColumns = [
    'clients' => ['stripe_customer_id', 'pagarme_customer_id'],
    'customer_cards' => [
      'stripe_customer_id',
      'stripe_payment_method_id',
      'billing_name',
      'billing_email',
      'billing_zip',
      'fingerprint',
      'pagarme_card_id'
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
