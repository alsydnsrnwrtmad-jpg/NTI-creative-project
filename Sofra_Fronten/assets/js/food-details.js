/* =====================================================================
   SOFRA — FOOD DETAILS PAGE
   بيقرأ id الطبق من الرابط (?id=) ويجيب بياناته من الداتا بيز عن طريق
   backend/api/get_meals.php، ويعرضها، ويضيفه لسلة التسوق والمفضلة
   المحفوظة في localStorage. كما يعرض أكلات قريبة وشبيهة من نفس التصنيف.
   ===================================================================== */

function sofraApiBase() {
    return '/sofra/backend/api';
}

function sofraFormatPrice(amount) {
    return "EGP " + amount;
}

function sofraGetCart() {
    try {
        return JSON.parse(localStorage.getItem("cart")) || [];
    } catch (err) {
        return [];
    }
}

function sofraSaveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function sofraGetFavorites() {
    try {
        return JSON.parse(localStorage.getItem("favorites")) || [];
    } catch (err) {
        return [];
    }
}

function sofraSaveFavorites(favs) {
    localStorage.setItem("favorites", JSON.stringify(favs));
}

async function sofraFetchMeal(id) {
    const res = await fetch(sofraApiBase() + '/get_meals.php?id=' + encodeURIComponent(id));
    const json = await res.json();
    if (!json || !json.success || !json.result) return null;
    return json.result;
}

async function sofraFetchRelated(currentId, categoryId) {
    const res = await fetch(sofraApiBase() + '/get_meals.php?available=1');
    const json = await res.json();
    if (!json || !json.success || !Array.isArray(json.results)) return [];

    let related = json.results.filter(function (m) { return Number(m.id) !== Number(currentId); });

    // رتّب الأكلات بحيث الأكلات من نفس التصنيف تظهر الأول
    related.sort(function (a, b) {
        const aSame = String(a.category_id) === String(categoryId);
        const bSame = String(b.category_id) === String(categoryId);
        if (aSame && !bSame) return -1;
        if (!aSame && bSame) return 1;
        return 0;
    });

    return related.slice(0, 4);
}

