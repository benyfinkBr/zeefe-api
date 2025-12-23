<?php
declare(strict_types=1);

require_once __DIR__ . '/mailer.php';
require_once __DIR__ . '/reservations.php';
require_once __DIR__ . '/ics.php';

function emailSolicitacaoCliente(PDO $pdo, int $reservationId): void {
  $dados = reservation_load($pdo, $reservationId);
  if (!$dados || empty($dados['client_email'])) {
    throw new RuntimeException('Cliente sem e-mail cadastrado.');
  }
  $visitantes = $dados['visitor_names'] ? implode(', ', $dados['visitor_names']) : 'Sem visitantes cadastrados';
  $placeholders = [
    'cliente_nome' => $dados['client_name'] ?? '',
    'sala_nome' => $dados['room_name'] ?? '',
    'data_formatada' => reservation_format_date($dados['date'] ?? ''),
    'hora_inicio' => reservation_format_time($dados['time_start'] ?? null),
    'hora_fim' => reservation_format_time($dados['time_end'] ?? null),
    'visitantes' => $visitantes,
    'link_portal' => 'https://zeefe.com.br/clientes.html'
  ];
  $html = mailer_render('reservation_requested.php', $placeholders);
  mailer_send($dados['client_email'], 'Ze.EFE - Recebemos sua solicitação', $html);
}

function emailSolicitacaoAnunciante(PDO $pdo, int $reservationId): void {
  $row = buscarDadosAnunciante($pdo, $reservationId);
  if (empty($row['advertiser_email'])) {
    throw new RuntimeException('A sala não possui anunciante com e-mail definido.');
  }
  $placeholders = [
    'anunciante_nome' => $row['advertiser_name'] ?: 'Anunciante',
    'sala_nome' => $row['room_name'] ?? '',
    'data_formatada' => reservation_format_date($row['date'] ?? ''),
    'hora_inicio' => reservation_format_time($row['time_start'] ?? null),
    'hora_fim' => reservation_format_time($row['time_end'] ?? null),
    'cliente_nome' => $row['client_name'] ?? 'Cliente',
    'link_portal' => 'https://zeefe.com.br/anunciante.html'
  ];
  $html = mailer_render('reservation_requested_advertiser.php', $placeholders);
  mailer_send($row['advertiser_email'], 'Ze.EFE - Nova solicitação de reserva', $html);
}

function emailConfirmacaoCliente(PDO $pdo, int $reservationId): void {
  $dados = reservation_load($pdo, $reservationId);
  if (!$dados || empty($dados['client_email'])) {
    throw new RuntimeException('Cliente sem e-mail cadastrado.');
  }
  $visitantes = $dados['visitor_names'] ? implode(', ', $dados['visitor_names']) : 'Sem visitantes cadastrados';
  $placeholders = [
    'cliente_nome' => $dados['client_name'] ?? '',
    'sala_nome' => $dados['room_name'] ?? '',
    'data_formatada' => reservation_format_date($dados['date'] ?? ''),
    'hora_inicio' => reservation_format_time($dados['time_start'] ?? null),
    'hora_fim' => reservation_format_time($dados['time_end'] ?? null),
    'visitantes' => $visitantes,
    'link_portal' => 'https://zeefe.com.br/clientes.html',
    'bloco_informacoes' => '<p style="margin:0 0 10px;font-size:15px;line-height:1.6;">Sua reserva foi confirmada. Vamos processar o pagamento usando o método principal já cadastrado.</p><p style="margin:0 0 20px;font-size:14px;color:#8A7766;">Assim que o pagamento for confirmado, enviaremos todos os dados completos da reserva e você poderá convidar os visitantes.</p>'
  ];
  $html = mailer_render('reservation_confirmed.php', $placeholders);
  mailer_send($dados['client_email'], 'Ze.EFE - Sua reserva foi confirmada', $html);
}

function emailPagamentoConfirmadoCliente(PDO $pdo, int $reservationId): void {
  $dados = reservation_load($pdo, $reservationId);
  if (!$dados || empty($dados['client_email'])) {
    throw new RuntimeException('Cliente sem e-mail cadastrado.');
  }
  $valor = $dados['amount_gross'] ?? $dados['total_price'] ?? null;
  $valorFormatado = $valor !== null ? 'R$ ' . number_format((float)$valor, 2, ',', '.') : 'Confirmado';
  $placeholders = [
    'cliente_nome' => $dados['client_name'] ?? '',
    'sala_nome' => $dados['room_name'] ?? '',
    'data_formatada' => reservation_format_date($dados['date'] ?? ''),
    'hora_inicio' => reservation_format_time($dados['time_start'] ?? null),
    'hora_fim' => reservation_format_time($dados['time_end'] ?? null),
    'valor_pago' => $valorFormatado,
    'link_portal' => 'https://zeefe.com.br/clientes.html'
  ];
  $html = mailer_render('payment_reservation_confirmed.php', $placeholders);
  mailer_send($dados['client_email'], 'Ze.EFE - Pagamento confirmado', $html);
}

function emailPagamentoFalhouCliente(PDO $pdo, int $reservationId, string $motivo = 'Pagamento não autorizado pelo banco.'): void {
  $dados = reservation_load($pdo, $reservationId);
  if (!$dados || empty($dados['client_email'])) {
    throw new RuntimeException('Cliente sem e-mail cadastrado.');
  }
  $placeholders = [
    'cliente_nome' => $dados['client_name'] ?? '',
    'sala_nome' => $dados['room_name'] ?? '',
    'data_formatada' => reservation_format_date($dados['date'] ?? ''),
    'hora_inicio' => reservation_format_time($dados['time_start'] ?? null),
    'hora_fim' => reservation_format_time($dados['time_end'] ?? null),
    'motivo' => $motivo,
    'link_portal' => 'https://zeefe.com.br/clientes.html'
  ];
  $html = mailer_render('payment_reservation_failed.php', $placeholders);
  mailer_send($dados['client_email'], 'Ze.EFE - Pagamento não aprovado', $html);
}

