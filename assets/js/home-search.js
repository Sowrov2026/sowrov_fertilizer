// ======================================
// Home Page Product Search
// Sowrov Fertilizer
// Client-side search — no backend calls
// ======================================

(function () {
    'use strict';

    var searchInput = document.getElementById('homeSearchInput');
    var searchClear = document.getElementById('homeSearchClear');
    var searchResults = document.getElementById('searchResults');
    var productGrid = document.getElementById('productGrid');
    var aiHomeCta = document.getElementById('aiHomeCta');

    if (!searchInput) return;

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    // Store all loaded products globally for search
    window._sfProducts = window._sfProducts || [];

    // Observe productGrid for content changes to capture products
    var observer = new MutationObserver(function () {
        captureProducts();
    });
    if (productGrid) {
        observer.observe(productGrid, { childList: true });
    }

    function captureProducts() {
        if (!productGrid) return;
        var cards = productGrid.querySelectorAll('.product-card');
        if (cards.length === 0) return;
        window._sfProducts = [];
        cards.forEach(function (card) {
            var nameEl = card.querySelector('h3');
            var descEl = card.querySelector('.product-content p');
            var priceEl = card.querySelector('h4');
            var imgEl = card.querySelector('img');
            var linkEl = card.querySelector('a[href*="product-details"]');
            var addCartBtn = card.querySelector('.add-cart');
            if (nameEl) {
                window._sfProducts.push({
                    name: nameEl.textContent.trim(),
                    description: descEl ? descEl.textContent.trim() : '',
                    price: priceEl ? priceEl.textContent.trim() : '',
                    image: imgEl ? imgEl.src : '',
                    link: linkEl ? linkEl.href : '#',
                    category: addCartBtn ? (addCartBtn.dataset.category || '') : ''
                });
            }
        });
    }

    // Try to capture on load as well
    setTimeout(captureProducts, 2000);
    setTimeout(captureProducts, 4000);

    // Search handler
    var debounceTimer;
    searchInput.addEventListener('input', function () {
        var query = this.value.trim().toLowerCase();
        searchClear.style.display = query ? 'flex' : 'none';

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
            performSearch(query);
        }, 200);
    });

    searchClear.addEventListener('click', function () {
        searchInput.value = '';
        searchClear.style.display = 'none';
        searchResults.innerHTML = '';
        searchResults.style.display = 'none';
    });

    function performSearch(query) {
        if (!query) {
            searchResults.innerHTML = '';
            searchResults.style.display = 'none';
            return;
        }

        // Ensure products are captured
        captureProducts();

        var products = window._sfProducts;
        if (products.length === 0) {
            searchResults.innerHTML = '<p class="search-no-results">পণ্য লোড হচ্ছে... অনুগ্রহ করে অপেক্ষা করুন।</p>';
            searchResults.style.display = 'block';
            return;
        }

        var filtered = products.filter(function (p) {
            var searchText = (p.name + ' ' + p.description + ' ' + p.category).toLowerCase();
            return searchText.indexOf(query) !== -1;
        });

        if (filtered.length === 0) {
            searchResults.innerHTML = '<p class="search-no-results">কোনো পণ্য পাওয়া যায়নি। অন্য কীওয়ার্ড দিয়ে চেষ্টা করুন।</p>';
            searchResults.style.display = 'block';
            return;
        }

        var html = '<div class="search-results-grid">';
        filtered.forEach(function (p) {
            html += '<a href="' + escapeHtml(p.link) + '" class="search-result-card">';
            if (p.image) {
                html += '<img src="' + escapeHtml(p.image) + '" alt="' + escapeHtml(p.name) + '" class="search-result-img">';
            }
            html += '<div class="search-result-info">';
            html += '<h4>' + escapeHtml(p.name) + '</h4>';
            if (p.description) {
                html += '<p>' + escapeHtml(p.description.substring(0, 80)) + (p.description.length > 80 ? '...' : '') + '</p>';
            }
            if (p.price) {
                html += '<span class="search-result-price">' + escapeHtml(p.price) + '</span>';
            }
            html += '</div>';
            html += '</a>';
        });
        html += '</div>';

        searchResults.innerHTML = html;
        searchResults.style.display = 'block';
    }

    // AI CTA button — trigger the floating AI chat
    if (aiHomeCta) {
        aiHomeCta.addEventListener('click', function () {
            // Try to find and click the AI chat toggle button
            var aiToggle = document.getElementById('chat-toggle') || document.querySelector('.sf-ai-toggle, .ai-chat-toggle, #aiChatToggle, .ai-btn');
            if (aiToggle) {
                aiToggle.click();
            } else {
                // Fallback: scroll to bottom where floating buttons are
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }
        });
    }

})();
