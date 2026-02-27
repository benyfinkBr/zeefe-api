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
  <title>Ze.EFE - Em breve</title>
  <link rel="stylesheet" href="style.css" />
  <style>
    .home-launch-page {
      background: var(--brand-cream);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .home-launch-main {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
      background: radial-gradient(circle at 10% 10%, #ffffff 0%, rgba(245, 240, 233, 0.95) 45%, rgba(230, 222, 212, 0.9) 100%);
    }

    .home-launch-card {
      width: min(760px, 100%);
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 22px;
      padding: 40px 32px;
      box-shadow: var(--shadow-soft);
      text-align: center;
    }

    .home-launch-kicker {
      margin: 0 0 10px;
      letter-spacing: .08em;
      text-transform: uppercase;
      font-size: .82rem;
      color: var(--brand-muted);
      font-weight: 700;
    }

    .home-launch-card h1 {
      margin: 0;
      color: var(--brand-green);
      line-height: 1.25;
      font-size: clamp(1.8rem, 4vw, 2.6rem);
    }

    .home-launch-card p {
      margin: 12px 0 0;
      color: #3f4b47;
      font-size: clamp(1rem, 2vw, 1.15rem);
    }

    @media (max-width: 700px) {
      .home-launch-card {
        padding: 30px 22px;
      }
    }
  </style>
</head>
<body class="home-launch-page">
  <main class="home-launch-main">
    <section class="home-launch-card" aria-live="polite">
      <p class="home-launch-kicker">Nova fase</p>
      <h1>A Ze.EFE esta nascendo.</h1>
      <p>Em breve mais informacoes.</p>
    </section>
  </main>
</body>
</html>
