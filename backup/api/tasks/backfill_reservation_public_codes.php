<?php
// Script de manutenção para gerar códigos públicos (não sequenciais) para reservas existentes.
// Execução: chamar via browser ou CLI (php backfill_reservation_public_codes.php)

require_once __DIR__ . '/../apiconfig.php';
require_once __DIR__ . '/../lib/reservations.php';

header('Content-Type: text/plain; charset=UTF-8');

try {
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

  $sql = "SELECT id, public_code FROM reservations WHERE public_code IS NULL OR public_code = ''";
  $stmt = $pdo->query($sql);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

  if (!$rows) {
    echo "Nenhuma reserva sem public_code encontrada.\n";
    exit;
  }

  echo "Gerando códigos públicos para " . count($rows) . " reservas...\n";

  $updated = 0;
  foreach ($rows as $row) {
    $code = reservation_get_public_code($pdo, $row);
    $updated++;
    echo "Reserva #{$row['id']} -> {$code}\n";
  }

  echo "Concluído. {$updated} reservas atualizadas.\n";
} catch (Throwable $e) {
  http_response_code(500);
  echo "Erro: " . $e->getMessage() . "\n";
}

