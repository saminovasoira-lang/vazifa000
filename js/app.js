/**
 * ULASH MARKET - Asosiy Dastur Boshqaruvchisi (Main App Controller)
 * Marshrutlash (Routing), Rollar, Autentifikatsiya, 6-bosqichli Buyurtma Kuzatuv va Do'konlar sahifasi
 */

const UlashApp = {
    currentPage: 'home',
    highlightOrderId: null,

    init() {
        this.setupNavigation();
        this.setupKeyboardShortcuts();
        this.setupSubscriptions();
        this.updateHeaderUserInfo();

        const initialHash = window.location.hash.replace('#', '') || 'home';
        this.navigateTo(initialHash);
    },

    formatPrice(price) {
        if (!price && price !== 0) return '0 so‘m';
        return Number(price).toLocaleString('uz-UZ') + ' so‘m';
    },

    setupSubscriptions() {
        window.ulashStore.subscribe('USER_CHANGED', () => {
            this.updateHeaderUserInfo();
            this.updateFloatingRoleBadge();
        });

        window.ulashStore.subscribe('ORDER_STATUS_CHANGED', () => {
            if (this.currentPage === 'orders') {
                this.renderOrdersPage();
            }
        });

        window.ulashStore.subscribe('DATA_SYNCED', () => {
            this.updateHeaderUserInfo();
            if (this.currentPage === 'home' || this.currentPage === 'catalog') {
                window.ulashCatalog.renderProducts();
            } else if (this.currentPage === 'stores') {
                this.renderStoresPage();
            }
        });
    },

    setupNavigation() {
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.replace('#', '') || 'home';
            this.navigateTo(hash, null, false);
        });
    },

    setupKeyboardShortcuts() {
        // Direktor (Admin) maxfiy klaviatura kombinatsiyasi: Ctrl + Shift + A
        window.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
                e.preventDefault();
                this.openAdminAuthModal();
            }
        });
    },

    navigateTo(pageName, params = null, updateHash = true) {
        this.currentPage = pageName;
        if (params && params.highlightOrderId) {
            this.highlightOrderId = params.highlightOrderId;
        }

        if (updateHash) {
            window.location.hash = pageName;
        }

        const sections = [
            'home-page-container',
            'catalog-page-container',
            'stores-page-container',
            'checkout-page-container',
            'orders-page-container',
            'courier-panel-container',
            'admin-panel-container',
            'profile-page-container'
        ];

        sections.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });

        if (pageName === 'home') {
            const el = document.getElementById('home-page-container');
            if (el) el.classList.remove('hidden');
            window.ulashCatalog.renderProducts();
        } else if (pageName === 'catalog') {
            const el = document.getElementById('catalog-page-container');
            if (el) el.classList.remove('hidden');
            window.ulashCatalog.renderProducts();
        } else if (pageName === 'stores' || pageName === 'branches') {
            const el = document.getElementById('stores-page-container');
            if (el) el.classList.remove('hidden');
            this.renderStoresPage();
        } else if (pageName === 'checkout') {
            const el = document.getElementById('checkout-page-container');
            if (el) el.classList.remove('hidden');
            window.ulashCheckout.init();
        } else if (pageName === 'orders') {
            const el = document.getElementById('orders-page-container');
            if (el) el.classList.remove('hidden');
            this.renderOrdersPage();
        } else if (pageName === 'courier') {
            const el = document.getElementById('courier-panel-container');
            if (el) el.classList.remove('hidden');
            window.ulashCourier.init();
        } else if (pageName === 'admin' || pageName === 'admin-secret') {
            const currentUser = window.ulashStore.getCurrentUser();
            if (!currentUser || currentUser.role !== 'admin') {
                this.openAdminAuthModal();
            } else {
                const el = document.getElementById('admin-panel-container');
                if (el) el.classList.remove('hidden');
                window.ulashAdmin.renderAdminPanel();
            }
        } else if (pageName === 'profile') {
            const el = document.getElementById('profile-page-container');
            if (el) el.classList.remove('hidden');
            this.renderProfilePage();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.updateActiveNavLinks(pageName);
    },

    updateActiveNavLinks(pageName) {
        document.querySelectorAll('.nav-link-btn').forEach(link => {
            if (link.dataset.page === pageName) {
                link.classList.add('text-blue-600', 'font-black');
                link.classList.remove('text-slate-600');
            } else {
                link.classList.remove('text-blue-600', 'font-black');
                link.classList.add('text-slate-600');
            }
        });
    },

    updateHeaderUserInfo() {
        const user = window.ulashStore.getCurrentUser() || {};
        const userNameEl = document.getElementById('header-user-name');
        const userRoleBadge = document.getElementById('header-user-role');

        if (userNameEl) {
            userNameEl.textContent = user.name || 'Kirish';
        }

        if (userRoleBadge) {
            if (user.role === 'admin') {
                userRoleBadge.textContent = 'Direktor';
                userRoleBadge.className = 'px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800';
            } else if (user.role === 'courier') {
                userRoleBadge.textContent = 'Kuryer';
                userRoleBadge.className = 'px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800';
            } else {
                userRoleBadge.textContent = 'Mijoz';
                userRoleBadge.className = 'px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800';
            }
        }

        this.updateFloatingRoleBadge();
    },

    updateFloatingRoleBadge() {
        const user = window.ulashStore.getCurrentUser() || {};
        const floatingPill = document.getElementById('quick-role-switcher');
        if (!floatingPill) return;

        const roleText = user.role === 'admin' ? '👑 Direktor' : user.role === 'courier' ? '🛵 Kuryer' : '👤 Mijoz';
        const roleColor = user.role === 'admin' ? 'border-amber-400 bg-amber-50 text-amber-900' : user.role === 'courier' ? 'border-emerald-400 bg-emerald-50 text-emerald-900' : 'border-blue-400 bg-blue-50 text-blue-900';
        
        floatingPill.className = `fixed bottom-20 md:bottom-5 left-5 z-40 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border-2 flex items-center gap-2.5 transition-all ${roleColor}`;
        floatingPill.innerHTML = `
            <div class="text-xs font-black">${roleText}</div>
            <div class="h-3 w-px bg-slate-300"></div>
            <button onclick="UlashApp.openRoleSelectorModal()" class="text-[11px] underline font-bold hover:opacity-80">
                Rolni almashtirish ⇄
            </button>
        `;
    },

    // --- Foydalanuvchi & Kuryer Login Modali ---
    openAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    },

    closeAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    },

    async handleLoginSubmit(e) {
        e.preventDefault();
        const account = document.getElementById('login-account').value.trim();
        const password = document.getElementById('login-password').value;
        const role = document.querySelector('input[name="login-role"]:checked').value;

        if (!account || !password) {
            alert("Iltimos, telefon raqam va parolni kiriting!");
            return;
        }

        // Backend orqali tekshirish
        if (window.ulashStore.isBackendOnline) {
            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ account, password, role })
                });
                const data = await res.json();
                if (data.success && data.user) {
                    window.ulashStore.setCurrentUser(data.user);
                    this.closeAuthModal();
                    window.ulashCatalog.showToast(`Xush kelibsiz, ${data.user.name}!`);
                    if (data.user.role === 'courier') this.navigateTo('courier');
                    else this.navigateTo('home');
                    return;
                } else {
                    alert(data.error || "Login yoki parol noto'g'ri!");
                    return;
                }
            } catch (err) {
                console.warn(err);
            }
        }

        // LocalStorage fallback
        const users = window.ulashStore.getUsers();
        const couriers = window.ulashStore.getCouriers();

        if (role === 'courier') {
            const c = couriers.find(cr => cr.phone === account || cr.email === account) || couriers[0];
            window.ulashStore.setCurrentUser({ ...c, role: 'courier' });
            this.closeAuthModal();
            window.ulashCatalog.showToast(`Xush kelibsiz, Kuryer ${c.name}! 🛵`);
            this.navigateTo('courier');
        } else {
            const u = users.find(usr => usr.phone === account || usr.email === account) || {
                id: `usr-${Date.now()}`,
                name: account.includes('@') ? account.split('@')[0] : 'Xaridor',
                phone: account,
                role: 'user'
            };
            window.ulashStore.setCurrentUser({ ...u, role: 'user' });
            this.closeAuthModal();
            window.ulashCatalog.showToast(`Xush kelibsiz, ${u.name}! 👤`);
            this.navigateTo('home');
        }
    },

    // --- Maxfiy Direktor (Admin) Kirish Modali ---
    openAdminAuthModal() {
        const modal = document.getElementById('admin-secret-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            const pinInput = document.getElementById('admin-secret-pin');
            if (pinInput) {
                pinInput.value = '';
                pinInput.focus();
            }
        }
    },

    closeAdminAuthModal() {
        const modal = document.getElementById('admin-secret-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    },

    async handleAdminSecretSubmit(e) {
        e.preventDefault();
        const pinInput = document.getElementById('admin-secret-pin');
        const pin = pinInput ? pinInput.value.trim() : '';

        if (window.ulashStore.isBackendOnline) {
            try {
                const res = await fetch('/api/auth/admin-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pin })
                });
                const data = await res.json();
                if (data.success && data.user) {
                    window.ulashStore.setCurrentUser(data.user);
                    this.closeAdminAuthModal();
                    window.ulashCatalog.showToast("Direktor boshqaruv tizimi ochildi! 👑");
                    this.navigateTo('admin');
                    return;
                } else {
                    alert(data.error || "Direktor maxfiy paroli noto‘g‘ri!");
                    return;
                }
            } catch (err) {
                console.warn(err);
            }
        }

        // Local fallback
        const settings = window.ulashStore.getSettings();
        if (pin === (settings.adminSecretPin || 'admin123')) {
            window.ulashStore.setCurrentUser({
                id: 'usr-admin',
                name: 'Direktor (Admin)',
                phone: '+998 71 200-00-00',
                email: 'admin@ulash.market',
                role: 'admin'
            });
            this.closeAdminAuthModal();
            window.ulashCatalog.showToast("Direktor boshqaruv tizimi ochildi! 👑");
            this.navigateTo('admin');
        } else {
            alert("Noto‘g‘ri maxfiy parol! (Standart sinov paroli: admin123)");
        }
    },

    openRoleSelectorModal() {
        const modal = document.createElement('div');
        modal.id = 'role-picker-modal';
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm';

        modal.innerHTML = `
            <div class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center">
                <div class="w-12 h-12 mx-auto mb-3 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold">
                    👥
                </div>
                <h3 class="text-base font-black text-slate-800 mb-1">Sinov uchun rolni tanlang</h3>
                <p class="text-xs text-slate-400 mb-5">Bir bosishda istalgan rolda sinab ko‘ring</p>

                <div class="space-y-2.5 text-xs font-bold">
                    <button onclick="UlashApp.switchRoleDirect('user')" class="w-full p-3 rounded-2xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 flex items-center justify-between transition">
                        <span class="flex items-center gap-2"><span>👤</span> Foydalanuvchi (Mijoz)</span>
                        <span>→</span>
                    </button>

                    <button onclick="UlashApp.switchRoleDirect('courier')" class="w-full p-3 rounded-2xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 flex items-center justify-between transition">
                        <span class="flex items-center gap-2"><span>🛵</span> Kuryer Paneli</span>
                        <span>→</span>
                    </button>

                    <button onclick="UlashApp.switchRoleDirect('admin')" class="w-full p-3 rounded-2xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 flex items-center justify-between transition">
                        <span class="flex items-center gap-2"><span>👑</span> Direktor (Admin)</span>
                        <span>→</span>
                    </button>
                </div>

                <button onclick="document.getElementById('role-picker-modal').remove()" class="w-full mt-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600">
                    Bekor qilish
                </button>
            </div>
        `;

        document.body.appendChild(modal);
    },

    switchRoleDirect(targetRole) {
        const pickerModal = document.getElementById('role-picker-modal');
        if (pickerModal) pickerModal.remove();

        if (targetRole === 'admin') {
            window.ulashStore.setCurrentUser({
                id: 'usr-admin',
                name: 'Direktor (Admin)',
                phone: '+998 71 200-00-00',
                role: 'admin'
            });
            this.navigateTo('admin');
        } else if (targetRole === 'courier') {
            const couriers = window.ulashStore.getCouriers();
            window.ulashStore.setCurrentUser({
                ...couriers[0],
                role: 'courier'
            });
            window.ulashCatalog.showToast("Kuryer Sardor Aliyev rejimi faollashdi! 🛵");
            this.navigateTo('courier');
        } else {
            const users = window.ulashStore.getUsers();
            window.ulashStore.setCurrentUser({
                ...users[0],
                role: 'user'
            });
            window.ulashCatalog.showToast("Xaridor Anvar Qosimov rejimi faollashdi! 👤");
            this.navigateTo('home');
        }
    },

    // ==========================================
    // 3. BUYURTMALAR TARIXI VA 6-BOSQICHLI JONLI KUZATUV
    // ==========================================
    renderOrdersPage() {
        const container = document.getElementById('orders-page-container');
        if (!container) return;

        const allOrders = window.ulashStore.getOrders();

        container.innerHTML = `
            <div class="max-w-5xl mx-auto px-4 py-8">
                <div class="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Mening Buyurtmalarim</h1>
                        <p class="text-xs text-slate-400 mt-0.5">6 bosqichli real-vaqt yetkazib berish kuzatuvi</p>
                    </div>
                    <button onclick="UlashApp.navigateTo('catalog')" class="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-2xl shadow-md shadow-blue-200 hover:bg-blue-700 transition">
                        + Yangi xarid qilish
                    </button>
                </div>

                ${allOrders.length === 0 ? `
                    <div class="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm">
                        <div class="w-16 h-16 mx-auto mb-3 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center text-3xl">
                            📋
                        </div>
                        <h3 class="text-base font-bold text-slate-800 mb-1">Sizda hali buyurtmalar yo‘q</h3>
                        <p class="text-xs text-slate-400 max-w-sm mx-auto mb-6">Ulash Market orqali eng yaqin do‘konlardan xarid qiling!</p>
                        <button onclick="UlashApp.navigateTo('catalog')" class="px-6 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-2xl">
                            Katalogni ko‘rish ➔
                        </button>
                    </div>
                ` : `
                    <div class="space-y-6">
                        ${allOrders.map(order => this.renderSingleOrderCard(order)).join('')}
                    </div>
                `}
            </div>
        `;

        // Xaritalarni yuklash
        setTimeout(() => {
            allOrders.forEach(o => {
                const mapEl = document.getElementById(`tracking-map-${o.id}`);
                if (mapEl) {
                    const store = window.ulashStore.getStoreById(o.storeId) || { lat: 41.2721, lng: 69.2045 };
                    window.ulashMap.initOrderTrackingMap(
                        `tracking-map-${o.id}`,
                        store.lat, store.lng,
                        o.customer?.lat || 41.2800, o.customer?.lng || 69.2200,
                        null, null,
                        o.status
                    );
                }
            });
        }, 200);
    },

    renderSingleOrderCard(order) {
        const isHighlighted = this.highlightOrderId === order.id;

        // 6 Bosqichli Buyurtmalar Stepperi (Foydalanuvchi talabi bo'yicha)
        const steps = [
            { id: 1, key: 'Buyurtma yaratildi', label: '1. Buyurtma yaratildi', icon: '📝' },
            { id: 2, key: 'Do‘kon tasdiqladi', label: '2. Do‘kon tasdiqladi', icon: '🏬' },
            { id: 3, key: 'Kuryer qabul qildi', label: '3. Kuryer qabul qildi', icon: '🛵' },
            { id: 4, key: 'Mahsulot tayyorlandi', label: '4. Mahsulot tayyorlandi', icon: '📦' },
            { id: 5, key: 'Kuryer olib ketdi', label: '5. Kuryer yo‘lda', icon: '🚚' },
            { id: 6, key: 'Buyurtma yetkazildi', label: '6. Yetkazildi', icon: '🎉' }
        ];

        const isCancelled = order.status === 'Bekor qilindi';
        const currentStepIndex = steps.findIndex(s => s.key === order.status);

        return `
            <div class="bg-white rounded-3xl border ${isHighlighted ? 'border-2 border-blue-600 ring-4 ring-blue-50' : 'border-slate-200/90'} p-6 shadow-sm overflow-hidden space-y-6">
                <!-- Sarlavha -->
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="text-base font-black text-blue-600">Buyurtma #${order.id}</span>
                            <span class="text-xs text-slate-400">• ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div class="text-xs text-slate-600 mt-0.5">
                            Do‘kon: <b class="text-slate-800">🏬 ${order.storeName || 'Ulash Supermarket'}</b>
                        </div>
                    </div>

                    <div class="flex items-center gap-2">
                        <span class="px-3 py-1 rounded-full text-xs font-bold ${this.getOrderBadgeStyle(order.status)}">
                            ${order.status}
                        </span>
                    </div>
                </div>

                <!-- 6 Bosqichli Stepper -->
                <div class="py-2">
                    ${isCancelled ? `
                        <div class="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-3">
                            <span class="text-2xl">⚠️</span>
                            <div>
                                <div>Ushbu buyurtma bekor qilingan.</div>
                                <div class="font-normal text-rose-600 text-[11px] mt-0.5">Ombordagi tovarlar qoldig‘i tiklangan.</div>
                            </div>
                        </div>
                    ` : `
                        <div class="relative flex items-center justify-between max-w-4xl mx-auto px-2">
                            <!-- Chiziq -->
                            <div class="absolute left-6 right-6 top-5 h-1 bg-slate-200 z-0">
                                <div class="bg-blue-600 h-full transition-all duration-500" style="width: ${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%"></div>
                            </div>

                            ${steps.map((st, idx) => {
                                const isPassed = currentStepIndex >= idx;
                                const isCurrent = currentStepIndex === idx;

                                return `
                                    <div class="relative z-10 flex flex-col items-center">
                                        <div class="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs transition-all ${isCurrent ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-100 scale-110 animate-bounce' : isPassed ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 border border-slate-200'}">
                                            <span>${isPassed && !isCurrent ? '✓' : st.icon}</span>
                                        </div>
                                        <span class="text-[10px] font-bold mt-2 text-center max-w-[70px] ${isCurrent ? 'text-blue-600 font-black' : isPassed ? 'text-slate-800' : 'text-slate-400'}">
                                            ${st.label}
                                        </span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `}
                </div>

                <!-- Kuryer ma'lumoti -->
                ${order.courierName ? `
                    <div class="p-4 bg-blue-50/70 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-blue-200">
                                🛵
                            </div>
                            <div>
                                <div class="font-bold text-slate-800 text-sm">${order.courierName}</div>
                                <div class="text-slate-500 text-[11px]">Kuryer buyurtmangizni yetkazmoqda</div>
                            </div>
                        </div>

                        <a href="tel:${order.courierPhone}" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow flex items-center gap-1.5">
                            <span>📞</span>
                            <span>Kuryerga qo‘ng‘iroq</span>
                        </a>
                    </div>
                ` : ''}

                <!-- Xarita kuzatuvi (agar yo'lda bo'lsa) -->
                ${order.status === 'Kuryer olib ketdi' || order.status === 'Kuryer qabul qildi' ? `
                    <div>
                        <div class="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                            <span>🗺️</span> Jonli yetkazish xaritasi:
                        </div>
                        <div id="tracking-map-${order.id}" class="w-full h-52 rounded-2xl border border-slate-200 overflow-hidden shadow-inner"></div>
                    </div>
                ` : ''}

                <!-- Mahsulotlar ro'yxati -->
                <div class="border-t border-slate-100 pt-3">
                    <div class="space-y-2 text-xs">
                        ${order.items.map(item => `
                            <div class="flex items-center justify-between py-1">
                                <div class="flex items-center gap-3">
                                    <img src="${item.image}" class="w-10 h-10 rounded-xl object-cover border border-slate-100">
                                    <div>
                                        <div class="font-bold text-slate-800">${item.name}</div>
                                        <div class="text-slate-400 text-[10px]">${item.quantity} dona x ${this.formatPrice(item.price)}</div>
                                    </div>
                                </div>
                                <span class="font-black text-slate-900">${this.formatPrice(item.price * item.quantity)}</span>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Yakuniy hisob -->
                    <div class="pt-3 border-t border-slate-100 mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2">
                        <div class="text-slate-500">
                            To‘lov: <b class="text-slate-800">${order.paymentMethod}</b>
                            <span class="ml-2 px-2 py-0.5 rounded text-[10px] font-bold ${order.paymentStatus === 'To‘langan' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                                ${order.paymentStatus}
                            </span>
                        </div>

                        <div class="text-sm font-black text-slate-900">
                            Jami to‘lov: <span class="text-blue-600 font-black text-base">${this.formatPrice(order.total)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    getOrderBadgeStyle(status) {
        const styles = {
            'Buyurtma yaratildi': 'bg-amber-100 text-amber-800 border border-amber-200',
            'Do‘kon tasdiqladi': 'bg-sky-100 text-sky-800 border border-sky-200',
            'Kuryer qabul qildi': 'bg-blue-100 text-blue-800 border border-blue-200',
            'Mahsulot tayyorlandi': 'bg-purple-100 text-purple-800 border border-purple-200',
            'Kuryer olib ketdi': 'bg-indigo-100 text-indigo-800 border border-indigo-200 animate-pulse',
            'Buyurtma yetkazildi': 'bg-emerald-100 text-emerald-800 border border-emerald-200',
            'Bekor qilindi': 'bg-rose-100 text-rose-800 border border-rose-200'
        };
        return styles[status] || 'bg-slate-100 text-slate-700';
    },

    // ==========================================
    // 4. DO'KONLAR VA FILIALLAR SAHIFASI
    // ==========================================
    renderStoresPage() {
        const container = document.getElementById('stores-page-container');
        if (!container) return;

        const stores = window.ulashStore.getStores();

        container.innerHTML = `
            <div class="max-w-7xl mx-auto px-4 py-8 space-y-8">
                <!-- Sarlavha -->
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 class="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Hamkor Do‘konlar & Supermarketlar</h1>
                        <p class="text-xs md:text-sm text-slate-500 mt-1">Toshkent bo‘ylab barcha rasmiy do‘konlar va ularning yetkazish shartlari</p>
                    </div>
                    <button onclick="UlashApp.navigateTo('catalog')" class="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-2xl shadow-md shadow-blue-200 hover:bg-blue-700 transition">
                        Barcha mahsulotlar ➔
                    </button>
                </div>

                <!-- Interaktiv Xarita -->
                <div class="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
                    <div class="flex items-center justify-between text-xs">
                        <span class="font-bold text-slate-800 flex items-center gap-2">
                            <span>🗺️</span> Xaritada do‘konlar joylashuvi:
                        </span>
                        <span class="text-slate-400">Belgini bosib tovarlarni ko‘ring</span>
                    </div>
                    <div id="stores-map-container" class="w-full h-72 md:h-96 rounded-2xl overflow-hidden border border-slate-200 shadow-inner"></div>
                </div>

                <!-- Do'konlar ro'yxati kartochkalari -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    ${stores.map(st => `
                        <div class="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between hover:border-blue-500 hover:shadow-xl transition duration-300">
                            <div class="space-y-3">
                                <div class="flex items-center gap-3">
                                    <img src="${st.logo}" class="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-sm">
                                    <div class="flex-1 min-w-0">
                                        <h3 class="font-black text-slate-900 text-sm truncate">${st.name}</h3>
                                        <div class="flex items-center gap-2 text-[10px] text-slate-400 font-bold mt-0.5">
                                            <span>${st.district}</span>
                                            <span>•</span>
                                            <span class="text-amber-500">★ ${st.rating} (${st.reviewsCount})</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="p-3 bg-slate-50 rounded-2xl text-xs space-y-1.5 text-slate-600">
                                    <p class="leading-relaxed">📍 <b>Manzil:</b> ${st.address}</p>
                                    <p>🕒 <b>Ish vaqti:</b> ${st.workingHours}</p>
                                    <p>⚡ <b>Yetkazish:</b> ${st.deliveryTime} (${this.formatPrice(st.deliveryFee)})</p>
                                    <p class="text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">${st.deliveryConditions || ''}</p>
                                </div>
                            </div>

                            <div class="pt-4 border-t border-slate-100 mt-4">
                                <button onclick="window.ulashCatalog.filterByStore('${st.id}'); UlashApp.navigateTo('catalog')" class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-200 transition text-center">
                                    Do‘konga kirish ➔
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        setTimeout(() => {
            window.ulashMap.initStoresMap('stores-map-container');
        }, 200);
    },

    // ==========================================
    // 5. FOYDALANUVCHI PROFILI SAHIFASI
    // ==========================================
    renderProfilePage() {
        const container = document.getElementById('profile-page-container');
        if (!container) return;

        const user = window.ulashStore.getCurrentUser() || {};
        const orders = window.ulashStore.getOrders();
        const wishlist = window.ulashStore.getWishlist();

        container.innerHTML = `
            <div class="max-w-3xl mx-auto px-4 py-8 space-y-6">
                <!-- Profil Asosiy Kartasi -->
                <div class="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-6">
                    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                        <div class="flex items-center gap-4">
                            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-2xl shadow-md">
                                ${user.name ? user.name[0].toUpperCase() : 'U'}
                            </div>
                            <div>
                                <h2 class="text-xl font-black text-slate-900">${user.name || 'Foydalanuvchi'}</h2>
                                <p class="text-xs text-slate-400 mt-0.5">${user.phone || ''} • ${user.email || 'Email kiritilmagan'}</p>
                                <span class="mt-2 inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${user.role === 'admin' ? 'bg-amber-100 text-amber-800' : user.role === 'courier' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}">
                                    ${user.role === 'admin' ? 'Bosh Direktor' : user.role === 'courier' ? 'Kuryer' : 'Xaridor'}
                                </span>
                            </div>
                        </div>

                        <button onclick="UlashApp.openRoleSelectorModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition">
                            Rolni almashtirish ⇄
                        </button>
                    </div>

                    <!-- Statistik ko'rsatkichlar -->
                    <div class="grid grid-cols-3 gap-4 text-center">
                        <div class="p-4 bg-slate-50 rounded-2xl">
                            <div class="text-lg font-black text-slate-900">${orders.length}</div>
                            <div class="text-[11px] text-slate-400 font-semibold mt-0.5">Jami buyurtmalar</div>
                        </div>
                        <div class="p-4 bg-slate-50 rounded-2xl">
                            <div class="text-lg font-black text-rose-600">${wishlist.length}</div>
                            <div class="text-[11px] text-slate-400 font-semibold mt-0.5">Sevimli tovarlar</div>
                        </div>
                        <div class="p-4 bg-slate-50 rounded-2xl">
                            <div class="text-lg font-black text-emerald-600">5.0 ★</div>
                            <div class="text-[11px] text-slate-400 font-semibold mt-0.5">Mijoz reytingi</div>
                        </div>
                    </div>

                    <!-- Manzillarim -->
                    <div class="space-y-3 pt-4 border-t border-slate-100">
                        <h4 class="font-bold text-xs text-slate-800">Standart yetkazib berish manzili:</h4>
                        <div class="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                            <div>
                                <div class="font-bold text-slate-800">${user.district || 'Toshkent shahar'}</div>
                                <div class="text-slate-500 mt-0.5">${user.defaultAddress || "Chilonzor 7-mavze, 12-uy, 45-xonadon"}</div>
                            </div>
                            <span class="text-blue-600 font-bold text-[11px]">Asosiy 📍</span>
                        </div>
                    </div>

                    <!-- Chiqish -->
                    <div class="pt-4 border-t border-slate-100 flex justify-end">
                        <button onclick="window.ulashStore.logout(); UlashApp.navigateTo('home')" class="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition">
                            Hisobdan chiqish 🚪
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
};

window.ulashApp = UlashApp;
