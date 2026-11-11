/**
 * ULASH MARKET - Firebase Cloud Firestore & Auth Xizmati
 * Real-time bulutli sinxronizatsiya (Real-time Cloud Sync)
 */

const FirebaseService = {
    // Tizim Firebase bilan ulanganmi yoki yo'qligini tekshirish
    isConnected() {
        return window.FirebaseState && window.FirebaseState.isConfigured;
    },

    init() {
        if (!this.isConnected()) return;

        console.log("🔥 Firebase Cloud Sync faollashtirilmoqda...");
        this.listenToOrders();
        this.listenToProducts();
    },

    // 1. Buyurtmalarni real-time kuzatish (Cloud Firestore onSnapshot)
    listenToOrders() {
        if (!this.isConnected()) return;
        const db = window.FirebaseState.db;

        db.collection('orders').orderBy('createdAt', 'desc')
            .onSnapshot((snapshot) => {
                const cloudOrders = [];
                snapshot.forEach(doc => {
                    cloudOrders.push({ id: doc.id, ...doc.data() });
                });

                if (cloudOrders.length > 0) {
                    // Mahalliy store-ni yangilash
                    localStorage.setItem(window.ulashStore.STORAGE_KEYS.ORDERS, JSON.stringify(cloudOrders));
                    window.ulashStore.notify('ORDERS_UPDATED', cloudOrders, false);
                }
            }, (error) => {
                console.error("Firestore Orders xatosi:", error);
            });
    },

    // 2. Mahsulotlarni real-time kuzatish
    listenToProducts() {
        if (!this.isConnected()) return;
        const db = window.FirebaseState.db;

        db.collection('products')
            .onSnapshot((snapshot) => {
                const cloudProducts = [];
                snapshot.forEach(doc => {
                    cloudProducts.push({ id: doc.id, ...doc.data() });
                });

                if (cloudProducts.length > 0) {
                    localStorage.setItem(window.ulashStore.STORAGE_KEYS.PRODUCTS, JSON.stringify(cloudProducts));
                    window.ulashStore.notify('PRODUCTS_UPDATED', cloudProducts, false);
                }
            }, (error) => {
                console.error("Firestore Products xatosi:", error);
            });
    },

    // 3. Yangi buyurtmani Firestore ga saqlash
    async createOrder(orderData) {
        if (!this.isConnected()) {
            return window.ulashStore.createOrder(orderData);
        }

        try {
            const db = window.FirebaseState.db;
            const docRef = await db.collection('orders').add(orderData);
            return { id: docRef.id, ...orderData };
        } catch (err) {
            console.error("Firestore createOrder xatosi:", err);
            return window.ulashStore.createOrder(orderData);
        }
    },

    // 4. Kuryer buyurtmani qabul qilishi (Firestore tranzaksiya / update)
    async acceptOrder(orderId, courier) {
        if (!this.isConnected()) {
            return window.ulashStore.courierAcceptOrder(orderId, courier);
        }

        try {
            const db = window.FirebaseState.db;
            const orderRef = db.collection('orders').doc(orderId);
            const doc = await orderRef.get();

            if (!doc.exists) return { success: false, message: "Buyurtma topilmadi" };
            const data = doc.data();

            if (data.status !== 'Yangi buyurtma') {
                return { success: false, message: "Bu buyurtma allaqachon boshqa kuryer tomonidan olingan!" };
            }

            await orderRef.update({
                status: 'Kuryer qabul qildi',
                courierId: courier.id,
                courierName: courier.name,
                courierPhone: courier.phone,
                statusHistory: firebase.firestore.FieldValue.arrayUnion({
                    status: 'Kuryer qabul qildi',
                    time: new Date().toISOString(),
                    note: `Kuryer ${courier.name} buyurtmani qabul qildi.`
                })
            });

            return { success: true };
        } catch (err) {
            console.error("Firestore acceptOrder xatosi:", err);
            return window.ulashStore.courierAcceptOrder(orderId, courier);
        }
    },

    // 5. Buyurtma holatini yangilash (Yo'lda / Yetkazildi)
    async updateStatus(orderId, newStatus, note = '') {
        if (!this.isConnected()) {
            return window.ulashStore.updateOrderStatus(orderId, newStatus, note);
        }

        try {
            const db = window.FirebaseState.db;
            await db.collection('orders').doc(orderId).update({
                status: newStatus,
                statusHistory: firebase.firestore.FieldValue.arrayUnion({
                    status: newStatus,
                    time: new Date().toISOString(),
                    note: note || `Holat: ${newStatus}`
                })
            });
            return true;
        } catch (err) {
            console.error("Firestore updateStatus xatosi:", err);
            return window.ulashStore.updateOrderStatus(orderId, newStatus, note);
        }
    }
};

window.firebaseService = FirebaseService;
