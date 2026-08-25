// IT Planet - Interactive JavaScript

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // Quote Calculator Logic
  const brandSelect = document.getElementById('calc-brand');
  const modelSelect = document.getElementById('calc-model');
  const issueSelect = document.getElementById('calc-issue');
  const quoteResult = document.getElementById('quote-result');
  const quotePrice = document.getElementById('quote-price');

  const modelData = {
    iphone: ['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'iPhone 14 Pro Max', 'iPhone 14', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 12', 'iPhone 11', 'iPhone X / XS'],
    samsung: ['Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24', 'Galaxy S23 Ultra', 'Galaxy S23', 'Galaxy S22', 'Galaxy Z Fold5', 'Galaxy A54'],
    pixel: ['Pixel 8 Pro', 'Pixel 8', 'Pixel 7 Pro', 'Pixel 7', 'Pixel 6a'],
    ipad: ['iPad Pro 12.9', 'iPad Air 5', 'iPad 10th Gen', 'iPad Mini 6'],
    laptop: ['MacBook Pro 16"', 'MacBook Air M2', 'Dell XPS 15', 'HP Spectre']
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
      const issue = issueSelect.value;
      if (issue && priceEstimates[issue]) {
        quotePrice.textContent = priceEstimates[issue];
        quoteResult.style.display = 'block';
      } else {
        quotePrice.textContent = '£35 - £95';
        quoteResult.style.display = 'block';
      }
    });
  }

  // Booking Modal Logic
  const modal = document.getElementById('booking-modal');
  const openModalBtns = document.querySelectorAll('.open-booking-modal');
  const closeModalBtn = document.querySelector('.modal-close');

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (modal) modal.classList.add('active');
    });
  });

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });

    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }
});
