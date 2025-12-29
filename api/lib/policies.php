<?php

function zeefe_policies_ensure_schema(PDO $pdo): void {
  try {
    $pdo->exec(
      "CREATE TABLE IF NOT EXISTS room_policies (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        room_id BIGINT NOT NULL,
        option_key VARCHAR(40) NOT NULL,
        label VARCHAR(120) NOT NULL,
        cancel_days INT NULL,
        cancel_fee_pct DECIMAL(5,2) NULL,
        charge_timing ENUM('confirm','cancel_window','day_before') NOT NULL DEFAULT 'confirm',
        active TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_room_policies_room (room_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
  } catch (Throwable $e) {
    error_log('[Policies] Falha ao garantir tabela room_policies: ' . $e->getMessage());
  }

  try {
    $pdo->exec(
      "CREATE TABLE IF NOT EXISTS room_policy_prices (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        policy_id BIGINT NOT NULL,
        date DATE NOT NULL,
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_policy_date (policy_id, date),
        INDEX idx_policy_prices_policy (policy_id),
        CONSTRAINT fk_policy_prices_policy FOREIGN KEY (policy_id) REFERENCES room_policies (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
  } catch (Throwable $e) {
    error_log('[Policies] Falha ao garantir tabela room_policy_prices: ' . $e->getMessage());
  }

  try {
    $pdo->exec(
      "CREATE TABLE IF NOT EXISTS room_views (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        room_id BIGINT NOT NULL,
        session_id VARCHAR(64) NULL,
        user_agent VARCHAR(255) NULL,
        ip VARCHAR(45) NULL,
        viewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_room_views_room (room_id),
        INDEX idx_room_views_date (viewed_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
  } catch (Throwable $e) {
    error_log('[Policies] Falha ao garantir tabela room_views: ' . $e->getMessage());
  }

  $columns = [
    'policy_id' => 'BIGINT NULL',
    'policy_key' => 'VARCHAR(40) NULL',
    'policy_label' => 'VARCHAR(120) NULL',
    'policy_cancel_days' => 'INT NULL',
    'policy_cancel_fee_pct' => 'DECIMAL(5,2) NULL',
    'policy_charge_timing' => "VARCHAR(20) NULL",
    'policy_charge_at' => 'DATETIME NULL'
  ];

  foreach ($columns as $col => $type) {
    try {
      $stmt = $pdo->prepare("SHOW COLUMNS FROM reservations LIKE :col");
      $stmt->execute([':col' => $col]);
      if (!$stmt->fetch(PDO::FETCH_ASSOC)) {
        $pdo->exec("ALTER TABLE reservations ADD COLUMN {$col} {$type}");
      }
    } catch (Throwable $e) {
      error_log('[Policies] Falha ao garantir coluna reservations.' . $col . ': ' . $e->getMessage());
    }
  }
}
