/* =====================================================================
   SOFRA — MULTI-LANGUAGE CONTROLLER
   بيدير اختيار اللغة بين: العربية (AR) / English (EN) / Français (FR)
   ويعرض modal تفاعلية بعنوان "اختاري اللغة المناسبة لكي"
   ===================================================================== */

// Prevent double-loading if the script is injected more than once
if (window.__SOFRA_LANG_LOADED) {
    // Already loaded — skip re-execution
} else {
    window.__SOFRA_LANG_LOADED = true;

    // Base key name; actual key is namespaced by area (user vs admin)
    const SOFRA_LANG_KEY = "sofra-lang";
/**
 * Determine current area for scoping language preference.
 * Returns "admin" for admin pages (path contains '/admin'), otherwise "user".
 */
function sofraGetArea() {
    const p = window.location.pathname.toLowerCase();
    return p.includes("/admin") ? "admin" : "user";
}
function sofraStorageKeyForArea() {
    return `${SOFRA_LANG_KEY}-${sofraGetArea()}`;
}

const SOFRA_DICTIONARY = {
    ar: {
        dir: "rtl",
        flag: "🇪🇬",
        name: "العربية",
        modalTitle: "اختاري اللغة المناسبة لكي",
        modalSub: "يسعدنا تقديم سفرة باللغة التي تفضلينها",
        home: "الرئيسية",
        menu: "المنيو",
        about: "من نحن",
        contact: "تواصل معنا",
        cart: "السلة 🛒",
        search: "بحث",
        searchPlaceholder: "ابحث عن أكلتك المفضلة...",
        account: "تسجيل خروج",
        addToCart: "+ أضف إلى السلة",
        add: "+ أضف",
        details: "التفاصيل ←",
        favorite: "إضافة للمفضلة",
        inFavorite: "في المفضلة",
        ingredients: "المكونات",
        viewCart: "عرض السلة 🛒",
        relatedTitle: "🔥 أكلات قريبة وشبيهة قد تعجبك",
        relatedSub: "استكشف المزيد من الأطباق اللذيذة بنفس الجودة والنكهة الممتازة",
        menuTitle: "اختر طبقك المفضل",
        menuSub: "أشهى الأطباق العالمية والمحلية طازجة من مطبخنا إليك مباشرة",
        close: "إغلاق"
    },
    en: {
        dir: "ltr",
        flag: "🇬🇧",
        name: "English",
        modalTitle: "Choose your preferred language",
        modalSub: "We are happy to serve you in your favorite language",
        home: "Home",
        menu: "Menu",
        about: "About Us",
        contact: "Contact",
        cart: "Cart 🛒",
        search: "Search",
        searchPlaceholder: "Search your favorite dish...",
        account: "logout",
        addToCart: "+ Add to Cart",
        add: "+ Add",
        details: "Details →",
        favorite: "Add to Favorites",
        inFavorite: "In Favorites",
        ingredients: "Ingredients",
        viewCart: "View Cart 🛒",
        relatedTitle: "🔥 Related & Similar Dishes",
        relatedSub: "Explore more delicious dishes with top quality & taste",
        menuTitle: "Choose Your Favorite Dish",
        menuSub: "The finest global and local dishes fresh from our kitchen to you",
        close: "Close"
    },
    fr: {
        dir: "ltr",
        flag: "🇫🇷",
        name: "Français",
        modalTitle: "Choisissez votre langue préférée",
        modalSub: "Nous sommes ravis de vous servir dans votre langue",
        home: "Accueil",
        menu: "Menu",
        about: "À propos",
        contact: "Contact",
        cart: "Panier 🛒",
        search: "Recherche",
        searchPlaceholder: "Chercher votre plat...",
        account: "Mon compte",
        addToCart: "+ Ajouter au panier",
        add: "+ Ajouter",
        details: "Détails →",
        favorite: "Ajouter aux favoris",
        inFavorite: "Dans les favoris",
        ingredients: "Ingrédients",
        viewCart: "Voir le panier 🛒",
        relatedTitle: "🔥 Plats similaires et recommandés",
        relatedSub: "Découvrez d'autres délicieux plats préparés avec soin",
        menuTitle: "Choisissez votre plat préféré",
        menuSub: "Les meilleurs plats internationaux et locaux directement en cuisine",
        close: "Fermer"
    }
};

function sofraApplyLanguage(lang) {
    const dict = SOFRA_DICTIONARY[lang] || SOFRA_DICTIONARY.ar;
    document.documentElement.lang = lang;
    document.documentElement.dir = dict.dir;

    try {
        // Store language scoped to current area (user/admin)
        localStorage.setItem(sofraStorageKeyForArea(), lang);
    } catch (e) {}

    // Update Language button flag and short text in navbar
    const langBtnFlag = document.getElementById("sofraLangBtnFlag");
    const langBtnText = document.getElementById("sofraLangBtnText");
    
    if (langBtnFlag) {
        langBtnFlag.textContent = dict.flag;
    }
    if (langBtnText) {
        langBtnText.textContent = lang.toUpperCase();
    }

    // Update active state in language modal
    document.querySelectorAll(".lang-option-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.lang === lang);
    });

    // Translate page elements with data-i18n attribute
    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.dataset.i18n;
        if (dict[key]) {
            el.textContent = dict[key];
        }
    });

    // Translate placeholders
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        const key = el.dataset.i18nPlaceholder;
        if (dict[key]) {
            el.placeholder = dict[key];
        }
    });

    // Dispatch event
    document.dispatchEvent(new CustomEvent("sofra:lang-changed", { detail: { lang, dict } }));
}

function sofraInitLanguage() {
    const areaKey = sofraStorageKeyForArea();
    // Try area-scoped key first, then fallback to legacy key, then default to Arabic
    const saved = localStorage.getItem(areaKey) || localStorage.getItem(SOFRA_LANG_KEY) || "ar";
    sofraApplyLanguage(saved);

    // Modal Trigger
    const langBtn = document.getElementById("sofraLangBtn");
    const langModal = document.getElementById("sofraLangModal");
    const closeBtn = document.getElementById("sofraLangModalClose");

    if (langBtn && langModal) {
        langBtn.addEventListener("click", () => {
            langModal.classList.add("is-open");
        });
    }

    if (closeBtn && langModal) {
        closeBtn.addEventListener("click", () => {
            langModal.classList.remove("is-open");
        });
    }

    if (langModal) {
        langModal.addEventListener("click", (e) => {
            if (e.target === langModal) {
                langModal.classList.remove("is-open");
            }
        });
    }

    // Language option click
    document.querySelectorAll(".lang-option-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const chosen = btn.dataset.lang;
            sofraApplyLanguage(chosen);
            if (langModal) langModal.classList.remove("is-open");
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    sofraInitLanguage();
});

document.addEventListener("sofra:partials-loaded", () => {
    sofraInitLanguage();
});

} // end of __SOFRA_LANG_LOADED guard