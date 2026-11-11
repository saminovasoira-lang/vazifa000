/**
 * ULASH MARKET - Direktor (Admin) Boshqaruv Paneli
 * Do'konlar, Mahsulotlar ombori, 6-bosqichli Buyurtmalar, Kuryerlar, Foydalanuvchilar, Promo-kodlar va Analitika
 */

const UlashAdmin = {
    activeTab: 'dashboard',
    charts: {},

    init() {
        this.setupSubscriptions();
    },

    formatPrice(price) {
        if (!price && price !== 0) return '0 so‘m';
        return Number(price).toLocaleString('uz-UZ') + ' so‘m';
    },

    setupSubscriptions() {
        window.ulashStore.subscribe('ORDERS_UPDATED', () => {
            if (this.isAdminViewActive()) this.renderCurrentTab();
        });
        window.ulashStore.subscribe('PRODUCTS_UPDATED', () => {
            if (this.isAdminViewActive() && (this.activeTab === 'products' || this.activeTab === 'dashboard')) {
                this.renderCurrentTab();
            }
        });
        window.ulashStore.subscribe('STORES_UPDATED', () => {
            if (this.isAdminViewActive() && (this.activeTab === 'stores' || this.activeTab === 'dashboard')) {
                this.renderCurrentTab();
            }
        });
        window.ulashStore.subscribe('COURIERS_UPDATED', () => {
            if (this.isAdminViewActive() && this.activeTab === 'couriers') this.renderCurrentTab();
        });
    },

    isAdminViewActive() {
        const container = document.getElementById('admin-panel-container');
        return container && !container.classList.contains('hidden');
    },

    setTab(tabName) {
        this.activeTab = tabName;
        this.renderAdminPanel();
    },

    renderCurrentTab() {
        this.renderAdminPanel();
    },

    renderAdminPanel() {
        const container = document.getElementById('admin-panel-container');
        if (!container) return;

        const currentUser = window.ulashStore.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            container.innerHTML = `
                <div class="max-w-md mx-auto py-24 px-4 text-center">
                    <div class="w-16 h-16 mx-auto mb-4 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center text-3xl shadow-sm border border-amber-200">
                        🔒
                    </div>
                    <h2 class="text-xl font-black text-slate-900 mb-2">Direktor ruxsati talab etiladi</h2>
                    <p class="text-xs text-slate-500 mb-6 leading-relaxed">
                        Ushbu boshqaruv paneliga faqat maxsus himoyalangan direktor paroli orqali kirish mumkin.
                    </p>
                    <button onclick="window.ulashApp.openAdminAuthModal()" class="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold text-xs rounded-2xl shadow-lg shadow-amber-200 transition">
                        Maxfiy Parolni Kiritish ➔
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="min-h-screen bg-slate-50 flex">
                <!-- 1. Chap Tomon Sidebar -->
                <aside class="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between shrink-0">
                    <div>
                        <!-- Logo & Admin Badge -->
                        <div class="p-6 border-b border-slate-100">
                            <div class="flex items-center gap-2">
                                <span class="text-xl font-black tracking-tight text-blue-600">ULASH</span>
                                <span class="text-[10px] px-2 py-0.5 rounded-lg font-black bg-amber-100 text-amber-800 border border-amber-300">
                                    DIREKTOR
                                </span>
                            </div>
                            <p class="text-[10px] text-slate-400 mt-1 font-bold">Boshqaruv & Analitika Markazi</p>
                        </div>

                        <!-- Sidebar Navigatsiya -->
                        <nav class="p-4 space-y-1 text-xs font-bold">
                            <button onclick="UlashAdmin.setTab('dashboard')" class="admin-nav-item w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${this.activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-slate-100'}">
                                <span class="text-base">📊</span>
                                <span>Dashboard & Analitika</span>
                            </button>

                            <button onclick="UlashAdmin.setTab('stores')" class="admin-nav-item w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${this.activeTab === 'stores' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-slate-100'}">
                                <span class="text-base">🏬</span>
                                <span>Do‘konlar Tizimi</span>
                            </button>

                            <button onclick="UlashAdmin.setTab('products')" class="admin-nav-item w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${this.activeTab === 'products' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-slate-100'}">
                                <span class="text-base">📦</span>
                                <span>Mahsulotlar & Ombor</span>
                            </button>

                            <button onclick="UlashAdmin.setTab('orders')" class="admin-nav-item w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${this.activeTab === 'orders' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-slate-100'}">
                                <span class="text-base">📋</span>
                                <span>Buyurtmalar (6 bosqich)</span>
                            </button>

                            <button onclick="UlashAdmin.setTab('couriers')" class="admin-nav-item w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${this.activeTab === 'couriers' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-slate-100'}">
                                <span class="text-base">🛵</span>
                                <span>Kuryerlar Nazorati</span>
                            </button>

                            <button onclick="UlashAdmin.setTab('users')" class="admin-nav-item w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${this.activeTab === 'users' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-slate-100'}">
                                <span class="text-base">👥</span>
                                <span>Mijozlar Bazasi</span>
                            </button>

                            <button onclick="UlashAdmin.setTab('promos')" class="admin-nav-item w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${this.activeTab === 'promos' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-slate-100'}">
                                <span class="text-base">🏷️</span>
                                <span>Promo-kodlar & Aksiya</span>
                            </button>

                            <button onclick="UlashAdmin.setTab('settings')" class="admin-nav-item w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition ${this.activeTab === 'settings' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-600 hover:bg-slate-100'}">
                                <span class="text-base">⚙️</span>
                                <span>Tizim Sozlamalari</span>
                            </button>
                        </nav>
                    </div>

                    <!-- Pastki Chiqish tugmasi -->
                    <div class="p-4 border-t border-slate-100">
                        <button onclick="window.ulashStore.logout(); window.ulashApp.navigateTo('home')" class="w-full flex items-center justify-center gap-2 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-xs transition">
                            <span>🚪</span>
                            <span>Admin rejimidan chiqish</span>
                        </button>
                    </div>
                </aside>

                <!-- 2. Asosiy Boshqaruv Maydoni -->
                <main class="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
                    <!-- Mobil tablar -->
                    <div class="md:hidden flex gap-2 overflow-x-auto pb-3 mb-4 text-xs font-bold scrollbar-none">
                        <button onclick="UlashAdmin.setTab('dashboard')" class="px-3 py-2 rounded-xl shrink-0 ${this.activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-white border text-slate-700'}">Dashboard</button>
                        <button onclick="UlashAdmin.setTab('stores')" class="px-3 py-2 rounded-xl shrink-0 ${this.activeTab === 'stores' ? 'bg-blue-600 text-white' : 'bg-white border text-slate-700'}">Do‘konlar</button>
                        <button onclick="UlashAdmin.setTab('products')" class="px-3 py-2 rounded-xl shrink-0 ${this.activeTab === 'products' ? 'bg-blue-600 text-white' : 'bg-white border text-slate-700'}">Mahsulotlar</button>
                        <button onclick="UlashAdmin.setTab('orders')" class="px-3 py-2 rounded-xl shrink-0 ${this.activeTab === 'orders' ? 'bg-blue-600 text-white' : 'bg-white border text-slate-700'}">Buyurtmalar</button>
                        <button onclick="UlashAdmin.setTab('couriers')" class="px-3 py-2 rounded-xl shrink-0 ${this.activeTab === 'couriers' ? 'bg-blue-600 text-white' : 'bg-white border text-slate-700'}">Kuryerlar</button>
                    </div>

                    ${this.renderActiveTabContent()}
                </main>
            </div>
        `;

        if (this.activeTab === 'dashboard') {
            this.initDashboardCharts();
        }
    },

    renderActiveTabContent() {
        switch (this.activeTab) {
            case 'dashboard':
                return this.renderDashboardTab();
            case 'stores':
                return this.renderStoresTab();
            case 'products':
                return this.renderProductsTab();
            case 'orders':
                return this.renderOrdersTab();
            case 'couriers':
                return this.renderCouriersTab();
            case 'users':
                return this.renderUsersTab();
            case 'promos':
                return this.renderPromosTab();
            case 'settings':
                return this.renderSettingsTab();
            default:
                return this.renderDashboardTab();
        }
    },

    // ==========================================
    // TAB 1: DASHBOARD VA ANALITIKA
    // ==========================================
    renderDashboardTab() {
        const orders = window.ulashStore.getOrders();
        const products = window.ulashStore.getProducts();
        const stores = window.ulashStore.getStores();
        const couriers = window.ulashStore.getCouriers();
        const users = window.ulashStore.getUsers().filter(u => u.role === 'user');

        const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        const avgOrder = orders.length ? Math.round(totalSales / orders.length) : 0;

        return `
            <div class="space-y-8">
                <!-- Sarlavha -->
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Marketplace Dashboard</h1>
                        <p class="text-xs text-slate-400 mt-0.5">Barcha savdo aylanmasi, buyurtmalar va do‘konlar faoliyati tahlili</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="window.print()" class="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition shadow-sm">
                            🖨️ Hisobotni chop etish
                        </button>
                        <button onclick="UlashAdmin.renderAdminPanel()" class="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-200">
                            🔄 Yangilash
                        </button>
                    </div>
                </div>

                <!-- 1. Asosiy Ko'rsatkichlar (KPI Cards) -->
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm">
                        <div class="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
                            <span>JAMI SAVDO</span>
                            <span class="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">+18.4%</span>
                        </div>
                        <div class="text-xl sm:text-2xl font-black text-slate-900">${this.formatPrice(totalSales)}</div>
                        <div class="text-[11px] text-slate-400 mt-1">Platformadagi umumiy tushum</div>
                    </div>

                    <div class="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm">
                        <div class="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
                            <span>BUYURTMALAR</span>
                            <span class="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[10px]">Faol</span>
                        </div>
                        <div class="text-xl sm:text-2xl font-black text-slate-900">${orders.length} ta</div>
                        <div class="text-[11px] text-slate-400 mt-1">O‘rtacha: ${this.formatPrice(avgOrder)}</div>
                    </div>

                    <div class="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm">
                        <div class="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
                            <span>DO‘KONLAR</span>
                            <span class="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px]">Faol</span>
                        </div>
                        <div class="text-xl sm:text-2xl font-black text-slate-900">${stores.length} ta hamkor</div>
                        <div class="text-[11px] text-slate-400 mt-1">${products.length} ta tovar joylangan</div>
                    </div>

                    <div class="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm">
                        <div class="flex items-center justify-between text-xs text-slate-400 font-bold mb-2">
                            <span>KURYERLAR & MIJOZLAR</span>
                            <span class="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">Onlayn</span>
                        </div>
                        <div class="text-xl sm:text-2xl font-black text-slate-900">${couriers.length} / ${users.length}</div>
                        <div class="text-[11px] text-slate-400 mt-1">${couriers.length} kuryer • ${users.length} mijoz</div>
                    </div>
                </div>

                <!-- 2. Chart.js Grafiklari -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <!-- Haftalik savdo grafigi (8 cols) -->
                    <div class="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
                        <div class="flex items-center justify-between mb-4">
                            <div>
                                <h3 class="font-bold text-slate-800 text-sm">Haftalik Savdo Dinamikasi</h3>
                                <p class="text-[11px] text-slate-400">Kunlik tushumlar va buyurtmalar hajmi</p>
                            </div>
                            <span class="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl">2026-yil</span>
                        </div>
                        <div class="h-64">
                            <canvas id="admin-weekly-chart"></canvas>
                        </div>
                    </div>

                    <!-- Do'konlar bo'yicha taqsimot (4 cols) -->
                    <div class="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
                        <div>
                            <h3 class="font-bold text-slate-800 text-sm mb-1">Do‘konlar Ulushi</h3>
                            <p class="text-[11px] text-slate-400 mb-4">Savdodagi ulushlar taqsimoti</p>
                            <div class="h-56 relative flex items-center justify-center">
                                <canvas id="admin-stores-chart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 3. Do'konlar faoliyati reyting jadvali -->
                <div class="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
                    <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                            <h3 class="font-bold text-slate-800 text-sm">Do‘konlar faoliyati va savdo hisoboti</h3>
                            <p class="text-[11px] text-slate-400">Har bir hamkor do‘konning reytingi va sotuv statistikasi</p>
                        </div>
                        <button onclick="UlashAdmin.setTab('stores')" class="text-xs font-bold text-blue-600 hover:underline">
                            Barcha do‘konlar ➔
                        </button>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-xs text-left">
                            <thead class="bg-slate-50 text-slate-400 font-bold border-b border-slate-100">
                                <tr>
                                    <th class="p-3">Do‘kon</th>
                                    <th class="p-3">Kategoriya</th>
                                    <th class="p-3">Reyting</th>
                                    <th class="p-3">Tovarlar</th>
                                    <th class="p-3">Buyurtmalar</th>
                                    <th class="p-3">Yetkazish sharti</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                ${stores.map(st => {
                                    const storeProducts = products.filter(p => p.storeId === st.id);
                                    const storeOrders = orders.filter(o => o.storeId === st.id);
                                    return `
                                        <tr class="hover:bg-slate-50 transition">
                                            <td class="p-3">
                                                <div class="flex items-center gap-2.5">
                                                    <img src="${st.logo}" class="w-8 h-8 rounded-xl object-cover border border-slate-200">
                                                    <div>
                                                        <div class="font-bold text-slate-800">${st.name}</div>
                                                        <div class="text-[10px] text-slate-400">${st.district}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="p-3 font-semibold text-slate-600">${st.category}</td>
                                            <td class="p-3 font-black text-amber-500">★ ${st.rating}</td>
                                            <td class="p-3 font-bold text-slate-800">${storeProducts.length} ta</td>
                                            <td class="p-3 font-black text-blue-600">${storeOrders.length} ta buyurtma</td>
                                            <td class="p-3 text-slate-500">${st.deliveryTime} (${this.formatPrice(st.deliveryFee)})</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    initDashboardCharts() {
        if (typeof Chart === 'undefined') return;

        // 1. Haftalik line chart
        const ctxWeekly = document.getElementById('admin-weekly-chart');
        if (ctxWeekly) {
            if (this.charts.weekly) this.charts.weekly.destroy();
            this.charts.weekly = new Chart(ctxWeekly, {
                type: 'line',
                data: {
                    labels: ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'],
                    datasets: [{
                        label: 'Savdo aylanmasi (mln so‘m)',
                        data: [18.5, 24.2, 21.0, 32.8, 41.5, 52.0, 48.7],
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.08)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointBackgroundColor: '#2563eb',
                        pointRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { grid: { color: '#f1f5f9' } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }

        // 2. Stores doughnut chart
        const ctxStores = document.getElementById('admin-stores-chart');
        if (ctxStores) {
            if (this.charts.stores) this.charts.stores.destroy();
            this.charts.stores = new Chart(ctxStores, {
                type: 'doughnut',
                data: {
                    labels: ['Mediapark', 'Korzinka', 'Terra Pro', 'Safia', 'Boshqalar'],
                    datasets: [{
                        data: [42, 28, 14, 10, 6],
                        backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } }
                    },
                    cutout: '70%'
                }
            });
        }
    },

    // ==========================================
    // TAB 2: DO'KONLARNI BOSHQARISH (CRUD)
    // ==========================================
    renderStoresTab() {
        const stores = window.ulashStore.getStores();

        return `
            <div class="space-y-6">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Do‘konlar Boshqaruvi</h1>
                        <p class="text-xs text-slate-400 mt-0.5">Platformadagi barcha savdo markazlari va supermarketlar</p>
                    </div>
                    <button onclick="UlashAdmin.openAddStoreModal()" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-200 transition flex items-center gap-2">
                        <span>+</span>
                        <span>Yangi do‘kon qo‘shish</span>
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${stores.map(st => `
                        <div class="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between hover:border-blue-400 transition">
                            <div class="space-y-3">
                                <div class="flex items-center gap-3">
                                    <img src="${st.logo}" class="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-sm">
                                    <div class="flex-1 min-w-0">
                                        <h3 class="font-black text-slate-900 text-sm truncate">${st.name}</h3>
                                        <div class="flex items-center gap-2 text-[10px] text-slate-400 font-semibold mt-0.5">
                                            <span>${st.district}</span>
                                            <span>•</span>
                                            <span class="text-amber-500 font-bold">★ ${st.rating}</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="p-3 bg-slate-50 rounded-2xl text-xs space-y-1 text-slate-600">
                                    <p>📍 <b>Manzil:</b> ${st.address}</p>
                                    <p>🕒 <b>Ish vaqti:</b> ${st.workingHours}</p>
                                    <p>📞 <b>Telefon:</b> ${st.phone}</p>
                                    <p>⚡ <b>Yetkazish:</b> ${st.deliveryTime} (${this.formatPrice(st.deliveryFee)})</p>
                                    <p class="text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">${st.deliveryConditions || ''}</p>
                                </div>
                            </div>

                            <div class="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between gap-2">
                                <button onclick="UlashAdmin.openEditStoreModal('${st.id}')" class="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition">
                                    Tahrirlash ✏️
                                </button>
                                <button onclick="UlashAdmin.deleteStore('${st.id}')" class="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition">
                                    O‘chirish 🗑️
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    openAddStoreModal() {
        const modalHtml = `
            <div id="admin-crud-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
                    <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h3 class="font-black text-slate-900 text-base">Yangi do‘kon qo‘shish</h3>
                        <button onclick="document.getElementById('admin-crud-modal').remove()" class="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                    </div>

                    <form onsubmit="UlashAdmin.submitNewStore(event)" class="space-y-3 text-xs">
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Do‘kon nomi *</label>
                            <input type="text" name="name" required placeholder="Masalan: Korzinka Supermarket" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium">
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block font-bold text-slate-700 mb-1">Qisqa nomi</label>
                                <input type="text" name="shortName" placeholder="Korzinka" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium">
                            </div>
                            <div>
                                <label class="block font-bold text-slate-700 mb-1">Kategoriya</label>
                                <select name="category" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium">
                                    <option value="oziq-ovqat">Oziq-ovqat</option>
                                    <option value="smartfonlar">Elektronika & Gadjetlar</option>
                                    <option value="maishiy-texnika">Maishiy texnika</option>
                                    <option value="kiyim">Kiyim-kechak</option>
                                    <option value="gozallik">Go'zallik & Parfyumeriya</option>
                                    <option value="sport">Sport tovarlari</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Logo URL rasm manzili</label>
                            <input type="url" name="logo" value="https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=300&q=80" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium">
                        </div>
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Manzil *</label>
                            <input type="text" name="address" required placeholder="Toshkent sh., Chilonzor tumani..." class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium">
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block font-bold text-slate-700 mb-1">Tuman</label>
                                <input type="text" name="district" placeholder="Chilonzor" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium">
                            </div>
                            <div>
                                <label class="block font-bold text-slate-700 mb-1">Telefon</label>
                                <input type="text" name="phone" placeholder="+998 71 200-00-00" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium">
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block font-bold text-slate-700 mb-1">Ish vaqti</label>
                                <input type="text" name="workingHours" value="08:00 - 23:00" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium">
                            </div>
                            <div>
                                <label class="block font-bold text-slate-700 mb-1">Yetkazish narxi (so'm)</label>
                                <input type="number" name="deliveryFee" value="15000" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium">
                            </div>
                        </div>

                        <div class="pt-3 border-t border-slate-100 flex justify-end gap-2">
                            <button type="button" onclick="document.getElementById('admin-crud-modal').remove()" class="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl">Bekor qilish</button>
                            <button type="submit" class="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">Do‘konni saqlash</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    submitNewStore(event) {
        event.preventDefault();
        const f = event.target;
        window.ulashStore.addStore({
            name: f.name.value.trim(),
            shortName: f.shortName.value.trim(),
            category: f.category.value,
            logo: f.logo.value.trim(),
            address: f.address.value.trim(),
            district: f.district.value.trim(),
            phone: f.phone.value.trim(),
            workingHours: f.workingHours.value.trim(),
            deliveryFee: parseInt(f.deliveryFee.value) || 15000
        });

        document.getElementById('admin-crud-modal')?.remove();
        window.ulashCatalog.showToast("Yangi do‘kon muvaffaqiyatli qo‘shildi! 🏬");
        this.renderAdminPanel();
    },

    openEditStoreModal(storeId) {
        const store = window.ulashStore.getStoreById(storeId);
        if (!store) return;

        const modalHtml = `
            <div id="admin-crud-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
                    <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h3 class="font-black text-slate-900 text-base">Do‘konni tahrirlash</h3>
                        <button onclick="document.getElementById('admin-crud-modal').remove()" class="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                    </div>

                    <form onsubmit="UlashAdmin.submitEditStore(event, '${store.id}')" class="space-y-3 text-xs">
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Do‘kon nomi *</label>
                            <input type="text" name="name" value="${store.name}" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium">
                        </div>
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Manzil *</label>
                            <input type="text" name="address" value="${store.address}" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium">
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block font-bold text-slate-700 mb-1">Telefon</label>
                                <input type="text" name="phone" value="${store.phone}" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium">
                            </div>
                            <div>
                                <label class="block font-bold text-slate-700 mb-1">Ish vaqti</label>
                                <input type="text" name="workingHours" value="${store.workingHours}" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium">
                            </div>
                        </div>
                        <div class="pt-3 border-t border-slate-100 flex justify-end gap-2">
                            <button type="button" onclick="document.getElementById('admin-crud-modal').remove()" class="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl">Bekor qilish</button>
                            <button type="submit" class="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">Yangilash</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    submitEditStore(event, storeId) {
        event.preventDefault();
        const f = event.target;
        window.ulashStore.updateStore(storeId, {
            name: f.name.value.trim(),
            address: f.address.value.trim(),
            phone: f.phone.value.trim(),
            workingHours: f.workingHours.value.trim()
        });

        document.getElementById('admin-crud-modal')?.remove();
        window.ulashCatalog.showToast("Do‘kon ma’lumotlari yangilandi! ✨");
        this.renderAdminPanel();
    },

    deleteStore(storeId) {
        if (confirm("Haqiqatan ham ushbu do‘konni o‘chirmoqchimisiz?")) {
            window.ulashStore.deleteStore(storeId);
            window.ulashCatalog.showToast("Do‘kon o‘chirildi.");
            this.renderAdminPanel();
        }
    },

    // ==========================================
    // TAB 3: MAHSULOTLAR VA OMBOR (CRUD)
    // ==========================================
    renderProductsTab() {
        const products = window.ulashStore.getProducts();
        const stores = window.ulashStore.getStores();

        return `
            <div class="space-y-6">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Mahsulotlar Ombori</h1>
                        <p class="text-xs text-slate-400 mt-0.5">Barcha tovarlar, narxlar, chegirmalar va zaxira qoldig‘i</p>
                    </div>
                    <button onclick="UlashAdmin.openAddProductModal()" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-200 transition flex items-center gap-2">
                        <span>+</span>
                        <span>Yangi mahsulot qo‘shish</span>
                    </button>
                </div>

                <div class="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-xs text-left">
                            <thead class="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold">
                                <tr>
                                    <th class="p-3.5">Mahsulot</th>
                                    <th class="p-3.5">Do‘kon</th>
                                    <th class="p-3.5">Kategoriya</th>
                                    <th class="p-3.5">Narx</th>
                                    <th class="p-3.5">Chegirma</th>
                                    <th class="p-3.5">Ombor</th>
                                    <th class="p-3.5">Amallar</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                ${products.map(p => `
                                    <tr class="hover:bg-slate-50 transition">
                                        <td class="p-3.5">
                                            <div class="flex items-center gap-3">
                                                <img src="${p.image}" class="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0">
                                                <div class="min-w-0">
                                                    <div class="font-bold text-slate-800 line-clamp-1">${p.name}</div>
                                                    <div class="text-[10px] text-slate-400 font-semibold">${p.brand} • ★${p.rating}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="p-3.5 font-bold text-slate-700">🏬 ${p.storeName || 'Ulash'}</td>
                                        <td class="p-3.5 font-semibold text-slate-500">${p.category}</td>
                                        <td class="p-3.5 font-black text-slate-900">${this.formatPrice(p.price)}</td>
                                        <td class="p-3.5">${p.discountPercent > 0 ? `<span class="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-200">-${p.discountPercent}%</span>` : '—'}</td>
                                        <td class="p-3.5 font-bold ${p.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}">${p.stock} dona</td>
                                        <td class="p-3.5">
                                            <div class="flex items-center gap-2">
                                                <button onclick="UlashAdmin.openEditProductModal('${p.id}')" class="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 font-bold" title="Tahrirlash">
                                                    ✏️
                                                </button>
                                                <button onclick="UlashAdmin.deleteProduct('${p.id}')" class="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600 font-bold" title="O‘chirish">
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    openAddProductModal() {
        const stores = window.ulashStore.getStores();
        const categories = window.ulashStore.getCategories();

        const modalHtml = `
            <div id="admin-crud-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
                    <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h3 class="font-black text-slate-900 text-base">Yangi mahsulot qo‘shish</h3>
                        <button onclick="document.getElementById('admin-crud-modal').remove()" class="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                    </div>

                    <form onsubmit="UlashAdmin.submitNewProduct(event)" class="space-y-3 text-xs">
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Mahsulot nomi *</label>
                            <input type="text" name="name" required placeholder="Masalan: Samsung Galaxy S25 Ultra" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium">
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block font-bold text-slate-700 mb-1">Qaysi do‘konga tegishli? *</label>
                                <select name="storeId" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium">
                                    ${stores.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block font-bold text-slate-700 mb-1">Kategoriya *</label>
                                <select name="category" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium">
                                    ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block font-bold text-slate-700 mb-1">Brend</label>
                                <input type="text" name="brand" placeholder="Apple, Artel..." class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium">
                            </div>
                            <div>
                                <label class="block font-bold text-slate-700 mb-1">Ombordagi soni</label>
                                <input type="number" name="stock" value="15" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium">
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block font-bold text-slate-700 mb-1">Sotuv narxi (so'm) *</label>
                                <input type="number" name="price" required placeholder="12000000" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium">
                            </div>
                            <div>
                                <label class="block font-bold text-slate-700 mb-1">Eski narxi (so'm)</label>
                                <input type="number" name="originalPrice" placeholder="14000000" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium">
                            </div>
                        </div>
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Rasm URL manzili</label>
                            <input type="url" name="image" value="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium">
                        </div>
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Tavsifi</label>
                            <textarea name="description" rows="2" placeholder="Mahsulot haqida batafsil ma'lumot..." class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium"></textarea>
                        </div>

                        <div class="pt-3 border-t border-slate-100 flex justify-end gap-2">
                            <button type="button" onclick="document.getElementById('admin-crud-modal').remove()" class="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl">Bekor qilish</button>
                            <button type="submit" class="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">Mahsulotni qo‘shish</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    submitNewProduct(event) {
        event.preventDefault();
        const f = event.target;
        const store = window.ulashStore.getStoreById(f.storeId.value);

        window.ulashStore.addProduct({
            name: f.name.value.trim(),
            storeId: f.storeId.value,
            storeName: store ? store.name : 'Ulash Supermarket',
            category: f.category.value,
            brand: f.brand.value.trim() || 'Original',
            stock: parseInt(f.stock.value) || 10,
            price: parseInt(f.price.value) || 0,
            originalPrice: parseInt(f.originalPrice.value) || parseInt(f.price.value),
            image: f.image.value.trim(),
            description: f.description.value.trim(),
            badge: 'Yangi'
        });

        document.getElementById('admin-crud-modal')?.remove();
        window.ulashCatalog.showToast("Yangi mahsulot omborga qo‘shildi! 📦");
        this.renderAdminPanel();
    },

    openEditProductModal(productId) {
        const p = window.ulashStore.getProductById(productId);
        if (!p) return;

        const modalHtml = `
            <div id="admin-crud-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
                    <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h3 class="font-black text-slate-900 text-base">Mahsulotni tahrirlash</h3>
                        <button onclick="document.getElementById('admin-crud-modal').remove()" class="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                    </div>

                    <form onsubmit="UlashAdmin.submitEditProduct(event, '${p.id}')" class="space-y-3 text-xs">
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Mahsulot nomi *</label>
                            <input type="text" name="name" value="${p.name}" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium">
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block font-bold text-slate-700 mb-1">Narxi (so'm) *</label>
                                <input type="number" name="price" value="${p.price}" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium">
                            </div>
                            <div>
                                <label class="block font-bold text-slate-700 mb-1">Ombordagi soni *</label>
                                <input type="number" name="stock" value="${p.stock}" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium">
                            </div>
                        </div>
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Rasm URL manzili</label>
                            <input type="url" name="image" value="${p.image}" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium">
                        </div>
                        <div class="pt-3 border-t border-slate-100 flex justify-end gap-2">
                            <button type="button" onclick="document.getElementById('admin-crud-modal').remove()" class="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl">Bekor qilish</button>
                            <button type="submit" class="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">Saqlash</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    submitEditProduct(event, productId) {
        event.preventDefault();
        const f = event.target;
        window.ulashStore.updateProduct(productId, {
            name: f.name.value.trim(),
            price: parseInt(f.price.value) || 0,
            stock: parseInt(f.stock.value) || 0,
            image: f.image.value.trim()
        });

        document.getElementById('admin-crud-modal')?.remove();
        window.ulashCatalog.showToast("Mahsulot ma’lumotlari yangilandi! ✨");
        this.renderAdminPanel();
    },

    deleteProduct(productId) {
        if (confirm("Haqiqatan ham ushbu mahsulotni o‘chirmoqchimisiz?")) {
            window.ulashStore.deleteProduct(productId);
            window.ulashCatalog.showToast("Mahsulot o‘chirildi.");
            this.renderAdminPanel();
        }
    },

    // ==========================================
    // TAB 4: BUYURTMALAR NAZORATI (6 BOSQICHLI)
    // ==========================================
    renderOrdersTab() {
        const orders = window.ulashStore.getOrders();
        const couriers = window.ulashStore.getCouriers();

        return `
            <div class="space-y-6">
                <div>
                    <h1 class="text-2xl font-black text-slate-900 tracking-tight">Buyurtmalar Nazorati (6 bosqich)</h1>
                    <p class="text-xs text-slate-400 mt-0.5">Barcha xaridorlarning buyurtmalari va holat stepperlari</p>
                </div>

                <div class="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-xs text-left">
                            <thead class="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold">
                                <tr>
                                    <th class="p-4">ID</th>
                                    <th class="p-4">Xaridor</th>
                                    <th class="p-4">Do‘kon</th>
                                    <th class="p-4">Summa</th>
                                    <th class="p-4">Holat (Bosqich)</th>
                                    <th class="p-4">Kuryer</th>
                                    <th class="p-4">Boshqarish</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                ${orders.map(o => `
                                    <tr class="hover:bg-slate-50 transition">
                                        <td class="p-4 font-black text-slate-800">#${o.id}</td>
                                        <td class="p-4">
                                            <div class="font-bold text-slate-800">${o.customer?.name}</div>
                                            <div class="text-[10px] text-slate-400">${o.customer?.phone}</div>
                                        </td>
                                        <td class="p-4 font-semibold text-slate-700">${o.storeName}</td>
                                        <td class="p-4 font-black text-slate-900">${this.formatPrice(o.total)}</td>
                                        <td class="p-4">
                                            <select onchange="UlashAdmin.changeOrderStatus('${o.id}', this.value)" class="px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700">
                                                <option value="Buyurtma yaratildi" ${o.status === 'Buyurtma yaratildi' ? 'selected' : ''}>1. Buyurtma yaratildi</option>
                                                <option value="Do‘kon tasdiqladi" ${o.status === 'Do‘kon tasdiqladi' ? 'selected' : ''}>2. Do‘kon tasdiqladi</option>
                                                <option value="Kuryer qabul qildi" ${o.status === 'Kuryer qabul qildi' ? 'selected' : ''}>3. Kuryer qabul qildi</option>
                                                <option value="Mahsulot tayyorlandi" ${o.status === 'Mahsulot tayyorlandi' ? 'selected' : ''}>4. Mahsulot tayyorlandi</option>
                                                <option value="Kuryer olib ketdi" ${o.status === 'Kuryer olib ketdi' ? 'selected' : ''}>5. Kuryer olib ketdi</option>
                                                <option value="Buyurtma yetkazildi" ${o.status === 'Buyurtma yetkazildi' ? 'selected' : ''}>6. Buyurtma yetkazildi</option>
                                                <option value="Bekor qilindi" ${o.status === 'Bekor qilindi' ? 'selected' : ''}>❌ Bekor qilindi</option>
                                            </select>
                                        </td>
                                        <td class="p-4 font-bold text-slate-700">
                                            ${o.courierName ? `🛵 ${o.courierName}` : '<span class="text-slate-400 font-normal">Biriktirilmagan</span>'}
                                        </td>
                                        <td class="p-4">
                                            <button onclick="UlashAdmin.cancelOrder('${o.id}')" class="text-rose-600 hover:underline font-bold text-xs">
                                                Bekor qilish
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    changeOrderStatus(orderId, newStatus) {
        window.ulashStore.updateOrderStatus(orderId, newStatus, `Direktor tomonidan holat o‘zgartirildi: ${newStatus}`);
        window.ulashCatalog.showToast(`Buyurtma #${orderId} holati yangilandi: ${newStatus}`);
    },

    cancelOrder(orderId) {
        if (confirm("Ushbu buyurtmani bekor qilmoqchimisiz?")) {
            window.ulashStore.cancelOrder(orderId, "Direktor tomonidan bekor qilindi");
            window.ulashCatalog.showToast("Buyurtma bekor qilindi va tovarlar omborga qaytarildi.");
            this.renderAdminPanel();
        }
    },

    // ==========================================
    // TAB 5: KURYERLAR NAZORATI
    // ==========================================
    renderCouriersTab() {
        const couriers = window.ulashStore.getCouriers();

        return `
            <div class="space-y-6">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Kuryerlar Nazorati</h1>
                        <p class="text-xs text-slate-400 mt-0.5">Yetkazib beruvchilar, transport vositalari va ularning daromadlari</p>
                    </div>
                    <button onclick="UlashAdmin.openAddCourierModal()" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-200 transition">
                        + Yangi kuryer qo‘shish
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    ${couriers.map(c => `
                        <div class="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
                            <div class="flex items-center gap-3 pb-3 border-b border-slate-100">
                                <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl font-bold border border-amber-200">
                                    🛵
                                </div>
                                <div>
                                    <h3 class="font-bold text-slate-900 text-sm">${c.name}</h3>
                                    <div class="text-[11px] text-slate-400">${c.transport}</div>
                                </div>
                            </div>

                            <div class="space-y-1.5 text-xs text-slate-600">
                                <p>📞 <b>Telefon:</b> ${c.phone}</p>
                                <p>⭐ <b>Reyting:</b> <span class="text-amber-500 font-bold">${c.rating}</span></p>
                                <p>📦 <b>Bajarilgan buyurtmalar:</b> <b>${c.completedOrders || 0} ta</b></p>
                                <p>💰 <b>Jami daromadi:</b> <b class="text-emerald-600">${this.formatPrice(c.earningsTotal || 0)}</b></p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    openAddCourierModal() {
        const modalHtml = `
            <div id="admin-crud-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                    <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h3 class="font-black text-slate-900 text-base">Yangi kuryer qo‘shish</h3>
                        <button onclick="document.getElementById('admin-crud-modal').remove()" class="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                    </div>

                    <form onsubmit="UlashAdmin.submitNewCourier(event)" class="space-y-3 text-xs">
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Ism va familiya *</label>
                            <input type="text" name="name" required placeholder="Masalan: Sardor Aliyev" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium">
                        </div>
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Telefon raqam *</label>
                            <input type="text" name="phone" required placeholder="+998 90 123-45-67" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium">
                        </div>
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Transport turi</label>
                            <input type="text" name="transport" placeholder="Skuter, Spark, Elektr velosiped..." class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium">
                        </div>
                        <div class="pt-3 border-t border-slate-100 flex justify-end gap-2">
                            <button type="button" onclick="document.getElementById('admin-crud-modal').remove()" class="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl">Bekor qilish</button>
                            <button type="submit" class="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">Qo‘shish</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    submitNewCourier(event) {
        event.preventDefault();
        const f = event.target;
        window.ulashStore.addCourier({
            name: f.name.value.trim(),
            phone: f.phone.value.trim(),
            transport: f.transport.value.trim() || 'Skuter'
        });

        document.getElementById('admin-crud-modal')?.remove();
        window.ulashCatalog.showToast("Yangi kuryer muvaffaqiyatli qo‘shildi! 🛵");
        this.renderAdminPanel();
    },

    // ==========================================
    // TAB 6: FOYDALANUVCHILAR (USERS)
    // ==========================================
    renderUsersTab() {
        const users = window.ulashStore.getUsers();
        const orders = window.ulashStore.getOrders();

        return `
            <div class="space-y-6">
                <div>
                    <h1 class="text-2xl font-black text-slate-900 tracking-tight">Mijozlar Bazasi</h1>
                    <p class="text-xs text-slate-400 mt-0.5">Ro‘yxatdan o‘tgan barcha xaridorlar va ularning faolligi</p>
                </div>

                <div class="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                    <div class="overflow-x-auto">
                        <table class="w-full text-xs text-left">
                            <thead class="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold">
                                <tr>
                                    <th class="p-4">Foydalanuvchi</th>
                                    <th class="p-4">Telefon</th>
                                    <th class="p-4">Rol</th>
                                    <th class="p-4">Manzil</th>
                                    <th class="p-4">Buyurtmalari</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                ${users.map(u => {
                                    const userOrders = orders.filter(o => o.customer?.phone === u.phone);
                                    return `
                                        <tr class="hover:bg-slate-50 transition">
                                            <td class="p-4 font-bold text-slate-800">👤 ${u.name}</td>
                                            <td class="p-4 font-semibold text-slate-600">${u.phone}</td>
                                            <td class="p-4">
                                                <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${u.role === 'admin' ? 'bg-amber-100 text-amber-800' : u.role === 'courier' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}">
                                                    ${u.role}
                                                </span>
                                            </td>
                                            <td class="p-4 text-slate-500">${u.defaultAddress || u.district || 'Toshkent'}</td>
                                            <td class="p-4 font-black text-blue-600">${userOrders.length} ta buyurtma</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    // ==========================================
    // TAB 7: PROMO-KODLAR VA AKSIYALAR
    // ==========================================
    renderPromosTab() {
        const promos = window.ulashStore.getPromos();

        return `
            <div class="space-y-6">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Promo-kodlar & Chegirmalar</h1>
                        <p class="text-xs text-slate-400 mt-0.5">Xaridorlar uchun chegirma kodlarini yaratish va boshqarish</p>
                    </div>
                    <button onclick="UlashAdmin.openAddPromoModal()" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-200 transition">
                        + Yangi Promo-kod
                    </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    ${promos.map(p => `
                        <div class="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between space-y-4">
                            <div>
                                <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                                    <span class="px-3 py-1 bg-blue-50 text-blue-700 font-black text-sm tracking-widest rounded-xl border border-blue-200">
                                        ${p.code}
                                    </span>
                                    <span class="text-rose-500 font-black text-base">-${p.discountPercent}%</span>
                                </div>
                                <div class="space-y-1 text-xs text-slate-500 mt-3">
                                    <p>Minimal xarid: <b>${this.formatPrice(p.minOrder || 100000)}</b></p>
                                    <p>Amal qilish muddati: <b>${p.expiresAt || 'Cheksiz'}</b></p>
                                    <p>Holati: <b class="text-emerald-600">Faol</b></p>
                                </div>
                            </div>

                            <button onclick="window.ulashStore.deletePromo('${p.id}'); UlashAdmin.renderAdminPanel()" class="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition">
                                O‘chirish 🗑️
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    openAddPromoModal() {
        const modalHtml = `
            <div id="admin-crud-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                    <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h3 class="font-black text-slate-900 text-base">Yangi Promo-kod</h3>
                        <button onclick="document.getElementById('admin-crud-modal').remove()" class="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                    </div>

                    <form onsubmit="UlashAdmin.submitNewPromo(event)" class="space-y-3 text-xs">
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Promo-kod nomi *</label>
                            <input type="text" name="code" required placeholder="Masalan: YAZ2026" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 uppercase font-black tracking-wider">
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block font-bold text-slate-700 mb-1">Chegirma (%)</label>
                                <input type="number" name="discountPercent" value="10" min="1" max="90" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold">
                            </div>
                            <div>
                                <label class="block font-bold text-slate-700 mb-1">Minimal xarid (so'm)</label>
                                <input type="number" name="minOrder" value="100000" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold">
                            </div>
                        </div>
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Amal qilish muddati</label>
                            <input type="date" name="expiresAt" value="2026-12-31" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium">
                        </div>
                        <div class="pt-3 border-t border-slate-100 flex justify-end gap-2">
                            <button type="button" onclick="document.getElementById('admin-crud-modal').remove()" class="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl">Bekor qilish</button>
                            <button type="submit" class="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">Yaratish</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    submitNewPromo(event) {
        event.preventDefault();
        const f = event.target;
        window.ulashStore.addPromo({
            code: f.code.value.trim().toUpperCase(),
            discountPercent: parseInt(f.discountPercent.value) || 10,
            minOrder: parseInt(f.minOrder.value) || 100000,
            expiresAt: f.expiresAt.value
        });

        document.getElementById('admin-crud-modal')?.remove();
        window.ulashCatalog.showToast("Promo-kod muvaffaqiyatli yaratildi! 🏷️");
        this.renderAdminPanel();
    },

    // ==========================================
    // TAB 8: TIZIM SOZLAMALARI
    // ==========================================
    renderSettingsTab() {
        const settings = window.ulashStore.getSettings();

        return `
            <div class="space-y-6 max-w-2xl">
                <div>
                    <h1 class="text-2xl font-black text-slate-900 tracking-tight">Tizim Sozlamalari</h1>
                    <p class="text-xs text-slate-400 mt-0.5">Marketplace narxlari, kuryer komissiyasi va admin paroli</p>
                </div>

                <div class="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
                    <form onsubmit="UlashAdmin.submitSettings(event)" class="space-y-4 text-xs">
                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Marketplace nomi:</label>
                            <input type="text" name="storeName" value="${settings.storeName || 'ULASH MARKET'}" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold">
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block font-bold text-slate-700 mb-1">Boshlang‘ich yetkazish narxi (so‘m):</label>
                                <input type="number" name="baseDeliveryFee" value="${settings.baseDeliveryFee || 15000}" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold">
                            </div>
                            <div>
                                <label class="block font-bold text-slate-700 mb-1">Bepul yetkazish chegarasi (so‘m):</label>
                                <input type="number" name="freeDeliveryThreshold" value="${settings.freeDeliveryThreshold || 350000}" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold">
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block font-bold text-slate-700 mb-1">Kuryer komissiyasi (har bir yetkazish uchun):</label>
                                <input type="number" name="courierCommission" value="${settings.courierCommission || 15000}" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold">
                            </div>
                            <div>
                                <label class="block font-bold text-slate-700 mb-1">Direktor (Admin) Maxfiy Paroli:</label>
                                <input type="text" name="adminSecretPin" value="${settings.adminSecretPin || 'admin123'}" class="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50/40 font-black tracking-widest text-center text-sm">
                            </div>
                        </div>

                        <div>
                            <label class="block font-bold text-slate-700 mb-1">Mijozlarni qo‘llab-quvvatlash telefoni:</label>
                            <input type="text" name="supportPhone" value="${settings.supportPhone || '+998 71 200-00-00'}" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold">
                        </div>

                        <button type="submit" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-blue-200 transition">
                            Sozlamalarni saqlash ➔
                        </button>
                    </form>
                </div>
            </div>
        `;
    },

    submitSettings(event) {
        event.preventDefault();
        const f = event.target;
        window.ulashStore.updateSettings({
            storeName: f.storeName.value.trim(),
            baseDeliveryFee: parseInt(f.baseDeliveryFee.value) || 15000,
            freeDeliveryThreshold: parseInt(f.freeDeliveryThreshold.value) || 350000,
            courierCommission: parseInt(f.courierCommission.value) || 15000,
            adminSecretPin: f.adminSecretPin.value.trim(),
            supportPhone: f.supportPhone.value.trim()
        });

        window.ulashCatalog.showToast("Barcha tizim sozlamalari yangilandi! ⚙️");
    }
};

window.ulashAdmin = UlashAdmin;
