<?php
require_once __DIR__ . '/apiconfig.php';
header('Content-Type: application/json');

try {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success'=>false,'error'=>'Método inválido']);
    exit;
  }
  $data = json_decode(file_get_contents('php://input'), true) ?: [];
  $id = isset($data['id']) ? (int)$data['id'] : 0;
  $companyId = isset($data['company_id']) ? (int)$data['company_id'] : 0;
  $actorId = isset($data['actor_id']) ? (int)$data['actor_id'] : 0;
  if ($id<=0 || $companyId<=0 || $actorId<=0) { http_response_code(400); echo json_encode(['success'=>false,'error'=>'Parâmetros inválidos']); exit; }

  // Permissões similares ao remove_user
  $masterId = null; $actorRole = null; $actorCompany = null;
  try {
    $q = $pdo->prepare('SELECT master_client_id FROM companies WHERE id=:id LIMIT 1');
    $q->execute([':id'=>$companyId]);
    if ($r=$q->fetch(PDO::FETCH_ASSOC)) $masterId = isset($r['master_client_id']) ? (int)$r['master_client_id'] : null;
  } catch (Throwable $e) { $masterId = null; }
  try {
    $qa = $pdo->prepare('SELECT company_id, company_role FROM clients WHERE id=:id LIMIT 1');
    $qa->execute([':id'=>$actorId]);
    if ($ar=$qa->fetch(PDO::FETCH_ASSOC)) { $actorCompany = (int)($ar['company_id'] ?? 0); $actorRole = $ar['company_role'] ?? null; }
  } catch (Throwable $e) {
    $qa = $pdo->prepare('SELECT company_id FROM clients WHERE id=:id LIMIT 1');
    $qa->execute([':id'=>$actorId]);
    if ($ar=$qa->fetch(PDO::FETCH_ASSOC)) { $actorCompany = (int)($ar['company_id'] ?? 0); }
    $actorRole = null;
  }
  if ($actorCompany !== $companyId) { http_response_code(403); echo json_encode(['success'=>false,'error'=>'Sem permissão']); exit; }
  $isMaster = ($masterId !== null && $masterId === $actorId);
  $isAdminish = in_array(strtolower((string)$actorRole), ['admin','gestor'], true);
  if (!$isMaster && !$isAdminish) { http_response_code(403); echo json_encode(['success'=>false,'error':'Permissão negada']); exit; }

  $del = $pdo->prepare('DELETE FROM company_invitations WHERE id=:id AND company_id=:cid');
  $del->execute([':id'=>$id, ':cid'=>$companyId]);
  echo json_encode(['success'=>true, 'deleted'=> $del->rowCount()>0 ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'error'=>'Erro interno: '.$e->getMessage()]);
}

