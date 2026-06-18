(function () {
  const mobileToggle = document.querySelector("[data-mobile-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  });

  document.querySelectorAll("[data-rank-tabs]").forEach(function (group) {
    const tabs = Array.from(group.querySelectorAll("[data-rank-tab]"));
    const scope = group.closest(".section") || document;
    const panels = Array.from(scope.querySelectorAll("[data-rank-panel]"));

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        const name = tab.getAttribute("data-rank-tab");

        tabs.forEach(function (item) {
          item.classList.toggle("active", item === tab);
        });

        panels.forEach(function (panel) {
          panel.classList.toggle("active", panel.getAttribute("data-rank-panel") === name);
        });
      });
    });
  });

  document.querySelectorAll("[data-filter-list]").forEach(function (form) {
    const section = form.closest("section");
    const list = section && section.nextElementSibling ? section.nextElementSibling.querySelector("[data-card-list]") : document.querySelector("[data-card-list]");
    const cards = list ? Array.from(list.querySelectorAll("[data-card]")) : [];
    const keyword = form.querySelector("[data-filter-keyword]");
    const region = form.querySelector("[data-filter-region]");
    const year = form.querySelector("[data-filter-year]");
    const type = form.querySelector("[data-filter-type]");
    const searchInput = form.querySelector("[data-search-input]");

    if (searchInput) {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("q");
      if (q) {
        searchInput.value = q;
      }
    }

    function valueOf(control) {
      return control ? control.value.trim().toLowerCase() : "";
    }

    function apply() {
      const q = valueOf(keyword);
      const selectedRegion = valueOf(region);
      const selectedYear = valueOf(year);
      const selectedType = valueOf(type);

      cards.forEach(function (card) {
        const haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();

        const matchKeyword = !q || haystack.indexOf(q) !== -1;
        const matchRegion = !selectedRegion || valueOf({ value: card.getAttribute("data-region") || "" }) === selectedRegion;
        const matchYear = !selectedYear || valueOf({ value: card.getAttribute("data-year") || "" }) === selectedYear;
        const matchType = !selectedType || valueOf({ value: card.getAttribute("data-type") || "" }) === selectedType;
        const visible = matchKeyword && matchRegion && matchYear && matchType;

        card.classList.toggle("is-hidden", !visible);
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      apply();
    });

    [keyword, region, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  });

  document.querySelectorAll("[data-player]").forEach(function (player) {
    const video = player.querySelector("video");
    const button = player.querySelector("[data-play-button]");
    const stream = player.getAttribute("data-stream") || (video ? video.getAttribute("data-stream") : "");
    let ready = false;
    let hls = null;

    function playVideo() {
      if (!video || !stream) {
        return;
      }

      player.classList.add("is-playing");

      if (ready) {
        video.play().catch(function () {});
        return;
      }

      ready = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          capLevelToPlayerSize: true,
          maxBufferLength: 60
        });

        hls.loadSource(stream);
        hls.attachMedia(video);

        if (window.Hls.Events && hls.on) {
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });

          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }

            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          });
        } else {
          video.play().catch(function () {});
        }
      } else {
        video.src = stream;
        video.addEventListener("loadedmetadata", function () {
          video.play().catch(function () {});
        }, { once: true });
        video.play().catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", playVideo);
    }

    player.addEventListener("click", function (event) {
      if (event.target === video || event.target.closest("video")) {
        return;
      }

      playVideo();
    });

    window.addEventListener("beforeunload", function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  });
})();
