<?php
require_once __DIR__ . '/apiconfig.php';
require_once __DIR__ . '/lib/policies.php';

try {
  if (!$pdo) {
    throw new RuntimeException($ZEEFE_DB_ERROR ?? $ZEEFE_CONFIG_ERROR ?? 'Conexão indisponível.');
  }
  zeefe_policies_ensure_schema($pdo);
  $stmt = $pdo->query('SELECT room_id, option_key FROM room_policies WHERE active = 1');
  $rows = $stmt ? $stmt->fetchAll(PDO::FETCH_ASSOC) : [];
  echo json_encode(['success' => true, 'data' => $rows]);
} catch (Throwable $e) {
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
