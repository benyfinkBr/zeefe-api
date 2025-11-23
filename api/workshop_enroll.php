<?php
require 'apiconfig.php';

header('Content-Type: application/json; charset=utf-8');

try {
  $body = json_decode(file_get_contents('php://input'), true);
  if (!$body) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Requisição inválida.']);
    exit;
  }

  $workshopId = isset($body['workshop_id']) ? (int) $body['workshop_id'] : 0;
  $name  = trim($body['name']  ?? '');
  $email = trim($body['email'] ?? '');
  $cpf   = trim($body['cpf']   ?? '');
  $phone = trim($body['phone'] ?? '');
  $voucherCode = trim($body['voucher_code'] ?? '');

  if ($workshopId <= 0 || $name === '' || $email === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Informe workshop, nome e e-mail.']);
    exit;
  }

  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'E-mail inválido.']);
    exit;
  }

  // Carrega workshop com contagem de inscritos
  $stmtW = $pdo->prepare("
    SELECT w.*,
           (SELECT COUNT(*) FROM workshop_enrollments e WHERE e.workshop_id = w.id AND e.payment_status <> 'cancelado') AS active_seats,
           (SELECT COUNT(*) FROM workshop_enrollments e WHERE e.workshop_id = w.id AND e.payment_status = 'pago') AS paid_seats
    FROM workshops w
    WHERE w.id = ?
      AND w.status = 'publicado'
    LIMIT 1
  ");
  $stmtW->execute([$workshopId]);
  $workshop = $stmtW->fetch(PDO::FETCH_ASSOC);

  if (!$workshop) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Workshop não encontrado ou não está publicado.']);
    exit;
  }

  // Checagem simples de capacidade (conta todos com pagamento pendente ou pago)
  $maxSeats = (int) ($workshop['max_seats'] ?? 0);
  if ($maxSeats > 0) {
    $activeSeats = (int) ($workshop['active_seats'] ?? 0);
    if ($activeSeats >= $maxSeats) {
      http_response_code(400);
      echo json_encode(['success' => false, 'error' => 'Não há mais vagas disponíveis para este workshop.']);
      exit;
    }
  }

  // Normaliza CPF/telefone
  if ($cpf !== '') {
    $cpf = preg_replace('/\D/', '', $cpf);
  } else {
    $cpf = null;
  }
  if ($phone !== '') {
    $phone = preg_replace('/\D/', '', $phone);
  } else {
    $phone = null;
  }

  // Localiza ou cria participante
  $pdo->beginTransaction();

  $stmtP = $pdo->prepare('SELECT * FROM workshop_participants WHERE email = ? LIMIT 1');
  $stmtP->execute([$email]);
  $participant = $stmtP->fetch(PDO::FETCH_ASSOC);

  if ($participant) {
    $participantId = (int) $participant['id'];
    // Atualiza dados básicos se vierem diferentes
    $upd = $pdo->prepare('UPDATE workshop_participants SET name = ?, cpf = ?, phone = ? WHERE id = ?');
    $upd->execute([$name, $cpf, $phone, $participantId]);
  } else {
    $ins = $pdo->prepare('INSERT INTO workshop_participants (name,email,cpf,phone,status) VALUES (?,?,?,?,\'ativo\')');
    $ins->execute([$name, $email, $cpf, $phone]);
    $participantId = (int) $pdo->lastInsertId();
  }

  // Gera código público único
  $publicCode = null;
  $tries = 0;
  do {
    $tries++;
    $candidate = 'W' . bin2hex(random_bytes(5)); // 11 caracteres, não sequencial
    $chk = $pdo->prepare('SELECT id FROM workshop_enrollments WHERE public_code = ? LIMIT 1');
    $chk->execute([$candidate]);
    if (!$chk->fetch()) {
      $publicCode = $candidate;
      break;
    }
  } while ($tries < 5);

  if (!$publicCode) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Não foi possível gerar o código do ingresso.']);
    exit;
  }

  // Para suportar o "break even", as inscrições começam como pendentes.
  $paymentStatus = 'pendente';
  $discountAmount = 0.00;

  $insE = $pdo->prepare('
    INSERT INTO workshop_enrollments (workshop_id, participant_id, public_code, payment_status, voucher_code, discount_amount, checkin_status)
    VALUES (?,?,?,?,?,?,\'nao_lido\')
  ');
  $insE->execute([$workshopId, $participantId, $publicCode, $paymentStatus, $voucherCode ?: null, $discountAmount]);
  $enrollmentId = (int) $pdo->lastInsertId();

  // Lógica de break-even: a partir de min_seats, confirmamos todos os pendentes.
  $minSeats = (int) ($workshop['min_seats'] ?? 0);
  $activeSeatsAfter = (int) ($workshop['active_seats'] ?? 0) + 1;
  $thresholdReached = false;

  if ($minSeats > 0 && $activeSeatsAfter >= $minSeats) {
    $updAll = $pdo->prepare("UPDATE workshop_enrollments SET payment_status = 'pago' WHERE workshop_id = ? AND payment_status = 'pendente'");
    $updAll->execute([$workshopId]);
    $thresholdReached = true;
    $paymentStatus = 'pago';
  }

  $pdo->commit();

  $checkinUrl = sprintf(
    '%s/api/workshop_checkin.php?code=%s',
    rtrim((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? ''), '/'),
    urlencode($publicCode)
  );

  echo json_encode([
    'success' => true,
    'enrollment_id' => $enrollmentId,
    'public_code' => $publicCode,
    'checkin_url' => $checkinUrl,
    'payment_status' => $paymentStatus,
    'threshold_reached' => $thresholdReached,
  ]);
} catch (Throwable $e) {
  if ($pdo && $pdo->inTransaction()) {
    $pdo->rollBack();
  }
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
