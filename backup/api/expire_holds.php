<?php
require 'apiconfig.php';
require_once __DIR__ . '/lib/mailer.php';
require_once __DIR__ . '/lib/reservations.php';

// Marks expired payment holds and notifies clients.
// Intended to be called by a cron job (e.g., every hour).

header('Content-Type: application/json');

try {
  // Find reservations with payment_status pending and hold_expires_at in the past
  $stmt = $pdo->query(
    "SELECT id FROM reservations 
     WHERE payment_status = 'pendente' 
       AND hold_expires_at IS NOT NULL 
       AND hold_expires_at < NOW()"
  );
  $expired = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);

  if (!$expired) {
    echo json_encode(['success' => true, 'updated' => 0]);
    exit;
  }

  $upd = $pdo->prepare("UPDATE reservations SET payment_status = 'expirado', updated_at = NOW() WHERE id = :id");

  $updated = 0;
  foreach ($expired as $reservationId) {
    $reservationId = (int)$reservationId;
    $upd->execute([':id' => $reservationId]);
    $updated++;

    // Notify client by email (best-effort)
    try {
      $dados = reservation_load($pdo, $reservationId);
      if ($dados && !empty($dados['client_email'])) {
        $detalhes = [
          'cliente_nome' => $dados['client_name'] ?? '',
          'sala_nome' => $dados['room_name'] ?? '',
          'data_formatada' => reservation_format_date($dados['date']),
          'hora_inicio' => reservation_format_time($dados['time_start'] ?? null),
          'hora_fim' => reservation_format_time($dados['time_end'] ?? null),
        ];
        $html = mailer_render('payment_expired.php', $detalhes);
        mailer_send($dados['client_email'], 'Ze.EFE - Prazo para pagamento expirado', $html);
      }
    } catch (Throwable $e) {
      error_log('Falha ao enviar e-mail de expiração: ' . $e->getMessage());
    }
  }

  echo json_encode(['success' => true, 'updated' => $updated]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

