<?php require __DIR__ . '/includes/header.php'; ?>

<main>
  <section class="landing-section">
    <div class="section-heading">
      <h3>Workshops &amp; Cursos Ze.EFE</h3>
      <p>Descubra experiências presenciais na mesma estrutura acolhedora das salas Ze.EFE.</p>
    </div>
    <div class="news-grid">
      <article class="news-card">
        <span class="news-tag">Workshops</span>
        <h4>Encontros presenciais para pequenos grupos</h4>
        <p>Formatos pensados para troca e prática, com foco em temas do dia a dia das empresas.</p>
      </article>
      <article class="news-card">
        <span class="news-tag">Cursos</span>
        <h4>Programas estruturados em salas Ze.EFE</h4>
        <p>Use nossas salas já equipadas para oferecer cursos abertos ou turmas fechadas.</p>
      </article>
      <article class="news-card">
        <span class="news-tag">Experiência</span>
        <h4>Infraestrutura pronta e gestão centralizada</h4>
        <p>Reserva, comunicação com participantes e indicadores em um só lugar.</p>
      </article>
    </div>
  </section>

  <section class="landing-section">
    <div class="section-heading">
      <h3>Próximos workshops</h3>
      <p>Veja os eventos disponíveis e escolha em qual deseja participar.</p>
    </div>
    <div id="workshopsMessage" class="rooms-message"></div>
    <div id="workshopsGrid" class="rooms-grid"></div>
  </section>

  <section class="landing-section">
    <div class="section-heading">
      <h3>Cadastre seu workshop</h3>
      <p>Quer promover um workshop ou curso presencial em uma sala Ze.EFE? Cadastre seu evento.</p>
    </div>
    <form id="workshopForm" class="form-card">
      <div class="form-row">
        <label for="wsTitle">Título</label>
        <input type="text" id="wsTitle" required />
      </div>
      <div class="form-grid-mini">
        <div>
          <label for="wsCity">Cidade</label>
          <input type="text" id="wsCity" />
        </div>
        <div>
          <label for="wsDate">Data</label>
          <input type="date" id="wsDate" />
        </div>
      </div>
      <div class="form-row">
        <label for="wsDesc">Descrição</label>
        <textarea id="wsDesc" rows="4"></textarea>
      </div>
      <button class="btn btn-primary" type="button" id="wsSubmit">Enviar</button>
    </form>
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

<script src="/scripts/workshops.js" defer></script>
</body>
</html>
