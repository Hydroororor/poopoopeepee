(function () {
    var searchInput = null;
    var searchResultsEl = null;
    var productIndex = [];

    var sectionLabels = {
        keyless: 'Keyless',
        newreleases: 'New Releases',
        limited: 'Limited Offers',
        popular: 'Most Popular',
        scripts: 'All Scripts'
    };

    function getSectionLabel(card) {
        var section = card.closest('section');
        if (!section || !section.id) {
            return 'Products';
        }
        return sectionLabels[section.id] || section.id;
    }

    function getCardName(card) {
        var nameEl = card.querySelector('.script-name, .limited-name');
        return nameEl ? nameEl.textContent.trim() : '';
    }

    function getCardFeatures(card) {
        var featuresEl = card.querySelector('.script-features, .limited-features');
        return featuresEl ? featuresEl.textContent.trim() : '';
    }

    function buildProductIndex() {
        productIndex = [];
        var seen = new Set();

        document.querySelectorAll('.script-card, .limited-card').forEach(function (card) {
            var name = getCardName(card);
            if (!name) {
                return;
            }

            var key = name.toLowerCase();
            if (seen.has(key)) {
                return;
            }
            seen.add(key);

            productIndex.push({
                name: name,
                features: getCardFeatures(card),
                section: getSectionLabel(card),
                element: card
            });
        });
    }

    function ensureSearchResultsEl() {
        if (searchResultsEl) {
            return searchResultsEl;
        }

        var container = document.querySelector('.search-container');
        if (!container) {
            return null;
        }

        searchResultsEl = document.createElement('div');
        searchResultsEl.id = 'searchResults';
        searchResultsEl.className = 'search-results';
        searchResultsEl.style.display = 'none';
        container.appendChild(searchResultsEl);
        return searchResultsEl;
    }

    function hideSearchResults() {
        if (searchResultsEl) {
            searchResultsEl.style.display = 'none';
            searchResultsEl.innerHTML = '';
        }
    }

    function clearSearchHighlights() {
        document.querySelectorAll('.script-card.search-highlight, .limited-card.search-highlight').forEach(function (card) {
            card.classList.remove('search-highlight');
        });
    }

    function scrollToProduct(card) {
        clearSearchHighlights();
        card.classList.add('search-highlight');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        hideSearchResults();
        if (searchInput) {
            searchInput.blur();
        }
    }

    function renderSearchResults(results) {
        var resultsEl = ensureSearchResultsEl();
        if (!resultsEl) {
            return;
        }

        resultsEl.innerHTML = '';

        if (!results.length) {
            resultsEl.innerHTML = '<div class="no-results">No products found</div>';
            resultsEl.style.display = 'block';
            return;
        }

        results.forEach(function (product) {
            var item = document.createElement('div');
            item.className = 'search-result-item';
            item.innerHTML =
                '<div class="search-result-title">' + product.name + '</div>' +
                '<div class="search-result-description">' + product.section + '</div>';

            item.addEventListener('click', function () {
                scrollToProduct(product.element);
            });

            resultsEl.appendChild(item);
        });

        resultsEl.style.display = 'block';
    }

    function performSearch() {
        if (!searchInput) {
            searchInput = document.getElementById('searchInput');
        }

        if (!searchInput || !productIndex.length) {
            return;
        }

        var query = searchInput.value.trim().toLowerCase();
        if (!query) {
            hideSearchResults();
            clearSearchHighlights();
            return;
        }

        var results = productIndex.filter(function (product) {
            var haystack = (product.name + ' ' + product.features + ' ' + product.section).toLowerCase();
            return haystack.indexOf(query) !== -1;
        });

        renderSearchResults(results);
    }

    function scrollPopular(direction) {
        var scrollEl = document.querySelector('.popular-scroll');
        if (!scrollEl) {
            return;
        }

        var amount = direction === 'left' ? -340 : 340;
        scrollEl.scrollBy({ left: amount, behavior: 'smooth' });
    }

    function initNavbarScroll() {
        var navbar = document.querySelector('.navbar');
        if (!navbar) {
            return;
        }

        window.addEventListener('scroll', function () {
            if (window.scrollY > 40) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    function initSmoothScroll() {
        var smoothScrollLinks = document.querySelectorAll('.smooth-scroll');
        smoothScrollLinks.forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                var targetId = this.getAttribute('href');
                var targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    function initLoadingScreen() {
        var loadingScreen = document.getElementById('loadingScreen');
        if (!loadingScreen) {
            return;
        }

        window.addEventListener('load', function () {
            setTimeout(function () {
                loadingScreen.classList.add('hidden');
            }, 1500);
        });
    }

    function initSearch() {
        searchInput = document.getElementById('searchInput');
        if (!searchInput) {
            return;
        }

        buildProductIndex();

        searchInput.addEventListener('input', performSearch);
        searchInput.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                performSearch();
            } else if (event.key === 'Escape') {
                hideSearchResults();
                clearSearchHighlights();
            }
        });

        document.addEventListener('click', function (event) {
            var container = document.querySelector('.search-container');
            if (container && !container.contains(event.target)) {
                hideSearchResults();
            }
        });
    }

    window.performSearch = performSearch;
    window.scrollPopular = scrollPopular;

    document.addEventListener('DOMContentLoaded', function () {
        initSearch();
        initNavbarScroll();
        initSmoothScroll();
        initLoadingScreen();
    });
})();
