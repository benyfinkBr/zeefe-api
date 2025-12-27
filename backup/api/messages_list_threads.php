<?php
require_once __DIR__ . '/apiconfig.php';
header('Content-Type: application/json');

try {
  $advertiserId = isset($_GET['advertiser_id']) ? (int)$_GET['advertiser_id'] : 0;
  $clientId     = isset($_GET['client_id']) ? (int)$_GET['client_id'] : 0;

  $p = [];

  if ($clientId > 0) {
    // Visão do cliente: calcula quantidade de mensagens não lidas para ele
    $sql = 'SELECT t.*,
                   SUM(CASE WHEN m.sender_type IN (\'advertiser\',\'system\')
                             AND m.read_by_client_at IS NULL
                            THEN 1 ELSE 0 END) AS unread_for_client
            FROM message_threads t
            LEFT JOIN messages m ON m.thread_id = t.id
            WHERE t.client_id = :cli
            GROUP BY t.id
            ORDER BY COALESCE(t.last_message_at, t.created_at) DESC';
    $p[':cli'] = $clientId;
  } elseif ($advertiserId > 0) {
    // Visão do anunciante: calcula mensagens não lidas para o anunciante
    $sql = 'SELECT t.*,
                   SUM(CASE WHEN m.sender_type = \'client\'
                             AND m.read_by_advertiser_at IS NULL
                            THEN 1 ELSE 0 END) AS unread_for_advertiser
            FROM message_threads t
            LEFT JOIN messages m ON m.thread_id = t.id
            WHERE t.advertiser_id = :adv
            GROUP BY t.id
            ORDER BY COALESCE(t.last_message_at, t.created_at) DESC';
    $p[':adv'] = $advertiserId;
  } else {
    // Visão do admin: mantém listagem simples, sem agregados específicos
    $sql = 'SELECT * FROM message_threads ORDER BY COALESCE(last_message_at, created_at) DESC';
  }

  $stmt = $pdo->prepare($sql);
  $stmt->execute($p);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
  echo json_encode(['success'=>true,'data'=>$rows]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success'=>false,'error'=>'Erro interno: '.$e->getMessage()]);
}
