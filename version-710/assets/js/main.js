(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var siteNav = document.querySelector('[data-site-nav]');
    if (navToggle && siteNav) {
        navToggle.addEventListener('click', function () {
            siteNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var show = function (next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    var searchInput = document.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
    var selected = 'all';
    var normalize = function (value) {
        return String(value || '').toLowerCase();
    };
    var applyFilter = function () {
        var query = normalize(searchInput ? searchInput.value : '');
        cards.forEach(function (card) {
            var text = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-genre')
            ].join(' '));
            var passSearch = !query || text.indexOf(query) !== -1;
            var passChip = selected === 'all' || text.indexOf(normalize(selected)) !== -1;
            card.classList.toggle('is-hidden', !(passSearch && passChip));
        });
    };
    if (searchInput && cards.length) {
        searchInput.addEventListener('input', applyFilter);
    }
    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            selected = chip.getAttribute('data-filter-value') || 'all';
            chips.forEach(function (item) {
                item.classList.toggle('active', item === chip);
            });
            applyFilter();
        });
    });
})();
