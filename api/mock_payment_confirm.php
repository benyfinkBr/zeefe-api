<?php
require 'apiconfig.php';

// Simple mock endpoint to mark a reservation as paid for testing.
// Usage: /api/mock_payment_confirm.php?reservation=123

function html_response(string $title, string $message, bool $ok = true, ?string $redirect = null): void {
  header('Content-Type: text/html; charset=UTF-8');
  $meta = $redirect ? '<meta http-equiv="refresh" content="3;url=' . htmlspecialchars($redirect) . '">' : '';
  echo '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8">' . $meta . '<meta name="viewport" content="width=device-width, initial-scale=1">'
    . '<title>' . htmlspecialchars($title) . '</title>'
    . '<style>body{font-family:Arial,Helvetica,sans-serif;background:#F5F0E9;margin:0;padding:32px;color:#1D413A}'
    . '.card{max-width:560px;margin:40px auto;background:#fff;border:1px solid rgba(29,65,58,.12);border-radius:16px;padding:28px;box-shadow:0 8px 24px rgba(29,65,58,.12)}'
    . 'h1{font-size:20px;margin:0 0 10px}p{margin:8px 0 16px;line-height:1.6}.ok{color:#1D413A}.err{color:#B54A3A}'
    . '.btn{display:inline-block;background:#1D413A;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600}'
    . '.hint{color:#8A7766;font-size:13px}</style></head><body><div class="card">'
    . '<h1>' . ($ok ? 'Pagamento recebido' : 'Não foi possível') . '</h1>'
    . '<p class="' . ($ok ? 'ok' : 'err') . '">' . htmlspecialchars($message) . '</p>'
    . '<p><a class="btn" href="' . htmlspecialchars($redirect ?? ('../clientes.html')) . '">Ir para o Portal do Cliente</a></p>'
    . ($redirect ? '<p class="hint">Você será redirecionado em alguns segundos.</p>' : '')
    . '</div></body></html>';
}

$reservationId = isset($_GET['reservation']) ? (int) $_GET['reservation'] : 0;
if ($reservationId <= 0) {
  html_response('Pagamento', 'Reserva inválida.', false, '../clientes.html');
  exit;
}

try {
$stmt = $pdo->prepare('SELECT r.*, rm.advertiser_id, rm.daily_rate FROM reservations r JOIN rooms rm ON rm.id = r.room_id WHERE r.id = :id LIMIT 1');
$stmt->execute([':id' => $reservationId]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$row) {
  html_response('Pagamento', 'Reserva não encontrada.', false, '../clientes.html');
  exit;
}

// Calcula fee do anunciante (ou 15% como padrão)
$feePct = 15.00;
if (!empty($row['advertiser_id'])) {
  try {
    $advSel = $pdo->prepare('SELECT fee_pct FROM advertisers WHERE id = :id LIMIT 1');
    $advSel->execute([':id' => $row['advertiser_id']]);
    if ($adv = $advSel->fetch(PDO::FETCH_ASSOC)) {
      if ($adv['fee_pct'] !== null && $adv['fee_pct'] !== '') $feePct = (float)$adv['fee_pct'];
    }
  } catch (Throwable $e) { /* segue com 15% */ }
}

// Valor bruto (pago): usa total_price se existir; senão, fallback daily_rate
$gross = (float)($row['total_price'] ?? 0.00);
if ($gross <= 0 && isset($row['daily_rate'])) { $gross = (float)$row['daily_rate']; }
if ($gross < 0) $gross = 0.00;
$voucher = (float)($row['voucher_amount'] ?? 0.00);
$paid = max(0.00, $gross - $voucher);
$feeAmount = round($paid * ($feePct/100.0), 2);
$net = round($paid - $feeAmount, 2);

// Atualiza reserva como paga e tenta persistir valores/fee se colunas existirem
$pdo->beginTransaction();
try {
  $upd = $pdo->prepare('UPDATE reservations SET payment_status = "confirmado", updated_at = NOW() WHERE id = :id');
  $upd->execute([':id' => $reservationId]);
  try {
    $updVals = $pdo->prepare('UPDATE reservations SET amount_gross = :g, fee_pct_at_time = :p, fee_amount = :f, amount_net = :n WHERE id = :id');
    $updVals->execute([':g'=>$paid, ':p'=>$feePct, ':f'=>$feeAmount, ':n'=>$net, ':id'=>$reservationId]);
  } catch (Throwable $ignore) { /* colunas podem não existir ainda */ }

  // Lançamento no ledger para anunciante (crédito pendente com D+30)
  if (!empty($row['advertiser_id']) && $net > 0) {
    try {
      $ins = $pdo->prepare('INSERT INTO ledger_entries (advertiser_id, reservation_id, type, description, amount, status, available_at, created_at) VALUES (:adv, :res, "credito", :d, :amt, "pendente", DATE_ADD(NOW(), INTERVAL 30 DAY), NOW())');
      $desc = 'Crédito de reserva #' . $reservationId;
      $ins->execute([':adv'=>$row['advertiser_id'], ':res'=>$reservationId, ':d'=>$desc, ':amt'=>$net]);
    } catch (Throwable $e) { /* se tabela/colunas não existirem, segue */ }
  }

  $pdo->commit();
} catch (Throwable $e) {
  if ($pdo->inTransaction()) $pdo->rollBack();
  html_response('Pagamento', 'Erro interno ao registrar o pagamento.', false, '../clientes.html');
  exit;
}

html_response('Pagamento', 'Pagamento recebido (ambiente de teste). Sua reserva está garantida.', true, '../clientes.html');
} catch (Throwable $e) {
  html_response('Pagamento', 'Erro interno ao registrar o pagamento.', false, '../clientes.html');
}
