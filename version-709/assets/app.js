(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    startTimer();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function bindLocalFilter(input) {
    var grid = document.querySelector('[data-card-grid]');
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    input.addEventListener('input', function () {
      var query = normalize(input.value);
      cards.forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.category,
          card.dataset.year,
          card.dataset.region,
          card.dataset.tags
        ].join(' '));
        card.classList.toggle('is-hidden', query && text.indexOf(query) === -1);
      });
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.global-search input')).forEach(bindLocalFilter);

  Array.prototype.slice.call(document.querySelectorAll('[data-global-search]')).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var panel = form.parentElement.querySelector('[data-search-results]');
      var root = document.body.dataset.root || './';
      var query = normalize(input ? input.value : '');

      if (!panel) {
        return;
      }

      if (!query) {
        panel.classList.remove('is-open');
        panel.innerHTML = '';
        return;
      }

      var source = window.siteIndex || [];
      var results = source.filter(function (item) {
        return normalize(item.t).indexOf(query) !== -1 ||
          normalize(item.c).indexOf(query) !== -1 ||
          normalize(item.y).indexOf(query) !== -1 ||
          normalize(item.g).indexOf(query) !== -1 ||
          normalize(item.k).indexOf(query) !== -1;
      }).slice(0, 12);

      if (!results.length) {
        panel.innerHTML = '<div class="search-result-item"><strong>未找到相关内容</strong><span>请尝试更换关键词。</span></div>';
        panel.classList.add('is-open');
        return;
      }

      panel.innerHTML = results.map(function (item) {
        return '<a class="search-result-item" href="' + root + item.u + '">' +
          '<strong>' + item.t + '</strong>' +
          '<span>' + item.c + ' · ' + item.y + ' · ' + item.g + '</span>' +
          '</a>';
      }).join('');
      panel.classList.add('is-open');
    });
  });

  function playVideo(box) {
    var video = box.querySelector('video');
    var button = box.querySelector('[data-player-start]');
    if (!video) {
      return;
    }
    var stream = video.dataset.stream;
    if (!stream) {
      return;
    }

    function begin() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
      if (button) {
        button.classList.add('is-hidden');
      }
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!video.dataset.hlsReady) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video.dataset.hlsReady = '1';
        hls.on(window.Hls.Events.MANIFEST_PARSED, begin);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            hls.destroy();
            video.removeAttribute('data-hls-ready');
          }
        });
      } else {
        begin();
      }
    } else {
      if (!video.getAttribute('src')) {
        video.setAttribute('src', stream);
      }
      begin();
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (box) {
    var button = box.querySelector('[data-player-start]');
    if (button) {
      button.addEventListener('click', function () {
        playVideo(box);
      });
    }
    box.addEventListener('dblclick', function () {
      playVideo(box);
    });
  });
})();
