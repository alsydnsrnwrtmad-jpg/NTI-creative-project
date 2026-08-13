/* =====================================================================
   SOFRA — THEME INIT (يتحمّل في <head> بـ blocking script عشان
   يمنع "وميض" الوضع الغلط قبل ما الصفحة تتعرض)
   ===================================================================== */
(function () {
    try {
        var saved = localStorage.getItem("sofra-theme") || "auto";
        document.documentElement.setAttribute("data-theme", saved);
    } catch (e) {
        document.documentElement.setAttribute("data-theme", "auto");
    }
})();
