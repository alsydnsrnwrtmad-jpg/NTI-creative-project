/* =====================================================================
   SOFRA — CART PAGE
   بيقرأ ويكتب في localStorage تحت مفتاح "cart" (نفس المفتاح اللي
   بتستخدمه صفحة food-details.html)، ويعرض الأصناف مع تحكم في الكمية
   وحذف الصنف وحساب الإجمالي.
   ===================================================================== */

const SOFRA_DELIVERY_FEE = 30;

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

function sofraFormatPrice(amount) {
    return "EGP " + amount;
}

function sofraEscapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function sofraRenderCart() {

    const cart = sofraGetCart();

    const emptyEl = document.getElementById("cartEmpty");
    const contentEl = document.getElementById("cartContent");
    const itemsEl = document.getElementById("cartItems");
    const countLabel = document.getElementById("cartCountLabel");

    if (!emptyEl || !contentEl || !itemsEl) return;

    if (!cart.length) {
        emptyEl.hidden = false;
        contentEl.hidden = true;
        if (countLabel) countLabel.textContent = "";
        return;
    }

    emptyEl.hidden = true;
    contentEl.hidden = false;

    const totalItems = cart.reduce(function (sum, item) {
        return sum + item.quantity;
    }, 0);

    if (countLabel) countLabel.textContent = "(" + totalItems + " صنف)";

    itemsEl.innerHTML = cart.map(function (item) {
        return (
            '<div class="cart-item" data-id="' + item.id + '">' +
                '<img src="' + item.image + '" alt="' + sofraEscapeHtml(item.name) + '">' +
                '<div class="cart-item-info">' +
                    '<h3>' + sofraEscapeHtml(item.name) + '</h3>' +
                    '<span class="cart-item-price">' + sofraFormatPrice(item.price) + '</span>' +
                '</div>' +
                '<div class="cart-item-qty" role="group" aria-label="الكمية">' +
                    '<button type="button" class="cart-qty-btn" data-action="decrease" aria-label="تقليل الكمية">−</button>' +
                    '<span>' + item.quantity + '</span>' +
                    '<button type="button" class="cart-qty-btn" data-action="increase" aria-label="زيادة الكمية">+</button>' +
                '</div>' +
                '<div class="cart-item-total">' + sofraFormatPrice(item.price * item.quantity) + '</div>' +
                '<button type="button" class="cart-remove-btn" data-action="remove" aria-label="إزالة من السلة">🗑</button>' +
            '</div>'
        );
    }).join("");

    const subtotal = cart.reduce(function (sum, item) {
        return sum + item.price * item.quantity;
    }, 0);

    const delivery = SOFRA_DELIVERY_FEE;
    const total = subtotal + delivery;

    const summaryItemsCount = document.getElementById("summaryItemsCount");
    const summarySubtotal = document.getElementById("summarySubtotal");
    const summaryDelivery = document.getElementById("summaryDelivery");
    const summaryTotal = document.getElementById("summaryTotal");

    if (summaryItemsCount) summaryItemsCount.textContent = totalItems;
    if (summarySubtotal) summarySubtotal.textContent = sofraFormatPrice(subtotal);
    if (summaryDelivery) summaryDelivery.textContent = sofraFormatPrice(delivery);
    if (summaryTotal) summaryTotal.textContent = sofraFormatPrice(total);
}

document.addEventListener("DOMContentLoaded", function () {

    sofraRenderCart();

    const itemsEl = document.getElementById("cartItems");

    if (itemsEl) {
        itemsEl.addEventListener("click", function (e) {

            const btn = e.target.closest("button[data-action]");
            if (!btn) return;

            const itemEl = e.target.closest(".cart-item");
            if (!itemEl) return;

            const id = Number(itemEl.dataset.id);
            const cart = sofraGetCart();
            const idx = cart.findIndex(function (item) {
                return item.id === id;
            });

            if (idx === -1) return;

            if (btn.dataset.action === "increase") {
                cart[idx].quantity++;
            } else if (btn.dataset.action === "decrease") {
                cart[idx].quantity--;
                if (cart[idx].quantity <= 0) {
                    cart.splice(idx, 1);
                }
            } else if (btn.dataset.action === "remove") {
                cart.splice(idx, 1);
            }

            sofraSaveCart(cart);
            sofraRenderCart();
        });
    }

    const clearBtn = document.getElementById("clearCartBtn");
    if (clearBtn) {
        clearBtn.addEventListener("click", function () {
            if (window.confirm("متأكد إنك عايز تفرّغ السلة؟")) {
                localStorage.removeItem("cart");
                sofraRenderCart();
            }
        });
    }

    const checkoutBtn = document.getElementById("checkoutBtn");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", async function () {
            // Ensure user is logged in
            const token = (typeof getSessionToken === 'function') ? getSessionToken() : null;
            if (!token) {
                if (window.confirm("عشان تكمل الطلب لازم تكون مسجل. هل تريد تسجيل الدخول الآن؟")) {
                    window.location.href = 'choice.html';
                }
                return;
            }

            const cart = sofraGetCart();
            if (!cart.length) {
                window.alert('السلة فاضية');
                return;
            }

            // Calculate subtotal and delivery
            const subtotal = cart.reduce((s, it) => s + (it.price * it.quantity), 0);
            const deliveryFee = SOFRA_DELIVERY_FEE;
            const total = subtotal + deliveryFee;

            if (!window.confirm(`سيتم إنشاء طلب بقيمة ${sofraFormatPrice(total)}. تأكيد ومتابعة؟`)) return;

            try {
                // Build payload
                const payload = {
                    cart: cart.map(it => ({ id: it.id, quantity: it.quantity, price: it.price })),
                    delivery_fee: deliveryFee,
                    payment_method: 'cash',
                    delivery_address: '',
                    phone: '',
                    notes: ''
                };

                // API base (from auth-api.js)
                const apiUrl = (typeof API_BASE_URL !== 'undefined') ? API_BASE_URL : '/sofra/backend/api';

                const res = await fetch(`${apiUrl}/create_order.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                const result = await res.json();

                if (result && result.success) {
                    window.alert('تم إنشاء الطلب بنجاح. رقم الطلب: ' + (result.order_id || '---'));
                    // Clear cart
                    localStorage.removeItem('cart');
                    sofraRenderCart();
                } else {
                    window.alert('حدث خطأ أثناء إنشاء الطلب: ' + (result.message || 'خطأ غير معروف'));
                }
            } catch (err) {
                console.error(err);
                window.alert('فشل الاتصال بالخادم. حاول مرة أخرى لاحقًا.');
            }
        });
    }

});
