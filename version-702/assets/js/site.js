(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
  }

  function startHero() {
    if (slides.length <= 1) {
      return;
    }
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  function resetHero() {
    if (timer) {
      window.clearInterval(timer);
    }
    startHero();
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      resetHero();
    });
  });

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      resetHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      resetHero();
    });
  }

  startHero();

  var filters = Array.prototype.slice.call(document.querySelectorAll('[data-local-filter]'));

  filters.forEach(function (input) {
    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
      cards.forEach(function (card) {
        var haystack = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '')).toLowerCase();
        card.classList.toggle('is-hidden', query && haystack.indexOf(query) === -1);
      });
    });
  });

  var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-ranking-tab]'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-ranking-panel]'));

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var key = tab.getAttribute('data-ranking-tab');
      tabs.forEach(function (item) {
        item.classList.toggle('is-active', item === tab);
      });
      panels.forEach(function (panel) {
        panel.classList.toggle('is-active', panel.getAttribute('data-ranking-panel') === key);
      });
    });
  });

  var resultBox = document.querySelector('[data-search-results]');

  function escapeHTML(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function cardHTML(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHTML(tag) + '</span>';
    }).join('');
    return '' +
      '<article class="movie-card" data-filter-card data-title="' + escapeHTML(movie.title) + '" data-meta="' + escapeHTML(movie.meta) + '">' +
      '<a class="poster-wrap" href="./' + escapeHTML(movie.url) + '" aria-label="' + escapeHTML(movie.title) + '">' +
      '<img src="' + escapeHTML(movie.cover) + '" alt="' + escapeHTML(movie.title) + '" loading="lazy">' +
      '<span class="poster-glow"></span>' +
      '</a>' +
      '<div class="movie-card-body">' +
      '<div class="movie-meta-line"><span>' + escapeHTML(movie.year) + '</span><span>' + escapeHTML(movie.region) + '</span><span>' + escapeHTML(movie.type) + '</span></div>' +
      '<h3><a href="./' + escapeHTML(movie.url) + '">' + escapeHTML(movie.title) + '</a></h3>' +
      '<p>' + escapeHTML(movie.desc) + '</p>' +
      '<div class="tag-row">' + tags + '</div>' +
      '<div class="card-actions"><a href="./' + escapeHTML(movie.url) + '">立即观看</a><span>' + escapeHTML(movie.heat) + '</span></div>' +
      '</div>' +
      '</article>';
  }

  if (resultBox && window.movieIndex) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim().toLowerCase();
    var searchInput = document.querySelector('.search-main input[name="q"]');
    if (searchInput) {
      searchInput.value = params.get('q') || '';
    }
    if (query) {
      var results = window.movieIndex.filter(function (movie) {
        return movie.search.indexOf(query) !== -1;
      }).slice(0, 120);
      if (results.length) {
        resultBox.innerHTML = results.map(cardHTML).join('');
      } else {
        resultBox.innerHTML = '<div class="empty-state">没有找到匹配内容，换个关键词试试。</div>';
      }
    }
  }
})();
