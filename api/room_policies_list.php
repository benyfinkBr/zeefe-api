<?php
require 'apiconfig.php';
require_once __DIR__ . '/lib/policies.php';

header('Content-Type: application/json');

try {
  zeefe_policies_ensure_schema($pdo);
  $input = ($_SERVER['REQUEST_METHOD'] ?? '') === 'GET' ? $_GET : getJsonInput();
  $roomId = isset($input['room_id']) ? (int) $input['room_id'] : 0;
  if ($roomId <= 0) {
    throw new RuntimeException('Informe room_id.');
  }

  $stmt = $pdo->prepare('SELECT * FROM room_policies WHERE room_id = :room AND active = 1 ORDER BY id ASC');
  $stmt->execute([':room' => $roomId]);
  $policies = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

  if (!$policies) {
    echo json_encode(['success' => true, 'policies' => []]);
    exit;
  }

  $policyIds = array_map(static fn($row) => (int) $row['id'], $policies);
  $in = implode(',', array_fill(0, count($policyIds), '?'));
  $priceStmt = $pdo->prepare("SELECT policy_id, date, price FROM room_policy_prices WHERE policy_id IN ({$in}) ORDER BY date ASC");
  $priceStmt->execute($policyIds);
  $prices = $priceStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
  $pricesMap = [];
  foreach ($prices as $row) {
    $pid = (int) $row['policy_id'];
    if (!isset($pricesMap[$pid])) $pricesMap[$pid] = [];
    $pricesMap[$pid][] = [
      'date' => $row['date'],
      'price' => (float) $row['price']
    ];
  }

  $output = array_map(static function ($row) use ($pricesMap) {
    $pid = (int) $row['id'];
    return [
      'id' => $pid,
      'room_id' => (int) $row['room_id'],
      'option_key' => $row['option_key'],
      'label' => $row['label'],
      'base_price' => $row['base_price'] !== null ? (float) $row['base_price'] : null,
      'cancel_days' => $row['cancel_days'] !== null ? (int) $row['cancel_days'] : null,
      'cancel_fee_pct' => $row['cancel_fee_pct'] !== null ? (float) $row['cancel_fee_pct'] : null,
      'charge_timing' => $row['charge_timing'],
      'prices' => $pricesMap[$pid] ?? []
    ];
  }, $policies);

  echo json_encode(['success' => true, 'policies' => $output]);
} catch (Throwable $e) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
