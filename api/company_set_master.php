<?php
require 'apiconfig.php';
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

  // Garante vínculo do cliente à empresa
  $updClient = $pdo->prepare('UPDATE clients SET company_id = :company_id, updated_at = NOW() WHERE id = :client_id');
  $updClient->execute([':company_id' => $companyId, ':client_id' => $clientId]);

  $masterStored = false;
  $masterMessage = null;
  // Tenta persistir master_client_id, se a coluna existir
  try {
    $updCompany = $pdo->prepare('UPDATE companies SET master_client_id = :client_id, updated_at = NOW() WHERE id = :company_id');
    $updCompany->execute([':client_id' => $clientId, ':company_id' => $companyId]);
    $masterStored = true;
  } catch (Throwable $e) {
    // Coluna pode não existir; segue sem falhar
    $masterMessage = 'Coluna companies.master_client_id não encontrada — vínculo salvo apenas no cliente.';
  }

  echo json_encode([
    'success' => true,
    'message' => $masterStored ? 'Usuário master definido com sucesso.' : ($masterMessage ?: 'Vínculo com a empresa atualizado.'),
    'company_id' => $companyId,
    'client_id' => $clientId
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}

