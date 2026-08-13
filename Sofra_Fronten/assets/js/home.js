/* =====================================================================
   SOFRA — HOME PAGE interactions
   Cinematic slider · filmstrip · scroll reveal · carousel drag
   ===================================================================== */

(function () {
    "use strict";

    const SLIDE_DURATION = 6000; // ms per slide

    /* ---------- Cinematic Hero Slider ---------- */
    const slides = document.querySelectorAll(".cinematic-hero__slide");
    const thumbs = document.querySelectorAll(".filmstrip-thumb");
    const progressBar = document.getElementById("heroProgressBar");
    const heroSection = document.querySelector(".cinematic-hero");
    const btnPrev = document.getElementById("heroPrev");
    const btnNext = document.getElementById("heroNext");

    if (!slides.length) return;

    let current = 0;
    let timer = null;
    let progressRAF = null;
    let progressStart = 0;
    let paused = false;

    function goTo(index) {
        const next = ((index % slides.length) + slides.length) % slides.length;
        if (next === current) return;

        slides[current].classList.remove("is-active");
        slides[current].setAttribute("aria-hidden", "true");
        thumbs[current]?.classList.remove("is-active");

        current = next;

        slides[current].classList.add("is-active");
        slides[current].setAttribute("aria-hidden", "false");
        thumbs[current]?.classList.add("is-active");

        resetProgress();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function resetProgress() {
        if (progressBar) {
            progressBar.style.width = "0%";
            progressBar.style.transition = "none";
        }
        cancelAnimationFrame(progressRAF);
        clearTimeout(timer);
        if (!paused) startAutoplay();
    }

    function startAutoplay() {
        progressStart = performance.now();

        function tick(now) {
            if (paused) return;
            const elapsed = now - progressStart;
            const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
            if (progressBar) {
                progressBar.style.transition = "none";
                progressBar.style.width = pct + "%";
            }
            if (elapsed < SLIDE_DURATION) {
                progressRAF = requestAnimationFrame(tick);
            }
        }
        progressRAF = requestAnimationFrame(tick);

        timer = setTimeout(next, SLIDE_DURATION);
    }

    btnNext?.addEventListener("click", next);
    btnPrev?.addEventListener("click", prev);

    thumbs.forEach((thumb) => {
        thumb.addEventListener("click", () => goTo(Number(thumb.dataset.goto)));
    });

    heroSection?.addEventListener("mouseenter", () => { paused = true; clearTimeout(timer); });
    heroSection?.addEventListener("mouseleave", () => { paused = false; resetProgress(); });

    /* Keyboard navigation */
    heroSection?.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") next();
        if (e.key === "ArrowLeft") prev();
    });

    /* Touch swipe */
    let touchStartX = 0;
    heroSection?.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    heroSection?.addEventListener("touchend", (e) => {
        const diff = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(diff) > 50) diff < 0 ? next() : prev();
    }, { passive: true });

    startAutoplay();

    /* ---------- Featured carousel drag scroll ---------- */
    const carousel = document.getElementById("featuredCarousel");
    if (carousel) {
        let isDown = false;
        let startX;
        let scrollLeft;

        carousel.addEventListener("mousedown", (e) => {
            isDown = true;
            carousel.classList.add("is-dragging");
            startX = e.pageX - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
        });
        carousel.addEventListener("mouseleave", () => { isDown = false; carousel.classList.remove("is-dragging"); });
        carousel.addEventListener("mouseup", () => { isDown = false; carousel.classList.remove("is-dragging"); });
        carousel.addEventListener("mousemove", (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - carousel.offsetLeft;
            carousel.scrollLeft = scrollLeft - (x - startX) * 1.5;
        });
    }

    /* ---------- Scroll reveal ---------- */
    const revealEls = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        );
        revealEls.forEach((el) => observer.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add("is-visible"));
    }
})();
