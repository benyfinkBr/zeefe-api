<?php
require_once __DIR__ . '/apiconfig.php';
header('Content-Type: application/json');

// Input: { code, room_id?, advertiser_id?, amount? }
try {
  $data = json_decode(file_get_contents('php://input'), true) ?: [];
  $code = strtoupper(trim($data['code'] ?? ''));
  $roomId = isset($data['room_id']) ? (int)$data['room_id'] : null;
  $advId = isset($data['advertiser_id']) ? (int)$data['advertiser_id'] : null;
  $amount = isset($data['amount']) ? (float)$data['amount'] : null;

  if ($code === '') { echo json_encode(['success'=>false,'error'=>'Informe o código.']); exit; }

  $stmt = $pdo->prepare('SELECT * FROM vouchers WHERE code = :c LIMIT 1');
  $stmt->execute([':c' => $code]);
  $v = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$v) { echo json_encode(['success'=>false,'error'=>'Voucher não encontrado.']); exit; }

  // Calcula quantas vezes já foi usado (reservations.voucher_code)
  $usedCount = 0;
  try {
    $usedStmt = $pdo->prepare('SELECT COUNT(*) AS total FROM reservations WHERE voucher_code = :c');
    $usedStmt->execute([':c' => $code]);
    $rowUsed = $usedStmt->fetch(PDO::FETCH_ASSOC);
    if ($rowUsed && isset($rowUsed['total'])) {
      $usedCount = (int)$rowUsed['total'];
    }
  } catch (Throwable $ignore) {
    $usedCount = 0;
  }

  // Regras básicas
  if (strtolower($v['status'] ?? '') !== 'ativo') { echo json_encode(['success'=>false,'error'=>'Voucher inativo.']); exit; }
  $startRaw = $v['starts_at'] ?? $v['valid_from'] ?? null;
  $endRaw   = $v['ends_at']   ?? $v['valid_to']   ?? null;
  $maxUses  = $v['max_uses']  ?? $v['max_redemptions'] ?? null;
  if (!empty($startRaw) && (new DateTimeImmutable()) < new DateTimeImmutable($startRaw)) { echo json_encode(['success'=>false,'error'=>'Voucher ainda não válido.']); exit; }
  if (!empty($endRaw) && (new DateTimeImmutable()) > new DateTimeImmutable($endRaw)) { echo json_encode(['success'=>false,'error'=>'Voucher expirado.']); exit; }
  if (!empty($maxUses) && $usedCount >= (int)$maxUses) { echo json_encode(['success'=>false,'error'=>'Limite de uso atingido.']); exit; }
  if (!empty($v['advertiser_id']) && $advId && (int)$v['advertiser_id'] !== (int)$advId) { echo json_encode(['success'=>false,'error'=>'Voucher não aplicável para este anunciante.']); exit; }
  if (!empty($v['room_id']) && $roomId && (int)$v['room_id'] !== (int)$roomId) { echo json_encode(['success'=>false,'error'=>'Voucher não aplicável para esta sala.']); exit; }

  $type = strtolower($v['type'] ?? 'percent');
  $val = (float)($v['value'] ?? 0);
  $discount = 0.0;
  if ($amount !== null) {
    if ($type === 'percent') $discount = round(max(0, $amount) * ($val/100.0), 2);
    else $discount = round(min($val, max(0, $amount)), 2);
  }

  echo json_encode([
    'success' => true,
    'voucher' => [
      'code' => $v['code'],
      'type' => $type,
      'value' => $val,
      'max_uses' => $v['max_uses'] ?? null,
      'used_count' => $usedCount,
      'advertiser_id' => $v['advertiser_id'] ?? null,
      'room_id' => $v['room_id'] ?? null,
      'discount' => $discount
    ]
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'error'=>'Erro interno: '.$e->getMessage()]);
}
