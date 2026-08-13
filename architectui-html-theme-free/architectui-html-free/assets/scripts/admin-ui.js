// Shared admin UI helpers: active nav highlight, mobile sidebar toggle,
// topbar user name, and logout button wiring.
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    // Highlight the current page in the sidebar
    var current = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.admin-nav a').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === current) link.classList.add('active');
    });

    // Mobile sidebar toggle
    var toggleBtn = document.getElementById('sidebarToggle');
    var sidebar = document.querySelector('.admin-sidebar');
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', function () {
        sidebar.classList.toggle('open');
      });
    }

    // Show logged-in admin name in the topbar, if available
    var userEl = document.getElementById('topbarUser');
    if (userEl) {
      try {
        var raw = localStorage.getItem('sofra_user_data');
        if (raw) {
          var u = JSON.parse(raw);
          var name = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email || 'Admin';
          userEl.textContent = name;
        }
      } catch (e) { /* ignore */ }
    }

    // Wire up any logout button to the shared adminLogout() from auth-guard.js
    document.querySelectorAll('[data-action="logout"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (typeof adminLogout === 'function') adminLogout();
      });
    });
  });
})();
