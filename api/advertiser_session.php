<?php
require 'apiconfig.php';

header('Content-Type: application/json; charset=utf-8');

if (empty($_SESSION['advertiser_id'])) {
  echo json_encode(['success' => false, 'error' => 'Sessão não autenticada.']);
  exit;
}

$advertiserId = (int) $_SESSION['advertiser_id'];

try {
  $stmt = $pdo->prepare('SELECT id, display_name, full_name, login_email, status FROM advertisers WHERE id = :id LIMIT 1');
  $stmt->execute([':id' => $advertiserId]);
  $adv = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$adv) {
    unset($_SESSION['advertiser_id'], $_SESSION['advertiser_name']);
    echo json_encode(['success' => false, 'error' => 'Anunciante não encontrado.']);
    exit;
  }
  if (in_array(strtolower($adv['status'] ?? ''), ['inativo','bloqueado'], true)) {
    unset($_SESSION['advertiser_id'], $_SESSION['advertiser_name']);
    echo json_encode(['success' => false, 'error' => 'Conta inativa.']);
    exit;
  }
  echo json_encode([
    'success' => true,
    'advertiser' => [
      'id' => (int)$adv['id'],
      'display_name' => $adv['display_name'] ?? null,
      'full_name' => $adv['full_name'] ?? null,
      'email' => $adv['login_email'] ?? null,
      'status' => $adv['status'] ?? 'ativo'
    ]
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}
