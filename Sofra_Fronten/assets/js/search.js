/* SOFRA — Search frontend controller
   - Hooks navbar search form and redirects to pages/search.html?q=...
   - Renders results on pages/search.html by calling backend/api/search.php?q=
*/

function getPagesPrefix() {
    return window.location.pathname.includes('/pages/') || window.location.href.includes('/pages/') ? '.' : 'pages';
}

function getApiBaseUrl() {
    return '/sofra/backend/api';
}

function attachNavbarSearch() {
    const form = document.querySelector('.nav-search');
    if (!form) return;
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const input = form.querySelector('input[type="search"]');
        if (!input) return;
        const q = input.value.trim();
        if (!q) return;
        const pagesPrefix = getPagesPrefix();
        // Redirect to search page with query param
        window.location.href = `${pagesPrefix}/search.html?q=` + encodeURIComponent(q);
    });
}

async function performSearch(query, containerEl) {
    containerEl.innerHTML = '<p class="muted">جاري البحث عن «' + escapeHtml(query) + '»...</p>';
    try {
        const api = getApiBaseUrl();
        const res = await fetch(`${api}/search.php?q=` + encodeURIComponent(query));
        if (!res.ok) {
            containerEl.innerHTML = '<p class="text-danger">حدث خطأ في البحث. حاول مرة أخرى.</p>';
            return;
        }
        const data = await res.json();
        if (!data.success) {
            containerEl.innerHTML = '<p class="muted">' + escapeHtml(data.message || 'لا توجد نتائج') + '</p>';
            return;
        }

        const results = data.results || [];
        if (results.length === 0) {
            // No results from backend — try client-side fallback by scraping menu page (useful when DB not seeded)
            try {
                const pagesPrefix = window.location.pathname.includes('/pages/') || window.location.href.includes('/pages/') ? '.' : 'pages';
                const menuUrl = `${pagesPrefix}/menu.html`;
                const menuRes = await fetch(menuUrl);
                if (menuRes.ok) {
                    const menuHtml = await menuRes.text();
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(menuHtml, 'text/html');
                    const cards = Array.from(doc.querySelectorAll('.menu-card'));
                    const found = [];
                    for (const c of cards) {
                        const nameEl = c.querySelector('.menu-card-body h3');
                        const descEl = c.querySelector('.menu-card-body p');
                        const priceEl = c.querySelector('.menu-card-footer .price');
                        const linkEl = c.querySelector('button.add-btn') || c.querySelector('a');
                        const name = nameEl ? nameEl.textContent.trim() : '';
                        const desc = descEl ? descEl.textContent.trim() : '';
                        if (!name) continue;
                        if (name.toLowerCase().includes(query.toLowerCase()) || desc.toLowerCase().includes(query.toLowerCase())) {
                            // attempt to get id from onclick or link
                            let id = null;
                            const onclick = c.getAttribute('onclick') || '';
                            const href = c.querySelector('a') ? c.querySelector('a').getAttribute('href') : '';
                            const btnOnclick = c.querySelector('button.add-btn') ? c.querySelector('button.add-btn').getAttribute('onclick') : '';
                            const idMatch = (onclick || href || btnOnclick).match(/id=(\d+)/);
                            if (idMatch) id = idMatch[1];
                            found.push({ id: id || 0, name, description: desc, price: priceEl ? priceEl.textContent.trim() : '' });
                        }
                    }
                    if (found.length > 0) {
                        // render found results
                        let html = '<div class="search-feedback"><p class="muted">تم العثور على ' + found.length + ' نتيجة في قوائم الصفحات:</p></div><div class="row g-4">';
                        for (const r of found) {
                            html += `
                                <div class="col-12 col-md-6 col-lg-4">
                                    <div class="card search-card h-100">
                                        <div class="card-body d-flex flex-column">
                                            <h5 class="card-title">${escapeHtml(r.name)}</h5>
                                            <p class="card-text">${escapeHtml(r.description)}</p>
                                            <div class="mt-auto d-flex justify-content-between align-items-center">
                                                <a href="food-details.html?id=${r.id}" class="btn btn-sm btn-outline-primary">عرض</a>
                                                <strong>${escapeHtml(r.price)}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }
                        html += '</div>';
                        containerEl.innerHTML = html;
                        return;
                    }
                }
            } catch (e) {
                console.warn('Client-side menu fallback failed', e);
            }

            containerEl.innerHTML = '<p class="muted">لا توجد نتائج ل"' + escapeHtml(query) + '"</p>';
            return;
        }

        // If closest flag true, show message
        let html = '';
        if (data.closest) {
            html += '<div class="search-feedback"><p class="muted">لم نجد نتائج مطابقة تمامًا، إليك أقرب المطابقات:</p></div>';
        } else {
            html += '<div class="search-feedback"><p class="muted">تم العثور على ' + results.length + ' نتيجة:</p></div>';
        }

        html += '<div class="row g-4">';
        for (const r of results) {
            const img = r.image_url && r.image_url.length ? r.image_url : '/sofra/Sofra_Fronten/assets/images/logo.png';
            const name = escapeHtml(r.name || '');
            const desc = escapeHtml(r.description || '');
            const price = r.price ? 'EGP ' + r.price : '';
            html += `
                <div class="col-12 col-md-6 col-lg-4">
                    <div class="card search-card h-100">
                        <img src="${img}" class="card-img-top" alt="${name}">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${name}</h5>
                            <p class="card-text">${desc}</p>
                            <div class="mt-auto d-flex justify-content-between align-items-center">
                                <a href="food-details.html?id=${r.id}" class="btn btn-sm btn-outline-primary">عرض</a>
                                <strong>${price}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        html += '</div>';

        containerEl.innerHTML = html;

    } catch (err) {
        console.error(err);
        containerEl.innerHTML = '<p class="text-danger">فشل الاتصال بالخادم أثناء البحث.</p>';
    }
}

function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

// Initialize on partials loaded so navbar elements exist
document.addEventListener('sofra:partials-loaded', () => {
    attachNavbarSearch();

    // If we're on the search page, perform search from query param
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q && (document.body.dataset.page === 'search' || window.location.pathname.toLowerCase().includes('search.html'))) {
        const container = document.getElementById('searchResults');
        if (container) {
            performSearch(q, container);
        }
    }
});

// Also attempt to attach on DOMContentLoaded as a fallback
document.addEventListener('DOMContentLoaded', () => {
    attachNavbarSearch();
});
