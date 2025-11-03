(() => {
  const ACTIVE_CLASS = 'image-carousel-active';

  function normalizeImages(images = []) {
    return images
      .map(src => (typeof src === 'string' ? src.trim() : ''))
      .filter(Boolean);
  }

  function createButton(label, className) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = className;
    btn.setAttribute('aria-label', label);
    btn.textContent = className.includes('prev') ? '‹' : '›';
    return btn;
  }

  function buildLightbox(images, altPrefix) {
    const overlay = document.createElement('div');
    overlay.className = 'image-carousel-lightbox';
    overlay.innerHTML = `
      <div class="image-carousel-lightbox-backdrop"></div>
      <div class="image-carousel-lightbox-content" role="dialog" aria-modal="true">
        <button type="button" class="image-carousel-close" aria-label="Fechar visualização">&times;</button>
        <div class="image-carousel-lightbox-track"></div>
      </div>
    `;

    const track = overlay.querySelector('.image-carousel-lightbox-track');
    const slides = images.map((src, idx) => {
      const slide = document.createElement('div');
      slide.className = 'image-carousel-slide';
      const img = document.createElement('img');
      img.src = src;
      img.alt = `${altPrefix} ${idx + 1}`;
      slide.appendChild(img);
      track.appendChild(slide);
      return slide;
    });

    const prev = createButton('Anterior', 'image-carousel-control prev');
    const next = createButton('Próxima', 'image-carousel-control next');
    overlay.querySelector('.image-carousel-lightbox-content').append(prev, next);

    let current = 0;

    const goTo = index => {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.classList.toggle(ACTIVE_CLASS, i === current);
      });
    };

    prev.addEventListener('click', () => goTo(current - 1));
    next.addEventListener('click', () => goTo(current + 1));

    if (slides.length <= 1) {
      prev.style.display = 'none';
      next.style.display = 'none';
    }

    const close = () => {
      overlay.classList.remove('show');
      document.body.classList.remove('image-carousel-no-scroll');
    };

    overlay.querySelector('.image-carousel-close').addEventListener('click', close);
    overlay.querySelector('.image-carousel-lightbox-backdrop').addEventListener('click', close);
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && overlay.classList.contains('show')) {
        close();
      }
    });

    document.body.appendChild(overlay);

    return {
      element: overlay,
      open(startIndex = 0) {
        if (!slides.length) return;
        goTo(startIndex);
        overlay.classList.add('show');
        document.body.classList.add('image-carousel-no-scroll');
      }
    };
  }

  function createImageCarousel(options = {}) {
  const {
      images = [],
      altPrefix = 'Imagem',
      showThumbnails = false,
      allowLightbox = false
    } = options;

  const normalized = normalizeImages(images);
  const wrapper = document.createElement('div');
  wrapper.className = 'image-carousel';
  if (allowLightbox) wrapper.classList.add('image-carousel-interactive');
    if (!normalized.length) {
      wrapper.classList.add('image-carousel-empty');
      wrapper.innerHTML = '<div class="image-carousel-placeholder">Sem imagens</div>';
      return { element: wrapper, update: () => {}, openLightbox: () => {} };
    }

    const track = document.createElement('div');
    track.className = 'image-carousel-track';
    wrapper.appendChild(track);

    const slides = normalized.map((src, idx) => {
      const slide = document.createElement('div');
      slide.className = 'image-carousel-slide';
      const img = document.createElement('img');
      img.src = src;
      img.alt = `${altPrefix} ${idx + 1}`;
      slide.appendChild(img);
      track.appendChild(slide);
      return slide;
    });

    const prev = createButton('Imagem anterior', 'image-carousel-control prev');
    const next = createButton('Próxima imagem', 'image-carousel-control next');
    wrapper.append(prev, next);

    let current = 0;

    const goTo = index => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        slide.classList.toggle(ACTIVE_CLASS, i === current);
      });
      if (showThumbnails) {
        thumbnails.forEach((btn, i) => btn.classList.toggle('active', i === current));
      }
    };

    prev.addEventListener('click', () => goTo(current - 1));
    next.addEventListener('click', () => goTo(current + 1));

    if (slides.length <= 1) {
      prev.style.display = 'none';
      next.style.display = 'none';
    }

    let thumbnails = [];
    if (showThumbnails) {
      const thumbBar = document.createElement('div');
      thumbBar.className = 'image-carousel-thumbnails';
      thumbnails = normalized.map((src, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'image-carousel-thumb';
        btn.innerHTML = `<img src="${src}" alt="${altPrefix} miniatura ${idx + 1}">`;
        btn.addEventListener('click', () => goTo(idx));
        thumbBar.appendChild(btn);
        return btn;
      });
      wrapper.appendChild(thumbBar);
    }

    let lightbox = null;
    if (allowLightbox) {
      lightbox = buildLightbox(normalized, altPrefix);
      slides.forEach((slide, idx) => {
        slide.addEventListener('click', () => lightbox.open(idx));
      });
    }

    goTo(0);

    return {
      element: wrapper,
      goTo,
      openLightbox(index = 0) {
        if (lightbox) lightbox.open(index);
      },
      update(newImages = []) {
        const fresh = normalizeImages(newImages);
        track.innerHTML = '';
        thumbnails.forEach(btn => btn.remove());
        thumbnails = [];
        if (!fresh.length) return;
        fresh.forEach((src, idx) => {
          const slide = document.createElement('div');
          slide.className = 'image-carousel-slide';
          const img = document.createElement('img');
          img.src = src;
          img.alt = `${altPrefix} ${idx + 1}`;
          slide.appendChild(img);
          if (allowLightbox) {
            slide.addEventListener('click', () => lightbox && lightbox.open(idx));
          }
          track.appendChild(slide);
        });
      }
    };
  }

  window.createImageCarousel = createImageCarousel;
})();
