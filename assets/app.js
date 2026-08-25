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
  const promoKey = 'itp_promo_seen_v2';
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

  // Global site search
  const searchInput = document.getElementById('site-search-input');
  const searchResults = document.getElementById('site-search-results');
  if (searchInput && searchResults && window.ITP_CATALOGUE) {
    const prefix = searchInput.dataset.prefix || '';
    const render = (items) => {
      if (!items.length) {
        searchResults.innerHTML = '<div class="search-empty">No matches — try iPhone, Samsung, vape, battery…</div>';
        searchResults.classList.add('active');
        return;
      }
      searchResults.innerHTML = items.slice(0, 8).map(item => {
        const img = prefix + item.image.replace(/^\.\.\//, '').replace(/^images\//, 'images/');
        // normalize path relative to current page
        let href = item.page;
        let src = item.image;
        if (prefix === '../') {
          href = item.page.startsWith('pages/') ? item.page.replace(/^pages\//, '') : '../' + item.page;
          src = item.image.startsWith('images/') ? '../' + item.image : item.image;
        }
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
      const matches = window.ITP_CATALOGUE.filter(item =>
        (item.name + ' ' + item.category + ' ' + (item.tags || '')).toLowerCase().includes(q)
      );
      render(matches);
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.site-search')) searchResults.classList.remove('active');
    });
  }

  // Catalogue page filter/search
  const grid = document.getElementById('catalogue-grid');
  const catSearch = document.getElementById('catalogue-search');
  if (grid && window.ITP_CATALOGUE) {
    let activeCategory = 'All';
    const prefix = grid.dataset.prefix || '../';
    const resolveImg = (img) => img.startsWith('images/') ? prefix.replace('pages/', '') && (prefix === '../' ? '../' + img : img) : img;
    // simpler:
    const imgPath = (img) => (document.body.dataset.root === 'pages' || prefix === '../')
      ? (img.startsWith('../') ? img : '../' + img.replace(/^\.\.\//, ''))
      : img;

    const paint = () => {
      const q = (catSearch?.value || '').trim().toLowerCase();
      const items = window.ITP_CATALOGUE.filter(item => {
        const catOk = activeCategory === 'All' || item.category === activeCategory ||
          (activeCategory === 'Vapes' && item.category === 'Vapes');
        const qOk = !q || (item.name + ' ' + item.tags + ' ' + item.category).toLowerCase().includes(q);
        return catOk && qOk;
      });
      grid.innerHTML = items.map(item => {
        const src = imgPath(item.image);
        let href = item.page;
        if (prefix === '../') {
          href = item.page.startsWith('pages/') ? item.page.replace(/^pages\//, '') : '../' + item.page;
          if (href.includes('catalogue.html')) href = 'catalogue.html' + (item.category === 'Vapes' ? '#vapes' : '');
        }
        return `<article class="catalogue-card" data-category="${item.category}">
          <img src="${src}" alt="${item.name}" loading="lazy" width="280" height="180">
          <div class="catalogue-card-body">
            <span class="catalogue-pill">${item.category}</span>
            <h3>${item.name}</h3>
            <p>Available in-store at Shepherd's Bush. Ask our team for options.</p>
            <div class="catalogue-card-actions">
              <a href="tel:07835393192" class="btn btn-success">Call Now</a>
              <a href="#" class="btn btn-outline open-enquiry-modal" data-prefill="${item.name}">Enquire</a>
            </div>
          </div>
        </article>`;
      }).join('') || '<p class="section-desc">No items match your search.</p>';
    };

    document.querySelectorAll('[data-catalogue-category]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-catalogue-category]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.getAttribute('data-catalogue-category');
        paint();
      });
    });
    catSearch?.addEventListener('input', paint);

    if (location.hash === '#vapes') {
      activeCategory = 'Vapes';
      document.querySelector('[data-catalogue-category="Vapes"]')?.classList.add('active');
      document.querySelector('[data-catalogue-category="All"]')?.classList.remove('active');
    }
    paint();
  }

  // London postcode checker — keep, but funnel to call/visit/enquiry
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
