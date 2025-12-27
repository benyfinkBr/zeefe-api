<?php

/**
 * Registro de eventos recebidos via Webhook do Pagar.me
 * Permite auditar confirmações/negações de pagamento independentemente dos e-mails.
 */

function pagarme_events_ensure_table(PDO $pdo): void {
  static $ensured = false;
  if ($ensured) {
    return;
  }

  $sql = "
    CREATE TABLE IF NOT EXISTS pagarme_events (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      hook_id VARCHAR(64) NULL,
      event_type VARCHAR(80) NOT NULL,
      status_code INT NULL,
      status_text VARCHAR(120) NULL,
      entity VARCHAR(20) NULL,
      context_id BIGINT NULL,
      payload LONGTEXT NOT NULL,
      received_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      processed_at DATETIME NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  ";
  $pdo->exec($sql);
  $ensured = true;
}

function pagarme_events_store(PDO $pdo, array $data): int {
  pagarme_events_ensure_table($pdo);
  $stmt = $pdo->prepare("
    INSERT INTO pagarme_events
      (hook_id, event_type, status_code, status_text, entity, context_id, payload)
    VALUES
      (:hook_id, :event_type, :status_code, :status_text, :entity, :context_id, :payload)
  ");
  $stmt->execute([
    ':hook_id' => $data['hook_id'] ?? null,
    ':event_type' => $data['event_type'] ?? '',
    ':status_code' => $data['status_code'] ?? null,
    ':status_text' => $data['status_text'] ?? null,
    ':entity' => $data['entity'] ?? null,
    ':context_id' => $data['context_id'] ?? null,
    ':payload' => $data['payload'] ?? ''
  ]);
  return (int) $pdo->lastInsertId();
}

function pagarme_events_mark_processed(PDO $pdo, int $eventId, string $message = '', bool $success = true): void {
  pagarme_events_ensure_table($pdo);
  $stmt = $pdo->prepare("
    UPDATE pagarme_events
    SET processed_at = NOW(),
        status_text = CONCAT(IF(:success = 1, 'processed:', 'failed:'), COALESCE(:message, status_text))
    WHERE id = :id
  ");
  $stmt->execute([
    ':message' => $message ?: null,
    ':success' => $success ? 1 : 0,
    ':id' => $eventId
  ]);
}
