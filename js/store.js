/**
 * ULASH MARKET - Yagona Reaktiv Holat Boshqaruvi (Unified Reactive Store)
 * Do'konlar, Mahsulotlar, Buyurtmalar (6 bosqich), Kuryerlar, Solishtirish, Sevimlilar va REST API integratsiyasi
 */

class UlashStore {
    constructor() {
        this.STORAGE_KEYS = {
            STORES: 'ulash_stores',
            CATEGORIES: 'ulash_categories',
            PRODUCTS: 'ulash_products',
            COURIERS: 'ulash_couriers',
            USERS: 'ulash_users',
            ORDERS: 'ulash_orders',
            SETTINGS: 'ulash_settings',
            CURRENT_USER: 'ulash_current_user',
            CART: 'ulash_cart',
            WISHLIST: 'ulash_wishlist',
            COMPARE: 'ulash_compare',
            PROMOS: 'ulash_promos',
            REVIEWS: 'ulash_reviews'
        };

        this.ORDER_STAGES = [
            'Buyurtma yaratildi',
            'Do‘kon tasdiqladi',
            'Kuryer qabul qildi',
            'Mahsulot tayyorlandi',
            'Kuryer olib ketdi',
            'Buyurtma yetkazildi'
        ];

        this.listeners = new Map();
        this.broadcastChannel = null;
        this.isBackendOnline = false;

        this.initBroadcastChannel();
        this.initData();
        this.checkBackendConnection();
    }

    async checkBackendConnection() {
        try {
            const res = await fetch('/api/stats', { method: 'GET', headers: { 'Accept': 'application/json' } });
            if (res.ok) {
                this.isBackendOnline = true;
                console.log("⚡ ULASH MARKET: Python Flask REST API serveri bilan ulandi!");
                this.syncFromBackend();
            }
        } catch (e) {
            this.isBackendOnline = false;
            console.log("ℹ️ ULASH MARKET: Mahalliy reaktiv xotira (LocalStorage + BroadcastChannel) ishlamoqda.");
        }
    }

