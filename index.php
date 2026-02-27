<?php
$homeLiveEnabled = false;

try {
  $cfg = require __DIR__ . '/api/config.php';
  $db = $cfg['db'] ?? null;
  if (is_array($db)
      && !empty($db['host'])
      && !empty($db['dbname'])
      && array_key_exists('user', $db)
      && array_key_exists('pass', $db)) {
    $dsn = 'mysql:host=' . $db['host'] . ';dbname=' . $db['dbname'] . ';charset=' . ($db['charset'] ?? 'utf8mb4');
    $pdo = new PDO($dsn, (string)$db['user'], (string)$db['pass'], [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
      PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    $stmt = $pdo->prepare("SELECT `value` FROM app_settings WHERE `key` = 'home_live_enabled' LIMIT 1");
    $stmt->execute();
    $row = $stmt->fetch();

    if ($row && isset($row['value'])) {
      $value = strtolower(trim((string)$row['value']));
      $homeLiveEnabled = in_array($value, ['1', 'true', 'yes', 'on'], true);
    }
  }
} catch (Throwable $e) {
  $homeLiveEnabled = false;
}

if ($homeLiveEnabled) {
  include __DIR__ . '/index2.php';
  exit;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Ze.EFE</title>
  <style>
    :root {
      color-scheme: light;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      font-family: Arial, sans-serif;
      background: linear-gradient(135deg, #f5f7fa 0%, #e6edf5 100%);
      color: #1f2937;
      text-align: center;
    }

    .notice {
      background: #ffffff;
      border: 1px solid #d7e0ea;
      border-radius: 14px;
      padding: 28px 24px;
      max-width: 560px;
      width: 100%;
      box-shadow: 0 10px 24px rgba(31, 41, 55, 0.08);
    }

    h1 {
      margin: 0;
      font-size: clamp(1.5rem, 3vw, 2rem);
      line-height: 1.35;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <main class="notice">
    <h1>Ze.EFE esta nascendo. Em breve mais informações.</h1>
  </main>
</body>
</html>
