/* =====================================================================
   SOFRA — INCLUDE ENGINE
   بيحمّل navbar.html و footer.html من partials/ ويحقنهم في أي صفحة
   ===================================================================== */

function getSofraPartialsBase() {
    const isPagesFolder = window.location.pathname.includes("/pages/") || window.location.href.includes("/pages/");
    return isPagesFolder ? "../partials" : "partials";
}

function getSofraAssetsPrefix() {
    const isPagesFolder = window.location.pathname.includes("/pages/") || window.location.href.includes("/pages/");
    return isPagesFolder ? "../assets" : "assets";
}

function getSofraPagesPrefix() {
    const isPagesFolder = window.location.pathname.includes("/pages/") || window.location.href.includes("/pages/");
    return isPagesFolder ? "." : "pages";
}

async function sofraLoadPartial(url, targetSelector) {
    const target = document.querySelector(targetSelector);
    if (!target) return;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("HTTP " + res.status);
        let html = await res.text();
        const assetsPrefix = getSofraAssetsPrefix();
        const pagesPrefix = getSofraPagesPrefix();
        html = html.replace(/href="\/pages\//g, `href="${pagesPrefix}/`);
        html = html.replace(/src="\/assets\//g, `src="${assetsPrefix}/`);
        html = html.replace(/href="\/assets\//g, `href="${assetsPrefix}/`);
        target.innerHTML = html;
    } catch (err) {
        console.warn("Sofra include warning:", url, err);
        const pagesPrefix = getSofraPagesPrefix();
        const assetsPrefix = getSofraAssetsPrefix();
        if (targetSelector === "#sofra-navbar") {
            target.innerHTML = `
            <nav class="navbar navbar-expand-lg fixed-top" id="sofraNavbar">
                <div class="container-fluid">
                    <a href="${pagesPrefix}/index.html" class="nav_logo"><img src="${assetsPrefix}/images/logo.png" alt="Sofra"></a>
                    <a class="navbar-brand" href="${pagesPrefix}/index.html">Sofra</a>
                    <div class="d-flex align-items-center gap-3 ms-auto">
                        <a class="nav-link" href="${pagesPrefix}/index.html">Home</a>
                        <a class="nav-link" href="${pagesPrefix}/menu.html">Menu</a>
                        <a class="nav-link" href="${pagesPrefix}/cart.html">Cart 🛒</a>
                    </div>
                </div>
            </nav>`;
        }
    }
}

function sofraHighlightActiveNavLink() {
    const currentPage = document.body.dataset.page;
    if (!currentPage) return;
    document.querySelectorAll("[data-nav-key]").forEach((link) => {
        if (link.dataset.navKey === currentPage) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }
    });
}

function sofraInitNavbarScrollEffect() {
    const nav = document.getElementById("sofraNavbar");
    if (!nav) return;
    const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
}

document.addEventListener("DOMContentLoaded", async () => {
    const partialsBase = getSofraPartialsBase();
    await Promise.all([
        sofraLoadPartial(`${partialsBase}/navbar.html`, "#sofra-navbar"),
        sofraLoadPartial(`${partialsBase}/footer.html`, "#sofra-footer"),
    ]);

    sofraHighlightActiveNavLink();
    sofraInitNavbarScrollEffect();

    // Load navbar auth script if auth-api.js is available
    if (typeof checkAuthStatus === 'function' || typeof loginUser === 'function') {
        const assetsPrefix = getSofraAssetsPrefix();
        const authScript = document.createElement('script');
        authScript.src = `${assetsPrefix}/js/navbar-auth.js`;
        document.body.appendChild(authScript);
    }

    // Always load language controller and search script so navbar features work across all pages
    (function () {
        const assetsPrefix = getSofraAssetsPrefix();

        // Load search controller first, then language controller. Set async=false to preserve execution order.
        const searchScript = document.createElement('script');
        searchScript.src = `${assetsPrefix}/js/search.js`;
        searchScript.async = false;
        document.body.appendChild(searchScript);

        const langScript = document.createElement('script');
        langScript.src = `${assetsPrefix}/js/language.js`;
        langScript.async = false;

        // Dispatch the partials-loaded event only after language.js has loaded
        langScript.onload = function () {
            document.dispatchEvent(new CustomEvent("sofra:partials-loaded"));
        };
        // Fallback: if language.js fails to load within 3s, still dispatch to avoid blocking
        setTimeout(function () {
            if (!window.__SOFRA_LANG_LOADED) {
                document.dispatchEvent(new CustomEvent("sofra:partials-loaded"));
            }
        }, 3000);

        document.body.appendChild(langScript);
    })();
});
