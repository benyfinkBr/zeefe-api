<?php
require_once __DIR__ . '/apiconfig.php';
header('Content-Type: application/json');

try {
  $data = json_decode(file_get_contents('php://input'), true) ?: [];
  $reservationId = isset($data['reservation_id']) ? (int)$data['reservation_id'] : 0;
  $code = strtoupper(trim($data['code'] ?? ''));
  if ($reservationId <= 0 || $code === '') { echo json_encode(['success'=>false,'error'=>'Parâmetros inválidos.']); exit; }

  // Carrega reserva + sala para escopo
  $sel = $pdo->prepare('SELECT r.*, rm.advertiser_id, rm.daily_rate FROM reservations r JOIN rooms rm ON rm.id = r.room_id WHERE r.id = :id LIMIT 1');
  $sel->execute([':id'=>$reservationId]);
  $r = $sel->fetch(PDO::FETCH_ASSOC);
  if (!$r) { echo json_encode(['success'=>false,'error'=>'Reserva não encontrada.']); exit; }

  $amount = (float)($r['total_price'] ?? 0.0);
  if ($amount <= 0 && isset($r['daily_rate'])) $amount = (float)$r['daily_rate'];
  if ($amount < 0) $amount = 0.0;

  // Busca voucher
  $vSel = $pdo->prepare('SELECT * FROM vouchers WHERE code = :c LIMIT 1');
  $vSel->execute([':c'=>$code]);
  $v = $vSel->fetch(PDO::FETCH_ASSOC);
  if (!$v) { echo json_encode(['success'=>false,'error'=>'Voucher não encontrado.']); exit; }

  // Valida
  if (strtolower($v['status'] ?? '') !== 'ativo') { echo json_encode(['success'=>false,'error'=>'Voucher inativo.']); exit; }
  if (!empty($v['starts_at']) && (new DateTimeImmutable()) < new DateTimeImmutable($v['starts_at'])) { echo json_encode(['success'=>false,'error'=>'Voucher ainda não válido.']); exit; }
  if (!empty($v['ends_at']) && (new DateTimeImmutable()) > new DateTimeImmutable($v['ends_at'])) { echo json_encode(['success'=>false,'error'=>'Voucher expirado.']); exit; }
  if (!empty($v['max_uses']) && (int)$v['used_count'] >= (int)$v['max_uses']) { echo json_encode(['success'=>false,'error'=>'Limite de uso atingido.']); exit; }
  if (!empty($v['advertiser_id']) && !empty($r['advertiser_id']) && (int)$v['advertiser_id'] !== (int)$r['advertiser_id']) { echo json_encode(['success'=>false,'error'=>'Voucher não aplicável para este anunciante.']); exit; }
  if (!empty($v['room_id']) && (int)$v['room_id'] !== (int)$r['room_id']) { echo json_encode(['success'=>false,'error'=>'Voucher não aplicável para esta sala.']); exit; }

  $type = strtolower($v['type'] ?? 'percent');
  $val = (float)($v['value'] ?? 0);
  $discount = 0.0;
  if ($type === 'percent') $discount = round($amount * ($val/100.0), 2);
  else $discount = round(min($val, $amount), 2);

  // Atualiza reserva (não contabiliza uso aqui; contabiliza ao confirmar pagamento)
  $upd = $pdo->prepare('UPDATE reservations SET voucher_code = :c, voucher_amount = :d, updated_at = NOW() WHERE id = :id');
  $upd->execute([':c'=>$v['code'], ':d'=>$discount, ':id'=>$reservationId]);

  echo json_encode(['success'=>true, 'voucher'=>['code'=>$v['code'],'type'=>$type,'value'=>$val,'discount'=>$discount], 'amounts'=>['gross'=>$amount,'payable'=>max(0,$amount-$discount)]]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'error'=>'Erro interno: '.$e->getMessage()]);
}

