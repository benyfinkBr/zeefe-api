<?php
session_set_cookie_params([
    'path' => '/',
    'secure' => true,
    'httponly' => true,
    'samesite' => 'None'
]);
session_start();
header('Content-Type: application/json');
require_once 'apiconfig.php';
require_once __DIR__ . '/lib/mailer.php';
require_once __DIR__ . '/lib/reservations.php';
require_once __DIR__ . '/lib/geocode.php';


$payload = json_decode(file_get_contents('php://input'), true);
if (!$payload || !isset($payload['table']) || !isset($payload['record'])) {
  http_response_code(400);
  echo json_encode(['error'=>'Formato inválido']); exit;
}

$allowed = ['companies','clients','rooms','reservations','visitors','amenities','campaigns','vouchers'];
$table   = $payload['table'];
$rawRecord = $payload['record'];
$record = $rawRecord;

$roomAmenities = [];
$reservationVisitors = null;
if ($table === 'rooms') {
  $amenitiesInput = $rawRecord['amenities'] ?? [];
  if (!is_array($amenitiesInput)) $amenitiesInput = [];
  $roomAmenities = array_values(array_filter(array_map('intval', $amenitiesInput)));
  unset($record['amenities']);
  unset($rawRecord['amenities']);
} elseif ($table === 'reservations' && array_key_exists('visitor_ids', $rawRecord)) {
  $visitorsInput = $rawRecord['visitor_ids'];
  if (!is_array($visitorsInput)) $visitorsInput = [];
  $reservationVisitors = array_values(array_filter(array_map('intval', $visitorsInput)));
  unset($record['visitor_ids']);
}

// Normalizações específicas de vouchers (alias de campos usados no Admin)
if ($table === 'vouchers') {
  // Mapear datas amigáveis e contagem máxima para as colunas reais
  if (array_key_exists('starts_at', $rawRecord)) {
    $record['valid_from'] = $rawRecord['starts_at'];
  }
  if (array_key_exists('ends_at', $rawRecord)) {
    $record['valid_to'] = $rawRecord['ends_at'];
  }
  if (array_key_exists('max_uses', $rawRecord)) {
    $record['max_redemptions'] = $rawRecord['max_uses'];
  }
  // Campos somente de exibição não devem ser persistidos diretamente
  unset($record['starts_at'], $record['ends_at'], $record['max_uses'], $record['used_count']);
}

if (!in_array($table, $allowed)) {
  http_response_code(400);
  echo json_encode(['error'=>'Tabela inválida']); exit;
}

