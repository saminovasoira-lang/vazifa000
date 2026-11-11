/**
 * ULASH MARKET - Kuryer Paneli va Yetkazib Berish Boshqaruvi
 * Yangi buyurtmalarni mustaqil tanlash, atomar qabul qilish, marshrut xaritasi, bosqichlarni yangilash va daromad
 */

const UlashCourier = {
    activeTab: 'available', // 'available' | 'active' | 'history'

    init() {
        this.renderCourierPanel();
        this.setupSubscriptions();
    },

    formatPrice(price) {
        if (!price && price !== 0) return '0 so‘m';
        return Number(price).toLocaleString('uz-UZ') + ' so‘m';
    },

    setupSubscriptions() {
        window.ulashStore.subscribe('ORDER_CREATED', () => {
            if (this.isCourierViewActive()) this.renderCourierPanel();
        });
        window.ulashStore.subscribe('ORDER_ACCEPTED', () => {
            if (this.isCourierViewActive()) this.renderCourierPanel();
        });
        window.ulashStore.subscribe('ORDER_STATUS_CHANGED', () => {
            if (this.isCourierViewActive()) this.renderCourierPanel();
        });
        window.ulashStore.subscribe('USER_CHANGED', () => {
            if (this.isCourierViewActive()) this.renderCourierPanel();
        });
    },

    isCourierViewActive() {
        const panel = document.getElementById('courier-panel-container');
        return panel && !panel.classList.contains('hidden');
    },

    getCurrentCourier() {
        const user = window.ulashStore.getCurrentUser();
        const couriers = window.ulashStore.getCouriers();

        if (user && user.role === 'courier') {
            return couriers.find(c => c.id === user.id || c.phone === user.phone) || {
                id: user.id || 'cour-1',
                name: user.name || 'Sardor Aliyev',
                phone: user.phone || '+998 90 123-45-67',
                transport: user.transport || 'Skuter',
                rating: 4.95,
                completedOrders: 142,
                earningsTotal: 2130000
            };
        }
        return couriers[0] || {
            id: 'cour-1',
            name: 'Sardor Aliyev',
            phone: '+998 90 123-45-67',
            transport: 'Skuter (Honda Dio)',
            rating: 4.95,
            completedOrders: 142,
            earningsTotal: 2130000
        };
    },

    setTab(tabName) {
        this.activeTab = tabName;
        this.renderCourierPanel();
    },

    renderCourierPanel() {
        const container = document.getElementById('courier-panel-container');
        if (!container) return;

        const courier = this.getCurrentCourier();
        const allOrders = window.ulashStore.getOrders();

        // 1. Yangi bo'sh buyurtmalar (hali hech qaysi kuryer olmagan)
        const availableOrders = allOrders.filter(o => 
            !o.courierId && 
            (o.status === 'Buyurtma yaratildi' || o.status === 'Do‘kon tasdiqladi')
        );

        // 2. Ushbu kuryer qabul qilgan faol buyurtmalar
        const myActiveOrders = allOrders.filter(o => 
            (o.courierId === courier.id || o.courierPhone === courier.phone) &&
            (o.status === 'Kuryer qabul qildi' || o.status === 'Mahsulot tayyorlandi' || o.status === 'Kuryer olib ketdi')
        );

        // 3. Ushbu kuryer bajargan buyurtmalar tarixi
        const myHistoryOrders = allOrders.filter(o => 
            (o.courierId === courier.id || o.courierPhone === courier.phone) &&
            (o.status === 'Buyurtma yetkazildi' || o.status === 'Bekor qilindi')
        );

        container.innerHTML = `
            <div class="max-w-6xl mx-auto px-4 py-8">
                <!-- Kuryer Profili va Balans Statistikasi -->
                <div class="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800 rounded-3xl p-6 text-white shadow-xl mb-8">
                    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl border border-white/30 shadow-inner">
                                🛵
                            </div>
                            <div>
                                <div class="flex items-center gap-2">
                                    <h1 class="text-xl md:text-2xl font-black">${courier.name}</h1>
                                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-slate-900 flex items-center gap-1">
                                        <span class="w-1.5 h-1.5 rounded-full bg-slate-900 animate-ping"></span>
                                        Onlayn
                                    </span>
                                </div>
                                <p class="text-blue-100 text-xs mt-1">
                                    Transport: <b class="text-white">${courier.transport}</b> • Tel: <b class="text-white">${courier.phone}</b>
                                </p>
                            </div>
                        </div>

                        <!-- Balans va Reyting -->
                        <div class="flex items-center gap-4 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
                            <div class="text-right">
                                <div class="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Jami Daromad</div>
                                <div class="text-lg font-black text-amber-300">${this.formatPrice(courier.earningsTotal || 0)}</div>
                            </div>
                            <div class="h-8 w-px bg-white/20"></div>
                            <div class="text-left">
                                <div class="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Reyting</div>
                                <div class="text-lg font-black text-white flex items-center gap-1">
                                    <span class="text-amber-300">★</span>
                                    <span>${courier.rating || 5.0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Kuryer Tanlov Menyusi -->
                    <div class="flex items-center gap-2 mt-6 pt-6 border-t border-white/15 overflow-x-auto text-xs font-bold">
                        <button onclick="UlashCourier.setTab('available')" class="px-4 py-2.5 rounded-xl transition ${this.activeTab === 'available' ? 'bg-white text-blue-700 shadow-md' : 'bg-white/10 text-white hover:bg-white/20'} flex items-center gap-2">
                            <span>⚡ Yangi buyurtmalar</span>
                            <span class="px-2 py-0.5 rounded-full text-[10px] ${this.activeTab === 'available' ? 'bg-blue-100 text-blue-700' : 'bg-white/20 text-white'}">${availableOrders.length}</span>
                        </button>

                        <button onclick="UlashCourier.setTab('active')" class="px-4 py-2.5 rounded-xl transition ${this.activeTab === 'active' ? 'bg-white text-blue-700 shadow-md' : 'bg-white/10 text-white hover:bg-white/20'} flex items-center gap-2">
                            <span>📦 Faol buyurtmalarim</span>
                            <span class="px-2 py-0.5 rounded-full text-[10px] ${this.activeTab === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-white/20 text-white'}">${myActiveOrders.length}</span>
                        </button>

                        <button onclick="UlashCourier.setTab('history')" class="px-4 py-2.5 rounded-xl transition ${this.activeTab === 'history' ? 'bg-white text-blue-700 shadow-md' : 'bg-white/10 text-white hover:bg-white/20'} flex items-center gap-2">
                            <span>📜 Yetkazilganlar tarixi</span>
                            <span class="px-2 py-0.5 rounded-full text-[10px] ${this.activeTab === 'history' ? 'bg-blue-100 text-blue-700' : 'bg-white/20 text-white'}">${myHistoryOrders.length}</span>
                        </button>
                    </div>
                </div>

                <!-- Tab Kontenti -->
                <div>
                    ${this.activeTab === 'available' ? this.renderAvailableOrders(availableOrders) : ''}
                    ${this.activeTab === 'active' ? this.renderActiveOrders(myActiveOrders) : ''}
                    ${this.activeTab === 'history' ? this.renderHistoryOrders(myHistoryOrders) : ''}
                </div>
            </div>
        `;

        // Faol buyurtmalarning xaritalarini initsializatsiya qilish
        if (this.activeTab === 'active' && myActiveOrders.length > 0) {
            setTimeout(() => {
                myActiveOrders.forEach(o => {
                    const store = window.ulashStore.getStoreById(o.storeId) || { lat: 41.2721, lng: 69.2045 };
                    const cust = o.customer || { lat: 41.2750, lng: 69.2100 };
                    window.ulashMap.initOrderTrackingMap(
                        `courier-map-${o.id}`,
                        store.lat, store.lng,
                        cust.lat || 41.2750, cust.lng || 69.2100,
                        null, null,
                        o.status
                    );
                });
            }, 200);
        }
    },

    renderAvailableOrders(orders) {
        if (orders.length === 0) {
            return `
                <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
                    <div class="text-5xl mb-3">🛵</div>
                    <h3 class="text-base font-bold text-slate-800 mb-1">Hozirda yangi bo‘sh buyurtmalar yo‘q</h3>
                    <p class="text-xs text-slate-400">Yangi buyurtma tushganda ushbu bo‘limda avtomatik paydo bo‘ladi.</p>
                </div>
            `;
        }

        return `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${orders.map(o => {
                    const store = window.ulashStore.getStoreById(o.storeId) || {
                        name: o.storeName || 'Ulash Do‘kon',
                        address: 'Toshkent sh.',
                        phone: '+998 71 200-00-00'
                    };

                    return `
                        <div class="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition">
                            <div class="space-y-4">
                                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                                    <div class="flex items-center gap-2">
                                        <span class="font-black text-slate-900 text-sm">#${o.id}</span>
                                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                            ${o.status}
                                        </span>
                                    </div>
                                    <span class="text-emerald-600 font-black text-xs bg-emerald-50 px-2 py-0.5 rounded-md">
                                        +15 000 so‘m komissiya
                                    </span>
                                </div>

                                <!-- Olish va Yetkazish manzillari -->
                                <div class="space-y-3 text-xs">
                                    <div class="flex items-start gap-3 p-3 bg-blue-50/60 rounded-2xl border border-blue-100">
                                        <span class="text-lg">🏬</span>
                                        <div>
                                            <div class="text-[10px] text-blue-600 font-bold uppercase">1. Do‘kondan mahsulotni olish:</div>
                                            <div class="font-bold text-slate-800 text-xs">${store.name}</div>
                                            <div class="text-[11px] text-slate-500">${store.address}</div>
                                        </div>
                                    </div>

                                    <div class="flex items-start gap-3 p-3 bg-rose-50/60 rounded-2xl border border-rose-100">
                                        <span class="text-lg">📍</span>
                                        <div>
                                            <div class="text-[10px] text-rose-600 font-bold uppercase">2. Xaridor xonadoniga yetkazish:</div>
                                            <div class="font-bold text-slate-800 text-xs">${o.customer?.name} (${o.customer?.phone})</div>
                                            <div class="text-[11px] text-slate-500">${o.customer?.address}</div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Tarkib va To'lov -->
                                <div class="p-3 bg-slate-50 rounded-2xl text-xs space-y-1">
                                    <div class="flex justify-between text-slate-500">
                                        <span>Tovarlar soni:</span>
                                        <b class="text-slate-800">${o.items?.length || 0} xil</b>
                                    </div>
                                    <div class="flex justify-between text-slate-500">
                                        <span>Buyurtma qiymati:</span>
                                        <b class="text-slate-800">${this.formatPrice(o.total)}</b>
                                    </div>
                                    <div class="flex justify-between text-slate-500">
                                        <span>To‘lov usuli:</span>
                                        <b class="text-blue-600">${o.paymentMethod} (${o.paymentStatus})</b>
                                    </div>
                                </div>
                            </div>

                            <!-- Qabul qilish tugmasi -->
                            <div class="pt-4 border-t border-slate-100 mt-4">
                                <button onclick="UlashCourier.acceptOrder('${o.id}')" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-blue-200 transition duration-200 flex items-center justify-center gap-2 active:scale-95">
                                    <span>Buyurtmani qabul qilish ➔</span>
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    renderActiveOrders(orders) {
        if (orders.length === 0) {
            return `
                <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
                    <div class="text-5xl mb-3">📦</div>
                    <h3 class="text-base font-bold text-slate-800 mb-1">Hozirda faol buyurtmalaringiz yo‘q</h3>
                    <p class="text-xs text-slate-400">"Yangi buyurtmalar" bo‘limidan o‘zingizga ma’qul buyurtmani qabul qiling.</p>
                </div>
            `;
        }

        return `
            <div class="space-y-6">
                ${orders.map(o => {
                    const store = window.ulashStore.getStoreById(o.storeId) || {
                        name: o.storeName || 'Ulash Do‘kon',
                        address: 'Toshkent sh.',
                        phone: '+998 71 200-00-00'
                    };

                    const isPickedUp = o.status === 'Kuryer olib ketdi';

                    return `
                        <div class="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-6 space-y-6">
                            <!-- Sarlavha -->
                            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                                <div>
                                    <div class="flex items-center gap-2">
                                        <h3 class="font-black text-slate-900 text-base">Buyurtma #${o.id}</h3>
                                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black ${isPickedUp ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}">
                                            ${o.status}
                                        </span>
                                    </div>
                                    <div class="text-xs text-slate-400 mt-0.5">Xaridor: <b class="text-slate-700">${o.customer?.name}</b></div>
                                </div>

                                <div class="flex items-center gap-2">
                                    <a href="tel:${o.customer?.phone}" class="px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs rounded-xl flex items-center gap-1.5 transition">
                                        <span>📞</span>
                                        <span>Xaridorga qo‘ng‘iroq</span>
                                    </a>
                                    <a href="tel:${store.phone}" class="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-xl flex items-center gap-1.5 transition">
                                        <span>🏬</span>
                                        <span>Do‘konga qo‘ng‘iroq</span>
                                    </a>
                                </div>
                            </div>

                            <!-- 2 ustun: Xarita va Holat boshqaruvi -->
                            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                <!-- Xarita (7 cols) -->
                                <div class="lg:col-span-7">
                                    <div class="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
                                        <span>🗺️</span>
                                        <span>Marshrut (Do‘kon ➔ Yetkazish manzili):</span>
                                    </div>
                                    <div id="courier-map-${o.id}" class="w-full h-72 rounded-2xl border border-slate-200 overflow-hidden shadow-inner"></div>
                                </div>

                                <!-- Manzillar & Bosqich tugmalari (5 cols) -->
                                <div class="lg:col-span-5 flex flex-col justify-between space-y-4">
                                    <div class="space-y-3 text-xs">
                                        <div class="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div class="text-[10px] font-bold text-blue-600 uppercase">Do‘kon manzili:</div>
                                            <div class="font-bold text-slate-800">${store.name}</div>
                                            <div class="text-slate-500">${store.address}</div>
                                        </div>

                                        <div class="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div class="text-[10px] font-bold text-rose-600 uppercase">Mijoz manzili:</div>
                                            <div class="font-bold text-slate-800">${o.customer?.name}</div>
                                            <div class="text-slate-500">${o.customer?.address}</div>
                                        </div>

                                        <div class="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div class="text-[10px] font-bold text-slate-400 uppercase">To‘lov summasi:</div>
                                            <div class="text-base font-black text-slate-900">${this.formatPrice(o.total)}</div>
                                            <div class="text-[11px] text-blue-600 font-semibold">${o.paymentMethod} (${o.paymentStatus})</div>
                                        </div>
                                    </div>

                                    <!-- Bosqich o'zgartirish tugmalari -->
                                    <div class="pt-3 border-t border-slate-100 space-y-2">
                                        ${!isPickedUp ? `
                                            <button onclick="UlashCourier.updateOrderStage('${o.id}', 'Kuryer olib ketdi', 'Kuryer mahsulotni do‘kondan qabul qilib yo‘lga chiqdi')" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-indigo-200 transition">
                                                🏬 Do‘kondan oldim, yo‘lga chiqdim ➔
                                            </button>
                                        ` : `
                                            <button onclick="UlashCourier.updateOrderStage('${o.id}', 'Buyurtma yetkazildi', 'Kuryer buyurtmani mijozga muvaffaqiyatli topshirdi')" class="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-200 transition">
                                                🎉 Mijozga yetkazdim (+15 000 so‘m) ➔
                                            </button>
                                        `}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    renderHistoryOrders(orders) {
        if (orders.length === 0) {
            return `
                <div class="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
                    <div class="text-5xl mb-3">📜</div>
                    <h3 class="text-base font-bold text-slate-800 mb-1">Yetkazilgan buyurtmalar tarixi bo‘sh</h3>
                    <p class="text-xs text-slate-400">Yetkazib berilgan buyurtmalaringiz shu yerda saqlanadi.</p>
                </div>
            `;
        }

        return `
            <div class="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-xs text-left">
                        <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                            <tr>
                                <th class="p-4">ID</th>
                                <th class="p-4">Xaridor</th>
                                <th class="p-4">Do‘kon</th>
                                <th class="p-4">Summa</th>
                                <th class="p-4">Holat</th>
                                <th class="p-4">Komissiya</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            ${orders.map(o => `
                                <tr class="hover:bg-slate-50 transition">
                                    <td class="p-4 font-black text-slate-800">#${o.id}</td>
                                    <td class="p-4">
                                        <div class="font-bold text-slate-800">${o.customer?.name}</div>
                                        <div class="text-[10px] text-slate-400">${o.customer?.address}</div>
                                    </td>
                                    <td class="p-4 font-semibold text-slate-700">${o.storeName}</td>
                                    <td class="p-4 font-black text-slate-900">${this.formatPrice(o.total)}</td>
                                    <td class="p-4">
                                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${o.status === 'Buyurtma yetkazildi' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">
                                            ${o.status}
                                        </span>
                                    </td>
                                    <td class="p-4 font-black text-emerald-600">+15 000 so‘m</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    acceptOrder(orderId) {
        const courier = this.getCurrentCourier();
        const res = window.ulashStore.acceptOrderByCourier(orderId, courier);

        if (res.success) {
            window.ulashCatalog.showToast("Buyurtma muvaffaqiyatli qabul qilindi! 🛵");
            this.activeTab = 'active';
            this.renderCourierPanel();
        } else {
            alert(res.message);
        }
    },

    updateOrderStage(orderId, nextStatus, note) {
        window.ulashStore.updateOrderStatus(orderId, nextStatus, note);

        if (nextStatus === 'Buyurtma yetkazildi') {
            try {
                if (typeof confetti === 'function') {
                    confetti({
                        particleCount: 150,
                        spread: 90,
                        origin: { y: 0.5 }
                    });
                }
            } catch (e) {}

            window.ulashCatalog.showToast("Tabriklaymiz! Buyurtma muvaffaqiyatli topshirildi (+15 000 so‘m) 🎉");
            this.activeTab = 'history';
        } else {
            window.ulashCatalog.showToast(`Holat yangilandi: ${nextStatus} 🚚`);
        }

        this.renderCourierPanel();
    }
};

window.ulashCourier = UlashCourier;
