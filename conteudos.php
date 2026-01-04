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
  <title>Conteúdos — Ze.EFE</title>
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
          <a href="workshops.html">Cursos</a>
          <a href="conteudos.html" aria-current="page">Conteúdos</a>
          <a href="quemsomos.html">Quem somos</a>
        </nav>
      </div>
      <div class="site-header-actions">
        <a href="index.html#contato" class="site-link">Contato</a>
        <button class="btn btn-outline" type="button" onclick="window.location='clientes.html'">Entrar</button>
      </div>
    </div>
  </header>

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
  <script>
    (async () => {
      const grid = document.getElementById('conteudosGrid');
      if (!grid) return;
      grid.innerHTML = '<p class="rooms-message">Carregando conteúdos...</p>';
      try {
        const res = await fetch('api/apiget.php?table=posts');
        const json = await res.json();
        if (!json.success) {
          grid.innerHTML = '<p class="rooms-message">Não foi possível carregar os conteúdos.</p>';
          return;
        }
        const normalizeCoverPath = (path) => {
          const raw = String(path || '').trim();
          if (!raw) return '';
          if (raw.startsWith('data:')) return raw;
          if (/^https?:\/\//i.test(raw)) return raw;
          const idx = raw.indexOf('/img/posts/');
          if (idx !== -1) return raw.slice(idx);
          if (raw.startsWith('img/')) return raw;
          if (raw.startsWith('/')) return raw;
          return '/' + raw;
        };
        const attachCover = (img, rawPath, wrap, alt) => {
          const primary = normalizeCoverPath(rawPath);
          if (!primary) return false;
          img.alt = alt;
          img.src = primary;
          let fallback = '';
          if (!/^https?:\/\//i.test(primary) && !primary.startsWith('data:')) {
            fallback = primary.startsWith('/') ? primary.slice(1) : '/' + primary;
          }
          img.addEventListener('error', () => {
            if (fallback) {
              img.src = fallback;
              fallback = '';
              return;
            }
            img.remove();
            wrap.classList.add('is-missing');
            wrap.textContent = 'Imagem indisponível';
          });
          return true;
        };
        const sharePanels = new Set();
        const closeSharePanels = (event) => {
          if (event && event.target.closest('.share-menu')) return;
          sharePanels.forEach(panel => {
            panel.hidden = true;
          });
        };
        document.addEventListener('click', closeSharePanels);
        const openShareWindow = (url) => window.open(url, '_blank', 'noopener');
        const createShareActions = (titleText, url) => {
          const wrap = document.createElement('div');
          wrap.className = 'news-card-share';

          const whatsappBtn = document.createElement('button');
          whatsappBtn.type = 'button';
          whatsappBtn.className = 'btn btn-secondary btn-sm';
          whatsappBtn.textContent = 'WhatsApp';
          whatsappBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            const text = encodeURIComponent(`${titleText} ${url}`);
            openShareWindow(`https://web.whatsapp.com/send?text=${text}`);
          });
          wrap.appendChild(whatsappBtn);

          const shareMenu = document.createElement('div');
          shareMenu.className = 'share-menu';
          const menuToggle = document.createElement('button');
          menuToggle.type = 'button';
          menuToggle.className = 'btn btn-secondary btn-sm';
          menuToggle.textContent = 'Compartilhar';

          const menuPanel = document.createElement('div');
          menuPanel.className = 'share-menu-panel';
          menuPanel.hidden = true;
          sharePanels.add(menuPanel);

          const menuItems = [
            { key: 'x', label: 'X' },
            { key: 'facebook', label: 'Facebook' },
            { key: 'linkedin', label: 'LinkedIn' },
            { key: 'email', label: 'E-mail' },
            { key: 'copy', label: 'Copiar link' }
          ];
          menuItems.forEach(item => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.dataset.share = item.key;
            btn.textContent = item.label;
            menuPanel.appendChild(btn);
          });

          menuToggle.addEventListener('click', (event) => {
            event.stopPropagation();
            const willOpen = menuPanel.hidden;
            closeSharePanels();
            menuPanel.hidden = !willOpen;
          });

          menuPanel.addEventListener('click', (event) => {
            const btn = event.target.closest('button[data-share]');
            if (!btn) return;
            const type = btn.dataset.share;
            const title = encodeURIComponent(titleText);
            const shareUrl = encodeURIComponent(url);
            if (type === 'x') {
              openShareWindow(`https://twitter.com/intent/tweet?text=${title}&url=${shareUrl}`);
            } else if (type === 'facebook') {
              openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`);
            } else if (type === 'linkedin') {
              openShareWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`);
            } else if (type === 'email') {
              window.location.href = `mailto:?subject=${title}&body=${shareUrl}`;
            } else if (type === 'copy') {
              if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(url).then(() => {
                  const original = menuToggle.textContent;
                  menuToggle.textContent = 'Copiado!';
                  setTimeout(() => { menuToggle.textContent = original; }, 1400);
                });
              } else {
                window.prompt('Copie o link:', url);
              }
            }
            menuPanel.hidden = true;
          });

          shareMenu.appendChild(menuToggle);
          shareMenu.appendChild(menuPanel);
          wrap.appendChild(shareMenu);
          return wrap;
        };
        let posts = json.data || [];
        const now = new Date();
        const isPublished = (post) => {
          const status = (post.status || '').toLowerCase();
          if (status !== 'publicado') return false;
          if (!post.published_at) return true;
          const scheduled = new Date(post.published_at);
          if (Number.isNaN(scheduled.getTime())) return true;
          return scheduled <= now;
        };
        posts = posts.filter(isPublished);
        if (!posts.length) {
          grid.innerHTML = '<p class="rooms-message">Nenhum conteúdo publicado no momento.</p>';
          return;
        }
        posts.sort((a, b) => {
          const da = a.published_at ? new Date(a.published_at).getTime() : 0;
          const db = b.published_at ? new Date(b.published_at).getTime() : 0;
          if (db !== da) return db - da;
          return (b.id || 0) - (a.id || 0);
        });
        grid.innerHTML = '';
        posts.forEach(p => {
          const card = document.createElement('article');
          card.className = 'news-card';
          const detailUrl = new URL(`conteudo-detalhe.html?id=${p.id}`, window.location.href).toString();
          if (p.cover_path) {
            const coverWrap = document.createElement('div');
            coverWrap.className = 'news-card-cover';
            const img = document.createElement('img');
            if (attachCover(img, p.cover_path, coverWrap, p.title || 'Imagem do conteúdo')) {
              coverWrap.appendChild(img);
            }
            card.appendChild(coverWrap);
          }
          const tag = document.createElement('span');
          tag.className = 'news-tag';
          tag.textContent = p.category_name || p.category || 'Conteúdo';
          card.appendChild(tag);
          const title = document.createElement('h4');
          const link = document.createElement('a');
          link.href = detailUrl;
          link.textContent = p.title || 'Conteúdo';
          title.appendChild(link);
          card.appendChild(title);
          const summary = document.createElement('p');
          summary.textContent = p.summary || '';
          card.appendChild(summary);
          card.appendChild(createShareActions(p.title || 'Conteúdo Ze.EFE', detailUrl));
          grid.appendChild(card);
        });
      } catch (e) {
        console.error(e);
        grid.innerHTML = '<p class="rooms-message">Não foi possível carregar os conteúdos.</p>';
      }
    })();
  </script>
</body>
</html>
