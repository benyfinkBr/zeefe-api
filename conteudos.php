<?php require __DIR__ . '/includes/header.php'; ?>

<main>
  <section class="landing-section">
    <div class="section-heading">
      <h3>Conteúdos para encontros presenciais</h3>
      <p>Ideias, boas práticas e novidades para quem organiza reuniões, treinamentos e workshops.</p>
    </div>
    <div id="conteudosGrid" class="news-grid"></div>
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

<script src="/scripts/conteudos.js" defer></script>
</body>
</html>
