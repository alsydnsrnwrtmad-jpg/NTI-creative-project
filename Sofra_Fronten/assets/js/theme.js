/* =====================================================================
   SOFRA — THEME & ACCENT COLOR CONTROLLER
   ===================================================================== */

const SOFRA_THEME_KEY = "sofra-theme";
const SOFRA_ACCENT_KEY = "sofra-accent";

function sofraApplyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
        localStorage.setItem(SOFRA_THEME_KEY, theme);
    } catch (e) {}

    document.querySelectorAll(".theme-switch button").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.theme === theme);
        btn.setAttribute("aria-pressed", btn.dataset.theme === theme ? "true" : "false");
    });
}

function sofraApplyAccent(accent) {
    document.documentElement.setAttribute("data-accent", accent);
    try {
        localStorage.setItem(SOFRA_ACCENT_KEY, accent);
    } catch (e) {}

    document.querySelectorAll(".accent-picker-dot").forEach((dot) => {
        dot.classList.toggle("active", dot.dataset.accent === accent);
    });
}

function sofraInitThemeSwitch() {
    const savedTheme = localStorage.getItem(SOFRA_THEME_KEY) || "auto";
    sofraApplyTheme(savedTheme);

    const savedAccent = localStorage.getItem(SOFRA_ACCENT_KEY) || "orange";
    sofraApplyAccent(savedAccent);

    document.querySelectorAll(".theme-switch button").forEach((btn) => {
        btn.addEventListener("click", () => sofraApplyTheme(btn.dataset.theme));
    });

    document.querySelectorAll(".accent-picker-dot").forEach((dot) => {
        dot.addEventListener("click", () => sofraApplyAccent(dot.dataset.accent));
    });

    if (window.matchMedia) {
        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
            if ((localStorage.getItem(SOFRA_THEME_KEY) || "auto") === "auto") {
                sofraApplyTheme("auto");
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", sofraInitThemeSwitch);
document.addEventListener("sofra:partials-loaded", sofraInitThemeSwitch);
