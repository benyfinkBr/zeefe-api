<?php
require_once __DIR__ . '/apiconfig.php';
header('Content-Type: application/json');

try {
  $data = json_decode(file_get_contents('php://input'), true);
  $companyId = isset($data['company_id']) ? (int)$data['company_id'] : 0;
  $clientId = isset($data['client_id']) ? (int)$data['client_id'] : 0;
  if ($companyId <= 0 || $clientId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Parâmetros inválidos.']);
    exit;
  }

  // Se for master, remove também o master_client_id para evitar referência quebrada
  try {
    $q = $pdo->prepare('SELECT master_client_id FROM companies WHERE id = :id LIMIT 1');
    $q->execute([':id' => $companyId]);
    $row = $q->fetch(PDO::FETCH_ASSOC);
    if ($row && (string)($row['master_client_id'] ?? '') === (string)$clientId) {
      $updM = $pdo->prepare('UPDATE companies SET master_client_id = NULL, updated_at = NOW() WHERE id = :id');
      $updM->execute([':id' => $companyId]);
    }
  } catch (Throwable $e) {
    // se a coluna não existir, ignora
  }

  $upd = $pdo->prepare('UPDATE clients SET company_id = NULL, company_role = NULL, updated_at = NOW() WHERE id = :id AND company_id = :cid');
  $upd->execute([':id' => $clientId, ':cid' => $companyId]);

  echo json_encode(['success' => true, 'message' => 'Vínculo removido.']);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}

