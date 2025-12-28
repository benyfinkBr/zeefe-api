<?php
require_once __DIR__ . '/apiconfig.php';
require_once __DIR__ . '/lib/company_access.php';
header('Content-Type: application/json');

try {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método inválido']);
    exit;
  }
  $data = json_decode(file_get_contents('php://input'), true) ?: [];
  $companyId = isset($data['company_id']) ? (int)$data['company_id'] : 0;
  $clientId  = isset($data['client_id']) ? (int)$data['client_id'] : 0;
  $actorId   = isset($data['actor_id']) ? (int)$data['actor_id'] : 0;
  if ($companyId <= 0 || $clientId <= 0 || $actorId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Parâmetros inválidos.']);
    exit;
  }
  if (!zeefe_require_active_company($pdo, $companyId)) {
    exit;
  }

  // Descobre master da empresa (se a coluna existir)
  $masterId = null;
  try {
    $q = $pdo->prepare('SELECT master_client_id FROM companies WHERE id = :id LIMIT 1');
    $q->execute([':id' => $companyId]);
    if ($row = $q->fetch(PDO::FETCH_ASSOC)) {
      $masterId = $row['master_client_id'] ?? null;
      if ($masterId !== null) $masterId = (int)$masterId;
    }
  } catch (Throwable $e) {
    // coluna pode não existir; segue sem master
    $masterId = null;
  }

  // Carrega ator (papel pode não existir)
  $actorRole = null; $actorCompany = null;
  try {
    $qa = $pdo->prepare('SELECT company_id, company_role FROM clients WHERE id = :id LIMIT 1');
    $qa->execute([':id' => $actorId]);
    if ($ar = $qa->fetch(PDO::FETCH_ASSOC)) {
      $actorCompany = isset($ar['company_id']) ? (int)$ar['company_id'] : null;
      $actorRole = $ar['company_role'] ?? null;
    }
  } catch (Throwable $e) {
    // se a coluna company_role não existir
    $qa = $pdo->prepare('SELECT company_id FROM clients WHERE id = :id LIMIT 1');
    $qa->execute([':id' => $actorId]);
    if ($ar = $qa->fetch(PDO::FETCH_ASSOC)) {
      $actorCompany = isset($ar['company_id']) ? (int)$ar['company_id'] : null;
    }
    $actorRole = null;
  }

  if ($actorCompany !== $companyId) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Sem permissão para gerenciar esta empresa.']);
    exit;
  }

  $isMaster = ($masterId !== null && $masterId === $actorId);
  $isAdminish = in_array(strtolower((string)$actorRole), ['admin','gestor'], true);
  if (!$isMaster && !$isAdminish) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Permissão negada. Requer Admin/Gestor ou Master.']);
    exit;
  }

  // Não permite remover o master
  if ($masterId !== null && $clientId === $masterId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Não é possível remover o usuário master.']);
    exit;
  }

  // Atualiza vínculo (sempre remove company_id). Qualquer ajuste de role é best-effort e não bloqueia a operação.
  $upd = $pdo->prepare('UPDATE clients SET company_id = NULL, updated_at = NOW() WHERE id = :cid AND company_id = :company');
  $upd->execute([':cid' => $clientId, ':company' => $companyId]);
  try {
    @$pdo->exec("UPDATE clients SET company_role = NULL WHERE id = {$clientId} LIMIT 1");
  } catch (Throwable $e) { /* ignora se coluna não existir */ }

  echo json_encode(['success' => true, 'removed' => $upd->rowCount() > 0]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
}
