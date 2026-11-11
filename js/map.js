/**
 * ULASH MARKET - Xarita va Do'konlar Logistikasi (Map & Delivery Logistics)
 * OpenStreetMap & Leaflet.js orqali interaktiv xaritalar, eng yaqin do'konni aniqlash va yo'nalishlar
 */

const UlashMap = {
    maps: {},
    markers: {},

    // Toshkent markaziy koordinatalari
    TASHKENT_CENTER: [41.2995, 69.2401],

    // Haversine formulasi bo'yicha masofani hisoblash (km)
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Yer radiusi (km)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return parseFloat((R * c).toFixed(1));
    },

    findNearestStore(lat, lng) {
        const stores = window.ulashStore.getStores().filter(s => s.isActive !== false);
        if (!stores.length) return null;

        let nearest = null;
        let minDistance = Infinity;

        stores.forEach(store => {
            const dist = this.calculateDistance(lat, lng, store.lat, store.lng);
            if (dist < minDistance) {
                minDistance = dist;
                nearest = { ...store, distanceKm: dist };
            }
        });

        return nearest;
    },

    // Barcha do'konlar va filiallar interaktiv xaritasi
    initStoresMap(containerId = 'stores-map-container') {
        const container = document.getElementById(containerId);
        if (!container) return null;

        if (this.maps[containerId]) {
            this.maps[containerId].remove();
        }

        const map = L.map(containerId, {
            scrollWheelZoom: false
        }).setView(this.TASHKENT_CENTER, 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap | ULASH MARKET',
            maxZoom: 19
        }).addTo(map);

        this.maps[containerId] = map;
        this.renderStoreMarkers(map);

        setTimeout(() => map.invalidateSize(), 300);
        return map;
    },

    renderStoreMarkers(map) {
        const stores = window.ulashStore.getStores();
        const bounds = [];

        stores.forEach(store => {
            const marker = L.marker([store.lat, store.lng], {
                icon: L.divIcon({
                    className: 'custom-store-marker',
                    html: `
                        <div class="w-10 h-10 rounded-2xl bg-white shadow-xl border-2 border-blue-600 flex items-center justify-center overflow-hidden hover:scale-110 transition-transform">
                            <img src="${store.logo}" alt="${store.name}" class="w-full h-full object-cover">
                        </div>
                    `,
                    iconSize: [40, 40],
                    iconAnchor: [20, 20]
                })
            }).addTo(map);

            const popupHtml = `
                <div class="p-2 min-w-[240px]">
                    <div class="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                        <img src="${store.logo}" class="w-8 h-8 rounded-lg object-cover border border-slate-200">
                        <div>
                            <h4 class="font-bold text-slate-800 text-xs">${store.name}</h4>
                            <span class="text-[10px] text-amber-500 font-bold">★ ${store.rating} (${store.reviewsCount} sharh)</span>
                        </div>
                    </div>
                    <div class="space-y-1 text-[11px] text-slate-600">
                        <p>📍 <b>Manzil:</b> ${store.address}</p>
                        <p>🕒 <b>Ish vaqti:</b> ${store.workingHours}</p>
                        <p>⚡ <b>Yetkazish:</b> ${store.deliveryTime} (${(store.deliveryFee || 15000).toLocaleString()} so‘m)</p>
                        <p>📞 <b>Telefon:</b> <a href="tel:${store.phone}" class="text-blue-600 font-semibold underline">${store.phone}</a></p>
                    </div>
                    <div class="mt-2.5 pt-2 border-t border-slate-100">
                        <button onclick="window.ulashCatalog.filterByStore('${store.id}'); window.ulashApp.navigateTo('catalog')" class="w-full py-1.5 bg-blue-600 text-white rounded-lg font-bold text-[11px] hover:bg-blue-700 transition">
                            Do‘kon tovarlarini ko‘rish ➔
                        </button>
                    </div>
                </div>
            `;
            marker.bindPopup(popupHtml);
            bounds.push([store.lat, store.lng]);
        });

        if (bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    },

    // Buyurtma berishda manzilni belgilash xaritasi
    initCheckoutMapPicker(containerId, initialLat = 41.2800, initialLng = 69.2200, onLocationSelected) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        if (this.maps[containerId]) {
            this.maps[containerId].remove();
        }

        const map = L.map(containerId).setView([initialLat, initialLng], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap | ULASH MARKET',
            maxZoom: 19
        }).addTo(map);

        this.maps[containerId] = map;

        // Do'konlarni yashil/ko'k doira bilan ko'rsatamiz
        const stores = window.ulashStore.getStores();
        stores.forEach(s => {
            L.circleMarker([s.lat, s.lng], {
                radius: 8,
                fillColor: '#2563eb',
                color: '#ffffff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.85
            }).addTo(map).bindTooltip(`🏬 ${s.shortName || s.name}`, { permanent: false });
        });

        // Foydalanuvchi tanlagan manzil (suriluvchi qizil pin)
        let userMarker = L.marker([initialLat, initialLng], {
            draggable: true,
            icon: L.divIcon({
                className: 'custom-user-marker',
                html: `<div class="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center text-white font-bold shadow-2xl border-2 border-white ring-4 ring-red-200 animate-pulse text-lg">📍</div>`,
                iconSize: [36, 36],
                iconAnchor: [18, 36]
            })
        }).addTo(map);

        const updatePosition = (lat, lng) => {
            userMarker.setLatLng([lat, lng]);
            const nearestStore = this.findNearestStore(lat, lng);
            if (onLocationSelected) {
                onLocationSelected({
                    lat,
                    lng,
                    nearestStore,
                    distanceKm: nearestStore ? nearestStore.distanceKm : 2.0
                });
            }
        };

        updatePosition(initialLat, initialLng);

        userMarker.on('dragend', (e) => {
            const pos = e.target.getLatLng();
            updatePosition(pos.lat, pos.lng);
        });

        map.on('click', (e) => {
            updatePosition(e.latlng.lat, e.latlng.lng);
        });

        setTimeout(() => map.invalidateSize(), 300);
        return map;
    },

    // 6-bosqichli buyurtmani kuzatish xaritasi (Do'kon -> Kuryer -> Mijoz)
    initOrderTrackingMap(containerId, storeLat, storeLng, customerLat, customerLng, courierLat, courierLng, status) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        if (this.maps[containerId]) {
            this.maps[containerId].remove();
        }

        const map = L.map(containerId, { scrollWheelZoom: false });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap | ULASH Express',
            maxZoom: 19
        }).addTo(map);

        this.maps[containerId] = map;

        // 1. Do'kon markeri
        L.marker([storeLat, storeLng], {
            icon: L.divIcon({
                className: 'store-track-icon',
                html: `<div class="px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-md border-2 border-white flex items-center gap-1">🏬 Do‘kon</div>`,
                iconAnchor: [35, 15]
            })
        }).addTo(map);

        // 2. Mijoz manzili markeri
        L.marker([customerLat, customerLng], {
            icon: L.divIcon({
                className: 'cust-track-icon',
                html: `<div class="px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded-lg shadow-md border-2 border-white flex items-center gap-1">📍 Yetkazish Manzili</div>`,
                iconAnchor: [55, 15]
            })
        }).addTo(map);

        let activePoints = [[storeLat, storeLng], [customerLat, customerLng]];

        // 3. Kuryer harakati (agar qabul qilingan yoki yo'lda bo'lsa)
        if (status === 'Kuryer olib ketdi' || status === 'Kuryer qabul qildi' || status === 'Mahsulot tayyorlandi') {
            const cPos = courierLat && courierLng ? [courierLat, courierLng] : [
                (storeLat * 0.4 + customerLat * 0.6),
                (storeLng * 0.4 + customerLng * 0.6)
            ];

            L.marker(cPos, {
                icon: L.divIcon({
                    className: 'courier-track-icon',
                    html: `<div class="w-11 h-11 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-xl border-2 border-white text-xl animate-bounce">🛵</div>`,
                    iconSize: [44, 44],
                    iconAnchor: [22, 22]
                })
            }).addTo(map).bindTooltip("Kuryer yo‘lda", { permanent: true, direction: 'top' });

            activePoints.push(cPos);
        }

        // Yo'l chizig'i
        L.polyline([[storeLat, storeLng], [customerLat, customerLng]], {
            color: '#2563eb',
            weight: 4,
            dashArray: '8, 8',
            opacity: 0.8
        }).addTo(map);

        map.fitBounds(activePoints, { padding: [45, 45] });
        setTimeout(() => map.invalidateSize(), 300);
        return map;
    }
};

window.ulashMap = UlashMap;
