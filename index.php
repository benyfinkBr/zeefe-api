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
      .site-nav {
        display: none;
      }

      .home-launch-card {
        padding: 30px 22px;
      }
    }
  </style>
</head>
<body class="home-launch-page">
  <header class="site-header">
    <div class="site-header-inner">
      <div class="site-header-left">
        <a href="index.php" class="site-logo" aria-current="page">
          <img src="img/logo.jpg" alt="Ze.EFE" />
        </a>
        <nav class="site-nav">
          <a href="salas.html">Salas</a>
          <a href="workshops.html">Cursos</a>
          <a href="conteudos.html">Conteudos</a>
          <a href="quemsomos.html">Quem somos</a>
        </nav>
      </div>
      <div class="site-header-actions">
        <a href="#contato" class="site-link">Contato</a>
      </div>
    </div>
  </header>

  <main class="home-launch-main">
    <section class="home-launch-card" aria-live="polite">
      <p class="home-launch-kicker">Nova fase</p>
      <h1>A Ze.EFE esta nascendo.</h1>
      <p>Em breve mais informacoes.</p>
    </section>
  </main>

  <footer class="site-footer" id="contato">
    <div class="site-footer-inner">
      <div class="footer-column footer-map">
        <h3>Mapa do site</h3>
        <div class="footer-links-grid">
          <div>
            <h4>Salas</h4>
            <a href="salas.html">Ver todas as salas</a>
          </div>
          <div>
            <h4>Cursos</h4>
            <a href="workshops.html">Agenda de cursos e workshops</a>
          </div>
          <div>
            <h4>Area do Cliente</h4>
            <a href="clientes.html">Reservas e visitantes</a>
          </div>
          <div>
            <h4>Anunciante</h4>
            <a href="anunciante.html">Cadastrar salas e cursos</a>
          </div>
        </div>
      </div>
      <div class="footer-column footer-contact">
        <h3>Contato</h3>
        <p>contato@zeefe.com.br | <a href="https://wa.me/11922293332?text=Ola,%20gostaria%20de%20mais%20informacoes.">(11) 9.2229-3332</a></p>
        <p>Moema, Sao Paulo - SP</p>
        <p><a href="https://www.instagram.com/zeefe_brasil/">Instagram</a> | <a href="https://www.linkedin.com/company/ze-efe">LinkedIn</a></p>
      </div>
    </div>
    <div class="site-footer-bottom">
      <div class="footer-powered">
        <span>Powered by</span>
        <div class="footer-powered-logos">
          <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='110' height='30'><text x='5' y='20' font-family='Arial' font-size='16' fill='%23005CAB'>HostGator</text></svg>" alt="HostGator" loading="lazy">
          <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='130' height='30'><text x='5' y='20' font-family='Arial' font-size='16' fill='%2300317A'>Contabilizei</text></svg>" alt="Contabilizei" loading="lazy">
          <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='110' height='30'><text x='5' y='20' font-family='Arial' font-size='16' fill='%2300B376'>Stripe</text></svg>" alt="Stripe" loading="lazy">
          <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='30'><text x='5' y='20' font-family='Arial' font-size='16' fill='%23E10D5C'>cora</text></svg>" alt="Cora" loading="lazy">
        </div>
      </div>
      <p>© 2026 Ze.EFE - Todos os direitos reservados</p>
    </div>
  </footer>
</body>
</html>