try {
  // Colunas válidas da tabela
  $colsStmt  = $pdo->query("DESCRIBE `$table`");
  $validCols = array_column($colsStmt->fetchAll(PDO::FETCH_ASSOC), 'Field');

  // Mantém só colunas existentes
  $record = array_intersect_key($record, array_flip($validCols));

  if ($table === 'rooms') {
    if (array_key_exists('facilitated_access', $rawRecord)) {
      $record['facilitated_access'] = (int) ($rawRecord['facilitated_access'] ?? 0);
    }
    if (isset($record['status']) && $record['status'] === 'manutenção') {
      $record['status'] = 'manutencao';
    }
  }

  if ($table === 'clients') {
    if (!empty($rawRecord['password'])) {
      $passwordPlain = $rawRecord['password'];
      $record['password'] = $passwordPlain;
      $record['password_hash'] = password_hash($passwordPlain, PASSWORD_DEFAULT);
    }
    if (isset($record['password_hash']) && $record['password_hash'] === '' && empty($rawRecord['password'])) {
      unset($record['password_hash']);
    }
    if (isset($record['password']) && $record['password'] === '' && empty($rawRecord['password'])) {
      unset($record['password']);
    }
  }

  if ($table === 'visitors' && !empty($record['client_id'])) {
    try {
      $stmtClient = $pdo->prepare('SELECT company_id FROM clients WHERE id = ? LIMIT 1');
      $stmtClient->execute([$record['client_id']]);
      $clientRow = $stmtClient->fetch(PDO::FETCH_ASSOC);
      if ($clientRow) {
        $clientCompany = $clientRow['company_id'] ?? null;
        if ($clientCompany) {
          $record['company_id'] = $clientCompany;
        } else {
          $record['company_id'] = null;
        }
      }
    } catch (PDOException $e) {
      http_response_code(500);
      echo json_encode(['error' => 'Erro ao validar vínculo do visitante: ' . $e->getMessage()]);
      exit;
    }
  } elseif ($table === 'visitors') {
    $record['company_id'] = null;
  }

  if ($table === 'reservations') {
    $reservationId = $rawRecord['id'] ?? null;
    $roomId = $rawRecord['room_id'] ?? null;
    $date   = $rawRecord['date'] ?? null;

    if ($reservationId && (!$roomId || !$date)) {
      $stmtInfo = $pdo->prepare("SELECT room_id, date FROM reservations WHERE id = ?");
      $stmtInfo->execute([$reservationId]);
      $existingReservation = $stmtInfo->fetch(PDO::FETCH_ASSOC);
      if ($existingReservation) {
        if (!$roomId) $roomId = $existingReservation['room_id'];
        if (!$date)   $date   = $existingReservation['date'];
      }
    }

    if ($roomId && $date) {
      $stmtRoom = $pdo->prepare("SELECT status, maintenance_start, maintenance_end, deactivated_from FROM rooms WHERE id = ? LIMIT 1");
      $stmtRoom->execute([$roomId]);
      $room = $stmtRoom->fetch(PDO::FETCH_ASSOC);

      if ($room) {
        $dateCheck = new DateTime($date);
        if ($room['status'] === 'manutencao') {
          $block = true;
          if (!empty($room['maintenance_start'])) {
            $start = new DateTime($room['maintenance_start']);
            if ($dateCheck < $start) $block = false;
          }
          if (!empty($room['maintenance_end'])) {
            $end = new DateTime($room['maintenance_end']);
            if ($dateCheck > $end) $block = false;
          }
          if ($block) {
            http_response_code(400);
            echo json_encode(['error' => 'A sala está em manutenção na data selecionada.']);
            exit;
          }
        }

        if ($room['status'] === 'desativada' && !empty($room['deactivated_from'])) {
          $deactivatedFrom = new DateTime($room['deactivated_from']);
          if ($dateCheck >= $deactivatedFrom) {
            http_response_code(400);
            echo json_encode(['error' => 'A sala está desativada para a data selecionada.']);
            exit;
          }
        }
      }
    }
  }

  // Normalizações simples
  foreach ($record as $k => $v) {
    // strings vazias para NULL em campos de data
    if (in_array($k, ['maintenance_start','maintenance_end','deactivated_from','created_at','updated_at']) && $v === '') {
      $record[$k] = null;
    }
    if (preg_match('/cpf/i', $k) && is_string($v)) {
      $record[$k] = preg_replace('/\D/', '', $v);
    }
    if (preg_match('/(phone|telefone|whatsapp)/i', $k) && is_string($v)) {
      $record[$k] = preg_replace('/\D/', '', $v);
    }
  }

  // Regra: em rooms, se status=ativo, zera datas de manutenção/desativação
  if ($table === 'rooms' && isset($record['status']) && $record['status'] === 'ativo') {
    foreach (['maintenance_start','maintenance_end','deactivated_from'] as $d) {
      if (in_array($d, $validCols)) $record[$d] = null;
    }
  }

  // INSERT x UPDATE com placeholders posicionais
  if (!empty($record['id'])) {
    $id = $record['id'];
    unset($record['id']);

    if (empty($record)) {
      echo json_encode(['success'=>true,'message'=>'Nada para atualizar']); exit;
    }

    $setParts = [];
    $values   = [];
    foreach ($record as $col => $val) {
      $setParts[] = "`$col` = ?";
      $values[]   = $val;
    }
    $values[] = $id;

    $sql = "UPDATE `$table` SET ".implode(',', $setParts)." WHERE `id` = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($values);

    if ($table === 'rooms') {
      sincronizarAmenidadesSala($pdo, $id, $roomAmenities);
      // Tentativa de geocodificação quando endereço mudou e lat/lon estiverem vazios
      try {
        $r = $pdo->prepare('SELECT street, complement, city, state, cep, lat, lon FROM rooms WHERE id = ?');
        $r->execute([$id]);
        $row = $r->fetch(PDO::FETCH_ASSOC);
        if ($row && (empty($row['lat']) || empty($row['lon']))) {
          attempt_room_geocode($pdo, $id, $row);
        }
      } catch (Throwable $ge) { /* ignora */ }
    }

    if ($table === 'reservations' && $reservationVisitors !== null) {
      sincronizarVisitantesReserva($pdo, $id, $reservationVisitors);
    }

    echo json_encode(['success'=>true,'message'=>'Registro atualizado']); exit;

  } else {
    if (empty($record)) {
      http_response_code(400);
      echo json_encode(['error'=>'Nenhum campo para inserir']); exit;
    }

    $columns = array_keys($record);
    $marks   = rtrim(str_repeat('?,', count($columns)), ',');
    $values  = array_values($record);

    $sql = "INSERT INTO `$table` (`".implode('`,`',$columns)."`) VALUES ($marks)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($values);
    $id = $pdo->lastInsertId();

    if ($table === 'rooms') {
      sincronizarAmenidadesSala($pdo, $id, $roomAmenities);
      // Geocodificação automática após criação se possível
      try {
        $r = $pdo->prepare('SELECT street, complement, city, state, cep, lat, lon FROM rooms WHERE id = ?');
        $r->execute([$id]);
        $row = $r->fetch(PDO::FETCH_ASSOC);
        if ($row && (empty($row['lat']) || empty($row['lon']))) {
          attempt_room_geocode($pdo, $id, $row);
        }
      } catch (Throwable $ge) { /* ignora */ }
    }

    if ($table === 'reservations' && $reservationVisitors !== null) {
      sincronizarVisitantesReserva($pdo, $id, $reservationVisitors);
    }

    if ($table === 'reservations' && empty($rawRecord['id'])) {
      try {
        enviarEmailReservaSolicitada($pdo, $id);
      } catch (Throwable $mailError) {
        error_log('Erro ao enviar e-mail de solicitação de reserva: ' . $mailError->getMessage());
      }
    }

    echo json_encode(['success'=>true,'message'=>'Registro criado','insertId'=>$id]); exit;
  }

} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['error'=>'Erro ao salvar registro: '.$e->getMessage()]);
}

