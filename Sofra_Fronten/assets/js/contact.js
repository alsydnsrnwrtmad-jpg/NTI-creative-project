/* =====================================================================
   SOFRA — CONTACT PAGE
   فاليديشن بسيط للفورم في المتصفح. لسه معملش ربط بباك اند حقيقي،
   فبنكتفي إننا نتأكد إن البيانات مكتوبة صح ونعرض رسالة نجاح للمستخدم.
   لما الباك اند يبقى جاهز، غيّر جزء "TODO" تحت بـ fetch على الـ API.
   ===================================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("contactForm");
    const status = document.getElementById("contactFormStatus");
    const submitBtn = document.getElementById("contactSubmitBtn");

    if (!form) return;

    function showStatus(message, isError) {
        if (!status) return;
        status.textContent = message;
        status.classList.toggle("is-error", Boolean(isError));
        status.classList.add("show");
    }

    function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const subject = form.subject.value.trim();
        const message = form.message.value.trim();

        if (!name || !email || !subject || !message) {
            showStatus("من فضلك املأ كل الحقول قبل الإرسال.", true);
            return;
        }

        if (!isValidEmail(email)) {
            showStatus("من فضلك اكتب بريد إلكتروني صحيح.", true);
            return;
        }

        // TODO: لما الباك اند يبقى جاهز، ابعت البيانات دي بـ fetch/POST
        // fetch("/api/contact", { method: "POST", body: JSON.stringify({ name, email, subject, message }) });

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "جاري الإرسال...";
        }

        window.setTimeout(function () {
            showStatus("تم إرسال رسالتك بنجاح! هنرد عليك في أقرب وقت ✅", false);
            form.reset();

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "إرسال الرسالة";
            }
        }, 600);
    });

});
