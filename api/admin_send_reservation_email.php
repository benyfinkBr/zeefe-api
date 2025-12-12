<?php
require 'apiconfig.php';
require_once __DIR__ . '/lib/mailer.php';
require_once __DIR__ . '/lib/reservations.php';

header('Content-Type: application/json; charset=utf-8');

try {
  $input = json_decode(file_get_contents('php://input'), true);
  $reservationId = (int)($input['reservation_id'] ?? 0);
  $type = trim($input['type'] ?? '');

  if ($reservationId <= 0 || $type === '') {
    throw new RuntimeException('Parâmetros inválidos.');
  }

  $map = [
    'request_client' => 'emailSolicitacaoCliente',
    'request_advertiser' => 'emailSolicitacaoAnunciante',
    'confirm_client' => 'emailConfirmacaoCliente',
    'payment_confirmed' => 'emailPagamentoConfirmadoCliente',
    'payment_failed_client' => 'emailPagamentoFalhouCliente',
    'payment_failed_advertiser' => 'emailPagamentoFalhouAnunciante',
    'details_after_payment' => 'emailDetalhesPosPagamento'
  ];

  if (!isset($map[$type])) {
    throw new RuntimeException('Tipo de e-mail não suportado.');
  }

  call_user_func($map[$type], $pdo, $reservationId);

  echo json_encode(['success' => true, 'message' => 'E-mail enviado.']);
} catch (Throwable $e) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

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
  $valor = $dados['amount_gross'] ?? null;
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

function emailPagamentoFalhouCliente(PDO $pdo, int $reservationId): void {
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
    'motivo' => 'Pagamento não autorizado pelo banco.',
    'link_portal' => 'https://zeefe.com.br/clientes.html'
  ];
  $html = mailer_render('payment_reservation_failed.php', $placeholders);
  mailer_send($dados['client_email'], 'Ze.EFE - Pagamento não aprovado', $html);
}

function emailPagamentoFalhouAnunciante(PDO $pdo, int $reservationId): void {
  $row = buscarDadosAnunciante($pdo, $reservationId);
  if (empty($row['advertiser_email'])) {
    throw new RuntimeException('A sala não possui anunciante com e-mail definido.');
  }
  $placeholders = [
    'sala_nome' => $row['room_name'] ?? '',
    'data_formatada' => reservation_format_date($row['date'] ?? ''),
    'cliente_nome' => $row['client_name'] ?? 'Cliente',
    'motivo' => 'Pagamento não autorizado.',
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
  foreach (['room_street','room_complement','room_city','room_state'] as $campo) {
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
  mailer_send($dados['client_email'], 'Ze.EFE - Detalhes da sua reserva', $html);
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
