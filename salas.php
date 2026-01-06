
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
<body>
  <header class="site-header">
    <div class="site-header-inner">
      <div class="site-header-left">
        <a href="index.html" class="site-logo">
          <img src="img/logo.jpg" alt="Ze.EFE" />
        </a>
        <nav class="site-nav">
          <a href="salas.html" aria-current="page">Salas</a>
          <a href="workshops.html">Cursos</a>
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
      <h3>Salas para encontros presenciais</h3>
      <p>Espaços completos e prontos para receber suas ideias mais inspiradoras.</p>
    </div>
    <div class="news-grid">
      <article class="news-card">
        <span class="news-tag">Reuniões</span>
        <h4>Ambientes prontos para reuniões de equipe</h4>
        <p>Salas equipadas para encontros pontuais, apresentações e alinhamentos estratégicos.</p>
      </article>
      <article class="news-card">
        <span class="news-tag">Treinamentos</span>
        <h4>Estrutura para treinamentos e workshops internos</h4>
        <p>Capacidade para pequenos grupos, com recursos de multimídia e apoio local.</p>
      </article>
      <article class="news-card">
        <span class="news-tag">Atendimentos</span>
        <h4>Salas acolhedoras para atendimentos individuais</h4>
        <p>Opções pensadas para consultas, mentorias e conversas mais reservadas.</p>
      </article>
    </div>
  </section>

  <section class="filters" aria-label="Filtros de capacidade">
    <button data-filter="all" class="filter-btn active">Todas</button>
    <button data-filter="up-to-10" class="filter-btn">Até 10 pessoas</button>
    <button data-filter="11-20" class="filter-btn">11-20 pessoas</button>
    <button data-filter="over-20" class="filter-btn">Mais de 20</button>
  </section>

  <!-- Filtros avançados (busca, localização, capacidade e comodidades) -->
  <section class="rooms-filters" aria-label="Filtros de salas">
    <div class="filters-wrap">
      <input id="filterQuerySalas" type="text" placeholder="Buscar por nome ou local" aria-label="Buscar por nome ou local" />
      <select id="filterStateSalas" aria-label="Estado (UF)">
        <option value="">UF (todas)</option>
      </select>
      <select id="filterCitySalas" aria-label="Cidade">
        <option value="">Cidade (todas)</option>
      </select>
      <select id="filterCapacitySalas" aria-label="Capacidade">
        <option value="">Capacidade (todas)</option>
        <option value="10">Até 10</option>
        <option value="20">Até 20</option>
        <option value="50">Até 50</option>
        <option value="51">Mais de 50</option>
      </select>
      <button id="openAdvancedFilters" class="btn btn-secondary btn-sm" type="button">Filtros avançados</button>
      <button id="clearFiltersSalas" class="btn btn-secondary btn-sm" type="button">Limpar filtros</button>
    </div>
  </section>

  <!-- Mapa de salas (mesma experiência do index) -->
  <section class="landing-section">
    <div class="section-heading">
      <h3>Encontre no mapa</h3>
      <p>Visualize onde estão as salas disponíveis. Clique nos marcadores para detalhes.</p>
    </div>
    <div id="rooms-map-salas" class="rooms-map" role="region" aria-label="Mapa de salas"></div>
  </section>

  <section class="rooms-showcase landing-section">
    <div class="section-heading">
      <h3>Salas disponíveis</h3>
      <p class="rooms-subtitle">Visualização compacta, igual à página inicial.</p>
    </div>
    <div id="rooms-message" class="rooms-message"></div>
    <div class="rooms-carousel">
      <button class="rooms-nav rooms-nav-prev" type="button" aria-label="Ver salas anteriores"><span aria-hidden="true">&lsaquo;</span></button>
      <div id="rooms-strip-salas" class="rooms-strip" aria-live="polite"></div>
      <button class="rooms-nav rooms-nav-next" type="button" aria-label="Ver mais salas"><span aria-hidden="true">&rsaquo;</span></button>
    </div>
  </section>
  <div class="modal-overlay" id="advancedFiltersModal" aria-hidden="true">
    <div class="modal-dialog modal-small advanced-filters-dialog" role="dialog" aria-modal="true" aria-labelledby="advancedFiltersTitle">
      <button class="modal-close" type="button" aria-label="Fechar" id="advancedFiltersClose">&times;</button>
      <div class="modal-body">
        <div class="modal-info advanced-filters-modal">
          <h2 id="advancedFiltersTitle">Filtros avançados</h2>
          <div class="advanced-filters-section">
            <h4>Modalidade de pagamento</h4>
            <div id="paymentFilters" class="checkbox-grid">
              <label><input type="checkbox" value="immediate" /> Pagamento no momento da Reserva</label>
              <label><input type="checkbox" value="cancel_window" /> Cancelamento da Reserva</label>
              <label><input type="checkbox" value="free_cancel" /> Sem taxa de cancelamento</label>
            </div>
          </div>
          <div class="advanced-filters-section">
            <h4>Comodidades</h4>
            <div id="amenityFilters" class="checkbox-grid" aria-label="Comodidades"></div>
          </div>
          <div class="advanced-filters-section">
            <h4>Formato da sala</h4>
            <div id="formatFilters" class="checkbox-grid">
              <label><input type="checkbox" value="reuniao" /> Reunião</label>
              <label><input type="checkbox" value="workshop" /> Workshop</label>
            </div>
          </div>
          <div class="advanced-filters-actions">
            <button id="advancedFiltersClear" class="btn btn-secondary" type="button">Limpar</button>
            <button id="advancedFiltersApply" class="btn btn-primary" type="button">Aplicar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-overlay" id="roomModal" aria-hidden="true">
  <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="roomModalTitle">
    <button class="modal-close" type="button" aria-label="Fechar" id="roomModalClose">&times;</button>
    <div class="modal-body">
      <div class="modal-gallery" id="roomModalGallery"></div>
      <div class="modal-info">
        <h2 id="roomModalTitle"></h2>
        <p id="roomModalDescription"></p>
        <dl class="modal-details">
          <div><dt>Capacidade</dt><dd id="roomModalCapacity"></dd></div>
          <div><dt>Status</dt><dd id="roomModalStatus"></dd></div>
          <div><dt>Localização</dt><dd id="roomModalLocation"></dd></div>
          <div><dt>Valor diário</dt><dd id="roomModalRate"></dd></div>
        </dl>
        <div id="roomModalAmenities" class="modal-amenities"></div>
      </div>
    </div>
    <div class="modal-footer">
      <a id="roomModalReserve" class="btn btn-primary" href="#">Reservar diária</a>
      <button class="btn btn-secondary" type="button" id="roomModalCloseFooter">Fechar</button>
    </div>
  </div>
  </div>
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

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin="" defer></script>
<script src="scripts/components/carousel.js" defer></script>
<script src="scripts/salas.js" defer></script>


</body>
</html>
