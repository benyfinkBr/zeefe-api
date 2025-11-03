<?php
// api/db_connect.php
// Returns a PDO instance using credentials from config.php
$config = require __DIR__ . '/config.php';
$db = $config['db'];

$dsn = "mysql:host={$db['host']};dbname={$db['dbname']};charset={$db['charset']}";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, $db['user'], $db['pass'], $options);
} catch (PDOException $e) {
    // In production, log the error instead of echoing
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'DB connection failed']);
    exit;
}
