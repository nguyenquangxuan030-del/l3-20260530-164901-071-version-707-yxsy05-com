(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var siteNav = document.querySelector('[data-site-nav]');

    if (navToggle && siteNav) {
        navToggle.addEventListener('click', function () {
            siteNav.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var filterPanel = document.querySelector('[data-filter-panel]');

    if (filterPanel) {
        var searchInput = filterPanel.querySelector('[data-search-input]');
        var regionFilter = filterPanel.querySelector('[data-region-filter]');
        var yearFilter = filterPanel.querySelector('[data-year-filter]');
        var categoryFilter = filterPanel.querySelector('[data-category-filter]');
        var result = document.querySelector('[data-filter-result]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilters() {
            var keyword = normalize(searchInput && searchInput.value);
            var region = normalize(regionFilter && regionFilter.value);
            var year = normalize(yearFilter && yearFilter.value);
            var category = normalize(categoryFilter && categoryFilter.value);
            var count = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.type,
                    card.dataset.category,
                    card.dataset.tags,
                    card.textContent
                ].join(' '));
                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesRegion = !region || normalize(card.dataset.region) === region;
                var matchesYear = !year || normalize(card.dataset.year) === year;
                var matchesCategory = !category || normalize(card.dataset.category) === category;
                var visible = matchesKeyword && matchesRegion && matchesYear && matchesCategory;

                card.style.display = visible ? '' : 'none';

                if (visible) {
                    count += 1;
                }
            });

            if (result) {
                result.textContent = '已显示 ' + count + ' 部影片';
            }
        }

        ['input', 'change'].forEach(function (eventName) {
            filterPanel.addEventListener(eventName, applyFilters);
        });

        filterPanel.addEventListener('reset', function () {
            window.setTimeout(applyFilters, 0);
        });

        applyFilters();
    }
})();
