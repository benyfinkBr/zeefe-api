<?php
function zeefe_pagarme_set_headers(): void {
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate');
    header('Pragma: no-cache');
    header('X-Content-Type-Options: nosniff');
}

function zeefe_pagarme_diag(PDO $pdo): array {
    try {
        $dbName = $pdo->query('SELECT DATABASE()')->fetchColumn();
        $dbUser = $pdo->query('SELECT USER()')->fetchColumn();
        $host = $pdo->query('SELECT @@hostname')->fetchColumn();
        $tableExists = (bool)$pdo->query("SHOW TABLES LIKE 'pagarme_events'")->fetch(PDO::FETCH_NUM);
        $count = $tableExists ? (int)$pdo->query('SELECT COUNT(*) FROM pagarme_events')->fetchColumn() : 0;
        return [
            'ok' => true,
            'db' => $dbName,
            'user' => $dbUser,
            'host' => $host,
            'table' => $tableExists,
            'count' => $count,
        ];
    } catch (Throwable $e) {
        return ['ok' => false, 'error' => $e->getMessage()];
    }
}

function zeefe_pagarme_ingest(PDO $pdo, string $rawBody): int {
    $payload = json_decode($rawBody, true);
    $hookId = null;
    $eventType = 'unknown';
    $entity = 'reservation';
    $contextId = null;

    if (is_array($payload)) {
        $hookId = $payload['id'] ?? null;
        if (!empty($payload['type'])) {
            $eventType = strtolower((string)$payload['type']);
        }
        $metaSources = [];
        if (!empty($payload['data']) && is_array($payload['data'])) {
            $data = $payload['data'];
            if (!empty($data['metadata']) && is_array($data['metadata'])) {
                $metaSources[] = $data['metadata'];
            }
            if (!empty($data['order']['metadata']) && is_array($data['order']['metadata'])) {
                $metaSources[] = $data['order']['metadata'];
            }
            if (!empty($data['charge']['metadata']) && is_array($data['charge']['metadata'])) {
                $metaSources[] = $data['charge']['metadata'];
            }
        }
        if (!empty($payload['metadata']) && is_array($payload['metadata'])) {
            $metaSources[] = $payload['metadata'];
        }
        foreach ($metaSources as $meta) {
            if (isset($meta['entity'])) {
                $entity = (string)$meta['entity'];
            }
            if (isset($meta['reservation_id']) && $contextId === null) {
                $contextId = (string)$meta['reservation_id'];
            } elseif (isset($meta['context_id']) && $contextId === null) {
                $contextId = (string)$meta['context_id'];
            }
        }
    }

    $stmt = $pdo->prepare(
        'INSERT INTO pagarme_events (hook_id, event_type, status_code, status_text, entity, context_id, payload, received_at)
         VALUES (:hook_id, :event_type, :status_code, :status_text, :entity, :context_id, :payload, NOW())'
    );
    $stmt->execute([
        ':hook_id' => $hookId,
        ':event_type' => $eventType,
        ':status_code' => 200,
        ':status_text' => 'received',
        ':entity' => $entity,
        ':context_id' => $contextId,
        ':payload' => $rawBody,
    ]);

    return (int)$pdo->lastInsertId();
}
