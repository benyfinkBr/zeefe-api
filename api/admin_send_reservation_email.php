<?php
require_once 'apiconfig.php';
require_once __DIR__ . '/lib/reservation_email_helpers.php';

$isEntryPoint = isset($_SERVER['SCRIPT_FILENAME']) && realpath($_SERVER['SCRIPT_FILENAME']) === __FILE__;

if ($isEntryPoint) {
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
  return;
}
