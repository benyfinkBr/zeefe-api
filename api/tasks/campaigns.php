<?php
require_once '../apiconfig.php';

function send_campaign_email($email, $subject, $body) {
    echo "Enviando email para $email: $subject\n";
}

$stmtCampaigns = $pdo->prepare("SELECT * FROM campaigns WHERE status='ativo'");
$stmtCampaigns->execute();
$campaigns = $stmtCampaigns->fetchAll();

foreach ($campaigns as $campaign) {
    $segment_rules = json_decode($campaign['segment_json'], true);
    $subject = $campaign['name'];
    $body = "Olá, confira nossa campanha: " . $campaign['name'];

    $conditions = [];
    $params = [];

    if (isset($segment_rules['client_type'])) {
        $conditions[] = 'tipo = :tipo';
        $params['tipo'] = $segment_rules['client_type'];
    }

    $where = count($conditions) ? 'WHERE ' . implode(' AND ', $conditions) : '';

    $sqlClients = "SELECT email FROM clients $where";
    $stmtClients = $pdo->prepare($sqlClients);
    $stmtClients->execute($params);
    $clients = $stmtClients->fetchAll();

    foreach ($clients as $client) {
        send_campaign_email($client['email'], $subject, $body);
    }
}

header('Content-Type: application/json');
echo json_encode([
    'message' => 'Campanhas enviadas conforme segmentação',
    'campaigns_count' => count($campaigns),
]);
?>