    async syncFromBackend() {
        if (!this.isBackendOnline) return;
        try {
            const [storesRes, productsRes, ordersRes, couriersRes, promosRes] = await Promise.all([
                fetch('/api/stores').then(r => r.json()).catch(() => null),
                fetch('/api/products').then(r => r.json()).catch(() => null),
                fetch('/api/orders').then(r => r.json()).catch(() => null),
                fetch('/api/couriers').then(r => r.json()).catch(() => null),
                fetch('/api/promos').then(r => r.json()).catch(() => null)
            ]);

            if (storesRes && storesRes.stores) {
                localStorage.setItem(this.STORAGE_KEYS.STORES, JSON.stringify(storesRes.stores));
            }
            if (productsRes && productsRes.products) {
                localStorage.setItem(this.STORAGE_KEYS.PRODUCTS, JSON.stringify(productsRes.products));
            }
            if (ordersRes && ordersRes.orders) {
                localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(ordersRes.orders));
            }
            if (couriersRes && couriersRes.couriers) {
                localStorage.setItem(this.STORAGE_KEYS.COURIERS, JSON.stringify(couriersRes.couriers));
            }
            if (promosRes && promosRes.promos) {
                localStorage.setItem(this.STORAGE_KEYS.PROMOS, JSON.stringify(promosRes.promos));
            }

            this.notify('DATA_SYNCED');
        } catch (err) {
            console.warn("Backend sync xatolik:", err);
        }
    }

    initBroadcastChannel() {
        if ('BroadcastChannel' in window) {
            this.broadcastChannel = new BroadcastChannel('ulash_market_sync');
            this.broadcastChannel.onmessage = (event) => {
                const { type, payload } = event.data;
                this.notify(type, payload, false);
            };
        }

        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith('ulash_')) {
                this.notify('STORAGE_SYNC', { key: e.key });
            }
        });
    }

    initData() {
        if (!localStorage.getItem(this.STORAGE_KEYS.STORES)) {
            localStorage.setItem(this.STORAGE_KEYS.STORES, JSON.stringify(INITIAL_STORES));
        }
        if (!localStorage.getItem(this.STORAGE_KEYS.CATEGORIES)) {
            localStorage.setItem(this.STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
        }
        if (!localStorage.getItem(this.STORAGE_KEYS.PRODUCTS)) {
            localStorage.setItem(this.STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
        }
        if (!localStorage.getItem(this.STORAGE_KEYS.COURIERS)) {
            localStorage.setItem(this.STORAGE_KEYS.COURIERS, JSON.stringify(INITIAL_COURIERS));
        }
        if (!localStorage.getItem(this.STORAGE_KEYS.USERS)) {
            localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
        }
        if (!localStorage.getItem(this.STORAGE_KEYS.ORDERS)) {
            localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
        }
        if (!localStorage.getItem(this.STORAGE_KEYS.PROMOS)) {
            localStorage.setItem(this.STORAGE_KEYS.PROMOS, JSON.stringify(INITIAL_PROMOS));
        }
        if (!localStorage.getItem(this.STORAGE_KEYS.REVIEWS)) {
            localStorage.setItem(this.STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
        }
        if (!localStorage.getItem(this.STORAGE_KEYS.SETTINGS)) {
            localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
        }
        if (!localStorage.getItem(this.STORAGE_KEYS.CART)) {
            localStorage.setItem(this.STORAGE_KEYS.CART, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.STORAGE_KEYS.WISHLIST)) {
            localStorage.setItem(this.STORAGE_KEYS.WISHLIST, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.STORAGE_KEYS.COMPARE)) {
            localStorage.setItem(this.STORAGE_KEYS.COMPARE, JSON.stringify([]));
        }

        if (!this.getCurrentUser()) {
            this.setCurrentUser({
                id: 'usr-1',
                name: 'Anvar Qosimov',
                phone: '+998 90 555-11-22',
                email: 'anvar@gmail.com',
                role: 'user',
                defaultAddress: "Chilonzor 7-mavze, 12-uy, 45-xonadon",
                district: 'Chilonzor',
                lat: 41.2750,
                lng: 69.2100
            });
        }
    }

    subscribe(eventType, callback) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }
        this.listeners.get(eventType).add(callback);

        return () => {
            const list = this.listeners.get(eventType);
            if (list) list.delete(callback);
        };
    }

    notify(eventType, payload = {}, broadcast = true) {
        if (this.listeners.has(eventType)) {
            this.listeners.get(eventType).forEach(cb => {
                try {
                    cb(payload);
                } catch (e) {
                    console.error(`Event listener error on ${eventType}:`, e);
                }
            });
        }

        if (this.listeners.has('*')) {
            this.listeners.get('*').forEach(cb => {
                try { cb({ type: eventType, payload }); } catch (e) {}
            });
        }

        if (broadcast && this.broadcastChannel) {
            try {
                this.broadcastChannel.postMessage({ type: eventType, payload });
            } catch (e) {}
        }
    }

    // ==========================================
    // 1. DO'KONLAR (STORES) BOSHQARUVI
    // ==========================================
    getStores() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.STORES)) || [];
        } catch (e) {
            return INITIAL_STORES;
        }
    }

    getStoreById(id) {
        const stores = this.getStores();
        return stores.find(s => s.id === id) || null;
    }

    addStore(storeData) {
        const stores = this.getStores();
        const newStore = {
            id: storeData.id || `store-${Date.now()}`,
            name: storeData.name || 'Yangi Do‘kon',
            shortName: storeData.shortName || storeData.name,
            logo: storeData.logo || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=300&q=80',
            category: storeData.category || 'oziq-ovqat',
            address: storeData.address || 'Toshkent shahar',
            district: storeData.district || 'Chilonzor',
            phone: storeData.phone || '+998 71 200-00-00',
            workingHours: storeData.workingHours || '08:00 - 22:00',
            lat: parseFloat(storeData.lat) || 41.2721,
            lng: parseFloat(storeData.lng) || 69.2045,
            rating: parseFloat(storeData.rating) || 5.0,
            reviewsCount: parseInt(storeData.reviewsCount) || 0,
            deliveryTime: storeData.deliveryTime || '30 daqiqa',
            deliveryFee: parseInt(storeData.deliveryFee) || 15000,
            minOrder: parseInt(storeData.minOrder) || 30000,
            isActive: true,
            deliveryConditions: storeData.deliveryConditions || "Tezkor va sifatli yetkazib berish xizmati."
        };

        stores.unshift(newStore);
        localStorage.setItem(this.STORAGE_KEYS.STORES, JSON.stringify(stores));
        this.notify('STORES_UPDATED', { action: 'add', store: newStore });

        if (this.isBackendOnline) {
            fetch('/api/stores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newStore)
            }).catch(console.warn);
        }

        return newStore;
    }

    updateStore(id, storeData) {
        const stores = this.getStores();
        const idx = stores.findIndex(s => s.id === id);
        if (idx !== -1) {
            stores[idx] = { ...stores[idx], ...storeData };
            localStorage.setItem(this.STORAGE_KEYS.STORES, JSON.stringify(stores));
            this.notify('STORES_UPDATED', { action: 'update', store: stores[idx] });

            if (this.isBackendOnline) {
                fetch(`/api/stores/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(storeData)
                }).catch(console.warn);
            }
            return stores[idx];
        }
        return null;
    }

    deleteStore(id) {
        let stores = this.getStores();
        stores = stores.filter(s => s.id !== id);
        localStorage.setItem(this.STORAGE_KEYS.STORES, JSON.stringify(stores));
        this.notify('STORES_UPDATED', { action: 'delete', id });

        if (this.isBackendOnline) {
            fetch(`/api/stores/${id}`, { method: 'DELETE' }).catch(console.warn);
        }
        return true;
    }

    // ==========================================
    // 2. KATEGORIYALAR (CATEGORIES)
    // ==========================================
    getCategories() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.CATEGORIES)) || INITIAL_CATEGORIES;
        } catch (e) {
            return INITIAL_CATEGORIES;
        }
    }

    // ==========================================
    // 3. MAHSULOTLAR (PRODUCTS) BOSHQARUVI
    // ==========================================
    getProducts() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.PRODUCTS)) || [];
        } catch (e) {
            return INITIAL_PRODUCTS;
        }
    }

    getProductById(id) {
        const products = this.getProducts();
        return products.find(p => p.id === id) || null;
    }

    getProductsByStore(storeId) {
        const products = this.getProducts();
        return products.filter(p => p.storeId === storeId);
    }

    addProduct(productData) {
        const products = this.getProducts();
        const price = parseInt(productData.price) || 0;
        const originalPrice = parseInt(productData.originalPrice) || price;
        let discountPercent = parseInt(productData.discountPercent) || 0;
        if (originalPrice > price && discountPercent === 0) {
            discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
        }

        const newProduct = {
            id: productData.id || `p-${Date.now()}`,
            name: productData.name || 'Yangi Mahsulot',
            brand: productData.brand || 'Original',
            category: productData.category || 'smartfonlar',
            storeId: productData.storeId || 'store-1',
            storeName: productData.storeName || 'Ulash Supermarket',
            price: price,
            originalPrice: originalPrice,
            discountPercent: discountPercent,
            stock: parseInt(productData.stock) || 10,
            rating: parseFloat(productData.rating) || 5.0,
            reviewsCount: 0,
            image: productData.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
            description: productData.description || 'Sifatli va kafolatlangan mahsulot.',
            isFeatured: !!productData.isFeatured,
            badge: productData.badge || 'Yangi',
            specs: productData.specs || {}
        };

        products.unshift(newProduct);
        localStorage.setItem(this.STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        this.notify('PRODUCTS_UPDATED', { action: 'add', product: newProduct });

        if (this.isBackendOnline) {
            fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct)
            }).catch(console.warn);
        }

        return newProduct;
    }

    updateProduct(id, productData) {
        const products = this.getProducts();
        const idx = products.findIndex(p => p.id === id);
        if (idx !== -1) {
            products[idx] = { ...products[idx], ...productData };
            localStorage.setItem(this.STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
            this.notify('PRODUCTS_UPDATED', { action: 'update', product: products[idx] });

            if (this.isBackendOnline) {
                fetch(`/api/products/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                }).catch(console.warn);
            }
            return products[idx];
        }
        return null;
    }

    deleteProduct(id) {
        let products = this.getProducts();
        products = products.filter(p => p.id !== id);
        localStorage.setItem(this.STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        this.notify('PRODUCTS_UPDATED', { action: 'delete', id });

        if (this.isBackendOnline) {
            fetch(`/api/products/${id}`, { method: 'DELETE' }).catch(console.warn);
        }
        return true;
    }

    // ==========================================
    // 4. BUYURTMALAR (ORDERS — 6 BOSQICHLI)
    // ==========================================
    getOrders() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ORDERS)) || [];
        } catch (e) {
            return INITIAL_ORDERS;
        }
    }

    getOrderById(id) {
        const orders = this.getOrders();
        return orders.find(o => o.id === id) || null;
    }

    createOrder(orderData) {
        const orders = this.getOrders();
        const now = new Date().toISOString();
        const orderId = orderData.id || `ORD-${Date.now().toString().slice(-4)}`;

        const newOrder = {
            id: orderId,
            createdAt: now,
            customer: orderData.customer || {
                name: 'Mijoz',
                phone: '+998 90 000-00-00',
                address: 'Toshkent sh.',
                district: 'Chilonzor',
                lat: 41.2750,
                lng: 69.2100
            },
            items: orderData.items || [],
            subtotal: orderData.subtotal || 0,
            deliveryFee: orderData.deliveryFee || 0,
            discountApplied: orderData.discountApplied || 0,
            promoCode: orderData.promoCode || null,
            total: orderData.total || 0,
            paymentMethod: orderData.paymentMethod || 'Naqd pul',
            paymentStatus: orderData.paymentStatus || 'Kutilmoqda',
            storeId: orderData.storeId || 'store-1',
            storeName: orderData.storeName || 'Ulash Market',
            distanceKm: orderData.distanceKm || 2.0,
            status: 'Buyurtma yaratildi', // 1-bosqich
            courierId: null,
            courierName: null,
            courierPhone: null,
            statusHistory: [
                {
                    status: 'Buyurtma yaratildi',
                    time: now,
                    note: 'Mijoz tomonidan buyurtma muvaffaqiyatli rasmiylashtirildi'
                }
            ]
        };

        orders.unshift(newOrder);
        localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(orders));

        // Ombordagi mahsulot qoldig'ini yangilash
        newOrder.items.forEach(it => {
            const p = this.getProductById(it.productId);
            if (p) {
                const newStock = Math.max(0, (p.stock || 0) - it.quantity);
                this.updateProduct(p.id, { stock: newStock });
            }
        });

        // Savatni tozalash
        this.clearCart();

        this.notify('ORDER_CREATED', { order: newOrder });

        if (this.isBackendOnline) {
            fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newOrder)
            }).catch(console.warn);
        }

        return newOrder;
    }

    updateOrderStatus(orderId, newStatus, note = '') {
        const orders = this.getOrders();
        const order = orders.find(o => o.id === orderId);
        if (!order) return null;

        const now = new Date().toISOString();
        order.status = newStatus;
        if (!order.statusHistory) order.statusHistory = [];

        order.statusHistory.push({
            status: newStatus,
            time: now,
            note: note || `Buyurtma holati yangilandi: ${newStatus}`
        });

        if (newStatus === 'Buyurtma yetkazildi') {
            order.paymentStatus = 'To‘langan';
            if (order.courierId) {
                this.recordCourierEarning(order.courierId, 15000);
            }
        }

        localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        this.notify('ORDER_STATUS_CHANGED', { order, newStatus });

        if (this.isBackendOnline) {
            fetch(`/api/orders/${orderId}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, note })
            }).catch(console.warn);
        }

        return order;
    }

    // Kuryer tomonidan atomar qabul qilish
    acceptOrderByCourier(orderId, courier) {
        const orders = this.getOrders();
        const order = orders.find(o => o.id === orderId);
        if (!order) return { success: false, message: 'Buyurtma topilmadi' };

        // Bir vaqtda faqat bitta kuryer qabul qiladi
        if (order.courierId && order.courierId !== courier.id) {
            return { success: false, message: 'Ushbu buyurtma allaqachon boshqa kuryer tomonidan qabul qilingan!' };
        }

        const now = new Date().toISOString();
        order.courierId = courier.id;
        order.courierName = courier.name;
        order.courierPhone = courier.phone;
        order.status = 'Kuryer qabul qildi'; // 3-bosqich

        if (!order.statusHistory) order.statusHistory = [];
        order.statusHistory.push({
            status: 'Kuryer qabul qildi',
            time: now,
            note: `Kuryer ${courier.name} (${courier.phone}) buyurtmani qabul qildi`
        });

        localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        this.notify('ORDER_ACCEPTED', { order, courier });

        if (this.isBackendOnline) {
            fetch(`/api/orders/${orderId}/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courierId: courier.id,
                    courierName: courier.name,
                    courierPhone: courier.phone
                })
            }).catch(console.warn);
        }

        return { success: true, order };
    }

    cancelOrder(orderId, reason = 'Mijoz / Admin tomonidan bekor qilindi') {
        const orders = this.getOrders();
        const order = orders.find(o => o.id === orderId);
        if (!order) return null;

        order.status = 'Bekor qilindi';
        const now = new Date().toISOString();
        if (!order.statusHistory) order.statusHistory = [];
        order.statusHistory.push({
            status: 'Bekor qilindi',
            time: now,
            note: reason
        });

        // Ombordagi mahsulot sonini tiklash
        if (order.items) {
            order.items.forEach(it => {
                const p = this.getProductById(it.productId);
                if (p) {
                    this.updateProduct(p.id, { stock: (p.stock || 0) + it.quantity });
                }
            });
        }

        localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        this.notify('ORDER_STATUS_CHANGED', { order, newStatus: 'Bekor qilindi' });

        if (this.isBackendOnline) {
            fetch(`/api/orders/${orderId}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Bekor qilindi', note: reason })
            }).catch(console.warn);
        }

        return order;
    }

    // ==========================================
    // 5. SAVATCHA (CART) BOSHQARUVI
    // ==========================================
    getCart() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.CART)) || [];
        } catch (e) {
            return [];
        }
    }

    addToCart(product, quantity = 1) {
        let cart = this.getCart();
        const idx = cart.findIndex(item => item.productId === product.id);

        if (idx !== -1) {
            cart[idx].quantity += quantity;
        } else {
            cart.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice || product.price,
                image: product.image,
                storeId: product.storeId || 'store-1',
                storeName: product.storeName || 'Ulash Supermarket',
                quantity: quantity
            });
        }

        localStorage.setItem(this.STORAGE_KEYS.CART, JSON.stringify(cart));
        this.notify('CART_UPDATED', { cart, addedItem: product });
        return cart;
    }

    updateCartQuantity(productId, quantity) {
        let cart = this.getCart();
        if (quantity <= 0) {
            cart = cart.filter(item => item.productId !== productId);
        } else {
            const item = cart.find(i => i.productId === productId);
            if (item) item.quantity = quantity;
        }

        localStorage.setItem(this.STORAGE_KEYS.CART, JSON.stringify(cart));
        this.notify('CART_UPDATED', { cart });
        return cart;
    }

    removeFromCart(productId) {
        let cart = this.getCart().filter(item => item.productId !== productId);
        localStorage.setItem(this.STORAGE_KEYS.CART, JSON.stringify(cart));
        this.notify('CART_UPDATED', { cart });
        return cart;
    }

    clearCart() {
        localStorage.setItem(this.STORAGE_KEYS.CART, JSON.stringify([]));
        this.notify('CART_UPDATED', { cart: [] });
    }

    getCartTotal() {
        const cart = this.getCart();
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    getCartCount() {
        const cart = this.getCart();
        return cart.reduce((count, item) => count + item.quantity, 0);
    }

    // ==========================================
    // 6. SEVIMLILAR (WISHLIST) VA SOLISHTIRISH (COMPARE)
    // ==========================================
    getWishlist() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.WISHLIST)) || [];
        } catch (e) {
            return [];
        }
    }

    isWishlisted(productId) {
        return this.getWishlist().includes(productId);
    }

    toggleWishlist(productId) {
        let list = this.getWishlist();
        let added = false;
        if (list.includes(productId)) {
            list = list.filter(id => id !== productId);
        } else {
            list.push(productId);
            added = true;
        }
        localStorage.setItem(this.STORAGE_KEYS.WISHLIST, JSON.stringify(list));
        this.notify('WISHLIST_UPDATED', { list, productId, added });
        return added;
    }

    getCompareList() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.COMPARE)) || [];
        } catch (e) {
            return [];
        }
    }

    isCompared(productId) {
        return this.getCompareList().includes(productId);
    }

    toggleCompare(productId) {
        let list = this.getCompareList();
        let added = false;
        if (list.includes(productId)) {
            list = list.filter(id => id !== productId);
        } else {
            if (list.length >= 4) {
                alert("Bir vaqtning o'zida maksimal 4 ta mahsulotni solishtirish mumkin!");
                return false;
            }
            list.push(productId);
            added = true;
        }
        localStorage.setItem(this.STORAGE_KEYS.COMPARE, JSON.stringify(list));
        this.notify('COMPARE_UPDATED', { list, productId, added });
        return added;
    }

    clearCompare() {
        localStorage.setItem(this.STORAGE_KEYS.COMPARE, JSON.stringify([]));
        this.notify('COMPARE_UPDATED', { list: [] });
    }

    // ==========================================
    // 7. PROMO-KODLAR (PROMOS)
    // ==========================================
    getPromos() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.PROMOS)) || INITIAL_PROMOS;
        } catch (e) {
            return INITIAL_PROMOS;
        }
    }

    validatePromo(code, subtotal) {
        const cleanCode = (code || '').trim().toUpperCase();
        const promos = this.getPromos();
        const promo = promos.find(p => p.code === cleanCode && p.isActive);

        if (!promo) {
            return { valid: false, error: 'Bunday promo-kod mavjud emas yoki muddati o‘tgan' };
        }

        if (subtotal < (promo.minOrder || 0)) {
            return {
                valid: false,
                error: `Ushbu promo-kod kamida ${(promo.minOrder).toLocaleString()} so‘mlik xaridlar uchun amal qiladi`
            };
        }

        const discountAmount = Math.round(subtotal * (promo.discountPercent / 100));
        return {
            valid: true,
            code: promo.code,
            discountPercent: promo.discountPercent,
            discountAmount: discountAmount,
            message: `Ajoyib! ${promo.discountPercent}% chegirma qo‘llandi (-${discountAmount.toLocaleString()} so‘m)`
        };
    }

    addPromo(promoData) {
        const promos = this.getPromos();
        const newPromo = {
            id: `prm-${Date.now()}`,
            code: (promoData.code || '').trim().toUpperCase(),
            discountPercent: parseInt(promoData.discountPercent) || 10,
            minOrder: parseInt(promoData.minOrder) || 100000,
            expiresAt: promoData.expiresAt || '2026-12-31',
            isActive: true
        };
        promos.push(newPromo);
        localStorage.setItem(this.STORAGE_KEYS.PROMOS, JSON.stringify(promos));
        this.notify('PROMOS_UPDATED', { promos });

        if (this.isBackendOnline) {
            fetch('/api/promos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPromo)
            }).catch(console.warn);
        }

        return newPromo;
    }

    deletePromo(id) {
        let promos = this.getPromos().filter(p => p.id !== id);
        localStorage.setItem(this.STORAGE_KEYS.PROMOS, JSON.stringify(promos));
        this.notify('PROMOS_UPDATED', { promos });

        if (this.isBackendOnline) {
            fetch(`/api/promos/${id}`, { method: 'DELETE' }).catch(console.warn);
        }
    }

    // ==========================================
    // 8. SHARHLAR VA BAHOLAR (REVIEWS)
    // ==========================================
    getReviews() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.REVIEWS)) || INITIAL_REVIEWS;
        } catch (e) {
            return INITIAL_REVIEWS;
        }
    }

    getProductReviews(productId) {
        return this.getReviews().filter(r => r.productId === productId);
    }

    addReview(reviewData) {
        const reviews = this.getReviews();
        const newRev = {
            id: `rev-${Date.now()}`,
            productId: reviewData.productId,
            userName: reviewData.userName || 'Mijoz',
            rating: parseInt(reviewData.rating) || 5,
            comment: reviewData.comment || '',
            createdAt: new Date().toISOString().split('T')[0]
        };

        reviews.unshift(newRev);
        localStorage.setItem(this.STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));

        // Mahsulot reytingini yangilash
        const prodReviews = reviews.filter(r => r.productId === reviewData.productId);
        const avgRating = (prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length).toFixed(1);
        this.updateProduct(reviewData.productId, {
            rating: parseFloat(avgRating),
            reviewsCount: prodReviews.length
        });

        this.notify('REVIEW_ADDED', { review: newRev });

        if (this.isBackendOnline) {
            fetch(`/api/products/${reviewData.productId}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData)
            }).catch(console.warn);
        }

        return newRev;
    }

    // ==========================================
    // 9. KURYERLAR, FOYDALANUVCHILAR VA SOZLAMALAR
    // ==========================================
    getCouriers() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.COURIERS)) || INITIAL_COURIERS;
        } catch (e) {
            return INITIAL_COURIERS;
        }
    }

    addCourier(courierData) {
        const couriers = this.getCouriers();
        const newCourier = {
            id: `cour-${Date.now()}`,
            name: courierData.name || 'Yangi Kuryer',
            phone: courierData.phone || '+998 90 000-00-00',
            email: courierData.email || '',
            transport: courierData.transport || 'Skuter',
            rating: 5.0,
            completedOrders: 0,
            earningsTotal: 0,
            status: 'online',
            lat: 41.2721,
            lng: 69.2045,
            assignedStoreId: courierData.assignedStoreId || 'store-1'
        };

        couriers.push(newCourier);
        localStorage.setItem(this.STORAGE_KEYS.COURIERS, JSON.stringify(couriers));
        this.notify('COURIERS_UPDATED', { couriers });

        if (this.isBackendOnline) {
            fetch('/api/couriers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCourier)
            }).catch(console.warn);
        }

        return newCourier;
    }

    recordCourierEarning(courierId, amount = 15000) {
        const couriers = this.getCouriers();
        const c = couriers.find(cr => cr.id === courierId);
        if (c) {
            c.completedOrders = (c.completedOrders || 0) + 1;
            c.earningsTotal = (c.earningsTotal || 0) + amount;
            c.status = 'online';
            localStorage.setItem(this.STORAGE_KEYS.COURIERS, JSON.stringify(couriers));
            this.notify('COURIERS_UPDATED', { couriers });
        }
    }

    getUsers() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.USERS)) || INITIAL_USERS;
        } catch (e) {
            return INITIAL_USERS;
        }
    }

    getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER));
        } catch (e) {
            return null;
        }
    }

    setCurrentUser(user) {
        localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        this.notify('USER_CHANGED', { user });
    }

    logout() {
        localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER);
        this.notify('USER_CHANGED', { user: null });
    }

    getSettings() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.SETTINGS)) || INITIAL_SETTINGS;
        } catch (e) {
            return INITIAL_SETTINGS;
        }
    }

    updateSettings(newSettings) {
        const current = this.getSettings();
        const updated = { ...current, ...newSettings };
        localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
        this.notify('SETTINGS_UPDATED', { settings: updated });

        if (this.isBackendOnline) {
            fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated)
            }).catch(console.warn);
        }

        return updated;
    }
}

// Global yagona namuna (Singleton)
window.ulashStore = new UlashStore();
