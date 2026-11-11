/**
 * ULASH MARKET - Katalog, Do'konlar, Qidiruv, Solishtirish, Sevimlilar va Savatcha Boshqaruvi
 */

const UlashCatalog = {
    selectedCategory: 'all',
    selectedStore: 'all',
    searchQuery: '',
    sortBy: 'default',
    onlyDiscounted: false,

    init() {
        this.renderCategoriesNav();
        this.renderStoresStrip();
        this.renderProducts();
        this.renderCartCounter();
        this.renderHeaderCounters();
        this.setupEventListeners();
    },

    formatPrice(price) {
        if (!price && price !== 0) return '0 so‘m';
        return Number(price).toLocaleString('uz-UZ') + ' so‘m';
    },

    setupEventListeners() {
        const searchInputs = document.querySelectorAll('.global-search-input');
        searchInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.trim().toLowerCase();
                this.renderProducts();
            });
        });

        window.ulashStore.subscribe('CART_UPDATED', () => {
            this.renderCartCounter();
            this.renderCartModalContent();
        });

        window.ulashStore.subscribe('WISHLIST_UPDATED', () => {
            this.renderHeaderCounters();
            this.renderProducts();
        });

        window.ulashStore.subscribe('COMPARE_UPDATED', () => {
            this.renderHeaderCounters();
            this.renderProducts();
        });

        window.ulashStore.subscribe('PRODUCTS_UPDATED', () => {
            this.renderProducts();
            this.renderCartModalContent();
        });

        window.ulashStore.subscribe('STORES_UPDATED', () => {
            this.renderStoresStrip();
            this.renderProducts();
        });
    },

    renderHeaderCounters() {
        const wishlist = window.ulashStore.getWishlist();
        const compare = window.ulashStore.getCompareList();

        const wishBadges = document.querySelectorAll('.wishlist-badge-count');
        wishBadges.forEach(b => {
            b.textContent = wishlist.length;
            b.classList.toggle('hidden', wishlist.length === 0);
        });

        const compBadges = document.querySelectorAll('.compare-badge-count');
        compBadges.forEach(b => {
            b.textContent = compare.length;
            b.classList.toggle('hidden', compare.length === 0);
        });
    },

    renderCategoriesNav() {
        const container = document.getElementById('categories-strip');
        if (!container) return;

        const categories = window.ulashStore.getCategories();
        
        let html = `
            <button onclick="UlashCatalog.filterByCategory('all')" 
                class="category-pill shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${this.selectedCategory === 'all' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}">
                <span>⚡ Barcha Kategoriyalar</span>
            </button>
        `;

        const categoryIcons = {
            'smartfonlar': '📱',
            'noutbuklar': '💻',
            'maishiy-texnika': '📺',
            'kiyim': '👕',
            'oziq-ovqat': '🍏',
            'gozallik': '✨',
            'sport': '⚽'
        };

        categories.forEach(cat => {
            const isSelected = this.selectedCategory === cat.id;
            const emoji = categoryIcons[cat.id] || '📦';
            html += `
                <button onclick="UlashCatalog.filterByCategory('${cat.id}')" 
                    class="category-pill shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all ${isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-200 font-bold' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'}">
                    <span>${emoji}</span>
                    <span>${cat.name}</span>
                </button>
            `;
        });

        container.innerHTML = html;
    },

    renderStoresStrip() {
        const container = document.getElementById('stores-strip-container');
        if (!container) return;

        const stores = window.ulashStore.getStores();

        let html = `
            <button onclick="UlashCatalog.filterByStore('all')" 
                class="store-chip shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all border ${this.selectedStore === 'all' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}">
                <span>🏬 Barcha Do‘konlar</span>
            </button>
        `;

        stores.forEach(st => {
            const isSelected = this.selectedStore === st.id;
            html += `
                <button onclick="UlashCatalog.filterByStore('${st.id}')" 
                    class="store-chip shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs transition-all border ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-md shadow-indigo-100' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-medium'}">
                    <img src="${st.logo}" class="w-5 h-5 rounded-full object-cover">
                    <span>${st.shortName || st.name}</span>
                    <span class="text-[10px] text-amber-500 font-bold">★${st.rating}</span>
                </button>
            `;
        });

        container.innerHTML = html;
    },

    filterByCategory(categoryId) {
        this.selectedCategory = categoryId;
        this.renderCategoriesNav();
        this.renderProducts();

        const catalogSection = document.getElementById('catalog-section');
        if (catalogSection) {
            catalogSection.scrollIntoView({ behavior: 'smooth' });
        }
    },

    filterByStore(storeId) {
        this.selectedStore = storeId;
        this.renderStoresStrip();
        this.renderProducts();

        const catalogSection = document.getElementById('catalog-section');
        if (catalogSection) {
            catalogSection.scrollIntoView({ behavior: 'smooth' });
        }
    },

    resetFilters() {
        this.selectedCategory = 'all';
        this.selectedStore = 'all';
        this.searchQuery = '';
        this.sortBy = 'default';
        this.onlyDiscounted = false;

        const searchInputs = document.querySelectorAll('.global-search-input');
        searchInputs.forEach(i => i.value = '');

        this.renderCategoriesNav();
        this.renderStoresStrip();
        this.renderProducts();
    },

    getFilteredProducts() {
        let products = window.ulashStore.getProducts();

        if (this.selectedCategory && this.selectedCategory !== 'all') {
            products = products.filter(p => p.category === this.selectedCategory);
        }

        if (this.selectedStore && this.selectedStore !== 'all') {
            products = products.filter(p => p.storeId === this.selectedStore);
        }

        if (this.searchQuery) {
            products = products.filter(p => 
                p.name.toLowerCase().includes(this.searchQuery) ||
                p.brand.toLowerCase().includes(this.searchQuery) ||
                (p.storeName && p.storeName.toLowerCase().includes(this.searchQuery)) ||
                (p.description && p.description.toLowerCase().includes(this.searchQuery))
            );
        }

        if (this.onlyDiscounted) {
            products = products.filter(p => p.discountPercent > 0);
        }

        if (this.sortBy === 'price-asc') {
            products.sort((a, b) => a.price - b.price);
        } else if (this.sortBy === 'price-desc') {
            products.sort((a, b) => b.price - a.price);
        } else if (this.sortBy === 'rating') {
            products.sort((a, b) => b.rating - a.rating);
        }

        return products;
    },

    renderProducts() {
        const grid = document.getElementById('products-grid');
        const countLabel = document.getElementById('products-count');
        if (!grid) return;

        const products = this.getFilteredProducts();

        if (countLabel) {
            countLabel.textContent = `${products.length} ta mahsulot mavjud`;
        }

        if (products.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                    <div class="w-16 h-16 mx-auto mb-3 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl">
                        🔍
                    </div>
                    <h3 class="text-base font-bold text-slate-800 mb-1">Afsuski, hech narsa topilmadi</h3>
                    <p class="text-slate-400 text-xs max-w-sm mx-auto mb-4">
                        Qidiruv so‘zini o‘zgartiring yoki filtrlarni tozalang.
                    </p>
                    <button onclick="UlashCatalog.resetFilters()" class="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition">
                        Barcha filtrlarni tozalash
                    </button>
                </div>
            `;
            return;
        }

        grid.innerHTML = products.map(p => this.createProductCardHtml(p)).join('');
    },

    createProductCardHtml(p) {
        const hasDiscount = p.discountPercent > 0;
        const isOutOfStock = p.stock <= 0;
        const isLowStock = p.stock > 0 && p.stock <= 5;
        const isFav = window.ulashStore.isWishlisted(p.id);
        const isComp = window.ulashStore.isCompared(p.id);
        const cartItem = window.ulashStore.getCart().find(item => item.productId === p.id);
        const cartQty = cartItem ? cartItem.quantity : 0;

        return `
            <div class="product-card group bg-white rounded-3xl overflow-hidden flex flex-col h-full border border-slate-200/90 hover:border-blue-400 hover:shadow-xl transition-all duration-300 relative">
                
                <!-- Rasm va belgilar -->
                <div class="aspect-square relative bg-slate-50 overflow-hidden cursor-pointer" onclick="UlashCatalog.openProductModal('${p.id}')">
                    <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'">
                    
                    <!-- Chegirma & Xit belgilari -->
                    <div class="absolute top-3 left-3 flex flex-col gap-1.5 items-start z-10">
                        ${hasDiscount ? `<span class="px-2 py-0.5 rounded-lg text-[10px] font-black bg-rose-500 text-white shadow-md">-${p.discountPercent}%</span>` : ''}
                        ${p.badge ? `<span class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white/95 text-slate-800 shadow-md backdrop-blur-sm border border-slate-100">${p.badge}</span>` : ''}
                    </div>

                    <!-- Sevimli ❤️ va Solishtirish ⚖️ tugmalari -->
                    <div class="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
                        <button onclick="event.stopPropagation(); UlashCatalog.toggleWishlist('${p.id}')" class="w-8 h-8 rounded-full ${isFav ? 'bg-rose-50 text-rose-500 border-rose-200' : 'bg-white/90 text-slate-400 hover:text-rose-500 border-slate-200'} border flex items-center justify-center text-xs shadow-md backdrop-blur-sm transition-transform active:scale-90" title="Sevimli mahsulotlarga qo‘shish">
                            ${isFav ? '❤️' : '🤍'}
                        </button>
                        <button onclick="event.stopPropagation(); UlashCatalog.toggleCompare('${p.id}')" class="w-8 h-8 rounded-full ${isComp ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white/90 text-slate-400 hover:text-blue-600 border-slate-200'} border flex items-center justify-center text-xs shadow-md backdrop-blur-sm transition-transform active:scale-90" title="Mahsulotlarni solishtirish">
                            ⚖️
                        </button>
                    </div>

                    <!-- Ombor holati -->
                    <div class="absolute bottom-2.5 left-2.5 z-10">
                        ${isOutOfStock ? 
                            `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700">Tugagan</span>` :
                            isLowStock ? 
                            `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">Faqat ${p.stock} dona qoldi</span>` :
                            `<span class="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/90 text-slate-600 shadow-sm border border-slate-100">${p.stock} ta omborda</span>`
                        }
                    </div>
                </div>

                <!-- Kontent -->
                <div class="p-4 flex-1 flex flex-col justify-between">
                    <div>
                        <!-- Do'kon va Reyting -->
                        <div class="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                            <span onclick="event.stopPropagation(); UlashCatalog.filterByStore('${p.storeId}')" class="font-semibold text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-2 py-0.5 rounded-md cursor-pointer transition truncate max-w-[140px]" title="${p.storeName || 'Ulash Supermarket'}">
                                🏬 ${p.storeName || 'Ulash Supermarket'}
                            </span>
                            <div class="flex items-center gap-1 font-bold text-amber-500 shrink-0">
                                <span>★</span>
                                <span>${p.rating}</span>
                                <span class="text-slate-400 text-[10px] font-normal">(${p.reviewsCount})</span>
                            </div>
                        </div>

                        <!-- Mahsulot nomi -->
                        <h3 class="font-bold text-slate-800 text-xs line-clamp-2 hover:text-blue-600 transition cursor-pointer mb-2 leading-relaxed" onclick="UlashCatalog.openProductModal('${p.id}')" title="${p.name}">
                            ${p.name}
                        </h3>
                    </div>

                    <div class="pt-3 border-t border-slate-100 mt-2">
                        <!-- Narx -->
                        <div class="mb-3">
                            ${hasDiscount ? `
                                <div class="text-[11px] text-slate-400 line-through">
                                    ${this.formatPrice(p.originalPrice)}
                                </div>
                            ` : ''}
                            <div class="text-sm font-black text-slate-900">
                                ${this.formatPrice(p.price)}
                            </div>
                        </div>

                        <!-- Savatga qo'shish / Miqdor nazorati -->
                        ${isOutOfStock ? `
                            <button disabled class="w-full py-2.5 px-3 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed text-center">
                                Hozirda mavjud emas
                            </button>
                        ` : cartQty > 0 ? `
                            <div class="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl p-1 text-xs">
                                <button onclick="event.stopPropagation(); UlashCatalog.changeCartQty('${p.id}', -1)" class="w-7 h-7 rounded-lg bg-white text-blue-700 font-bold hover:bg-blue-600 hover:text-white transition shadow-sm flex items-center justify-center">
                                    -
                                </button>
                                <span class="font-extrabold text-blue-700">${cartQty} dona</span>
                                <button onclick="event.stopPropagation(); UlashCatalog.changeCartQty('${p.id}', 1)" class="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition shadow-sm flex items-center justify-center">
                                    +
                                </button>
                            </div>
                        ` : `
                            <button onclick="event.stopPropagation(); UlashCatalog.quickAddToCart('${p.id}')" class="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition duration-200 flex items-center justify-center gap-1.5 shadow-md shadow-blue-200 active:scale-95">
                                <span>🛒</span>
                                <span>Savatga</span>
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    },

    quickAddToCart(productId) {
        const p = window.ulashStore.getProductById(productId);
        if (!p) return;
        window.ulashStore.addToCart(p, 1);
        this.showToast(`"${p.name.substring(0, 24)}..." savatga qo‘shildi! 🛒`);
    },

    changeCartQty(productId, change) {
        const item = window.ulashStore.getCart().find(i => i.productId === productId);
        if (item) {
            window.ulashStore.updateCartQuantity(productId, item.quantity + change);
        }
    },

    toggleWishlist(productId) {
        const added = window.ulashStore.toggleWishlist(productId);
        const p = window.ulashStore.getProductById(productId);
        const name = p ? p.name.substring(0, 22) : 'Mahsulot';
        if (added) {
            this.showToast(`❤️ ${name}... sevimlilarga saqlandi!`);
        } else {
            this.showToast(`🤍 ${name}... sevimlilardan o‘chirildi.`);
        }
    },

    toggleCompare(productId) {
        const added = window.ulashStore.toggleCompare(productId);
        const p = window.ulashStore.getProductById(productId);
        const name = p ? p.name.substring(0, 22) : 'Mahsulot';
        if (added) {
            this.showToast(`⚖️ ${name}... solishtirish ro‘yxatiga qo‘shildi!`);
        }
    },

    // ==========================================
    // MAHSULOT TAFSILOTLARI MODALI (QUICK VIEW)
    // ==========================================
    openProductModal(productId) {
        const product = window.ulashStore.getProductById(productId);
        if (!product) return;

        const modal = document.getElementById('product-detail-modal');
        const content = document.getElementById('product-detail-content');
        if (!modal || !content) return;

        const store = window.ulashStore.getStoreById(product.storeId) || {
            name: product.storeName || 'Ulash Supermarket',
            logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=300&q=80',
            rating: 4.9,
            deliveryTime: '30 daqiqa',
            deliveryFee: 15000
        };

        const reviews = window.ulashStore.getProductReviews(product.id);
        const isFav = window.ulashStore.isWishlisted(product.id);
        const isComp = window.ulashStore.isCompared(product.id);

        let specsHtml = '';
        if (product.specs && typeof product.specs === 'object') {
            specsHtml = Object.entries(product.specs).map(([key, val]) => `
                <div class="flex items-center justify-between py-1.5 border-b border-slate-100 text-xs">
                    <span class="text-slate-500">${key}:</span>
                    <span class="font-bold text-slate-800 text-right">${val}</span>
                </div>
            `).join('');
        }

        let reviewsHtml = reviews.length ? reviews.map(r => `
            <div class="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <div class="flex items-center justify-between text-xs">
                    <span class="font-bold text-slate-800">${r.userName}</span>
                    <span class="text-amber-500 font-bold">★ ${r.rating}</span>
                </div>
                <p class="text-xs text-slate-600 leading-relaxed">${r.comment}</p>
                <div class="text-[10px] text-slate-400">${r.createdAt || 'Yaqinda'}</div>
            </div>
        `).join('') : '<p class="text-xs text-slate-400 py-2">Hozircha sharhlar yo‘q. Birinchi bo‘lib sharh qoldiring!</p>';

        content.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 max-h-[85vh] overflow-y-auto">
                <!-- Chap: Rasm -->
                <div class="p-6 bg-slate-50 flex flex-col justify-center items-center relative">
                    <img src="${product.image}" alt="${product.name}" class="max-h-[350px] w-auto object-contain rounded-2xl shadow-sm">
                    ${product.discountPercent > 0 ? `<span class="absolute top-6 left-6 px-3 py-1 bg-rose-500 text-white rounded-xl text-xs font-black shadow-md">-${product.discountPercent}% CHEGIRMA</span>` : ''}
                </div>

                <!-- O'ng: Tafsilotlar -->
                <div class="p-6 space-y-4 flex flex-col justify-between">
                    <div>
                        <!-- Do'kon bloki -->
                        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div class="flex items-center gap-2">
                                <img src="${store.logo}" class="w-8 h-8 rounded-full object-cover border border-slate-200">
                                <div>
                                    <div class="text-xs font-bold text-slate-800">${store.name}</div>
                                    <div class="text-[10px] text-emerald-600 font-semibold">⚡ Yetkazish: ${store.deliveryTime || '30 daq'}</div>
                                </div>
                            </div>
                            <span class="text-xs text-amber-500 font-bold">★ ${product.rating} (${product.reviewsCount} ta baho)</span>
                        </div>

                        <h2 class="text-lg font-black text-slate-900 mt-3 leading-snug">${product.name}</h2>
                        <p class="text-xs text-slate-500 mt-1 leading-relaxed">${product.description}</p>

                        <!-- Narx -->
                        <div class="mt-4 p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100 flex items-center justify-between">
                            <div>
                                ${product.discountPercent > 0 ? `<div class="text-xs text-slate-400 line-through">${this.formatPrice(product.originalPrice)}</div>` : ''}
                                <div class="text-xl font-black text-blue-700">${this.formatPrice(product.price)}</div>
                            </div>
                            <div class="text-right text-[11px] text-slate-600 font-medium">
                                Omborda: <b class="text-slate-800">${product.stock} dona</b>
                            </div>
                        </div>

                        <!-- Texnik xususiyatlar -->
                        <div class="mt-4">
                            <h4 class="font-bold text-xs text-slate-800 mb-2">Asosiy xususiyatlar:</h4>
                            <div class="space-y-1">
                                ${specsHtml || '<p class="text-xs text-slate-400">Standart parametrlar</p>'}
                            </div>
                        </div>

                        <!-- Sharhlar qismi -->
                        <div class="mt-5 pt-4 border-t border-slate-100">
                            <h4 class="font-bold text-xs text-slate-800 mb-2 flex items-center justify-between">
                                <span>Xaridorlar fikrlari (${reviews.length})</span>
                                <button onclick="document.getElementById('review-form-${product.id}').classList.toggle('hidden')" class="text-blue-600 hover:underline font-bold text-[11px]">
                                    + Sharh yozish
                                </button>
                            </h4>

                            <!-- Sharh yozish formasi -->
                            <form id="review-form-${product.id}" onsubmit="UlashCatalog.submitReview(event, '${product.id}')" class="hidden mb-3 p-3 bg-slate-50 rounded-2xl border border-blue-200 space-y-2 text-xs">
                                <div>
                                    <label class="block font-semibold text-slate-700 mb-1">Bahoyingiz:</label>
                                    <select name="rating" class="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white">
                                        <option value="5">⭐⭐⭐⭐⭐ A'lo (5)</option>
                                        <option value="4">⭐⭐⭐⭐ Yaxshi (4)</option>
                                        <option value="3">⭐⭐⭐ Qoniqarli (3)</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block font-semibold text-slate-700 mb-1">Fikringiz:</label>
                                    <textarea name="comment" required rows="2" placeholder="Mahsulot haqida xolisona fikringiz..." class="w-full p-2 rounded-lg border border-slate-200"></textarea>
                                </div>
                                <button type="submit" class="w-full py-1.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
                                    Sharhni saqlash
                                </button>
                            </form>

                            <div class="space-y-2 max-h-40 overflow-y-auto pr-1">
                                ${reviewsHtml}
                            </div>
                        </div>
                    </div>

                    <!-- Tugmalar -->
                    <div class="pt-4 border-t border-slate-100 flex items-center gap-2">
                        <button onclick="UlashCatalog.toggleWishlist('${product.id}'); UlashCatalog.openProductModal('${product.id}')" class="px-3.5 py-3 rounded-2xl border border-slate-200 text-sm font-bold hover:bg-slate-50">
                            ${isFav ? '❤️ Sevimli' : '🤍 Saqlash'}
                        </button>
                        <button onclick="UlashCatalog.toggleCompare('${product.id}'); UlashCatalog.openProductModal('${product.id}')" class="px-3.5 py-3 rounded-2xl border border-slate-200 text-sm font-bold hover:bg-slate-50">
                            ⚖️
                        </button>
                        <button onclick="UlashCatalog.quickAddToCart('${product.id}'); UlashCatalog.closeProductModal()" class="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-blue-200 transition">
                            🛒 Savatchaga qo‘shish
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    },

    closeProductModal() {
        const modal = document.getElementById('product-detail-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    },

    submitReview(event, productId) {
        event.preventDefault();
        const form = event.target;
        const rating = parseInt(form.rating.value) || 5;
        const comment = form.comment.value.trim();
        const user = window.ulashStore.getCurrentUser() || { name: 'Xaridor' };

        window.ulashStore.addReview({
            productId,
            userName: user.name || 'Xaridor',
            rating,
            comment
        });

        this.showToast("Sharhingiz qabul qilindi, rahmat! ⭐");
        this.openProductModal(productId);
    },

    // ==========================================
    // MAHSULOTLARNI SOLISHTIRISH (COMPARE MODAL)
    // ==========================================
    openCompareModal() {
        const compareIds = window.ulashStore.getCompareList();
        if (compareIds.length === 0) {
            this.showToast("Solishtirish ro‘yxati bo‘sh! Mahsulot kartasidagi ⚖️ belgisini bosing.");
            return;
        }

        const modal = document.getElementById('compare-modal');
        const content = document.getElementById('compare-modal-content');
        if (!modal || !content) return;

        const products = compareIds.map(id => window.ulashStore.getProductById(id)).filter(Boolean);

        content.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full text-xs text-left border-collapse">
                    <thead>
                        <tr class="border-b border-slate-200">
                            <th class="p-3 bg-slate-50 font-bold text-slate-500 w-32">Parametr</th>
                            ${products.map(p => `
                                <th class="p-3 min-w-[200px] text-center bg-white border-l border-slate-100">
                                    <div class="relative">
                                        <button onclick="window.ulashStore.toggleCompare('${p.id}'); UlashCatalog.openCompareModal()" class="absolute -top-1 -right-1 text-slate-400 hover:text-rose-500 font-bold text-sm">✕</button>
                                        <img src="${p.image}" class="w-20 h-20 object-contain mx-auto mb-2 rounded-xl">
                                        <h4 class="font-bold text-slate-800 text-xs line-clamp-2">${p.name}</h4>
                                        <div class="text-blue-600 font-black text-sm mt-1">${this.formatPrice(p.price)}</div>
                                        <button onclick="UlashCatalog.quickAddToCart('${p.id}')" class="mt-2 w-full py-1.5 bg-blue-600 text-white rounded-lg font-bold text-[11px] hover:bg-blue-700">
                                            Savatga 🛒
                                        </button>
                                    </div>
                                </th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr>
                            <td class="p-3 font-semibold text-slate-600 bg-slate-50">Do‘kon</td>
                            ${products.map(p => `<td class="p-3 text-center border-l border-slate-100 font-bold text-slate-700">🏬 ${p.storeName || 'Ulash Supermarket'}</td>`).join('')}
                        </tr>
                        <tr>
                            <td class="p-3 font-semibold text-slate-600 bg-slate-50">Brend</td>
                            ${products.map(p => `<td class="p-3 text-center border-l border-slate-100 font-semibold text-slate-800">${p.brand}</td>`).join('')}
                        </tr>
                        <tr>
                            <td class="p-3 font-semibold text-slate-600 bg-slate-50">Reyting</td>
                            ${products.map(p => `<td class="p-3 text-center border-l border-slate-100 text-amber-500 font-bold">★ ${p.rating} (${p.reviewsCount} ta)</td>`).join('')}
                        </tr>
                        <tr>
                            <td class="p-3 font-semibold text-slate-600 bg-slate-50">Chegirma</td>
                            ${products.map(p => `<td class="p-3 text-center border-l border-slate-100">${p.discountPercent > 0 ? `<span class="text-rose-600 font-bold">-${p.discountPercent}%</span>` : 'Mavjud emas'}</td>`).join('')}
                        </tr>
                        <tr>
                            <td class="p-3 font-semibold text-slate-600 bg-slate-50">Omborda</td>
                            ${products.map(p => `<td class="p-3 text-center border-l border-slate-100 font-bold ${p.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}">${p.stock} dona</td>`).join('')}
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                <button onclick="window.ulashStore.clearCompare(); UlashCatalog.closeCompareModal()" class="text-xs text-rose-600 font-bold hover:underline">
                    Solishtirish ro‘yxatini tozalash
                </button>
                <button onclick="UlashCatalog.closeCompareModal()" class="px-5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900">
                    Yopish
                </button>
            </div>
        `;

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    },

    closeCompareModal() {
        const modal = document.getElementById('compare-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    },

    // ==========================================
    // SEVIMLILAR MODALI (WISHLIST MODAL)
    // ==========================================
    openWishlistModal() {
        const wishIds = window.ulashStore.getWishlist();
        const modal = document.getElementById('wishlist-modal');
        const content = document.getElementById('wishlist-modal-content');
        if (!modal || !content) return;

        if (wishIds.length === 0) {
            content.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-4xl mb-2">🤍</div>
                    <h3 class="font-bold text-slate-800 text-base mb-1">Sevimli mahsulotlar ro‘yxati bo‘sh</h3>
                    <p class="text-xs text-slate-400">Yoqqan tovarlaringizni ❤️ belgisini bosib saqlab qo‘yishingiz mumkin.</p>
                </div>
            `;
        } else {
            const products = wishIds.map(id => window.ulashStore.getProductById(id)).filter(Boolean);
            content.innerHTML = `
                <div class="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
                    ${products.map(p => `
                        <div class="py-3 flex items-center justify-between gap-3 text-xs">
                            <div class="flex items-center gap-3">
                                <img src="${p.image}" class="w-14 h-14 rounded-xl object-cover border border-slate-100">
                                <div>
                                    <h4 class="font-bold text-slate-800 line-clamp-1">${p.name}</h4>
                                    <div class="text-blue-600 font-black text-xs mt-0.5">${this.formatPrice(p.price)}</div>
                                    <div class="text-[10px] text-slate-400">Do‘kon: ${p.storeName || 'Ulash'}</div>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <button onclick="UlashCatalog.quickAddToCart('${p.id}')" class="px-3 py-1.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
                                    Savatga 🛒
                                </button>
                                <button onclick="UlashCatalog.toggleWishlist('${p.id}'); UlashCatalog.openWishlistModal()" class="text-slate-400 hover:text-rose-500 font-bold p-1">
                                    ✕
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    },

    closeWishlistModal() {
        const modal = document.getElementById('wishlist-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    },

    // ==========================================
    // SAVATCHA (CART MODAL)
    // ==========================================
    openCartModal() {
        const modal = document.getElementById('cart-modal');
        if (!modal) return;
        this.renderCartModalContent();
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    },

    closeCartModal() {
        const modal = document.getElementById('cart-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    },

    renderCartCounter() {
        const count = window.ulashStore.getCartCount();
        const total = window.ulashStore.getCartTotal();

        const badges = document.querySelectorAll('.cart-badge-count');
        badges.forEach(b => {
            b.textContent = count;
            b.classList.toggle('hidden', count === 0);
        });

        const totalHeaders = document.querySelectorAll('.cart-total-header');
        totalHeaders.forEach(t => {
            t.textContent = this.formatPrice(total);
        });
    },

    renderCartModalContent() {
        const itemsContainer = document.getElementById('cart-modal-items');
        const summaryContainer = document.getElementById('cart-modal-summary');
        if (!itemsContainer || !summaryContainer) return;

        const cart = window.ulashStore.getCart();

        if (cart.length === 0) {
            itemsContainer.innerHTML = `
                <div class="py-12 text-center text-slate-400">
                    <div class="text-5xl mb-3">🛒</div>
                    <div class="font-bold text-slate-700 text-sm mb-1">Savatchangiz bo‘sh</div>
                    <p class="text-xs">Katalogimizdan kerakli mahsulotlarni tanlang</p>
                </div>
            `;
            summaryContainer.innerHTML = `
                <button onclick="UlashCatalog.closeCartModal(); window.ulashApp.navigateTo('catalog')" class="w-full py-3 bg-blue-600 text-white font-bold rounded-2xl text-xs hover:bg-blue-700 transition">
                    Xaridni boshlash ➔
                </button>
            `;
            return;
        }

        itemsContainer.innerHTML = cart.map(item => `
            <div class="flex items-center justify-between py-3 border-b border-slate-100 gap-3 text-xs">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                    <img src="${item.image}" class="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0">
                    <div class="min-w-0 flex-1">
                        <h4 class="font-bold text-slate-800 line-clamp-1">${item.name}</h4>
                        <div class="text-blue-600 font-extrabold text-xs mt-0.5">${this.formatPrice(item.price)}</div>
                        <div class="text-[10px] text-slate-400">Do‘kon: ${item.storeName || 'Ulash Supermarket'}</div>
                    </div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                    <div class="flex items-center bg-slate-100 rounded-xl p-0.5">
                        <button onclick="UlashCatalog.changeCartQty('${item.productId}', -1)" class="w-6 h-6 rounded-lg bg-white text-slate-700 font-bold hover:bg-rose-50 hover:text-rose-600 transition flex items-center justify-center shadow-sm">
                            -
                        </button>
                        <span class="px-2 font-bold text-slate-800">${item.quantity}</span>
                        <button onclick="UlashCatalog.changeCartQty('${item.productId}', 1)" class="w-6 h-6 rounded-lg bg-white text-slate-700 font-bold hover:bg-emerald-50 hover:text-emerald-600 transition flex items-center justify-center shadow-sm">
                            +
                        </button>
                    </div>
                    <button onclick="window.ulashStore.removeFromCart('${item.productId}')" class="text-slate-400 hover:text-rose-500 font-bold p-1">
                        ✕
                    </button>
                </div>
            </div>
        `).join('');

        const subtotal = window.ulashStore.getCartTotal();
        const settings = window.ulashStore.getSettings();
        const threshold = settings.freeDeliveryThreshold || 350000;
        const progress = Math.min(100, Math.round((subtotal / threshold) * 100));

        summaryContainer.innerHTML = `
            <div class="space-y-3">
                <!-- Bepul yetkazish progress bar -->
                <div class="p-3 bg-blue-50/70 rounded-2xl border border-blue-100 text-xs">
                    <div class="flex items-center justify-between mb-1.5 font-bold text-blue-900 text-[11px]">
                        <span>${subtotal >= threshold ? '🎉 Bepul yetkazib berish faollashdi!' : `Yana ${this.formatPrice(threshold - subtotal)} lik xarid qiling:`}</span>
                        <span>${progress}%</span>
                    </div>
                    <div class="w-full h-2 bg-blue-200/70 rounded-full overflow-hidden">
                        <div class="h-full bg-blue-600 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
                    </div>
                </div>

                <div class="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>Mahsulotlar jami:</span>
                    <span class="text-sm font-black text-slate-900">${this.formatPrice(subtotal)}</span>
                </div>

                <div class="flex gap-2">
                    <button onclick="window.ulashStore.clearCart()" class="px-4 py-3 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-bold text-xs rounded-2xl transition">
                        Tozalash
                    </button>
                    <button onclick="UlashCatalog.closeCartModal(); window.ulashApp.navigateTo('checkout')" class="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-blue-200 transition text-center">
                        Buyurtma berish ➔
                    </button>
                </div>
            </div>
        `;
    },

    showToast(message) {
        let toast = document.getElementById('app-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'app-toast';
            toast.className = 'fixed bottom-20 md:bottom-8 right-6 z-50 bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 transform transition-all duration-300 opacity-0 translate-y-4 pointer-events-none';
            document.body.appendChild(toast);
        }

        toast.innerHTML = `<span>⚡</span> <span>${message}</span>`;
        toast.classList.remove('opacity-0', 'translate-y-4');
        toast.classList.add('opacity-100', 'translate-y-0');

        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => {
            toast.classList.remove('opacity-100', 'translate-y-0');
            toast.classList.add('opacity-0', 'translate-y-4');
        }, 3000);
    }
};

window.ulashCatalog = UlashCatalog;
