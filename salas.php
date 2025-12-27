
<?php require __DIR__ . '/includes/header.php'; ?>

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
      <button id="clearFiltersSalas" class="btn btn-secondary btn-sm" type="button">Limpar filtros</button>
    </div>
    <div class="filters-wrap" id="amenityFilters" aria-label="Comodidades"></div>
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
        <p>contato@zeefe.com | (11) 9.6714-7377</p>
        <p>Moema, São Paulo - SP</p>
        <p><a href="#">Instagram</a> | <a href="#">LinkedIn</a></p>
      </div>
    </div>
    <div class="site-footer-bottom">
      <div class="footer-powered">
        <span>Powered by</span>
        <div class="footer-powered-logos">
          <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='110' height='30'><text x='5' y='20' font-family='Arial' font-size='16' fill='%23005CAB'>HostGator</text></svg>" alt="HostGator" loading="lazy">
          <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='130' height='30'><text x='5' y='20' font-family='Arial' font-size='16' fill='%2300317A'>Contabilizei</text></svg>" alt="Contabilizei" loading="lazy">
          <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='110' height='30'><text x='5' y='20' font-family='Arial' font-size='16' fill='%2300B376'>pagar.me</text></svg>" alt="Pagar.me" loading="lazy">
          <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='30'><text x='5' y='20' font-family='Arial' font-size='16' fill='%23E10D5C'>cora</text></svg>" alt="Cora" loading="lazy">
        </div>
      </div>
      <p>© 2025 Ze.EFE - Todos os direitos reservados</p>
    </div>
  </footer>

  <!-- Modal de escolha de entrada -->
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

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin="" defer></script>
<script src="scripts/components/carousel.js" defer></script>
<script src="scripts/header-session.js" defer></script>
<script src="scripts/salas.js" defer></script>


</body>
</html>
