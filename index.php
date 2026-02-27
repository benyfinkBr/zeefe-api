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
      min-height: 100vh;
      margin: 0;
      display: grid;
      place-items: center;
      padding: 28px;
      background:
        radial-gradient(1000px 520px at 8% 8%, rgba(29, 65, 58, 0.18) 0%, rgba(29, 65, 58, 0) 60%),
        radial-gradient(900px 440px at 92% 92%, rgba(138, 119, 102, 0.22) 0%, rgba(138, 119, 102, 0) 62%),
        linear-gradient(145deg, #f5f0e9 0%, #efe8de 44%, #e8dfd3 100%);
    }

    .home-launch-main {
      width: 100%;
      max-width: 860px;
    }

    .home-launch-card {
      position: relative;
      overflow: hidden;
      width: 100%;
      background: linear-gradient(160deg, #ffffff 0%, #fbfaf8 100%);
      border: 1px solid rgba(29, 65, 58, 0.16);
      border-radius: 26px;
      padding: 48px 40px 42px;
      box-shadow: 0 26px 52px rgba(29, 65, 58, 0.16);
      text-align: center;
    }

    .home-launch-card::before {
      content: "";
      position: absolute;
      top: -85px;
      right: -85px;
      width: 250px;
      height: 250px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(29, 65, 58, 0.15) 0%, rgba(29, 65, 58, 0) 70%);
      pointer-events: none;
    }

    .home-launch-card::after {
      content: "";
      position: absolute;
      bottom: -70px;
      left: -70px;
      width: 220px;
      height: 220px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(138, 119, 102, 0.2) 0%, rgba(138, 119, 102, 0) 68%);
      pointer-events: none;
    }

    .home-launch-logo {
      width: 138px;
      height: auto;
      margin-bottom: 18px;
    }

    .home-launch-kicker {
      margin: 0 0 14px;
      letter-spacing: .08em;
      text-transform: uppercase;
      font-size: .78rem;
      color: var(--brand-muted);
      font-weight: 700;
    }

    .home-launch-card h1 {
      margin: 0;
      color: var(--brand-green);
      line-height: 1.2;
      font-size: clamp(2rem, 4.4vw, 3rem);
      font-weight: 800;
    }

    .home-launch-sub {
      margin: 14px 0 0;
      color: #3f4b47;
      font-size: clamp(1rem, 2.1vw, 1.2rem);
    }

    .home-launch-pill {
      margin: 24px auto 0;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: 1px solid rgba(29, 65, 58, 0.25);
      background: #f3eee7;
      color: var(--brand-green);
      border-radius: 999px;
      padding: 8px 14px;
      font-size: .84rem;
      font-weight: 700;
    }

    .home-launch-pill::before {
      content: "";
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #1d8a5c;
      box-shadow: 0 0 0 4px rgba(29, 138, 92, 0.16);
    }

    @media (max-width: 700px) {
      .home-launch-card {
        padding: 36px 24px 32px;
      }

      .home-launch-logo {
        width: 120px;
      }
    }
  </style>
</head>
<body class="home-launch-page">
  <main class="home-launch-main">
    <section class="home-launch-card" aria-live="polite">
      <img class="home-launch-logo" src="img/logo.jpg" alt="Ze.EFE" />
      <p class="home-launch-kicker">Nova fase</p>
      <h1>A Ze.EFE esta nascendo.</h1>
      <p class="home-launch-sub">Em breve mais informacoes.</p>
      <div class="home-launch-pill">Lançamento em preparacao</div>
    </section>
  </main>
</body>
</html>