function emailPagamentoFalhouAnunciante(PDO $pdo, int $reservationId, string $motivo = 'Pagamento não autorizado.'): void {
  $row = buscarDadosAnunciante($pdo, $reservationId);
  if (empty($row['advertiser_email'])) {
    throw new RuntimeException('A sala não possui anunciante com e-mail definido.');
  }
  $placeholders = [
    'sala_nome' => $row['room_name'] ?? '',
    'data_formatada' => reservation_format_date($row['date'] ?? ''),
    'cliente_nome' => $row['client_name'] ?? 'Cliente',
    'motivo' => $motivo,
    'link_portal' => 'https://zeefe.com.br/anunciante.html'
  ];
  $html = mailer_render('payment_reservation_failed_advertiser.php', $placeholders);
  mailer_send($row['advertiser_email'], 'Ze.EFE - Pagamento do cliente não aprovado', $html);
}

function emailDetalhesPosPagamento(PDO $pdo, int $reservationId): void {
  $dados = reservation_load($pdo, $reservationId);
  if (!$dados || empty($dados['client_email'])) {
    throw new RuntimeException('Cliente sem e-mail cadastrado.');
  }
  $publicCode = reservation_get_public_code($pdo, $dados);
  $enderecoPartes = [];
  foreach (['room_street', 'room_complement', 'room_city', 'room_state'] as $campo) {
    if (!empty($dados[$campo])) {
      $enderecoPartes[] = $dados[$campo];
    }
  }
  $endereco = $enderecoPartes ? implode(', ', $enderecoPartes) : 'Disponível no portal';
  $placeholders = [
    'cliente_nome' => $dados['client_name'] ?? '',
    'sala_nome' => $dados['room_name'] ?? '',
    'data_formatada' => reservation_format_date($dados['date'] ?? ''),
    'hora_inicio' => reservation_format_time($dados['time_start'] ?? null),
    'hora_fim' => reservation_format_time($dados['time_end'] ?? null),
    'endereco' => $endereco,
    'codigo_publico' => $publicCode,
    'link_portal' => 'https://zeefe.com.br/clientes.html'
  ];
  $html = mailer_render('reservation_details_after_payment.php', $placeholders);
  $attachments = [];
  try {
    $date = $dados['date'] ?? date('Y-m-d');
    $start = trim($dados['time_start'] ?? '08:00');
    $end = trim($dados['time_end'] ?? '20:00');
    $normalizeTime = static function (string $t): string {
      $t = trim($t);
      if (preg_match('/^\d{2}:\d{2}:\d{2}$/', $t)) {
        return $t;
      }
      if (preg_match('/^\d{2}:\d{2}$/', $t)) {
        return $t . ':00';
      }
      $dt = DateTime::createFromFormat('H:i:s', $t) ?: DateTime::createFromFormat('H:i', $t);
      return $dt ? $dt->format('H:i:s') : '00:00:00';
    };
    $startTs = strtotime($date . ' ' . $normalizeTime($start));
    $endTs = strtotime($date . ' ' . $normalizeTime($end));
    $summary = 'Reserva Ze.EFE - ' . ($dados['room_name'] ?? 'Sala');
    $descResumo = ($dados['title'] ? ($dados['title'] . "\n\n") : '') . trim($dados['description'] ?? '');
    $street = trim((string)($dados['room_street'] ?? ''));
    $compl = trim((string)($dados['room_complement'] ?? ''));
    $addr1 = $street ? ($street . ($compl ? ' - ' . $compl : '')) : '';
    $cityState = trim((string)($dados['room_city'] ?? ''));
    if (!empty($dados['room_state'])) {
      $cityState .= ($cityState ? ' - ' : '') . strtoupper((string)$dados['room_state']);
    }
    $parts = array_filter([$addr1 ?: null, $cityState ?: null]);
    $location = $parts ? implode(', ', $parts) : ($dados['room_name'] ?? 'Sala Ze.EFE');
    $attachments[] = [
      'data' => ics_generate([
        'summary' => $summary,
        'description' => $descResumo,
        'location' => $location,
        'start' => $startTs,
        'end' => $endTs,
        'uid' => 'zeefe-' . ($dados['public_code'] ?? $reservationId) . '-' . md5($summary . $date),
        'tz' => 'America/Sao_Paulo'
      ]),
      'name' => 'reserva.ics',
      'type' => 'text/calendar'
    ];
  } catch (Throwable $icsError) {
    error_log('[MAIL] Falha ao gerar ICS da reserva #' . $reservationId . ': ' . $icsError->getMessage());
  }
  mailer_send($dados['client_email'], 'Ze.EFE - Detalhes da sua reserva', $html, '', $attachments);
}

function buscarDadosAnunciante(PDO $pdo, int $reservationId): array {
  $stmt = $pdo->prepare('SELECT r.*, rooms.name AS room_name, rooms.advertiser_id, a.display_name AS advertiser_name, a.login_email AS advertiser_email, c.name AS client_name FROM reservations r JOIN rooms ON rooms.id = r.room_id JOIN clients c ON c.id = r.client_id LEFT JOIN advertisers a ON a.id = rooms.advertiser_id WHERE r.id = ? LIMIT 1');
  $stmt->execute([$reservationId]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$row) {
    throw new RuntimeException('Reserva não encontrada.');
  }
  return $row;
}
