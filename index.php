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
  <title>Ze.EFE - Marca lá!</title>
  <link rel="stylesheet" href="style.css" />
  <!-- Leaflet (mapa) -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
</head>
<body class="home-v2">
  <header class="site-header">
    <div class="site-header-inner">
      <div class="site-header-left">
        <a href="index.html" class="site-logo" aria-current="page">
          <img src="img/logo.jpg" alt="Ze.EFE" />
        </a>
        <nav class="site-nav">
          <a href="salas.html">Salas</a>
          <a href="workshops.html">Cursos</a>
          <a href="conteudos.html">Conteúdos</a>
          <a href="quemsomos.html">Quem somos</a>
        </nav>
      </div>
      <div class="site-header-actions">
        <a href="#contato" class="site-link">Contato</a>
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
    <section class="hero-spotlight">
      <div class="hero-spotlight-inner">
        <div class="hero-spotlight-content">
          <h1>Encontre uma sala para fazer sua reunião!</h1>
          <p>Sem complicação, sem custos ocultos</p>
        </div>
        <form class="hero-search-bar" id="heroSearchForm">
          <div class="hero-search-field hero-location-field">
            <label for="heroLocation">Local</label>
            <input id="heroLocation" type="text" placeholder="Selecione um local..." readonly aria-haspopup="dialog" aria-controls="heroLocationModal" />
          </div>
          <div class="hero-search-field hero-search-date">
            <label for="heroDate">Data</label>
            <input id="heroDate" type="date" />
          </div>
          <input id="heroCapacity" type="number" min="1" class="hidden" />
          <input id="filterQuery" type="hidden" />
          <input id="filterType" type="hidden" value="rooms" />
          <button class="btn btn-primary hero-submit" type="submit">Marcar agora</button>
        </form>
      </div>
    </section>

    <section class="home-results">
      <div class="section-heading">
        <h3>Salas em Destaque</h3>
      </div>
      <div id="rooms-message" class="rooms-message"></div>
      <div id="rooms-strip" class="rooms-strip home-rooms-grid" aria-live="polite"></div>
    </section>

    <section class="home-results">
      <div class="section-heading">
        <h3>Cursos & Workshops</h3>
      </div>
      <div id="workshops-message" class="rooms-message"></div>
      <div id="featured-workshops" class="rooms-strip home-workshops-grid"></div>
    </section>

    <section class="home-results">
      <div class="section-heading">
        <h3>Conteúdo</h3>
      </div>
      <div id="content-message" class="rooms-message"></div>
      <div id="home-content-cards" class="home-content-grid"></div>
    </section>
  </main>

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
        <p>contato@zeefe.com.br | <a href="https://wa.me/11922293332?text=Olá,%20gostaria%20de%20mais%20informações.">(11) 9.2229-3332</a></p>
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

  <!-- Modal: escolha de entrada -->
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

  <!-- Modal: seleção de local -->
  <div class="modal-overlay" id="heroLocationModal" aria-hidden="true">
    <div class="modal-dialog modal-small hero-location-dialog" role="dialog" aria-modal="true" aria-labelledby="heroLocationTitle">
      <button class="modal-close" type="button" id="heroLocationClose" aria-label="Fechar">&times;</button>
      <div class="modal-body">
        <div class="modal-info hero-location-modal">
          <h2 id="heroLocationTitle">Selecione seu local</h2>
          <div class="hero-location-fields">
            <label for="heroStateSelect">Estado (UF)</label>
            <select id="heroStateSelect">
              <option value="">Selecione um estado...</option>
            </select>
            <label for="heroCitySelect">Cidade</label>
            <select id="heroCitySelect" disabled>
              <option value="">Selecione uma cidade...</option>
            </select>
            <label for="heroNeighborhoodSelect">Bairro</label>
            <select id="heroNeighborhoodSelect" disabled>
              <option value="">Selecione um bairro...</option>
            </select>
          </div>
          <div class="hero-location-actions">
            <button type="button" class="btn btn-secondary" id="heroLocationCancel">Cancelar</button>
            <button type="button" class="btn btn-primary" id="heroLocationConfirm" disabled>Confirmar</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin="" defer></script>
  <script src="scripts/header-session.js" defer></script>
  <script src="scripts/components/carousel.js" defer></script>
  <script src="scripts/index.js" defer></script>
  <script src="scripts/cookies.js" defer></script>

  <!-- Banner de cookies -->
  <div id="cookieBanner" class="cookie-banner" role="dialog" aria-labelledby="cookieTitle" aria-live="polite" hidden>
    <div class="cookie-inner">
      <p id="cookieTitle"><strong>Usamos cookies</strong> para melhorar sua experiência. Ao continuar, você concorda com nossa política.</p>
      <div class="cookie-actions">
        <button id="cookieAccept" class="btn btn-primary btn-sm">Aceitar</button>
        <button id="cookieDismiss" class="btn btn-secondary btn-sm">Agora não</button>
      </div>
    </div>
  </div>
</body>
</html>
