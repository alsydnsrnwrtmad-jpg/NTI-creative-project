// Admin - load all meals, allow edit (link) and delete (API)
(function(){
  function el(sel, ctx){ return (ctx||document).querySelector(sel); }
  function els(sel, ctx){ return Array.from((ctx||document).querySelectorAll(sel)); }

  function renderTable(tbody, meals){
    tbody.innerHTML = '';
    meals.forEach(function(m){
      var tr = document.createElement('tr');
      var imgTd = document.createElement('td');
      var img = document.createElement('img'); img.src = m.image_url || 'assets/images/avatars/11.jpg'; img.width = 48; img.height = 48; img.className = 'rounded'; img.alt = m.name || '';
      imgTd.appendChild(img);
      var nameTd = document.createElement('td'); nameTd.innerHTML = '<b>' + (m.name||'') + '</b>';
      var catTd = document.createElement('td'); catTd.textContent = m.category_id || '';
      var priceTd = document.createElement('td'); priceTd.textContent = (parseFloat(m.price)||0) + ' EGP';
      var availTd = document.createElement('td'); availTd.innerHTML = m.is_available ? '<div class="badge bg-success">Available</div>' : '<div class="badge bg-secondary">Unavailable</div>';
      var actionsTd = document.createElement('td'); actionsTd.className = 'text-center';

      var viewBtn = document.createElement('a'); viewBtn.href = '#'; viewBtn.className = 'btn btn-sm btn-outline-secondary me-1'; viewBtn.innerHTML = '<i class="fa-solid fa-eye"></i>';
      viewBtn.onclick = function(e){ e.preventDefault(); window.open('food-details.html?id=' + encodeURIComponent(m.id), '_blank'); };

      var editBtn = document.createElement('a'); editBtn.href = 'meals-add.html?id=' + encodeURIComponent(m.id); editBtn.className = 'btn btn-sm btn-outline-primary me-1'; editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';

      var delBtn = document.createElement('a'); delBtn.href = '#'; delBtn.className = 'btn btn-sm btn-outline-danger'; delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
      delBtn.onclick = function(e){ e.preventDefault(); if (!confirm('Delete this meal?')) return; deleteMeal(m.id, function(ok, msg){ if (ok){ tr.remove(); alert('Deleted'); } else alert('Delete failed: '+msg); }); };

      actionsTd.appendChild(viewBtn); actionsTd.appendChild(editBtn); actionsTd.appendChild(delBtn);

      tr.appendChild(imgTd); tr.appendChild(nameTd); tr.appendChild(catTd); tr.appendChild(priceTd); tr.appendChild(availTd); tr.appendChild(actionsTd);
      tbody.appendChild(tr);
    });
  }

  function deleteMeal(id, cb){
    var token = localStorage.getItem('sofra_session_token') || '';
    var fd = new FormData(); fd.append('id', id);
    fetch('/sofra/backend/api/delete_meal.php', {
      method: 'POST', headers: token ? { 'Authorization': 'Bearer ' + token } : {}, body: fd
    }).then(function(r){ return r.json(); }).then(function(j){ cb(!!(j && j.success), j && j.message); }).catch(function(err){ console.error(err); cb(false, err.message || 'network error'); });
  }

  document.addEventListener('DOMContentLoaded', function(){
    var tbody = document.querySelector('table tbody');
    if (!tbody) return;
    fetch('/sofra/backend/api/get_meals.php?available=0').then(function(r){ return r.json(); }).then(function(j){
      if (j && j.success && Array.isArray(j.results)) {
        renderTable(tbody, j.results);
      } else {
        console.warn('No meals returned or error', j);
      }
    }).catch(function(err){ console.error('Error loading meals', err); });
  });
})();
