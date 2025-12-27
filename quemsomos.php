<?php require __DIR__ . '/includes/bootstrap.php'; ?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Quem somos — Ze.EFE</title>
  <link rel="stylesheet" href="/style.css?v=20241222" />
</head>
<body>
<?php require __DIR__ . '/includes/header.php'; ?>

<main>
  <section class="landing-section">
    <div class="section-heading">
      <h3>Quem somos</h3>
      <p>Saiba mais sobre a Ze.EFE, nossas salas e como apoiamos encontros presenciais.</p>
    </div>
    <div class="news-grid">
      <article class="news-card">
        <span class="news-tag">Sobre</span>
        <h4>Espaços pensados para colaboração</h4>
        <p>Salas equipadas para reuniões, workshops e cursos com conforto e tecnologia.</p>
      </article>
      <article class="news-card">
        <span class="news-tag">Equipe</span>
        <h4>Time dedicado</h4>
        <p>Suporte antes, durante e após suas reservas, garantindo boa experiência.</p>
      </article>
      <article class="news-card">
        <span class="news-tag">Propósito</span>
        <h4>Conectar pessoas presencialmente</h4>
        <p>Ambientes acolhedores para que ideias aconteçam e negócios prosperem.</p>
      </article>
    </div>
  </section>
</main>

<footer class="site-footer">
  <div class="site-footer-inner">
    <div class="footer-column footer-map">
      <h3>Mapa do site</h3>
      <div class="footer-links-grid">
        <div>
          <h4>Salas</h4>
          <a href="/salas.php">Ver todas as salas</a>
        </div>
        <div>
          <h4>Cursos</h4>
          <a href="/workshops.php">Agenda de cursos e workshops</a>
        </div>
        <div>
          <h4>Área do Cliente</h4>
          <a href="/clientes.php">Reservas e visitantes</a>
        </div>
        <div>
          <h4>Anunciante</h4>
          <a href="/anunciante.php">Portal do Anunciante</a>
        </div>
      </div>
    </div>
    <div class="footer-column footer-contact">
      <h3>Contato</h3>
      <p>Email: contato@zeefe.com.br</p>
      <p>Telefone: (11) 1234-5678</p>
      <p>Endereço: Moema, São Paulo - SP</p>
    </div>
    <div class="footer-column footer-newsletter">
      <h3>Receba novidades</h3>
      <form id="newsletterForm">
        <input type="email" placeholder="Seu e-mail" required />
        <button type="submit" class="btn btn-primary">Assinar</button>
      </form>
    </div>
  </div>
</footer>

<script src="/scripts/quemsomos.js" defer></script>
</body>
</html>
