(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initMobileNav() {
        var toggle = qs("[data-mobile-toggle]");
        var panel = qs("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function initSearchForms() {
        qsa(".site-search").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = qs('input[name="q"]', form);
                var query = input ? input.value.trim() : "";
                if (!query) {
                    event.preventDefault();
                    window.location.href = "search.html";
                    return;
                }
                event.preventDefault();
                window.location.href = "search.html?q=" + encodeURIComponent(query);
            });
        });
    }

    function initHeroCarousel() {
        var carousel = qs("[data-carousel]");
        if (!carousel) {
            return;
        }
        var slides = qsa(".hero-slide", carousel);
        var dots = qsa(".hero-dot", carousel);
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
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
        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        qsa("[data-filter-section]").forEach(function (section) {
            var input = qs("[data-filter-input]", section);
            var buttons = qsa("[data-filter-value]", section);
            var cards = qsa("[data-card]", section);
            var activeValue = "all";

            function applyFilter() {
                var query = normalize(input ? input.value : "");
                cards.forEach(function (card) {
                    var keywords = normalize(card.getAttribute("data-keywords"));
                    var type = normalize(card.getAttribute("data-type"));
                    var year = normalize(card.getAttribute("data-year"));
                    var category = normalize(card.getAttribute("data-category"));
                    var valueMatched = activeValue === "all" || type === activeValue || year === activeValue || category === activeValue;
                    var queryMatched = !query || keywords.indexOf(query) !== -1;
                    card.classList.toggle("is-hidden", !(valueMatched && queryMatched));
                });
            }

            if (input) {
                input.addEventListener("input", applyFilter);
            }
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    activeValue = normalize(button.getAttribute("data-filter-value"));
                    buttons.forEach(function (item) {
                        item.classList.toggle("is-active", item === button);
                    });
                    applyFilter();
                });
            });
            applyFilter();
        });
    }

    function attachVideo(video, source) {
        if (!video || !source) {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            video._hlsInstance = hls;
            return;
        }
        video.src = source;
    }

    function initPlayers() {
        qsa(".js-player").forEach(function (player) {
            var video = qs("video", player);
            var cover = qs(".player-cover", player);
            var source = player.getAttribute("data-stream");
            var started = false;

            function play() {
                if (!started) {
                    attachVideo(video, source);
                    started = true;
                }
                if (cover) {
                    cover.classList.add("is-hidden");
                }
                if (video) {
                    video.setAttribute("controls", "controls");
                    var promise = video.play();
                    if (promise && promise.catch) {
                        promise.catch(function () {});
                    }
                }
            }

            if (cover) {
                cover.addEventListener("click", play);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (!started) {
                        play();
                    }
                });
            }
        });
    }

    function renderSearchCard(movie) {
        var tags = [movie.region, movie.type, movie.year].filter(Boolean).map(function (item) {
            return "<span>" + escapeHtml(item) + "</span>";
        }).join("");
        return [
            '<article class="movie-card" data-card>',
            '    <a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">',
            '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="poster-shade"></span>',
            '        <span class="play-badge">播放</span>',
            '    </a>',
            '    <div class="card-body">',
            '        <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '        <div class="card-meta">' + tags + '</div>',
            '        <p>' + escapeHtml(movie.oneLine || "") + '</p>',
            '        <div class="card-stats">',
            '            <span>评分 ' + escapeHtml(movie.rating || "") + '</span>',
            '            <span>' + escapeHtml(movie.category || "") + '</span>',
            '        </div>',
            '    </div>',
            '</article>'
        ].join("");
    }

    function initSearchPage() {
        var results = qs("[data-search-results]");
        if (!results || !window.movieCatalog) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var input = qs("[data-search-page-input]");
        var title = qs("[data-search-title]");
        var empty = qs("[data-empty-state]");
        if (input) {
            input.value = query;
        }

        function render(value) {
            var current = normalize(value);
            var list = window.movieCatalog.filter(function (movie) {
                var body = normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.category,
                    movie.tags,
                    movie.oneLine
                ].join(" "));
                return !current || body.indexOf(current) !== -1;
            });
            if (!current) {
                list = window.movieCatalog.slice(0, 80);
            }
            results.innerHTML = list.slice(0, 240).map(renderSearchCard).join("");
            if (title) {
                title.textContent = current ? "匹配结果" : "推荐浏览";
            }
            if (empty) {
                empty.classList.toggle("show", list.length === 0);
            }
        }

        if (input) {
            input.addEventListener("input", function () {
                render(input.value);
            });
        }
        render(query);
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMobileNav();
        initSearchForms();
        initHeroCarousel();
        initFilters();
        initPlayers();
        initSearchPage();
    });
})();