function sincronizarAmenidadesSala(PDO $pdo, $roomId, array $amenities) {
  $stmtDel = $pdo->prepare("DELETE FROM room_amenities WHERE room_id = ?");
  $stmtDel->execute([$roomId]);

  if (!$amenities) return;

  $stmtIns = $pdo->prepare("INSERT INTO room_amenities (room_id, amenity_id) VALUES (?, ?)");
  foreach ($amenities as $amenityId) {
    if ($amenityId > 0) {
      $stmtIns->execute([$roomId, $amenityId]);
    }
  }
}

function sincronizarVisitantesReserva(PDO $pdo, $reservationId, array $visitors) {
  $stmtDel = $pdo->prepare('DELETE FROM reservation_visitors WHERE reservation_id = ?');
  $stmtDel->execute([$reservationId]);

  if (!$visitors) return;

  $stmtIns = $pdo->prepare('INSERT INTO reservation_visitors (reservation_id, visitor_id) VALUES (?, ?)');
  foreach ($visitors as $visitorId) {
    if ($visitorId > 0) {
      $stmtIns->execute([$reservationId, $visitorId]);
    }
  }
}

function enviarEmailReservaSolicitada(PDO $pdo, int $reservationId): void {
  $dados = reservation_load($pdo, $reservationId);
  if (!$dados || empty($dados['client_email'])) {
    return;
  }
  $horaInicio = reservation_format_time($dados['time_start'] ?? null);
  $horaFim = reservation_format_time($dados['time_end'] ?? null);
  $visitantes = $dados['visitor_names'] ? implode(', ', $dados['visitor_names']) : 'Sem visitantes cadastrados';
  $html = mailer_render('reservation_requested.php', [
    'cliente_nome' => $dados['client_name'] ?? '',
    'sala_nome' => $dados['room_name'] ?? '',
    'data_formatada' => reservation_format_date($dados['date']),
    'hora_inicio' => $horaInicio,
    'hora_fim' => $horaFim,
    'visitantes' => $visitantes,
    'link_portal' => 'https://zeefe.com.br/clientes.html'
  ]);
  mailer_send($dados['client_email'], 'Ze.EFE - recebemos sua solicitação', $html);
}
