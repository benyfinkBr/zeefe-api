<?php
require 'apiconfig.php';
require_once __DIR__ . '/lib/policies.php';

header('Content-Type: application/json');

try {
  zeefe_policies_ensure_schema($pdo);
  $data = getJsonInput();
  $roomId = isset($data['room_id']) ? (int) $data['room_id'] : 0;
  $policies = $data['policies'] ?? [];
  if ($roomId <= 0) {
    throw new RuntimeException('Informe room_id.');
  }
  if (!is_array($policies)) {
    throw new RuntimeException('Formato de policies inválido.');
  }

  $pdo->beginTransaction();

  $stmtIds = $pdo->prepare('SELECT id FROM room_policies WHERE room_id = :room');
  $stmtIds->execute([':room' => $roomId]);
  $existingIds = array_map('intval', $stmtIds->fetchAll(PDO::FETCH_COLUMN));
  if ($existingIds) {
    $in = implode(',', array_fill(0, count($existingIds), '?'));
    $pdo->prepare("DELETE FROM room_policy_prices WHERE policy_id IN ({$in})")->execute($existingIds);
    $pdo->prepare("DELETE FROM room_policies WHERE id IN ({$in})")->execute($existingIds);
  }

  $insertPolicy = $pdo->prepare(
    'INSERT INTO room_policies (room_id, option_key, label, base_price, cancel_days, cancel_fee_pct, charge_timing, active)
     VALUES (:room_id, :option_key, :label, :base_price, :cancel_days, :cancel_fee_pct, :charge_timing, 1)'
  );
  $insertPrice = $pdo->prepare(
    'INSERT INTO room_policy_prices (policy_id, date, price) VALUES (:policy_id, :date, :price)'
  );

  foreach ($policies as $policy) {
    if (!is_array($policy)) continue;
    $optionKey = trim((string) ($policy['option_key'] ?? ''));
    $label = trim((string) ($policy['label'] ?? ''));
    $chargeTiming = trim((string) ($policy['charge_timing'] ?? 'confirm'));
    if ($optionKey === '' || $label === '') continue;
    $basePrice = isset($policy['base_price']) ? (float) $policy['base_price'] : null;
    $cancelDays = isset($policy['cancel_days']) ? (int) $policy['cancel_days'] : null;
    $cancelFee = isset($policy['cancel_fee_pct']) ? (float) $policy['cancel_fee_pct'] : null;
    $insertPolicy->execute([
      ':room_id' => $roomId,
      ':option_key' => $optionKey,
      ':label' => $label,
      ':base_price' => $basePrice,
      ':cancel_days' => $cancelDays,
      ':cancel_fee_pct' => $cancelFee,
      ':charge_timing' => $chargeTiming
    ]);
    $policyId = (int) $pdo->lastInsertId();
    $prices = $policy['prices'] ?? [];
    if (is_array($prices)) {
      foreach ($prices as $priceRow) {
        $date = trim((string) ($priceRow['date'] ?? ''));
        $price = isset($priceRow['price']) ? (float) $priceRow['price'] : 0.0;
        if ($date === '') continue;
        $insertPrice->execute([
          ':policy_id' => $policyId,
          ':date' => $date,
          ':price' => $price
        ]);
      }
    }
  }

  $pdo->commit();
  echo json_encode(['success' => true]);
} catch (Throwable $e) {
  if ($pdo->inTransaction()) $pdo->rollBack();
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
