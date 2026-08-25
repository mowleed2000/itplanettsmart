// IT Planet - Interactive JavaScript Features

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Navigation Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      mobileToggle.setAttribute('aria-expanded', navMenu.classList.contains('active'));
    });
  }

  // Mobile dropdown toggles
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

  // Quote Calculator Logic
  const brandSelect = document.getElementById('calc-brand');
  const modelSelect = document.getElementById('calc-model');
  const issueSelect = document.getElementById('calc-issue');
  const quoteResult = document.getElementById('quote-result');
  const quotePrice = document.getElementById('quote-price');

  const modelData = {
    iphone: ['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'iPhone 14 Pro Max', 'iPhone 14', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 12', 'iPhone 11', 'iPhone X / XS'],
    samsung: ['Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24', 'Galaxy S23 Ultra', 'Galaxy S23', 'Galaxy S22', 'Galaxy Z Fold5', 'Galaxy A54', 'Galaxy A53'],
    pixel: ['Pixel 8 Pro', 'Pixel 8', 'Pixel Fold', 'Pixel 7 Pro', 'Pixel 7', 'Pixel 6a'],
    ipad: ['iPad Pro 12.9', 'iPad Air 5', 'iPad 10th Gen', 'iPad Mini 6'],
    laptop: ['MacBook Pro 16"', 'MacBook Air M2', 'Dell XPS 15', 'HP Spectre', 'ASUS ZenBook']
  };

  const priceEstimates = {
    'Screen Replacement': '£45 - £129',
    'Battery Replacement': '£35 - £69',
    'Back Glass Repair': '£40 - £85',
    'Charging Port Fix': '£35 - £55',
    'Camera Repair': '£39 - £79',
    'Water Damage Diagnostic': '£25 - £45',
    'Data Recovery': '£49 - £120'
  };

  if (brandSelect && modelSelect) {
    brandSelect.addEventListener('change', (e) => {
      const brand = e.target.value;
      modelSelect.innerHTML = '<option value="">Select Model</option>';
      if (modelData[brand]) {
        modelData[brand].forEach(model => {
          const opt = document.createElement('option');
          opt.value = model;
          opt.textContent = model;
          modelSelect.appendChild(opt);
        });
      }
    });
  }

  const quoteForm = document.getElementById('quote-form');
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const issue = issueSelect ? issueSelect.value : '';
      if (issue && priceEstimates[issue]) {
        quotePrice.textContent = priceEstimates[issue];
      } else {
        quotePrice.textContent = '£35 - £95';
      }
      if (quoteResult) quoteResult.style.display = 'block';
    });
  }

  // London Postcode Callout Checker Logic
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
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 15px; border-radius: 8px; margin-top: 15px; text-align: center;">
            <p style="font-weight: 700; font-size: 1.1rem; margin-bottom: 5px;">Great news! On-Site Callout Available in ${input}</p>
            <p style="font-size: 0.9rem;">Our mobile repair van can arrive at your location within 60 minutes.</p>
            <a href="#" class="btn btn-success open-booking-modal" style="margin-top: 10px;">Book Callout Repair Now</a>
          </div>
        `;
        bindModalTriggers(postcodeResult);
      } else {
        postcodeResult.innerHTML = `
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; padding: 15px; border-radius: 8px; margin-top: 15px; text-align: center;">
            <p style="font-weight: 700; font-size: 1.05rem; margin-bottom: 5px;">Store Drop-off & Free Courier Available</p>
            <p style="font-size: 0.9rem;">Visit our Shepherd's Bush store at 134 Uxbridge Rd (W12 8AA) or use our free Mail-In repair service.</p>
            <a href="our-locations.html" class="btn btn-primary" style="margin-top: 10px;">View Store Directions</a>
          </div>
        `;
      }
    });
  }

  // Trade-In Cash Calculator Logic
  const tradeinForm = document.getElementById('tradein-calc-form');
  const tradeinResult = document.getElementById('tradein-result');
  const tradeinPrice = document.getElementById('tradein-price');

  const tradeinValues = {
    'iphone15pm': { 'like-new': '£680', 'good': '£590', 'cracked': '£380', 'faulty': '£220' },
    'iphone15p': { 'like-new': '£590', 'good': '£510', 'cracked': '£320', 'faulty': '£180' },
    'iphone14pm': { 'like-new': '£490', 'good': '£420', 'cracked': '£260', 'faulty': '£140' },
    'iphone13': { 'like-new': '£340', 'good': '£290', 'cracked': '£180', 'faulty': '£95' },
    'samsung-s24u': { 'like-new': '£620', 'good': '£540', 'cracked': '£340', 'faulty': '£190' },
    'pixel8p': { 'like-new': '£390', 'good': '£320', 'cracked': '£190', 'faulty': '£110' }
  };

  if (tradeinForm) {
    tradeinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const model = document.getElementById('tradein-model').value;
      const cond = document.getElementById('tradein-condition').value;

      if (tradeinValues[model] && tradeinValues[model][cond]) {
        tradeinPrice.textContent = tradeinValues[model][cond];
      } else {
        tradeinPrice.textContent = '£180 - £450';
      }
      if (tradeinResult) tradeinResult.style.display = 'block';
    });
  }

  // Booking Modal
  const modal = document.getElementById('booking-modal');
  const closeModalBtn = document.querySelector('.modal-close');

  function openModal(e) {
    if (e) e.preventDefault();
    if (modal) modal.classList.add('active');
  }

  function bindModalTriggers(scope) {
    (scope || document).querySelectorAll('.open-booking-modal').forEach(btn => {
      btn.addEventListener('click', openModal);
    });
  }

  bindModalTriggers();

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });

    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') modal.classList.remove('active');
    });
  }
});
