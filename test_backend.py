#!/usr/bin/env python3
"""
ULASH MARKET - Backend & API Test Suite
Ushbu skript Flask REST API va barcha ma'lumotlar bazasi amallarini to'liq testdan o'tkazadi.
"""

import sys
import json
import sqlite3

# Windows konsolida UTF-8 ni sozlash
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import server

def run_tests():
    print("=" * 60)
    print("[TEST] ULASH MARKET TEST SUITE BOSHLANDI")
    print("=" * 60)

    # 1. Baza initsializatsiyasi
    server.init_db()
    conn = sqlite3.connect(server.DB_PATH)
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) FROM stores")
    stores_cnt = cur.fetchone()[0]
    assert stores_cnt >= 8, f"Kutilgan do'konlar soni >= 8, lekin {stores_cnt} ta"
    print(f"[OK] 1. Do'konlar bazasi tekshirildi: {stores_cnt} ta do'kon mavjud.")

    cur.execute("SELECT COUNT(*) FROM products")
    products_cnt = cur.fetchone()[0]
    assert products_cnt >= 18, f"Kutilgan mahsulotlar soni >= 18, lekin {products_cnt} ta"
    print(f"[OK] 2. Mahsulotlar bazasi tekshirildi: {products_cnt} ta mahsulot mavjud.")

    cur.execute("SELECT COUNT(*) FROM orders")
    orders_cnt = cur.fetchone()[0]
    assert orders_cnt >= 3, f"Kutilgan buyurtmalar soni >= 3, lekin {orders_cnt} ta"
    print(f"[OK] 3. Buyurtmalar bazasi tekshirildi: {orders_cnt} ta dastlabki buyurtma mavjud.")

    cur.execute("SELECT COUNT(*) FROM couriers")
    couriers_cnt = cur.fetchone()[0]
    assert couriers_cnt >= 3, f"Kutilgan kuryerlar soni >= 3, lekin {couriers_cnt} ta"
    print(f"[OK] 4. Kuryerlar bazasi tekshirildi: {couriers_cnt} ta kuryer mavjud.")

    cur.execute("SELECT COUNT(*) FROM promos")
    promos_cnt = cur.fetchone()[0]
    assert promos_cnt >= 3, f"Kutilgan promo-kodlar soni >= 3, lekin {promos_cnt} ta"
    print(f"[OK] 5. Promo-kodlar bazasi tekshirildi: {promos_cnt} ta promo-kod mavjud.")

    conn.close()

    # 2. Flask Test Client orqali API testlari
    app = server.app
    app.config['TESTING'] = True
    client = app.test_client()

    # A) Do'konlar API
    res = client.get('/api/stores')
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True and len(data['stores']) >= 8
    print("[OK] 6. GET /api/stores — Muvaffaqiyatli.")

    # B) Mahsulotlar API
    res = client.get('/api/products')
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True and len(data['products']) >= 18
    print("[OK] 7. GET /api/products — Muvaffaqiyatli.")

    # C) Promo-kodni tekshirish API
    res = client.post('/api/promos/validate', json={'code': 'ULASH10', 'subtotal': 150000})
    assert res.status_code == 200
    data = res.get_json()
    assert data['valid'] is True and data['discountAmount'] == 15000
    print("[OK] 8. POST /api/promos/validate — Muvaffaqiyatli (ULASH10 chegirmasi to'g'ri hisoblandi).")

    # D) Admin login API
    res = client.post('/api/auth/admin-login', json={'pin': 'admin123'})
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True and data['user']['role'] == 'admin'
    print("[OK] 9. POST /api/auth/admin-login — Muvaffaqiyatli (Direktor paroli qabul qilindi).")

    # E) Yangi buyurtma yaratish (6 bosqichli test)
    new_order_payload = {
        "id": "ORD-TEST-999",
        "customer": {
            "name": "Test Xaridor",
            "phone": "+998 90 999-99-99",
            "address": "Toshkent, Test ko'cha 1",
            "district": "Chilonzor",
            "lat": 41.2750,
            "lng": 69.2100
        },
        "items": [
            {
                "productId": "p-1",
                "name": "iPhone 16 Pro Max",
                "price": 16500000,
                "quantity": 1
            }
        ],
        "subtotal": 16500000,
        "deliveryFee": 0,
        "discountApplied": 0,
        "total": 16500000,
        "paymentMethod": "Naqd pul",
        "storeId": "store-3",
        "storeName": "Mediapark Bozor Elektronika"
    }

    res = client.post('/api/orders', json=new_order_payload)
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    print("[OK] 10. POST /api/orders — Yangi buyurtma yaratildi (1-bosqich: Buyurtma yaratildi).")

    # F) Kuryer tomonidan atomar qabul qilish
    res = client.post('/api/orders/ORD-TEST-999/accept', json={
        "courierId": "cour-1",
        "courierName": "Sardor Aliyev",
        "courierPhone": "+998 90 123-45-67"
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True and data['status'] == 'Kuryer qabul qildi'
    print("[OK] 11. POST /api/orders/accept — Kuryer buyurtmani atomar qabul qildi (3-bosqich).")

    # Boshqa kuryer olishga urinsa 409 xatolik qaytarishi kerak
    res2 = client.post('/api/orders/ORD-TEST-999/accept', json={
        "courierId": "cour-2",
        "courierName": "Jasur Karimov",
        "courierPhone": "+998 93 987-65-43"
    })
    assert res2.status_code == 409
    print("[OK] 12. Atomar qulflash tekshirildi: 2-kuryer qabul qila olmadi (409 Conflict).")

    # G) Buyurtma holatini yetkazildi deb belgilash (6-bosqich)
    res = client.post('/api/orders/ORD-TEST-999/status', json={
        "status": "Buyurtma yetkazildi",
        "note": "Mijozga eshik oldida topshirildi"
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data['status'] == 'Buyurtma yetkazildi'
    print("[OK] 13. POST /api/orders/status — Buyurtma yetkazildi (6-bosqich yakunlandi).")

    # H) Dashboard statistika API
    res = client.get('/api/stats')
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert data['stats']['totalOrders'] >= 4
    print("[OK] 14. GET /api/stats — Dashboard statistikasi to'g'ri qaytdi.")

    # I) Statik sahifa index.html
    res = client.get('/')
    assert res.status_code == 200
    assert b"ULASH MARKET" in res.data
    print("[OK] 15. GET / — Bosh sahifa index.html muvaffaqiyatli taqdim etildi.")

    print("=" * 60)
    print("BARCHA 15 TA TEST MUVAFFAQIYATLI O'TDI!")
    print("=" * 60)

if __name__ == '__main__':
    run_tests()
