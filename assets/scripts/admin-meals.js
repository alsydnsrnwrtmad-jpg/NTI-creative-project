// Admin meals helper: attaches to the Add Meal form and submits to backend API
(function(){
  function qs(name){
    var m = location.search.match(new RegExp('[?&]'+name+'=([^&]+)'));
    return m? decodeURIComponent(m[1]) : null;
  }

  function loadCategories(selectEl, selectedId, cb) {
    if (!selectEl) { if (cb) cb(); return; }
    fetch('/sofra/backend/api/get_categories.php').then(function(r){ return r.json(); }).then(function(j){
      selectEl.innerHTML = '<option value="" disabled' + (selectedId ? '' : ' selected') + '>Select category</option>';
      if (j && j.success && Array.isArray(j.results)) {
        j.results.forEach(function(c){
          var opt = document.createElement('option');
          opt.value = c.id;
          opt.textContent = c.name;
          if (selectedId && String(selectedId) === String(c.id)) opt.selected = true;
          selectEl.appendChild(opt);
        });
      }
      if (cb) cb();
    }).catch(function(err){
      console.error('Error loading categories:', err);
      if (cb) cb();
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    var form = document.querySelector('.card-body form');
    if (!form) return;

    var categorySelect = document.getElementById('mealCategory');
    var editingId = qs('id');
    if (editingId) {
      // load meal data
      fetch('/sofra/backend/api/get_meals.php?id=' + encodeURIComponent(editingId)).then(function(r){ return r.json(); }).then(function(j){
        if (j && j.success && j.result) {
          var m = j.result;
          document.getElementById('mealName').value = m.name || '';
          document.getElementById('mealPrice').value = m.price || '';
          document.getElementById('mealAvailability').value = (m.is_available ? 'Available' : 'Unavailable');
          document.getElementById('mealDescription').value = m.description || '';
          loadCategories(categorySelect, m.category_id);
        } else {
          loadCategories(categorySelect, null);
        }
      }).catch(function(){ loadCategories(categorySelect, null); });
    } else {
      loadCategories(categorySelect, null);
    }

    form.addEventListener('submit', function(e){
      e.preventDefault();
      var name = document.getElementById('mealName').value.trim();
      var category = document.getElementById('mealCategory').value;
      var price = document.getElementById('mealPrice').value;
      var availability = document.getElementById('mealAvailability').value;
      var description = document.getElementById('mealDescription').value;
      var imageInput = document.getElementById('mealImage');

      if (!name || !price) {
        alert('Please provide a name and a price for the meal.');
        return;
      }

      var fd = new FormData();
      fd.append('name', name);
      fd.append('description', description);
      fd.append('price', price);
      fd.append('category_id', category);
      fd.append('is_available', (availability === 'Available') ? 1 : 0);
      if (imageInput && imageInput.files && imageInput.files[0]) {
        fd.append('mealImage', imageInput.files[0]);
      }

      var token = localStorage.getItem('sofra_session_token') || '';
      var url = editingId ? '/sofra/backend/api/update_meal.php' : '/sofra/backend/api/create_meal.php';
      if (editingId) fd.append('id', editingId);

      fetch(url, {
        method: 'POST',
        headers: token ? { 'Authorization': 'Bearer ' + token } : {},
        body: fd
      }).then(function(res){ return res.json(); }).then(function(json){
        if (json && json.success) {
          alert(editingId ? 'Meal updated successfully.' : 'Meal created successfully.');
          window.location.href = 'meals-all.html';
        } else {
          alert('Error: ' + (json && json.message ? json.message : 'unknown'));
        }
      }).catch(function(err){
        console.error(err);
        alert('Network error. See console for details.');
      });

    });
  });
})();
