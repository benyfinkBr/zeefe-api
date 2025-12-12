<?php
function reservation_load(PDO $pdo, int $reservationId): ?array {
  $stmt = $pdo->prepare('SELECT r.*, rooms.name AS room_name, rooms.street AS room_street, rooms.complement AS room_complement, rooms.city AS room_city, rooms.state AS room_state, clients.name AS client_name, clients.email AS client_email FROM reservations r JOIN rooms ON rooms.id = r.room_id JOIN clients ON clients.id = r.client_id WHERE r.id = ? LIMIT 1');
  $stmt->execute([$reservationId]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$row) {
    return null;
  }

  $visitorsStmt = $pdo->prepare('SELECT v.name, v.email FROM reservation_visitors rv JOIN visitors v ON v.id = rv.visitor_id WHERE rv.reservation_id = ?');
  $visitorsStmt->execute([$reservationId]);
  $visitors = $visitorsStmt->fetchAll(PDO::FETCH_ASSOC);
  $row['visitor_names'] = array_filter(array_map(static function ($item) {
    return $item['name'] ?? '';
  }, $visitors));
  $row['visitor_emails'] = array_filter(array_map(static function ($item) {
    return $item['email'] ?? '';
  }, $visitors));
  return $row;
}

/**
 * Gera ou retorna um código público não sequencial para a reserva.
 * Requer coluna reservations.public_code (VARCHAR) no banco.
 */
function reservation_get_public_code(PDO $pdo, array $reservation): string {
  if (!empty($reservation['public_code'])) {
    return $reservation['public_code'];
  }
  // Gera código do tipo ZF-AB12-9XK3 (10–12 caracteres mistos)
  $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  $length = 10;
  $code = '';
  $max = strlen($alphabet) - 1;
  for ($i = 0; $i < $length; $i++) {
    $code .= $alphabet[random_int(0, $max)];
  }
  $code = 'ZF-' . substr($code, 0, 4) . '-' . substr($code, 4);

  try {
    $stmt = $pdo->prepare('UPDATE reservations SET public_code = :code WHERE id = :id');
    $stmt->execute([':code' => $code, ':id' => $reservation['id']]);
  } catch (Throwable $e) {
    // Se coluna não existir ou houver erro, apenas devolve o código em memória.
  }
  return $code;
}

function reservation_format_date(string $date): string {
  $dt = DateTime::createFromFormat('Y-m-d', $date);
  return $dt ? $dt->format('d/m/Y') : $date;
}

function reservation_format_time(?string $time): string {
  if (!$time) return '--';
  $dt = DateTime::createFromFormat('H:i:s', $time) ?: DateTime::createFromFormat('H:i', $time);
  return $dt ? $dt->format('H:i') : $time;
}
