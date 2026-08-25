// IT Planet - Site interactions (enquiry funnel, search, catalogue, promos)

document.addEventListener('DOMContentLoaded', () => {
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      mobileToggle.setAttribute('aria-expanded', navMenu.classList.contains('active'));
    });
  }

  document.querySelectorAll('.dropdown > .nav-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      if (window.innerWidth > 768) return;
      e.preventDefault();
      const parent = link.parentElement;
      document.querySelectorAll('.dropdown.open').forEach((openItem) => {
        if (openItem !== parent) openItem.classList.remove('open');
      });
      parent.classList.toggle('open');
    });
  });

  // Enquiry modal (replaces booking)
  const modal = document.getElementById('enquiry-modal');
  function openEnquiry(prefill) {
    if (!modal) return;
    if (prefill) {
      const issue = modal.querySelector('[name="device_issue"]');
      if (issue && !issue.value) issue.value = prefill;
    }
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeEnquiry() {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.open-enquiry-modal');
    if (trigger) {
      e.preventDefault();
      openEnquiry(trigger.getAttribute('data-prefill') || '');
      return;
    }
    if (e.target === modal || e.target.closest('.modal-close')) {
      closeEnquiry();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeEnquiry();
  });

  const enquiryForm = document.getElementById('enquiry-form');
  if (enquiryForm) {
    enquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const box = document.getElementById('enquiry-success');
      if (box) box.style.display = 'block';
      enquiryForm.reset();
      setTimeout(closeEnquiry, 2200);
    });
  }

  // Promo device interest popups (latest models)
  const promoKey = 'itp_promo_seen_v3';
  if (!sessionStorage.getItem(promoKey) && document.getElementById('device-promo-modal')) {
    setTimeout(() => {
      document.getElementById('device-promo-modal').classList.add('active');
      sessionStorage.setItem(promoKey, '1');
    }, 1800);
  }
  document.querySelectorAll('#device-promo-modal .modal-close, #device-promo-modal .promo-dismiss').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('device-promo-modal')?.classList.remove('active');
    });
  });

  const isPagesRoot = document.body.dataset.root === 'pages';
  const resolveHref = (page) => {
    if (!page) return '#';
    if (!isPagesRoot) return page;
    if (page.startsWith('pages/')) return page.replace(/^pages\//, '');
    if (page.startsWith('images/') || page.startsWith('assets/') || page.startsWith('policies/')) return '../' + page;
    return '../' + page;
  };
  const resolveImg = (img) => {
    if (!img) return '';
    if (!isPagesRoot) return img;
    return img.startsWith('../') ? img : '../' + img.replace(/^\.\.\//, '');
  };

  const searchIndex = [
    ...(window.ITP_CATALOGUE || []),
    ...(window.ITP_SERVICES || []),
  ];

  // Global site search — products + services
  const searchInput = document.getElementById('site-search-input');
  const searchResults = document.getElementById('site-search-results');
  if (searchInput && searchResults && searchIndex.length) {
    const render = (items) => {
      if (!items.length) {
        searchResults.innerHTML = '<div class="search-empty">No matches — try iPhone, PS5, charger, repair, trade-in…</div>';
        searchResults.classList.add('active');
        return;
      }
      searchResults.innerHTML = items.slice(0, 8).map(item => {
        const href = resolveHref(item.page);
        const src = resolveImg(item.image);
        return `<a class="search-result-item" href="${href}">
          <img src="${src}" alt="" loading="lazy" width="44" height="44">
          <span><strong>${item.name}</strong><small>${item.category}</small></span>
        </a>`;
      }).join('');
      searchResults.classList.add('active');
    };
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      if (q.length < 2) {
        searchResults.classList.remove('active');
        searchResults.innerHTML = '';
        return;
      }
      const matches = searchIndex.filter(item =>
        (item.name + ' ' + item.category + ' ' + (item.tags || '')).toLowerCase().includes(q)
      );
      // Prefer exact-ish product name hits first
      matches.sort((a, b) => {
        const as = a.name.toLowerCase().startsWith(q) ? 0 : 1;
        const bs = b.name.toLowerCase().startsWith(q) ? 0 : 1;
        return as - bs;
      });
      render(matches);
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.site-search')) searchResults.classList.remove('active');
    });
  }

  // Catalogue page — products only
  const grid = document.getElementById('catalogue-grid');
  const catSearch = document.getElementById('catalogue-search');
  if (grid && window.ITP_CATALOGUE) {
    let activeCategory = 'All';
    const VAPE_CATS = new Set(['Vapes & Pods', 'Pouches & Heated', 'Coils & Tanks']);
    const CHARGER_CATS = new Set(['Chargers & Power', 'Gadgets']);

    const categoryMatch = (item, cat) => {
      if (cat === 'All') return true;
      if (cat === 'Vapes') return VAPE_CATS.has(item.category);
      if (cat === 'Chargers & Power') return CHARGER_CATS.has(item.category) || item.category === 'Chargers & Power';
      return item.category === cat;
    };

    const paint = () => {
      const q = (catSearch?.value || '').trim().toLowerCase();
      const items = window.ITP_CATALOGUE.filter(item => {
        const catOk = categoryMatch(item, activeCategory);
        const qOk = !q || (item.name + ' ' + (item.tags || '') + ' ' + item.category).toLowerCase().includes(q);
        return catOk && qOk;
      });
      grid.innerHTML = items.map(item => {
        const src = resolveImg(item.image);
        const badge = item.badge ? `<span class="catalogue-badge">${item.badge}</span>` : '';
        const summary = item.summary || "Available in-store at Shepherd's Bush. Ask our team for options.";
        return `<article class="catalogue-card" id="${(item.page || '').split('#')[1] || ''}" data-category="${item.category}">
          <div class="catalogue-card-media">
            <img src="${src}" alt="${item.name}" loading="lazy" width="280" height="180">
            ${badge}
          </div>
          <div class="catalogue-card-body">
            <span class="catalogue-pill">${item.category}</span>
            <h3>${item.name}</h3>
            <p>${summary}</p>
            <div class="catalogue-card-actions">
              <a href="tel:07835393192" class="btn btn-success">Call Now</a>
              <a href="#" class="btn btn-outline open-enquiry-modal" data-prefill="Stock enquiry: ${item.name}">Enquire</a>
            </div>
          </div>
        </article>`;
      }).join('') || '<p class="section-desc">No products match your search. Call us — we may have it in the back.</p>';
    };

    const setCategory = (cat) => {
      activeCategory = cat;
      document.querySelectorAll('[data-catalogue-category]').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-catalogue-category') === cat);
      });
      paint();
    };

    document.querySelectorAll('[data-catalogue-category]').forEach(btn => {
      btn.addEventListener('click', () => setCategory(btn.getAttribute('data-catalogue-category')));
    });
    catSearch?.addEventListener('input', paint);

    const hash = (location.hash || '').replace('#', '');
    if (hash === 'vapes') setCategory('Vapes');
    else if (hash === 'chargers') setCategory('Chargers & Power');
    else if (hash === 'gaming') setCategory('Gaming & Electronics');
    else if (hash === 'phones') setCategory('Smartphones');
    else if (hash === 'laptops') setCategory('Tablets & Laptops');
    else paint();

    if (hash && !['vapes', 'chargers', 'gaming', 'phones', 'laptops'].includes(hash)) {
      const el = document.getElementById(hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
    }
  }

  // London postcode checker — funnel to call/visit/enquiry
  const postcodeForm = document.getElementById('postcode-check-form');
  const postcodeResult = document.getElementById('postcode-result');
  if (postcodeForm) {
    postcodeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('postcode-input').value.trim().toUpperCase();
      const validPrefixes = ['W12', 'W6', 'W14', 'SW6', 'W1', 'W2', 'W3', 'W4', 'W8', 'W11', 'W9', 'W10', 'SW1', 'WC1', 'WC2', 'EC1', 'NW1', 'NW8'];
      const isEligible = validPrefixes.some(prefix => input.startsWith(prefix));
      if (isEligible) {
        postcodeResult.innerHTML = `
          <div class="result-ok">
            <p><strong>Callout available in ${input}</strong></p>
            <p>Call us to arrange an on-site visit, or send an enquiry.</p>
            <a href="tel:07835393192" class="btn btn-success">Call 07835 393192</a>
            <a href="#" class="btn btn-outline open-enquiry-modal" data-prefill="Mobile callout request for ${input}">Enquire</a>
          </div>`;
      } else {
        postcodeResult.innerHTML = `
          <div class="result-info">
            <p><strong>Visit our Shepherd's Bush store</strong></p>
            <p>134 Uxbridge Road, London W12 8AA — walk-ins welcome.</p>
            <a href="our-locations.html" class="btn btn-primary">Get Directions</a>
            <a href="tel:07835393192" class="btn btn-success">Call Now</a>
          </div>`;
      }
    });
  }

  // Trade-in valuation — no cash amounts shown
  const tradeinForm = document.getElementById('tradein-calc-form');
  if (tradeinForm) {
    tradeinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const result = document.getElementById('tradein-result');
      if (result) {
        result.style.display = 'block';
        result.innerHTML = `
          <p style="font-weight:700;margin-bottom:8px;">Thanks — we can value this device in-store.</p>
          <p style="color:var(--text-muted);font-size:0.95rem;margin-bottom:12px;">Call us or visit 134 Uxbridge Road for a same-day cash assessment. No online purchase required.</p>
          <a href="tel:07835393192" class="btn btn-success">Call Now</a>
          <a href="#" class="btn btn-outline open-enquiry-modal" data-prefill="Trade-in valuation enquiry">Enquire</a>`;
      }
    });
  }

  // Lazy-load images that lack loading attr
  document.querySelectorAll('img:not([loading])').forEach(img => {
    if (!img.closest('.logo')) img.setAttribute('loading', 'lazy');
  });
});
