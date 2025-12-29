<?php
require 'apiconfig.php';
require_once __DIR__ . '/lib/policies.php';

header('Content-Type: application/json');

try {
  zeefe_policies_ensure_schema($pdo);
  $input = ($_SERVER['REQUEST_METHOD'] ?? '') === 'GET' ? $_GET : getJsonInput();
  $advId = isset($input['advertiser_id']) ? (int) $input['advertiser_id'] : 0;
  if ($advId <= 0) {
    throw new RuntimeException('Informe advertiser_id.');
  }

  $stmt = $pdo->prepare(
    'SELECT COUNT(*) FROM room_views rv
     INNER JOIN rooms r ON r.id = rv.room_id
     WHERE r.advertiser_id = :adv
       AND rv.viewed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
  );
  $stmt->execute([':adv' => $advId]);
  $count = (int) $stmt->fetchColumn();

  echo json_encode(['success' => true, 'count' => $count]);
} catch (Throwable $e) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