document.addEventListener("DOMContentLoaded", async function () {

    const params = new URLSearchParams(window.location.search);
    const foodId = params.get("id");

    const wrapper = document.getElementById("fdWrapper");
    const notFound = document.getElementById("fdNotFound");
    const breadcrumbName = document.getElementById("fdBreadcrumbName");
    const relatedSection = document.getElementById("fdRelatedSection");

    let food = null;
    if (foodId) {
        try {
            food = await sofraFetchMeal(foodId);
        } catch (err) {
            console.error('Error fetching meal:', err);
            food = null;
        }
    }

    // ======================================
    // Food Not Found
    // ======================================
    if (!food) {
        if (wrapper) wrapper.hidden = true;
        if (notFound) notFound.hidden = false;
        if (relatedSection) relatedSection.hidden = true;
        if (breadcrumbName) breadcrumbName.textContent = "طبق غير موجود";
        document.title = "Food Not Found - Sofra";
        return;
    }

    // ======================================
    // Fill Page With Food Data
    // ======================================
    document.title = food.name + " - Sofra";
    if (breadcrumbName) breadcrumbName.textContent = food.name;

    const foodName = document.getElementById("foodName");
    if (foodName) foodName.textContent = food.name;

    const foodDescription = document.getElementById("foodDescription");
    if (foodDescription) foodDescription.textContent = food.description || '';

    const foodPrice = document.getElementById("foodPrice");
    if (foodPrice) foodPrice.textContent = sofraFormatPrice(parseFloat(food.price) || 0);

    const foodImage = document.getElementById("foodImage");
    if (foodImage) {
        foodImage.src = food.image_url || 'https://via.placeholder.com/800x600?text=No+Image';
        foodImage.alt = food.name;
    }

    const foodBadge = document.getElementById("foodBadge");
    if (foodBadge) {
        if (food.badge) {
            foodBadge.textContent = food.badge;
            foodBadge.hidden = false;
        } else {
            foodBadge.hidden = true;
        }
    }

    const ingredientsList = document.getElementById("foodIngredients");
    if (ingredientsList) {
        ingredientsList.innerHTML = "";
        (food.ingredients || []).forEach(function (ingredient) {
            const li = document.createElement("li");
            li.textContent = ingredient;
            ingredientsList.appendChild(li);
        });
    }

    // ======================================
    // Favorite Button Handler
    // ======================================
    const favBtn = document.getElementById("favBtn");
    let favs = sofraGetFavorites();
    let isFav = favs.includes(Number(foodId));

    function renderFavState() {
        if (!favBtn) return;
        const heart = favBtn.querySelector(".heart-icon");
        const text = favBtn.querySelector(".fav-text");
        if (isFav) {
            favBtn.classList.add("is-favorite");
            if (heart) heart.textContent = "❤️";
            if (text) text.textContent = "في المفضلة";
        } else {
            favBtn.classList.remove("is-favorite");
            if (heart) heart.textContent = "🤍";
            if (text) text.textContent = "إضافة للمفضلة";
        }
    }
    renderFavState();

    if (favBtn) {
        favBtn.addEventListener("click", function () {
            favs = sofraGetFavorites();
            const idNum = Number(foodId);
            if (isFav) {
                favs = favs.filter(function (id) { return id !== idNum; });
                isFav = false;
            } else {
                if (!favs.includes(idNum)) favs.push(idNum);
                isFav = true;
            }
            sofraSaveFavorites(favs);
            renderFavState();
        });
    }

    // ======================================
    // Quantity Stepper
    // ======================================
    let quantity = 1;
    const qtyValue = document.getElementById("fdQtyValue");
    const qtyMinus = document.getElementById("fdQtyMinus");
    const qtyPlus = document.getElementById("fdQtyPlus");

    function renderQty() {
        if (qtyValue) qtyValue.textContent = quantity;
    }

    if (qtyMinus) {
        qtyMinus.addEventListener("click", function () {
            if (quantity > 1) {
                quantity--;
                renderQty();
            }
        });
    }

    if (qtyPlus) {
        qtyPlus.addEventListener("click", function () {
            if (quantity < 20) {
                quantity++;
                renderQty();
            }
        });
    }

    // ======================================
    // Add To Cart
    // ======================================
    const addToCart = document.getElementById("addToCart");
    const toast = document.getElementById("fdToast");

    if (addToCart) {
        addToCart.addEventListener("click", function () {

            const cart = sofraGetCart();
            const existing = cart.find(function (item) {
                return item.id === Number(foodId);
            });

            if (existing) {
                existing.quantity += quantity;
            } else {
                cart.push({
                    id: Number(foodId),
                    name: food.name,
                    price: parseFloat(food.price) || 0,
                    image: food.image_url,
                    quantity: quantity
                });
            }

            sofraSaveCart(cart);

            if (toast) {
                toast.textContent = "تمت إضافة " + quantity + " × " + food.name + " إلى السلة ✅";
                toast.classList.add("show");
                window.clearTimeout(toast._hideTimer);
                toast._hideTimer = window.setTimeout(function () {
                    toast.classList.remove("show");
                }, 3000);
            }

            // رجّع الكمية لـ 1 بعد الإضافة
            quantity = 1;
            renderQty();
        });
    }

    // ======================================
    // Render Related Dishes
    // ======================================
    const relatedGrid = document.getElementById("fdRelatedGrid");
    if (relatedGrid) {
        try {
            const topRelated = await sofraFetchRelated(foodId, food.category_id);
            relatedGrid.innerHTML = topRelated.map(function (data) {
                const badgeHtml = data.badge ? '<span class="menu-badge">' + data.badge + '</span>' : '';
                const img = data.image_url || 'https://via.placeholder.com/800x600?text=No+Image';
                return (
                    '<div class="col-12 col-sm-6 col-lg-3">' +
                        '<div class="menu-card" style="cursor: pointer;" onclick="window.location.href=\'food-details.html?id=' + data.id + '\'">' +
                            '<div class="menu-image">' +
                                '<img src="' + img + '" alt="' + data.name + '">' +
                                badgeHtml +
                            '</div>' +
                            '<div class="menu-card-body">' +
                                '<h3>' + data.name + '</h3>' +
                                '<p>' + (data.description || '') + '</p>' +
                                '<div class="menu-card-footer">' +
                                    '<span class="price">EGP ' + (parseFloat(data.price) || 0) + '</span>' +
                                    '<button class="add-btn" onclick="event.stopPropagation(); window.location.href=\'food-details.html?id=' + data.id + '\'">التفاصيل →</button>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>'
                );
            }).join('');
        } catch (err) {
            console.error('Error fetching related meals:', err);
        }
    }

});
