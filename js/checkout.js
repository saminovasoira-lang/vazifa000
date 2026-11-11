/**
 * ULASH MARKET - Buyurtma Rasmiylashtirish va Yetkazib Berish Manzili (Checkout)
 * Xaritada manzil tanlash, do'konni biriktirish, promo-kod va to'lov usullari
 */

const UlashCheckout = {
    selectedStore: null,
    selectedCoords: { lat: 41.2750, lng: 69.2100 },
    selectedPaymentMethod: 'Naqd pul (kuryerga)',
    appliedPromo: null,

    init() {
        this.renderCheckout();
    },

    formatPrice(price) {
        if (!price && price !== 0) return '0 so‘m';
        return Number(price).toLocaleString('uz-UZ') + ' so‘m';
    },

    renderCheckout() {
        const container = document.getElementById('checkout-page-container');
        if (!container) return;

        const cart = window.ulashStore.getCart();
        const currentUser = window.ulashStore.getCurrentUser() || {};

        if (cart.length === 0) {
            container.innerHTML = `
                <div class="max-w-md mx-auto py-20 px-4 text-center">
                    <div class="w-20 h-20 mx-auto mb-4 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center text-4xl shadow-sm">
                        🛒
                    </div>
                    <h2 class="text-xl font-black text-slate-800 mb-1">Savatchangiz bo‘sh</h2>
                    <p class="text-xs text-slate-400 mb-6">Buyurtma rasmiylashtirish uchun katalogdan mahsulot qo‘shing.</p>
                    <button onclick="window.ulashApp.navigateTo('catalog')" class="px-6 py-3 bg-blue-600 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition">
                        Katalogga o‘tish ➔
                    </button>
                </div>
            `;
            return;
        }

        const nearest = window.ulashMap.findNearestStore(this.selectedCoords.lat, this.selectedCoords.lng);
        this.selectedStore = nearest;

        const subtotal = window.ulashStore.getCartTotal();
        const settings = window.ulashStore.getSettings();
        const freeDeliveryThreshold = settings.freeDeliveryThreshold || 350000;
        const baseDeliveryFee = nearest ? (nearest.deliveryFee || 15000) : 15000;
        const deliveryFee = subtotal >= freeDeliveryThreshold ? 0 : baseDeliveryFee;

        let discount = 0;
        if (this.appliedPromo) {
            discount = this.appliedPromo.discountAmount || 0;
        }
        const total = Math.max(0, subtotal + deliveryFee - discount);

        container.innerHTML = `
            <div class="max-w-6xl mx-auto px-4 py-8">
                <!-- Sarlavha -->
                <div class="mb-6 flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Buyurtmani rasmiylashtirish</h1>
                        <p class="text-xs text-slate-500 mt-0.5">Yetkazib berish manzili va qulay to‘lov usulini tanlang</p>
                    </div>
                    <button onclick="window.ulashApp.navigateTo('home')" class="text-xs font-bold text-blue-600 hover:underline">
                        ← Xaridni davom ettirish
                    </button>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <!-- Chap Tomon: Manzil va Qabul Qiluvchi Ma'lumotlari (7 cols) -->
                    <div class="lg:col-span-7 space-y-6">
                        
                        <!-- 1. Qabul qiluvchi -->
                        <div class="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs">1</div>
                                <h3 class="text-sm font-bold text-slate-800">Qabul qiluvchi ma’lumotlari</h3>
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div>
                                    <label class="block font-bold text-slate-700 mb-1">Ism va familiya *</label>
                                    <input type="text" id="checkout-name" value="${currentUser.name || ''}" placeholder="Masalan: Sardor Rahimov" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-semibold">
                                </div>
                                <div>
                                    <label class="block font-bold text-slate-700 mb-1">Telefon raqam *</label>
                                    <input type="tel" id="checkout-phone" value="${currentUser.phone || '+998 '}" placeholder="+998 90 123-45-67" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-semibold">
                                </div>
                            </div>
                        </div>

                        <!-- 2. Yetkazib berish manzili va Xarita -->
                        <div class="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs">2</div>
                                <div>
                                    <h3 class="text-sm font-bold text-slate-800">Yetkazib berish manzili</h3>
                                    <p class="text-[11px] text-slate-400">Xaritada belgilang, eng yaqin filial aniqlanadi</p>
                                </div>
                            </div>

                            <div class="space-y-3 text-xs">
                                <div>
                                    <label class="block font-bold text-slate-700 mb-1">To‘liq manzil (Ko‘cha, uy, xonadon, orientir) *</label>
                                    <textarea id="checkout-address" rows="2" placeholder="Masalan: Chilonzor 7-mavze, 12-uy, 45-xonadon. Orientir: 173-maktab ro‘parasida" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-medium">${currentUser.defaultAddress || ''}</textarea>
                                </div>

                                <!-- Xarita konteyneri -->
                                <div>
                                    <div class="flex items-center justify-between mb-1.5 text-[11px]">
                                        <span class="font-bold text-slate-700 flex items-center gap-1">
                                            <span>🗺️</span> Xaritada aniq nuqtani belgilang:
                                        </span>
                                        <span class="text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-bold">
                                            Qizil markerni suring
                                        </span>
                                    </div>
                                    <div id="checkout-map-picker" class="w-full h-64 rounded-2xl border border-slate-200 overflow-hidden shadow-inner"></div>
                                </div>

                                <!-- Eng yaqin do'kon kartochkasi -->
                                <div id="nearest-store-badge" class="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 flex items-start gap-3">
                                    <div class="text-3xl">🏬</div>
                                    <div class="text-xs">
                                        <div class="text-slate-500 font-medium">Yetkazib beruvchi eng yaqin do‘kon:</div>
                                        <div class="font-black text-blue-700 text-sm mt-0.5" id="nearest-store-title">
                                            ${this.selectedStore ? this.selectedStore.name : 'Korzinka Supermarket'}
                                        </div>
                                        <div class="text-slate-600 mt-1" id="nearest-store-distance">
                                            Masofa: ~${this.selectedStore?.distanceKm || 1.8} km • Yetkazish vaqti: ~${this.selectedStore?.deliveryTime || '30 daq'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 3. To'lov usuli -->
                        <div class="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs">3</div>
                                <h3 class="text-sm font-bold text-slate-800">To‘lov usulini tanlang</h3>
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                <label class="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 cursor-pointer hover:border-blue-500 transition bg-slate-50/50">
                                    <input type="radio" name="paymentMethod" value="Naqd pul (kuryerga)" checked onchange="UlashCheckout.setPaymentMethod(this.value)" class="text-blue-600">
                                    <div>
                                        <div class="font-bold text-slate-800">💵 Naqd pul</div>
                                        <div class="text-[10px] text-slate-400">Kuryerga yetkazganda</div>
                                    </div>
                                </label>

                                <label class="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 cursor-pointer hover:border-blue-500 transition bg-slate-50/50">
                                    <input type="radio" name="paymentMethod" value="Click / Payme" onchange="UlashCheckout.setPaymentMethod(this.value)" class="text-blue-600">
                                    <div>
                                        <div class="font-bold text-slate-800">📲 Click / Payme</div>
                                        <div class="text-[10px] text-slate-400">Tezkor onlayn to‘lov</div>
                                    </div>
                                </label>

                                <label class="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200 cursor-pointer hover:border-blue-500 transition bg-slate-50/50">
                                    <input type="radio" name="paymentMethod" value="Uzcard / Humo (Terminal)" onchange="UlashCheckout.setPaymentMethod(this.value)" class="text-blue-600">
                                    <div>
                                        <div class="font-bold text-slate-800">💳 Karta (Terminal)</div>
                                        <div class="text-[10px] text-slate-400">Kuryer terminalida</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                    </div>

                    <!-- O'ng Tomon: Buyurtma Tarkibi va Promo-kod (5 cols) -->
                    <div class="lg:col-span-5 space-y-6">
                        <div class="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm sticky top-24 space-y-4">
                            <h3 class="text-sm font-bold text-slate-800 pb-3 border-b border-slate-100 flex items-center justify-between">
                                <span>Buyurtmangiz tarkibi</span>
                                <span class="text-xs font-semibold text-slate-400">${cart.length} xil mahsulot</span>
                            </h3>

                            <!-- Mahsulotlar ro'yxati -->
                            <div class="max-h-56 overflow-y-auto space-y-3 pr-1 text-xs">
                                ${cart.map(item => `
                                    <div class="flex items-center gap-3">
                                        <img src="${item.image}" class="w-12 h-12 rounded-xl object-cover bg-slate-50 border border-slate-100 shrink-0">
                                        <div class="flex-1 min-w-0">
                                            <div class="font-bold text-slate-800 truncate">${item.name}</div>
                                            <div class="text-[11px] text-slate-400">${item.quantity} x ${this.formatPrice(item.price)}</div>
                                        </div>
                                        <div class="font-black text-slate-900 shrink-0">
                                            ${this.formatPrice(item.price * item.quantity)}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>

                            <!-- Promo-kod kiritish maydoni -->
                            <div class="pt-3 border-t border-slate-100">
                                <label class="block text-xs font-bold text-slate-700 mb-1">Promo-kod (Chegirma uchun):</label>
                                <div class="flex gap-2">
                                    <input type="text" id="checkout-promo-input" placeholder="Masalan: ULASH10" class="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-bold uppercase">
                                    <button onclick="UlashCheckout.applyPromoCode()" class="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition">
                                        Qo‘llash
                                    </button>
                                </div>
                                <div id="promo-status-msg" class="text-[11px] mt-1 font-semibold"></div>
                            </div>

                            <!-- Narxlar hisob-kitobi -->
                            <div class="space-y-2 text-xs pt-3 border-t border-slate-100">
                                <div class="flex justify-between text-slate-600">
                                    <span>Mahsulotlar summasi:</span>
                                    <span class="font-bold text-slate-800">${this.formatPrice(subtotal)}</span>
                                </div>
                                <div class="flex justify-between text-slate-600">
                                    <span>Yetkazib berish xizmati:</span>
                                    <span>${deliveryFee === 0 ? '<span class="text-emerald-600 font-bold">BEPUL</span>' : this.formatPrice(deliveryFee)}</span>
                                </div>
                                ${discount > 0 ? `
                                    <div class="flex justify-between text-rose-600 font-bold">
                                        <span>Promo-kod chegirmasi:</span>
                                        <span>-${this.formatPrice(discount)}</span>
                                    </div>
                                ` : ''}
                                <div class="flex justify-between text-slate-900 font-black text-sm pt-3 border-t border-slate-200">
                                    <span>Jami to‘lov:</span>
                                    <span class="text-blue-600 text-lg font-black" id="checkout-final-total">${this.formatPrice(total)}</span>
                                </div>
                            </div>

                            <!-- Buyurtma berish tugmasi -->
                            <button id="btn-submit-order" onclick="UlashCheckout.submitOrder()" class="w-full mt-4 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl shadow-xl shadow-blue-200 transition duration-200 flex items-center justify-center gap-2 group active:scale-95">
                                <span>Buyurtmani tasdiqlash ➔</span>
                            </button>

                            <p class="text-[10px] text-slate-400 text-center leading-relaxed">
                                Buyurtma tasdiqlangach, do‘kon tayyorlaydi va kuryer tezda eshigingizgacha yetkazadi.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Xaritani faollashtirish
        setTimeout(() => {
            window.ulashMap.initCheckoutMapPicker('checkout-map-picker', this.selectedCoords.lat, this.selectedCoords.lng, (location) => {
                this.selectedCoords = { lat: location.lat, lng: location.lng };
                this.selectedStore = location.nearestStore;

                const storeTitle = document.getElementById('nearest-store-title');
                const storeDist = document.getElementById('nearest-store-distance');
                if (storeTitle && location.nearestStore) {
                    storeTitle.textContent = location.nearestStore.name;
                    storeDist.textContent = `Masofa: ~${location.distanceKm} km • Yetkazish vaqti: ~${location.nearestStore.deliveryTime || '30 daq'}`;
                }
            });
        }, 150);
    },

    setPaymentMethod(val) {
        this.selectedPaymentMethod = val;
    },

    applyPromoCode() {
        const input = document.getElementById('checkout-promo-input');
        const msg = document.getElementById('promo-status-msg');
        if (!input || !msg) return;

        const code = input.value.trim().toUpperCase();
        if (!code) {
            msg.className = 'text-[11px] text-rose-500 font-semibold mt-1';
            msg.textContent = 'Iltimos, promo-kodni kiriting!';
            return;
        }

        const subtotal = window.ulashStore.getCartTotal();
        const res = window.ulashStore.validatePromo(code, subtotal);

        if (res.valid) {
            this.appliedPromo = res;
            msg.className = 'text-[11px] text-emerald-600 font-bold mt-1';
            msg.textContent = res.message;
            this.renderCheckout();
        } else {
            this.appliedPromo = null;
            msg.className = 'text-[11px] text-rose-500 font-semibold mt-1';
            msg.textContent = res.error;
        }
    },

    submitOrder() {
        const nameInput = document.getElementById('checkout-name');
        const phoneInput = document.getElementById('checkout-phone');
        const addressInput = document.getElementById('checkout-address');

        const name = nameInput ? nameInput.value.trim() : '';
        const phone = phoneInput ? phoneInput.value.trim() : '';
        const address = addressInput ? addressInput.value.trim() : '';

        if (!name || name.length < 2) {
            alert("Iltimos, ismingizni kiriting!");
            if (nameInput) nameInput.focus();
            return;
        }

        if (!phone || phone.length < 9) {
            alert("Iltimos, to‘g‘ri telefon raqamingizni kiriting!");
            if (phoneInput) phoneInput.focus();
            return;
        }

        if (!address || address.length < 5) {
            alert("Iltimos, to‘liq yetkazib berish manzilingizni kiriting!");
            if (addressInput) addressInput.focus();
            return;
        }

        const cart = window.ulashStore.getCart();
        const subtotal = window.ulashStore.getCartTotal();
        const settings = window.ulashStore.getSettings();
        const freeDeliveryThreshold = settings.freeDeliveryThreshold || 350000;
        const baseDeliveryFee = this.selectedStore ? (this.selectedStore.deliveryFee || 15000) : 15000;
        const deliveryFee = subtotal >= freeDeliveryThreshold ? 0 : baseDeliveryFee;

        let discount = 0;
        let promoCode = null;
        if (this.appliedPromo) {
            discount = this.appliedPromo.discountAmount || 0;
            promoCode = this.appliedPromo.code;
        }

        const total = Math.max(0, subtotal + deliveryFee - discount);
        const store = this.selectedStore || window.ulashStore.getStores()[0];

        const orderData = {
            customer: {
                name,
                phone,
                address,
                district: store ? store.district : 'Toshkent',
                lat: this.selectedCoords.lat,
                lng: this.selectedCoords.lng
            },
            items: cart.map(it => ({
                productId: it.productId,
                name: it.name,
                price: it.price,
                quantity: it.quantity,
                image: it.image
            })),
            subtotal,
            deliveryFee,
            discountApplied: discount,
            promoCode,
            total,
            paymentMethod: this.selectedPaymentMethod,
            paymentStatus: this.selectedPaymentMethod === 'Click / Payme' ? 'To‘langan' : 'Kutilmoqda',
            storeId: store ? store.id : 'store-1',
            storeName: store ? store.name : 'Ulash Supermarket',
            distanceKm: store ? (store.distanceKm || 2.0) : 2.0
        };

        const newOrder = window.ulashStore.createOrder(orderData);

        // Confetti otish
        try {
            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 120,
                    spread: 80,
                    origin: { y: 0.6 }
                });
            }
        } catch (e) {}

        // Buyurtmalar sahifasiga o'tish
        window.ulashApp.navigateTo('orders', { highlightOrderId: newOrder.id });
    }
};

window.ulashCheckout = UlashCheckout;
