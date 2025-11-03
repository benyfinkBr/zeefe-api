<?php
function reservation_load(PDO $pdo, int $reservationId): ?array {
  $stmt = $pdo->prepare('SELECT r.*, rooms.name AS room_name, clients.name AS client_name, clients.email AS client_email FROM reservations r JOIN rooms ON rooms.id = r.room_id JOIN clients ON clients.id = r.client_id WHERE r.id = ? LIMIT 1');
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

function reservation_format_date(string $date): string {
  $dt = DateTime::createFromFormat('Y-m-d', $date);
  return $dt ? $dt->format('d/m/Y') : $date;
}

function reservation_format_time(?string $time): string {
  if (!$time) return '--';
  $dt = DateTime::createFromFormat('H:i:s', $time) ?: DateTime::createFromFormat('H:i', $time);
  return $dt ? $dt->format('H:i') : $time;
}
