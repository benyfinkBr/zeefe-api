<!DOCTYPE html>
<html lang="pt-BR">
<head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-17483604386"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'AW-17483604386');
</script>

  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Workshops e Cursos — Ze.EFE</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <header class="site-header">
    <div class="site-header-inner">
      <div class="site-header-left">
        <a href="index.html" class="site-logo">
          <img src="img/logo.jpg" alt="Ze.EFE" />
        </a>
        <nav class="site-nav">
          <a href="salas.html">Salas</a>
          <a href="workshops.html" aria-current="page">Cursos</a>
          <a href="conteudos.html">Conteúdos</a>
          <a href="quemsomos.html">Quem somos</a>
        </nav>
      </div>
      <div class="site-header-actions">
        <a href="index.html#contato" class="site-link">Contato</a>
        <div class="site-header-guest" data-zeefe-header="guest">
          <button class="btn btn-outline" type="button" id="openLoginChoice" data-zeefe-header-btn="login">Entrar</button>
        </div>
        <div class="site-header-user" data-zeefe-header="account" hidden>
          <button class="user-menu-trigger" type="button" data-zeefe-header-btn="account" aria-haspopup="true" aria-expanded="false">
            <span data-zeefe-header-label="account">Minha Conta</span>
          </button>
          <div class="user-menu-dropdown" role="menu">
            <p class="user-menu-label" data-zeefe-header-label="user"></p>
            <button type="button" class="user-menu-item" data-zeefe-header-btn="portal">Ir para o portal</button>
            <button type="button" class="user-menu-item user-menu-danger" data-zeefe-header-btn="logout">Sair</button>
          </div>
        </div>
      </div>
    </div>
  </header>

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
      <div id="workshopsList" class="workshops-grid" aria-live="polite"></div>
    </section>
  </main>

  <!-- Modal: Detalhes do workshop -->
  <div class="modal-overlay" id="workshopDetailsModal" aria-hidden="true">
    <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="workshopDetailsTitle" style="width:900px; max-width:96vw;">
      <button class="modal-close" type="button" id="workshopDetailsClose" aria-label="Fechar">&times;</button>
      <div class="modal-body">
        <div class="modal-info" style="padding:20px; width:100%">
          <div class="workshop-details-header">
            <div>
              <h2 id="workshopDetailsTitle" style="margin:0 0 6px">Workshop</h2>
              <p id="workshopDetailsMeta" class="modal-intro" style="margin-bottom:0;"></p>
            </div>
            <aside class="workshop-cta-box">
              <a href="clientes.html" class="btn btn-primary btn-sm">Quero Participar</a>
            </aside>
          </div>
          <div class="workshop-details-layout" style="display:grid; grid-template-columns:minmax(0,2fr) minmax(0,1.4fr); gap:16px; align-items:flex-start;">
            <div>
              <div id="workshopDetailsCoverWrapper" style="margin-bottom:12px; display:none;">
                <img id="workshopDetailsCover" src="" alt="Imagem do workshop" style="width:100%; border-radius:14px; object-fit:cover; max-height:260px;">
              </div>
              <h3 style="margin:0 0 4px; font-size:1rem;">Sobre o evento</h3>
              <p id="workshopDetailsDescription" class="rooms-message" style="margin:4px 0 0;"></p>
            </div>
            <aside>
              <div class="summary-card">
                <h4 style="margin:0 0 6px; font-size:0.95rem;">Informações rápidas</h4>
                <ul style="list-style:none; padding:0; margin:0; font-size:0.9rem;">
                  <li id="workshopDetailsWhen"></li>
                  <li id="workshopDetailsWhere"></li>
                  <li id="workshopDetailsPrice"></li>
                  <li id="workshopDetailsSeats"></li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  </div>

  <footer class="site-footer">
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
            <h4>Área do Cliente</h4>
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
        <p>contato@zeefe.com | <a href="https://wa.me/11922293332?text=Olá,%20gostaria%20de%20mais%20informações.">(11) 9.2229-3332</a></p>
        <p>Moema, São Paulo - SP</p>
        <p><a href="https://www.instagram.com/zeefe_brasil/">Instagram</a> | <a href="https://www.linkedin.com/company/zeefe/about/?viewAsMember=true">LinkedIn</a></p>
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
      <p>© 2025 Ze.EFE - Todos os direitos reservados</p>
    </div>
  </footer>
  <div class="modal-overlay" id="entryChoiceModal" aria-hidden="true">
    <div class="modal-dialog modal-small" role="dialog" aria-modal="true" aria-labelledby="entryChoiceTitle">
      <button class="modal-close" type="button" id="entryChoiceClose" aria-label="Fechar">&times;</button>
      <div class="modal-body">
        <div class="modal-info">
          <h2 id="entryChoiceTitle">Como você prefere entrar?</h2>
          <div class="entry-choice-grid">
            <button type="button" class="btn btn-primary entry-choice-btn" data-destino="clientes.html">
              Sou cliente
            </button>
            <button type="button" class="btn btn-secondary entry-choice-btn" data-destino="anunciante.html">
              Sou anunciante
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <script src="scripts/header-session.js" defer></script>
  <script src="scripts/workshops.js" defer></script>
</body>
</html>
