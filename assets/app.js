// IT Planet - Site interactions (enquiry funnel, catalogue, promos)

document.addEventListener('DOMContentLoaded', () => {
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('active');
      mobileToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // Close mobile menu when a non-dropdown link is chosen
    navMenu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        if (a.parentElement.classList.contains('dropdown') && a.classList.contains('nav-link')) return;
        if (window.innerWidth <= 900) {
          navMenu.classList.remove('active');
          mobileToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  document.querySelectorAll('.dropdown > .nav-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      if (window.innerWidth > 900) return; // desktop: allow hover / navigate
      e.preventDefault();
      const parent = link.parentElement;
      document.querySelectorAll('.dropdown.open').forEach((openItem) => {
        if (openItem !== parent) openItem.classList.remove('open');
      });
      parent.classList.toggle('open');
    });
  });

  // Enquiry modal
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
    if (e.target === modal || e.target.closest('.modal-close')) closeEnquiry();
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

  const promoKey = 'itp_promo_seen_v4';
  if (!sessionStorage.getItem(promoKey) && document.getElementById('device-promo-modal')) {
    setTimeout(() => {
      document.getElementById('device-promo-modal').classList.add('active');
      sessionStorage.setItem(promoKey, '1');
    }, 1800);
  }
  document.querySelectorAll('#device-promo-modal .modal-close, #device-promo-modal .promo-dismiss').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('device-promo-modal')?.classList.remove('active');
    });
  });

  const isPagesRoot = document.body.dataset.root === 'pages';
  const resolveImg = (img) => {
    if (!img) return '';
    if (!isPagesRoot) return img;
    return img.startsWith('../') ? img : '../' + img.replace(/^\.\.\//, '');
  };

  // Catalogue — products only (never services)
  const grid = document.getElementById('catalogue-grid');
  const catSearch = document.getElementById('catalogue-search');
  if (grid && window.ITP_CATALOGUE) {
    let activeCategory = 'All';
    const VAPE_GROUP = new Set([
      'Vapes & Pod Systems',
      'Nicotine Pouches & Heated Tobacco',
      'Vape Coils & Tanks',
    ]);

    const categoryMatch = (item, cat) => {
      if (cat === 'All') return true;
      if (cat === 'Vapes') return VAPE_GROUP.has(item.category);
      return item.category === cat;
    };

    const paint = () => {
      const q = (catSearch?.value || '').trim().toLowerCase();
      const items = window.ITP_CATALOGUE.filter((item) => {
        const catOk = categoryMatch(item, activeCategory);
        const qOk = !q || (item.name + ' ' + (item.tags || '') + ' ' + item.category).toLowerCase().includes(q);
        return catOk && qOk;
      });
      const countEl = document.getElementById('catalogue-count');
      if (countEl) countEl.textContent = `${items.length} product${items.length === 1 ? '' : 's'}`;
      grid.innerHTML = items.map((item) => {
        const src = resolveImg(item.image);
        const badge = item.badge ? `<span class="catalogue-badge">${item.badge}</span>` : '';
        const pid = item.id || '';
        return `<article class="catalogue-card" id="${pid}" data-category="${item.category}">
          <div class="catalogue-card-media">
            <img src="${src}" alt="${item.name}" loading="lazy" width="280" height="180">
            ${badge}
          </div>
          <div class="catalogue-card-body">
            <span class="catalogue-pill">${item.category}</span>
            <h3>${item.name}</h3>
            <p>${item.summary || "In-store at Shepherd's Bush."}</p>
            <div class="catalogue-card-actions">
              <a href="tel:07835393192" class="btn btn-success">Call Now</a>
              <a href="#" class="btn btn-outline open-enquiry-modal" data-prefill="Stock enquiry: ${item.name}">Enquire</a>
            </div>
          </div>
        </article>`;
      }).join('') || '<p class="section-desc">No products match. Call us — we may have it in the back.</p>';
    };

    const HASH_TO_CAT = {
      vapes: 'Vapes',
      chargers: 'Chargers & Power Banks',
      gaming: 'Gaming & Electronics',
      phones: 'Smartphones',
      laptops: 'Tablets & Laptops',
      snacks: 'Drinks & Snacks',
      gadgets: 'Scales & Gadgets',
    };
    const CAT_TO_HASH = {
      Vapes: 'vapes',
      'Chargers & Power Banks': 'chargers',
      'Gaming & Electronics': 'gaming',
      Smartphones: 'phones',
      'Tablets & Laptops': 'laptops',
      'Drinks & Snacks': 'snacks',
      'Scales & Gadgets': 'gadgets',
      All: '',
    };

    const setCategory = (cat, syncHash = true) => {
      activeCategory = cat || 'All';
      document.querySelectorAll('[data-catalogue-category]').forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-catalogue-category') === activeCategory);
      });
      paint();
      if (syncHash) {
        const next = CAT_TO_HASH[activeCategory];
        if (next) history.replaceState(null, '', '#' + next);
        else if (Object.prototype.hasOwnProperty.call(CAT_TO_HASH, activeCategory)) {
          history.replaceState(null, '', location.pathname + location.search);
        }
      }
    };

    document.querySelectorAll('[data-catalogue-category]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        setCategory(btn.getAttribute('data-catalogue-category'));
      });
    });
    catSearch?.addEventListener('input', paint);

    const hash = (location.hash || '').replace('#', '');
    if (HASH_TO_CAT[hash]) setCategory(HASH_TO_CAT[hash], false);
    else {
      paint();
      if (hash) {
        const el = document.getElementById(hash);
        if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
      }
    }
  }

  // Postcode checker
  const postcodeForm = document.getElementById('postcode-check-form');
  const postcodeResult = document.getElementById('postcode-result');
  if (postcodeForm) {
    postcodeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('postcode-input').value.trim().toUpperCase();
      const validPrefixes = ['W12', 'W6', 'W14', 'SW6', 'W1', 'W2', 'W3', 'W4', 'W8', 'W11', 'W9', 'W10', 'SW1', 'WC1', 'WC2', 'EC1', 'NW1', 'NW8'];
      const isEligible = validPrefixes.some((prefix) => input.startsWith(prefix));
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

  const tradeinForm = document.getElementById('tradein-calc-form');
  if (tradeinForm) {
    tradeinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const result = document.getElementById('tradein-result');
      if (result) {
        result.style.display = 'block';
        result.innerHTML = `
          <p style="font-weight:700;margin-bottom:8px;">Thanks — we can value this device in-store.</p>
          <p style="color:var(--text-muted);font-size:0.95rem;margin-bottom:12px;">Call us or visit 134 Uxbridge Road for a same-day cash assessment.</p>
          <a href="tel:07835393192" class="btn btn-success">Call Now</a>
          <a href="#" class="btn btn-outline open-enquiry-modal" data-prefill="Trade-in valuation enquiry">Enquire</a>`;
      }
    });
  }

  document.querySelectorAll('img:not([loading])').forEach((img) => {
    if (!img.closest('.logo')) img.setAttribute('loading', 'lazy');
  });
});
