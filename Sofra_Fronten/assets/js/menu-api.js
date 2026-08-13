// Menu API loader: fetches meals from backend and renders them on the menu page
(function(){
  function renderMeals(container, meals) {
    if (!container) return;
    container.innerHTML = '';
    meals.forEach(function(m){
      var col = document.createElement('div');
      col.className = 'col-12 col-sm-6 col-lg-4 col-xl-3';

      var card = document.createElement('div');
      card.className = 'menu-card';
      card.style.cursor = 'pointer';
      card.onclick = function(){ window.location.href = 'food-details.html?id=' + encodeURIComponent(m.id); };

      var imgWrap = document.createElement('div'); imgWrap.className='menu-image';
      var img = document.createElement('img'); img.src = m.image_url || 'https://via.placeholder.com/800x600?text=No+Image'; img.alt = m.name || 'Meal';
      imgWrap.appendChild(img);
      if (!m.is_available) {
        var badge = document.createElement('span'); badge.className='menu-badge'; badge.textContent = 'Unavailable'; imgWrap.appendChild(badge);
      }

      var body = document.createElement('div'); body.className='menu-card-body';
      var h3 = document.createElement('h3'); h3.textContent = m.name;
      var p = document.createElement('p'); p.textContent = m.description || '';
      var footer = document.createElement('div'); footer.className='menu-card-footer';
      var price = document.createElement('span'); price.className='price'; price.textContent = 'EGP ' + (parseFloat(m.price) || 0);
      var btn = document.createElement('button'); btn.className='add-btn'; btn.textContent = '+ Add';
      btn.onclick = function(ev){ ev.stopPropagation(); window.location.href = 'food-details.html?id=' + encodeURIComponent(m.id); };
      footer.appendChild(price); footer.appendChild(btn);

      body.appendChild(h3); body.appendChild(p); body.appendChild(footer);
      card.appendChild(imgWrap); card.appendChild(body);
      col.appendChild(card);
      container.appendChild(col);
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    var container = document.querySelector('.row.g-4');
    if (!container) return;
    fetch('/sofra/backend/api/get_meals.php?available=1').then(function(r){ return r.json(); }).then(function(j){
      if (j && j.success && Array.isArray(j.results) && j.results.length>0) {
        renderMeals(container, j.results);
      }
      // If results empty, keep static HTML already present (fallback) so that existing static entries show up
    }).catch(function(err){
      console.error('Error fetching meals:', err);
      // keep static fallback
    });
  });
})();
