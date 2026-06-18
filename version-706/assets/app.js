(function () {
  var toggle = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var thumbs = Array.prototype.slice.call(slider.querySelectorAll('.hero-thumb'));
    var index = 0;
    var timer = null;
    var setActive = function (next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('is-active', i === index);
      });
    };
    var start = function () {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        setActive(index + 1);
      }, 5200);
    };
    dots.concat(thumbs).forEach(function (control) {
      control.addEventListener('click', function () {
        setActive(parseInt(control.getAttribute('data-hero-index') || '0', 10));
        start();
      });
    });
    start();
  }

  document.querySelectorAll('[data-search-panel]').forEach(function (panel) {
    var input = panel.querySelector('[data-search-input]');
    var selects = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-select]'));
    var root = panel.parentElement || document;
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
    var reset = panel.querySelector('[data-filter-reset]');
    var apply = function () {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var filters = {};
      selects.forEach(function (select) {
        filters[select.getAttribute('data-filter-select')] = select.value;
      });
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category'),
          card.textContent
        ].join(' ').toLowerCase();
        var matched = !keyword || text.indexOf(keyword) !== -1;
        Object.keys(filters).forEach(function (key) {
          if (filters[key] && card.getAttribute('data-' + key) !== filters[key]) {
            matched = false;
          }
        });
        card.classList.toggle('is-hidden', !matched);
      });
    };
    if (input) {
      input.addEventListener('input', apply);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });
    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        selects.forEach(function (select) {
          select.value = '';
        });
        apply();
      });
    }
  });
})();
