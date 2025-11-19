<?php
require 'apiconfig.php';

$table = preg_replace('/[^a-z_]/', '', $_GET['table'] ?? '');
if (!$table) {
  echo json_encode(['success' => false, 'error' => 'Tabela inválida.']);
  exit;
}

try {
  switch ($table) {
    case 'rooms':
      $sql = "
        SELECT r.*, GROUP_CONCAT(ra.amenity_id) AS amenity_ids
        FROM rooms r
        LEFT JOIN room_amenities ra ON ra.room_id = r.id
        GROUP BY r.id
        ORDER BY r.id DESC
      ";
      $stmt = $pdo->query($sql);
      $rows = $stmt->fetchAll();

      foreach ($rows as &$row) {
        $row['amenities'] = [];
        if (!empty($row['amenity_ids'])) {
          $row['amenities'] = array_map('intval', array_filter(array_map('trim', explode(',', $row['amenity_ids']))));
        }
        unset($row['amenity_ids']);
        $row['facilitated_access'] = isset($row['facilitated_access']) ? (int) $row['facilitated_access'] : 0;
      }
      unset($row);

      echo json_encode(['success' => true, 'data' => $rows]);
      break;

    case 'clients':
      $conditions = [];
      $params = [];
      if (!empty($_GET['company_id'])) {
        $conditions[] = 'c.company_id = :company_id';
        $params[':company_id'] = (int) $_GET['company_id'];
      }
      if (!empty($_GET['status'])) {
        $conditions[] = 'c.status = :status';
        $params[':status'] = preg_replace('/[^a-z_]/i', '', $_GET['status']);
      }
      $sql = "
        SELECT c.*, comp.nome_fantasia AS company_name, comp.razao_social AS company_razao
        FROM clients c
        LEFT JOIN companies comp ON comp.id = c.company_id
      ";
      if ($conditions) {
        $sql .= ' WHERE ' . implode(' AND ', $conditions);
      }
      $sql .= ' ORDER BY c.id DESC';
      $stmt = $pdo->prepare($sql);
      $stmt->execute($params);
      $rows = $stmt->fetchAll();

      echo json_encode(['success' => true, 'data' => $rows]);
      break;

    case 'reservations':
      $conditions = [];
      $params = [];

      if (!empty($_GET['room_id'])) {
        $conditions[] = 'r.room_id = :room_id';
        $params[':room_id'] = (int) $_GET['room_id'];
      }

      if (!empty($_GET['client_id'])) {
        $conditions[] = 'r.client_id = :client_id';
        $params[':client_id'] = (int) $_GET['client_id'];
      }

      if (!empty($_GET['status'])) {
        $status = preg_replace('/[^a-z_]/', '', $_GET['status']);
        if ($status) {
          $conditions[] = 'r.status = :status';
          $params[':status'] = $status;
        }
      }

      $dateRange = $_GET['date_range'] ?? '';
      $today = new DateTimeImmutable('today');

      switch ($dateRange) {
        case 'past_30':
        case 'past_60':
        case 'past_90':
          $days = (int) substr($dateRange, 5);
          $from = $today->modify("-{$days} days")->format('Y-m-d');
          $to = $today->format('Y-m-d');
          $conditions[] = '(r.date BETWEEN :date_from AND :date_to)';
          $params[':date_from'] = $from;
          $params[':date_to'] = $to;
          break;
        case 'future':
          $conditions[] = 'r.date >= :date_from';
          $params[':date_from'] = $today->format('Y-m-d');
          break;
      }

      $dateFrom = $_GET['date_from'] ?? '';
      $dateTo   = $_GET['date_to'] ?? '';
      if ($dateRange === 'custom') {
        if ($dateFrom) {
          $conditions[] = 'r.date >= :custom_from';
          $params[':custom_from'] = $dateFrom;
        }
        if ($dateTo) {
          $conditions[] = 'r.date <= :custom_to';
          $params[':custom_to'] = $dateTo;
        }
      }

      $sql = "
        SELECT r.*,
               rooms.name  AS room_name,
               clients.name AS client_name,
               GROUP_CONCAT(DISTINCT rv.visitor_id) AS visitor_ids,
               GROUP_CONCAT(DISTINCT CONCAT(rv.visitor_id, '::', COALESCE(vis.name,'')) SEPARATOR '||') AS visitor_info
        FROM reservations r
        LEFT JOIN rooms   ON rooms.id = r.room_id
        LEFT JOIN clients ON clients.id = r.client_id
        LEFT JOIN reservation_visitors rv ON rv.reservation_id = r.id
        LEFT JOIN visitors vis ON vis.id = rv.visitor_id
      ";

      if ($conditions) {
        $sql .= ' WHERE ' . implode(' AND ', $conditions);
      }

      $sql .= ' GROUP BY r.id ORDER BY r.date DESC, r.time_start ASC';

      $stmt = $pdo->prepare($sql);
      $stmt->execute($params);
      $rows = $stmt->fetchAll();

      foreach ($rows as &$row) {
        $row['visitors'] = [];
        $row['visitor_names'] = [];
        if (!empty($row['visitor_ids'])) {
          $row['visitors'] = array_values(array_filter(array_map('intval', explode(',', $row['visitor_ids']))));
        }
        if (!empty($row['visitor_info'])) {
          $names = [];
          foreach (explode('||', $row['visitor_info']) as $chunk) {
            $parts = explode('::', $chunk, 2);
            if (count($parts) === 2 && trim($parts[1]) !== '') {
              $names[] = $parts[1];
            }
          }
          $row['visitor_names'] = $names;
        }
        unset($row['visitor_ids'], $row['visitor_info']);
      }
      unset($row);

      echo json_encode(['success' => true, 'data' => $rows]);
      break;

    case 'vouchers':
      // Seleciona vouchers e já traz campos derivados para o painel
      $sql = "
        SELECT v.*,
               v.valid_from AS starts_at,
               v.valid_to   AS ends_at,
               v.max_redemptions AS max_uses,
               COALESCE(v.used_count,
                        (SELECT COUNT(*) FROM reservations r WHERE r.voucher_code = v.code)
               ) AS used_count
        FROM vouchers v
        ORDER BY v.id DESC
      ";
      $stmt = $pdo->query($sql);
      $rows = $stmt->fetchAll();
      echo json_encode(['success' => true, 'data' => $rows]);
      break;

    case 'visitors':
      $sql = "
        SELECT v.*,
               c.name AS client_name,
               comp.nome_fantasia AS company_name
        FROM visitors v
        LEFT JOIN clients c   ON c.id   = v.client_id
        LEFT JOIN companies comp ON comp.id = v.company_id
        ORDER BY v.id DESC
      ";
      $stmt = $pdo->query($sql);
      $rows = $stmt->fetchAll();

      echo json_encode(['success' => true, 'data' => $rows]);
      break;

    default:
      $stmt = $pdo->query("SELECT * FROM `$table` ORDER BY id DESC");
      $rows = $stmt->fetchAll();
      echo json_encode(['success' => true, 'data' => $rows]);
      break;
  }
} catch (Exception $e) {
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
