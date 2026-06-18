(function () {
  var ready = function (callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  };

  function setupMobileMenu() {
    var button = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
      button.setAttribute("aria-expanded", panel.classList.contains("open") ? "true" : "false");
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-slide-dot]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    };
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });
    show(0);
    window.setInterval(function () {
      show(current + 1);
    }, 5600);
  }

  function setupCardFilter() {
    var input = document.querySelector("[data-card-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    if (!input || !cards.length) {
      return;
    }
    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = card.getAttribute("data-search") || card.textContent || "";
        card.classList.toggle("is-hidden", keyword && text.toLowerCase().indexOf(keyword) === -1);
      });
    });
  }

  function setupVideoPlayer() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-player-box]"));
    boxes.forEach(function (box) {
      var video = box.querySelector("video");
      var trigger = box.querySelector("[data-play-trigger]");
      if (!video || !trigger) {
        return;
      }
      var stream = video.getAttribute("data-stream") || "";
      var hlsInstance = null;
      var started = false;
      var startPlayback = function () {
        if (!stream) {
          return;
        }
        box.classList.add("playing");
        if (started) {
          video.play().catch(function () {});
          return;
        }
        started = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hlsInstance.on(window.Hls.Events.ERROR, function () {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
              video.src = stream;
              video.play().catch(function () {});
            }
          });
        } else {
          video.src = stream;
          video.play().catch(function () {});
        }
      };
      trigger.addEventListener("click", startPlayback);
      video.addEventListener("click", startPlayback);
      video.addEventListener("play", function () {
        box.classList.add("playing");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          box.classList.remove("playing");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHeroSlider();
    setupCardFilter();
    setupVideoPlayer();
  });
})();
