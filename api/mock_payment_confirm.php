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
  $stmt = $pdo->prepare('SELECT id, status, payment_status FROM reservations WHERE id = :id LIMIT 1');
  $stmt->execute([':id' => $reservationId]);
  $row = $stmt->fetch();
  if (!$row) {
    html_response('Pagamento', 'Reserva não encontrada.', false, '../clientes.html');
    exit;
  }

  // Marcar como pago (mock). Mantém status corrente (normalmente confirmada) e sinaliza pagamento.
  $upd = $pdo->prepare('UPDATE reservations SET payment_status = "confirmado", updated_at = NOW() WHERE id = :id');
  $upd->execute([':id' => $reservationId]);

  html_response('Pagamento', 'Pagamento recebido (ambiente de teste). Sua reserva está garantida.', true, '../clientes.html');
} catch (Throwable $e) {
  html_response('Pagamento', 'Erro interno ao registrar o pagamento.', false, '../clientes.html');
}

