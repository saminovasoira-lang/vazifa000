#!/usr/bin/env python3
"""
=============================================================================
ULASH MARKET — YAGONA ONLAYN MARKETPLACE (Flask Backend & REST API Server)
=============================================================================
Ushbu backend:
1. Python Flask orqali to'liq REST API va veb-server xizmatini bajaradi.
2. SQLite (ulash_market.db) bazasida do'konlar, mahsulotlar, buyurtmalar (6 bosqich),
   foydalanuvchilar, kuryerlar, sharhlar va promo-kodlarni saqlaydi.
3. Dastlabki ishga tushganda bazani avtomatik to'ldiradi (seed data).
4. Statik veb-fayllarni (HTML, CSS, JS) to'g'ridan-to'g'ri taqdim etadi.
5. Brauzerni avtomatik ochadi: http://localhost:8000
=============================================================================
"""

import os
import sys
import json
import sqlite3
import hashlib
import webbrowser
from datetime import datetime
from functools import wraps
from flask import Flask, request, jsonify, send_from_directory, g

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "ulash_market.db")
PORT = 8000

app = Flask(__name__, static_folder=BASE_DIR, static_url_path="")
app.config['SECRET_KEY'] = 'ulash_market_secret_key_2026_super_secure'

# -----------------------------------------------------------------------------
# DATABASE YORDAMCHILARI (SQLite Connection & Helper Functions)
# -----------------------------------------------------------------------------

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DB_PATH)
        db.row_factory = sqlite3.Row
        db.execute("PRAGMA foreign_keys = ON")
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def hash_password(password: str) -> str:
    """Parolni SHA-256 orqali xeshlaydi"""
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def row_to_dict(row):
    """SQLite qatorini Python dict formatiga o'tkazadi"""
    if row is None:
        return None
    d = dict(row)
    # JSON maydonlarni parse qilish
    for key in ['specs', 'specs_json', 'items', 'items_json', 'status_history', 'status_history_json', 'current_location']:
        if key in d and isinstance(d[key], str):
            try:
                clean_key = key.replace('_json', '')
                d[clean_key] = json.loads(d[key])
            except Exception:
                pass
    return d

# -----------------------------------------------------------------------------
# BAZANI YARATISH VA DASTLABKI MA'LUMOTLARNI TO'LDIRISH (SEEDING)
# -----------------------------------------------------------------------------

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # 1. Stores (Do'konlar) jadvali
    cur.execute("""
    CREATE TABLE IF NOT EXISTS stores (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        short_name TEXT,
        logo TEXT,
        category TEXT,
        address TEXT NOT NULL,
        district TEXT,
        phone TEXT,
        working_hours TEXT,
        lat REAL,
        lng REAL,
        rating REAL DEFAULT 5.0,
        reviews_count INTEGER DEFAULT 0,
        delivery_time TEXT,
        delivery_fee INTEGER DEFAULT 15000,
        min_order INTEGER DEFAULT 30000,
        is_active INTEGER DEFAULT 1,
        created_at TEXT
    )
    """)

    # 2. Categories (Kategoriyalar) jadvali
    cur.execute("""
    CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT,
        badge TEXT,
        color TEXT
    )
    """)

    # 3. Products (Mahsulotlar) jadvali
    cur.execute("""
    CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        brand TEXT,
        category TEXT NOT NULL,
        store_id TEXT,
        store_name TEXT,
        price INTEGER NOT NULL,
        original_price INTEGER,
        discount_percent INTEGER DEFAULT 0,
        stock INTEGER DEFAULT 10,
        rating REAL DEFAULT 5.0,
        reviews_count INTEGER DEFAULT 0,
        image TEXT,
        description TEXT,
        is_featured INTEGER DEFAULT 0,
        badge TEXT,
        specs_json TEXT,
        created_at TEXT,
        FOREIGN KEY (store_id) REFERENCES stores (id) ON DELETE SET NULL
    )
    """)

    # 4. Users (Foydalanuvchilar) jadvali
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user', -- 'user' | 'courier' | 'admin'
        default_address TEXT,
        district TEXT,
        lat REAL,
        lng REAL,
        created_at TEXT
    )
    """)

    # 5. Couriers (Kuryerlar) jadvali
    cur.execute("""
    CREATE TABLE IF NOT EXISTS couriers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        email TEXT,
        transport TEXT,
        rating REAL DEFAULT 5.0,
        completed_orders INTEGER DEFAULT 0,
        earnings_total INTEGER DEFAULT 0,
        status TEXT DEFAULT 'online', -- 'online' | 'busy' | 'offline'
        lat REAL,
        lng REAL,
        assigned_branch_id TEXT,
        created_at TEXT
    )
    """)

    # 6. Orders (Buyurtmalar — 6 bosqichli) jadvali
    cur.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_address TEXT NOT NULL,
        district TEXT,
        lat REAL,
        lng REAL,
        subtotal INTEGER NOT NULL,
        delivery_fee INTEGER DEFAULT 0,
        discount_applied INTEGER DEFAULT 0,
        promo_code TEXT,
        total INTEGER NOT NULL,
        payment_method TEXT,
        payment_status TEXT DEFAULT 'Kutilmoqda',
        store_id TEXT,
        store_name TEXT,
        distance_km REAL,
        status TEXT NOT NULL, -- 1. Buyurtma yaratildi | 2. Do‘kon tasdiqladi | 3. Kuryer qabul qildi | 4. Mahsulot tayyorlandi | 5. Kuryer olib ketdi | 6. Buyurtma yetkazildi | Bekor qilindi
        courier_id TEXT,
        courier_name TEXT,
        courier_phone TEXT,
        items_json TEXT NOT NULL,
        status_history_json TEXT NOT NULL,
        created_at TEXT
    )
    """)

    # 7. Reviews (Sharhlar) jadvali
    cur.execute("""
    CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        user_phone TEXT,
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at TEXT,
        FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
    )
    """)

    # 8. Promos (Promo-kodlar) jadvali
    cur.execute("""
    CREATE TABLE IF NOT EXISTS promos (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        discount_percent INTEGER DEFAULT 10,
        discount_amount INTEGER DEFAULT 0,
        min_order INTEGER DEFAULT 100000,
        expires_at TEXT,
        is_active INTEGER DEFAULT 1
    )
    """)

    # 9. Settings (Sozlamalar) jadvali
    cur.execute("""
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
    )
    """)

    conn.commit()

    # Dastlabki ma'lumotlar bor-yo'qligini tekshirish
    cur.execute("SELECT COUNT(*) FROM stores")
    stores_count = cur.fetchone()[0]

    if stores_count == 0:
        print("[ULASH-DB] Dastlabki ma'lumotlar bazaga kiritilmoqda (Seed Data)...")
        now = datetime.now().isoformat()

        # A) KATEGORIYALAR
        categories = [
            ('smartfonlar', 'Smartfon va gadjetlar', 'smartphone', 'Ommabop', 'blue'),
            ('noutbuklar', 'Noutbuk va kompyuterlar', 'laptop', 'Top', 'indigo'),
            ('maishiy-texnika', 'Maishiy texnika', 'tv', 'Kafolatli', 'sky'),
            ('kiyim', 'Kiyim va poyabzallar', 'shirt', 'Trend', 'rose'),
            ('oziq-ovqat', 'Oziq-ovqat va ichimliklar', 'shopping-bag', 'Tezkor', 'emerald'),
            ('gozallik', "Go'zallik va salomatlik", 'sparkles', 'Original', 'amber'),
            ('sport', 'Sport va hordiq', 'dumbbell', 'Yangi', 'cyan')
        ]
        cur.executemany("INSERT INTO categories VALUES (?, ?, ?, ?, ?)", categories)

        # B) DO'KONLAR (STORES)
        stores = [
            ('store-1', 'Korzinka Supermarket', 'Korzinka', 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=300&q=80', 'oziq-ovqat', "Toshkent sh., Chilonzor tumani, Qatortol ko'chasi 45-uy", 'Chilonzor', '+998 71 140-14-14', '08:00 - 23:00', 41.2721, 69.2045, 4.9, 1420, '25-35 daqiqa', 12000, 40000, 1, now),
            ('store-2', 'Makro Supermarket City', 'Makro', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80', 'oziq-ovqat', "Toshkent sh., Yunusobod tumani, Amir Temur shoh ko'chasi 112-uy", 'Yunusobod', '+998 71 205-12-34', '08:00 - 23:00', 41.3542, 69.2889, 4.8, 980, '30-40 daqiqa', 15000, 35000, 1, now),
            ('store-3', 'Mediapark Bozor Elektronika', 'Mediapark', 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=300&q=80', 'smartfonlar', "Toshkent sh., Shayxontohur tumani, Qoratosh ko'chasi 11A", 'Shayxontohur', '+998 71 203-33-33', '09:00 - 22:00', 41.3111, 69.2325, 4.95, 2150, '35-50 daqiqa', 20000, 100000, 1, now),
            ('store-4', 'Idea Maishiy Texnika', 'Idea', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80', 'maishiy-texnika', "Toshkent sh., Mirzo Ulug'bek tumani, Buyuk Ipak Yo'li ko'chasi 78-uy", "Mirzo Ulug'bek", '+998 71 230-77-99', '09:00 - 21:00', 41.3267, 69.3312, 4.85, 870, '40-60 daqiqa', 25000, 150000, 1, now),
            ('store-5', 'Terra Pro & Zara Fashion', 'Terra Pro', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=300&q=80', 'kiyim', "Toshkent sh., Mirobod tumani, Shahrisabz ko'chasi 10-uy", 'Mirobod', '+998 71 200-88-11', '10:00 - 22:00', 41.3005, 69.2780, 4.75, 640, '30-45 daqiqa', 15000, 50000, 1, now),
            ('store-6', 'Safia Cafe & Bakery', 'Safia', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80', 'oziq-ovqat', "Toshkent sh., Yakkasaroy tumani, Shota Rustaveli ko'chasi 32-uy", 'Yakkasaroy', '+998 71 200-50-50', '08:00 - 22:00', 41.2890, 69.2530, 4.92, 1890, '20-30 daqiqa', 10000, 30000, 1, now),
            ('store-7', 'Bellissimo Pizza & Burgers', 'Bellissimo', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80', 'oziq-ovqat', "Toshkent sh., Chilonzor 9-mavze, Bunyodkor ko'chasi 15-uy", 'Chilonzor', '+998 71 205-11-11', '10:00 - 02:00', 41.2820, 69.2120, 4.88, 3120, '25-35 daqiqa', 12000, 45000, 1, now),
            ('store-8', 'Bellstore Cosmetics & Perfumery', 'Bellstore', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80', 'gozallik', "Toshkent sh., Sergeli tumani, Yangisergeli ko'chasi 24-uy", 'Sergeli', '+998 71 200-44-00', '09:00 - 21:00', 41.2238, 69.2215, 4.82, 530, '35-50 daqiqa', 15000, 80000, 1, now)
        ]
        cur.executemany("INSERT INTO stores VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", stores)

        # C) MAHSULOTLAR (PRODUCTS)
        products = [
            (
                'p-1', 'iPhone 16 Pro Max 256GB Natural Titanium', 'Apple', 'smartfonlar',
                'store-3', 'Mediapark Bozor Elektronika', 16500000, 18200000, 9, 14, 4.9, 148,
                'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
                "Eng so'nggi A18 Pro chipiga ega flagman smartfon. Titan korpus, 48 MP asosiy kamera, 5x optik zoom va ajoyib avtonomlik. 1 yil rasmiy kafolat bilan.",
                1, 'Xit savdo',
                json.dumps({"Ekran": "6.9 dyuym Super Retina XDR OLED, 120Hz", "Protsessor": "Apple A18 Pro (3 nm)", "Doimiy xotira": "256 GB", "Kamera": "48 MP + 48 MP + 12 MP", "Batareya": "4685 mA/soat"}),
                now
            ),
            (
                'p-2', 'Samsung Galaxy S24 Ultra 12/512GB Titanium Gray', 'Samsung', 'smartfonlar',
                'store-3', 'Mediapark Bozor Elektronika', 14200000, 16000000, 11, 9, 4.8, 92,
                'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
                "Galaxy AI imkoniyatlari bilan boyitilgan titan korpusli super-flagman. S-Pen qalami, 200MP kamera va yorqin 2600 nit AMOLED displey.",
                1, 'AI Tavsiya',
                json.dumps({"Ekran": "6.8 dyuym Dynamic AMOLED 2X, 120Hz", "Protsessor": "Snapdragon 8 Gen 3 for Galaxy", "Xotira": "12 GB RAM / 512 GB ROM", "Kamera": "200 MP + 50 MP + 12 MP + 10 MP", "Batareya": "5000 mA/soat"}),
                now
            ),
            (
                'p-3', 'MacBook Air 13 M3 8-Core CPU / 16GB / 512GB Space Gray', 'Apple', 'noutbuklar',
                'store-3', 'Mediapark Bozor Elektronika', 15800000, 17500000, 10, 6, 4.95, 84,
                'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
                "Apple M3 chipi bilan quvvatlangan engil va kuchli ultrabuk. Kun bo'yi quvvatsiz ishlaydi (18 soatgacha). Silent fanless sovutish tizimi.",
                1, 'Top Tanlov',
                json.dumps({"Ekran": "13.6 dyuym Liquid Retina Display", "Chip": "Apple M3 (8 yadroli CPU, 10 yadroli GPU)", "Tezkor xotira": "16 GB", "SSD xotira": "512 GB", "Vazni": "1.24 kg"}),
                now
            ),
            (
                'p-4', 'Asus ROG Strix G16 i7-13650HX / RTX 4060 / 16GB / 1TB', 'Asus', 'noutbuklar',
                'store-3', 'Mediapark Bozor Elektronika', 17200000, 19800000, 13, 4, 4.85, 57,
                'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
                "Eng og'ir zamonaviy o'yinlar va 3D modellashtirish uchun mo'ljallangan qudratli o'yin noutbuki. 165Hz tezkor ROG Nebula displey.",
                0, 'Gaming',
                json.dumps({"Protsessor": "Intel Core i7-13650HX", "Videokarta": "NVIDIA GeForce RTX 4060 8GB", "Xotira": "16 GB DDR5 / 1 TB NVMe SSD", "Ekran": "16 dyuym FHD+ 165Hz 100% sRGB"}),
                now
            ),
            (
                'p-5', 'LG 55 OLED 4K Smart TV evo C3 Series (2024)', 'LG', 'maishiy-texnika',
                'store-4', 'Idea Maishiy Texnika', 13500000, 15900000, 15, 8, 4.92, 61,
                'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=80',
                "Mukammal qora rang va cheksiz kontrast beruvchi OLED evo matritsa. Dolby Vision va Dolby Atmos qo'llab-quvvatlaydi, 120Hz geyming rejimi mavjud.",
                1, 'Kinozal',
                json.dumps({"Diagonal": "55 dyuym (139 sm)", "Displey turi": "OLED evo 4K UHD", "Chastota": "120Hz (VRR, G-Sync, FreeSync)", "Operatsion tizim": "webOS 24"}),
                now
            ),
            (
                'p-6', 'Artel Inverter Konditsioner 12000 BTU Grand White', 'Artel', 'maishiy-texnika',
                'store-4', 'Idea Maishiy Texnika', 4600000, 5200000, 12, 18, 4.75, 115,
                'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
                "35 kv.m gacha bo'lgan xonalarni tez va tejamkor sovitish va isitish. A++ energiya tejamkorlik toifasi va past shovqin darajasi (21 dB). 3 yil to'liq kafolat.",
                0, 'Tejamkor',
                json.dumps({"Xona maydoni": "35 kv.m gacha", "Freon turi": "R32 ekologik toza", "Kompressor": "Inverter energiya tejovchi", "Kafolat": "3 yil rasmiy"}),
                now
            ),
            (
                'p-7', 'Sony WH-1000XM5 Shovqinni bekor qiluvchi quloqchin', 'Sony', 'smartfonlar',
                'store-3', 'Mediapark Bozor Elektronika', 4300000, 4900000, 12, 12, 4.93, 186,
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
                "Bozordagi eng kuchli faol shovqin bekor qilish (ANC) tizimi. 30 soatgacha to'xtovsiz musiqa tinglash va kristaldek toza mikrofon suhbati.",
                1, 'Premium Ovoz',
                json.dumps({"Batareya": "30 soat (ANC yoniq holda)", "Ulanish": "Bluetooth 5.2, LDAC, Hi-Res Audio", "Og'irligi": "250 gramm"}),
                now
            ),
            (
                'p-8', 'Nike Air Max 270 Black & White Original Krossovka', 'Nike', 'kiyim',
                'store-5', 'Terra Pro & Zara Fashion', 1450000, 1800000, 19, 22, 4.82, 143,
                'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
                "Nike brendining eng qulay kundalik krossovkasi. Tovondagi ulkan Max Air yostiqchasi qadamni nihoyatda yumshoq va elastik qiladi. Nafas oluvchi to'rli mato.",
                1, 'Trend 2026',
                json.dumps({"O'lchamlar": "40, 41, 42, 43, 44, 45", "Tepa qismi": "Yengil tekstil va mustahkam polimer", "Amortizatsiya": "Max Air 270 havo yostig'i"}),
                now
            ),
            (
                'p-9', 'Erkaklar uchun Klassik Paxta Kostyum-Shim Navy Blue', 'Zara', 'kiyim',
                'store-5', 'Terra Pro & Zara Fashion', 1850000, 2300000, 20, 11, 4.65, 42,
                'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
                "Yuqori sifatli Turkiya matosidan tikilgan zamonaviy slim-fit bichimli kostyum-shim. To'y, tantanalar va ish uchrashuvlari uchun ideal.",
                0, 'Klassika',
                json.dumps({"Tarkibi": "70% paxta, 25% viskoza, 5% elastan", "Bichimi": "Slim Fit", "Rang": "To'q ko'k (Navy)"}),
                now
            ),
            (
                'p-10', 'Lattafe Asad Eau de Parfum 100ml Erkaklar Atiri', 'Lattafa', 'gozallik',
                'store-8', 'Bellstore Cosmetics & Perfumery', 390000, 550000, 29, 28, 4.88, 230,
                'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
                "Sharqona qora qahva, vanil va xushbo'y ziravorlar notalari bilan boyitilgan, 24 soatdan ortiq saqlanuvchi hashamatli erkaklar parfyumi.",
                1, 'Bestseller',
                json.dumps({"Hajmi": "100 ml", "Turi": "Eau De Parfum", "Mustahkamligi": "24 soatgacha shleyfli", "Ishlab chiqarilgan": "BAA (Dubay)"}),
                now
            ),
            (
                'p-11', 'Dyson Airwrap Multi-Styler Complete Long Soch Shakllantirgich', 'Dyson', 'gozallik',
                'store-8', 'Bellstore Cosmetics & Perfumery', 7200000, 8100000, 11, 5, 4.96, 95,
                'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
                "Haddan tashqari qizdirmasdan soch turmaklovchi Coanda effekti. Sochni bir vaqtning o'zida quritadi va jiloli to'lqin hosil qiladi.",
                1, 'Top Brend',
                json.dumps({"Quvvat": "1300 Vt", "Nasatkalar": "6 xil professional nasadka", "Kafolat": "2 yil xalqaro kafolat"}),
                now
            ),
            (
                'p-12', 'Rio Mare Zaytun moyidagi Tuns balig‘i 3x80g (Italiya)', 'Rio Mare', 'oziq-ovqat',
                'store-1', 'Korzinka Supermarket', 98000, 120000, 18, 65, 4.9, 312,
                'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=800&q=80',
                "Toza zaytun moyida konservalangan, tabiiy oqsil va Omega-3 ga boy xushbo'y tuns balig'i filesi. Salatlar va pishiriqlar uchun a'lo tanlov.",
                0, 'Italiya',
                json.dumps({"Og'irligi": "3 dona x 80 gramm", "Tarkibi": "Sariq qanotli tunes, zaytun moyi, tuz", "Yaroqlilik muddati": "3 yil"}),
                now
            ),
            (
                'p-13', 'Lavazza Qualita Oro Tabiiy Donli Qahva 1kg', 'Lavazza', 'oziq-ovqat',
                'store-1', 'Korzinka Supermarket', 320000, 380000, 16, 35, 4.85, 177,
                'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80',
                "100% Markaziy va Janubiy Amerika Arabikasi donalari. Gullar va mevali nozik notalarga ega bo'lgan klassik italyancha espresso qahvasi.",
                0, '100% Arabica',
                json.dumps({"Og'irligi": "1000 gramm (1 kg)", "Qovurilish darajasi": "O'rtacha (Medium Roast)", "Turi": "Butun donli qahva"}),
                now
            ),
            (
                'p-14', 'Safia Qizil Baxmal (Red Velvet) Torti 1.2kg', 'Safia', 'oziq-ovqat',
                'store-6', 'Safia Cafe & Bakery', 175000, 210000, 17, 20, 4.94, 280,
                'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
                "Krem-chizli yumshoq qatlamlar va qizil nozik biskvit. Safia qandolatchiligining eng sevimli desertlaridan biri. Har kuni yangi tayyorlanadi.",
                1, 'Shirinlik',
                json.dumps({"Vazni": "1.2 kg", "Tarkibi": "Krem-chiz, tabiiy sariyog', vanil, biskvit", "Saqlash": "Muzlatgichda 72 soat"}),
                now
            ),
            (
                'p-15', 'Bellissimo Peperoni & Qazili Maxsus Pitsa 35cm', 'Bellissimo', 'oziq-ovqat',
                'store-7', 'Bellissimo Pizza & Burgers', 95000, 115000, 17, 50, 4.89, 410,
                'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
                "Qarsildoq xamir, ko'p miqdordagi mozzarella pishlog'i, achchiq peperoni va milliy sifatli qazi bo'laklari bilan issiq pitsa.",
                1, 'Issiq yetkazish',
                json.dumps({"Diametri": "35 sm (Katta o'lcham)", "Bo'laklar soni": "8 bo'lak", "Xamir turi": "An'anaviy qalin qarsildoq"}),
                now
            ),
            (
                'p-16', 'Xiaomi Electric Scooter 4 Pro Elektr Samokat 25km/soat', 'Xiaomi', 'sport',
                'store-3', 'Mediapark Bozor Elektronika', 6800000, 7900000, 14, 7, 4.78, 88,
                'https://images.unsplash.com/photo-1559348349-86f1f65817fe?auto=format&fit=crop&w=800&q=80',
                "Bir zaryad bilan 55 km masofani bosib o'tuvchi yangi avlod elektr samokati. 10 dyuymli tubeless mustahkam g'ildiraklar va ikki tomonlama disk tormoz.",
                1, 'Tezkor Shahar',
                json.dumps({"Tezlik": "25 km/soat gacha", "Yurish masofasi": "55 km gacha", "Maksimal yuk": "120 kg", "Akkumulyator": "12400 mA/soat"}),
                now
            ),
            (
                'p-17', 'Fitnes Gantellar To‘plami 2x15kg Xrom Qoplamali', 'Torneo', 'sport',
                'store-4', 'Idea Maishiy Texnika', 850000, 1100000, 23, 19, 4.7, 64,
                'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
                "Uy sharoitida shug'ullanish uchun yig'iladigan qulay xromlangan gantellar to'plami. Maxsus qulflar va qulay ushlagich bilan to'liq xavfsiz.",
                0, 'Sport',
                json.dumps({"Jami og'irligi": "30 kg (har biri 15 kg)", "Material": "Yuqori sifatli xromli po'lat", "Qoplamasi": "Sirpanmaydigan rezinali ushlagich"}),
                now
            ),
            (
                'p-18', 'Sony PlayStation 5 Slim 1TB + 2 ta DualSense Joystik', 'Sony', 'noutbuklar',
                'store-3', 'Mediapark Bozor Elektronika', 7400000, 8200000, 10, 10, 4.97, 204,
                'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
                "Ultra ixcham o'lchamli yangi PS5 Slim versiyasi. 1TB tezkor SSD xotira va to'plamda 2 ta original oq rangli DualSense geympadi bilan.",
                1, 'Xit Sotuv',
                json.dumps({"Xotira": "1 TB ultra-tezkor NVMe SSD", "Ruxsat": "4K 120Hz va 8K qo'llab-quvvatlaydi", "Komplekt": "Konsol + 2 ta DualSense + HDMI 2.1"}),
                now
            )
        ]
        cur.executemany("INSERT INTO products VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", products)

        # D) FOYDALANUVCHILAR (USERS & ADMIN)
        users = [
            ('usr-admin', 'Direktor Boshqaruvchi', '+998 71 200-00-00', 'admin@ulash.market', hash_password('admin123'), 'admin', 'Toshkent sh., Amir Temur shoh ko‘chasi 1-uy', 'Yunusobod', 41.3110, 69.2790, now),
            ('usr-1', 'Anvar Qosimov', '+998 90 555-11-22', 'anvar@gmail.com', hash_password('user123'), 'user', "Chilonzor 7-mavze, 12-uy, 45-xonadon", 'Chilonzor', 41.2750, 69.2100, now),
            ('usr-2', 'Dilnoza Karimova', '+998 94 333-22-11', 'dilnoza@gmail.com', hash_password('user123'), 'user', "Yunusobod 14-mavze, 5-uy, 18-xonadon", 'Yunusobod', 41.3580, 69.2850, now),
            ('usr-3', 'Olimjon Vohidov', '+998 91 777-88-99', 'olim@gmail.com', hash_password('user123'), 'user', "Mirzo Ulug'bek, Qorasuv 4-mavze, 23-uy", "Mirzo Ulug'bek", 41.3310, 69.3380, now)
        ]
        cur.executemany("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", users)

        # E) KURYERLAR (COURIERS)
        couriers = [
            ('cour-1', 'Sardor Aliyev', '+998 90 123-45-67', 'sardor.kuryer@gmail.com', 'Skuter (Honda Dio)', 4.95, 142, 2130000, 'online', 41.278, 69.215, 'store-1', now),
            ('cour-2', 'Jasur Karimov', '+998 93 987-65-43', 'jasur.kuryer@gmail.com', 'Chevrolet Spark (Oq)', 4.88, 98, 1470000, 'online', 41.350, 69.282, 'store-2', now),
            ('cour-3', 'Bobur Rahimov', '+998 97 555-44-33', 'bobur.kuryer@gmail.com', 'Elektr Velosiped', 4.91, 64, 960000, 'online', 41.320, 69.325, 'store-4', now)
        ]
        cur.executemany("INSERT INTO couriers VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", couriers)

        # F) BUYURTMALAR (ORDERS — 6 BOSQICHLI)
        orders = [
            (
                'ORD-1092', 'Anvar Qosimov', '+998 90 555-11-22',
                "Chilonzor 7-mavze, 12-uy, 45-xonadon (Orientir: 173-maktab ro'parasida)",
                'Chilonzor', 41.2750, 69.2100,
                20800000, 0, 0, None, 20800000,
                'Click / Payme', 'To‘langan',
                'store-3', 'Mediapark Bozor Elektronika', 2.3,
                'Kuryer qabul qildi', # 3-bosqich
                'cour-1', 'Sardor Aliyev', '+998 90 123-45-67',
                json.dumps([
                    {"productId": "p-1", "name": "iPhone 16 Pro Max 256GB Natural Titanium", "price": 16500000, "quantity": 1, "image": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80"},
                    {"productId": "p-7", "name": "Sony WH-1000XM5 Shovqinni bekor qiluvchi quloqchin", "price": 4300000, "quantity": 1, "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"}
                ]),
                json.dumps([
                    {"status": "Buyurtma yaratildi", "time": now, "note": "Mijoz tomonidan buyurtma berildi"},
                    {"status": "Do‘kon tasdiqladi", "time": now, "note": "Mediapark do'koni buyurtmani tasdiqladi"},
                    {"status": "Kuryer qabul qildi", "time": now, "note": "Kuryer Sardor Aliyev buyurtmani qabul qildi"}
                ]),
                now
            ),
            (
                'ORD-1093', 'Dilnoza Karimova', '+998 94 333-22-11',
                "Yunusobod 14-mavze, 5-uy, 18-xonadon",
                'Yunusobod', 41.3580, 69.2850,
                710000, 0, 0, None, 710000,
                'Naqd pul (kuryerga)', 'Kutilmoqda',
                'store-1', 'Korzinka Supermarket', 1.8,
                'Do‘kon tasdiqladi', # 2-bosqich (kuryer qabul qilishiga tayyor)
                None, None, None,
                json.dumps([
                    {"productId": "p-10", "name": "Lattafe Asad Eau de Parfum 100ml Erkaklar Atiri", "price": 390000, "quantity": 1, "image": "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80"},
                    {"productId": "p-13", "name": "Lavazza Qualita Oro Tabiiy Donli Qahva 1kg", "price": 320000, "quantity": 1, "image": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80"}
                ]),
                json.dumps([
                    {"status": "Buyurtma yaratildi", "time": now, "note": "Mijoz tomonidan buyurtma berildi"},
                    {"status": "Do‘kon tasdiqladi", "time": now, "note": "Do'kon buyurtmani qabul qildi va tovarlar jamlanmoqda"}
                ]),
                now
            ),
            (
                'ORD-1088', 'Olimjon Vohidov', '+998 91 777-88-99',
                "Mirzo Ulug'bek, Qorasuv 4-mavze, 23-uy",
                "Mirzo Ulug'bek", 41.3310, 69.3380,
                1450000, 0, 0, None, 1450000,
                'Click / Payme', 'To‘langan',
                'store-5', 'Terra Pro & Zara Fashion', 1.2,
                'Buyurtma yetkazildi', # 6-bosqich (muvaffaqiyatli yakunlangan)
                'cour-3', 'Bobur Rahimov', '+998 97 555-44-33',
                json.dumps([
                    {"productId": "p-8", "name": "Nike Air Max 270 Black & White Original Krossovka", "price": 1450000, "quantity": 1, "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"}
                ]),
                json.dumps([
                    {"status": "Buyurtma yaratildi", "time": now, "note": "Buyurtma rasmiylashtirildi"},
                    {"status": "Do‘kon tasdiqladi", "time": now, "note": "Do'kon buyurtmani tasdiqladi"},
                    {"status": "Kuryer qabul qildi", "time": now, "note": "Kuryer Bobur Rahimov biriktirildi"},
                    {"status": "Mahsulot tayyorlandi", "time": now, "note": "Mahsulot qadoqlandi"},
                    {"status": "Kuryer olib ketdi", "time": now, "note": "Kuryer yo'lga chiqdi"},
                    {"status": "Buyurtma yetkazildi", "time": now, "note": "Mijozga eshik oldida topshirildi"}
                ]),
                now
            )
        ]
        cur.executemany("INSERT INTO orders VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", orders)

        # G) PROMO-KODLAR
        promos = [
            ('prm-1', 'ULASH10', 10, 0, 100000, '2026-12-31', 1),
            ('prm-2', 'YANGI2026', 15, 0, 200000, '2026-12-31', 1),
            ('prm-3', 'BAHOR50', 5, 0, 50000, '2026-06-30', 1)
        ]
        cur.executemany("INSERT INTO promos VALUES (?, ?, ?, ?, ?, ?, ?)", promos)

        # H) SHARHLAR (REVIEWS)
        reviews = [
            ('rev-1', 'p-1', 'Anvar Qosimov', '+998 90 555-11-22', 5, "Nihoyatda sifatli va original telefon. 30 daqiqada Mediaparkdan kuryer keltirib berdi!", now),
            ('rev-2', 'p-1', 'Sardor M.', '+998 93 111-22-33', 5, "Kameralari juda zo'r. Rahmat Ulash Market jamoasiga!", now),
            ('rev-3', 'p-2', 'Dilnoza K.', '+998 94 333-22-11', 5, "S-Pen qalami juda qulay ekan. AI funksiyalari a'lo darajada.", now),
            ('rev-4', 'p-14', 'Kamola S.', '+998 90 999-88-77', 5, "Safia tortlari doimgidek eng sarasi. Yangi va mazali!", now)
        ]
        cur.executemany("INSERT INTO reviews VALUES (?, ?, ?, ?, ?, ?, ?)", reviews)

        # I) SOZLAMALAR
        settings = [
            ('store_name', 'ULASH MARKET'),
            ('tagline', 'Barcha do‘konlar, tovarlar va kuryerlar yagona onlayn marketplace tizimida'),
            ('base_delivery_fee', '15000'),
            ('free_delivery_threshold', '350000'),
            ('courier_commission', '15000'),
            ('admin_secret_pin', 'admin123'),
            ('support_phone', '+998 71 200-00-00'),
            ('telegram_bot', '@ulash_market_bot')
        ]
        cur.executemany("INSERT INTO settings VALUES (?, ?)", settings)

        conn.commit()
        print("[ULASH-DB] Baza muvaffaqiyatli to'ldirildi!")

    conn.close()

# -----------------------------------------------------------------------------
# REST API ENDPOINTS
# -----------------------------------------------------------------------------

# 1. Autentifikatsiya (Auth)
@app.route('/api/auth/register', methods=['POST'])
def api_register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    phone = data.get('phone', '').strip()
    email = data.get('email', '').strip() or None
    password = data.get('password', '').strip()
    role = data.get('role', 'user') # 'user' | 'courier'

    if not name or not phone or not password:
        return jsonify({'error': 'Ism, telefon raqam va parol kiritilishi shart'}), 400

    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT id FROM users WHERE phone = ? OR (email IS NOT NULL AND email = ?)", (phone, email))
    if cur.fetchone():
        return jsonify({'error': 'Ushbu telefon yoki email orqali foydalanuvchi allaqachon mavjud'}), 400

    user_id = f"usr-{int(datetime.now().timestamp() * 1000)}"
    pwd_hash = hash_password(password)
    now = datetime.now().isoformat()

    cur.execute("""
    INSERT INTO users (id, name, phone, email, password_hash, role, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (user_id, name, phone, email, pwd_hash, role, now))

    # Agar kuryer bo'lsa kuryerlar ro'yxatiga ham qo'shamiz
    if role == 'courier':
        cur.execute("""
        INSERT INTO couriers (id, name, phone, email, transport, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (user_id, name, phone, email, data.get('transport', 'Skuter'), now))

    db.commit()

    return jsonify({
        'success': True,
        'user': {
            'id': user_id,
            'name': name,
            'phone': phone,
            'email': email,
            'role': role
        }
    })

@app.route('/api/auth/login', methods=['POST'])
def api_login():
    data = request.get_json() or {}
    account = data.get('account', '').strip()
    password = data.get('password', '').strip()
    expected_role = data.get('role', 'user')

    if not account or not password:
        return jsonify({'error': 'Hisob va parol kiritilishi shart'}), 400

    pwd_hash = hash_password(password)
    db = get_db()
    cur = db.cursor()
    cur.execute("""
    SELECT id, name, phone, email, role, default_address, district, lat, lng
    FROM users
    WHERE (phone = ? OR email = ?) AND password_hash = ?
    """, (account, account, pwd_hash))
    user = cur.fetchone()

    if not user:
        return jsonify({'error': 'Telefon/email yoki parol noto‘g‘ri'}), 401

    user_dict = dict(user)
    return jsonify({'success': True, 'user': user_dict})

@app.route('/api/auth/admin-login', methods=['POST'])
def api_admin_login():
    data = request.get_json() or {}
    pin = data.get('pin', '').strip()

    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT value FROM settings WHERE key = 'admin_secret_pin'")
    row = cur.fetchone()
    correct_pin = row['value'] if row else 'admin123'

    if pin == correct_pin:
        return jsonify({
            'success': True,
            'user': {
                'id': 'usr-admin',
                'name': 'Direktor (Admin)',
                'phone': '+998 71 200-00-00',
                'email': 'admin@ulash.market',
                'role': 'admin'
            }
        })
    else:
        return jsonify({'error': 'Direktor maxfiy paroli noto‘g‘ri!'}), 403

# 2. Do'konlar (Stores) API
@app.route('/api/stores', methods=['GET', 'POST'])
def api_stores():
    db = get_db()
    cur = db.cursor()

    if request.method == 'GET':
        cur.execute("SELECT * FROM stores WHERE is_active = 1 ORDER BY rating DESC, name ASC")
        stores = [row_to_dict(r) for r in cur.fetchall()]
        return jsonify({'success': True, 'stores': stores})

    elif request.method == 'POST':
        # Admin orqali yangi do'kon qo'shish
        data = request.get_json() or {}
        store_id = data.get('id') or f"store-{int(datetime.now().timestamp() * 1000)}"
        name = data.get('name', '').strip()
        if not name:
            return jsonify({'error': 'Do‘kon nomi kiritilishi shart'}), 400

        now = datetime.now().isoformat()
        cur.execute("""
        INSERT INTO stores (id, name, short_name, logo, category, address, district, phone,
                            working_hours, lat, lng, rating, reviews_count, delivery_time,
                            delivery_fee, min_order, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
        """, (
            store_id, name, data.get('short_name', name),
            data.get('logo', 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=300&q=80'),
            data.get('category', 'oziq-ovqat'), data.get('address', 'Toshkent shahar'),
            data.get('district', 'Chilonzor'), data.get('phone', '+998 71 200-00-00'),
            data.get('working_hours', '08:00 - 22:00'),
            float(data.get('lat', 41.2721)), float(data.get('lng', 69.2045)),
            float(data.get('rating', 5.0)), int(data.get('reviews_count', 0)),
            data.get('delivery_time', '30 daqiqa'), int(data.get('delivery_fee', 15000)),
            int(data.get('min_order', 30000)), now
        ))
        db.commit()
        return jsonify({'success': True, 'id': store_id, 'message': 'Do‘kon muvaffaqiyatli qo‘shildi'})

@app.route('/api/stores/<store_id>', methods=['GET', 'PUT', 'DELETE'])
def api_store_detail(store_id):
    db = get_db()
    cur = db.cursor()

    if request.method == 'GET':
        cur.execute("SELECT * FROM stores WHERE id = ?", (store_id,))
        row = cur.fetchone()
        if not row:
            return jsonify({'error': 'Do‘kon topilmadi'}), 404
        return jsonify({'success': True, 'store': row_to_dict(row)})

    elif request.method == 'PUT':
        data = request.get_json() or {}
        cur.execute("""
        UPDATE stores SET
            name = COALESCE(?, name),
            short_name = COALESCE(?, short_name),
            logo = COALESCE(?, logo),
            category = COALESCE(?, category),
            address = COALESCE(?, address),
            district = COALESCE(?, district),
            phone = COALESCE(?, phone),
            working_hours = COALESCE(?, working_hours),
            lat = COALESCE(?, lat),
            lng = COALESCE(?, lng),
            delivery_time = COALESCE(?, delivery_time),
            delivery_fee = COALESCE(?, delivery_fee),
            min_order = COALESCE(?, min_order)
        WHERE id = ?
        """, (
            data.get('name'), data.get('short_name'), data.get('logo'),
            data.get('category'), data.get('address'), data.get('district'),
            data.get('phone'), data.get('working_hours'), data.get('lat'),
            data.get('lng'), data.get('delivery_time'), data.get('delivery_fee'),
            data.get('min_order'), store_id
        ))
        db.commit()
        return jsonify({'success': True, 'message': 'Do‘kon ma’lumotlari yangilandi'})

    elif request.method == 'DELETE':
        cur.execute("DELETE FROM stores WHERE id = ?", (store_id,))
        db.commit()
        return jsonify({'success': True, 'message': 'Do‘kon o‘chirildi'})

# 3. Kategoriyalar (Categories) API
@app.route('/api/categories', methods=['GET'])
def api_categories():
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM categories")
    categories = [row_to_dict(r) for r in cur.fetchall()]
    return jsonify({'success': True, 'categories': categories})

# 4. Mahsulotlar (Products) API
@app.route('/api/products', methods=['GET', 'POST'])
def api_products():
    db = get_db()
    cur = db.cursor()

    if request.method == 'GET':
        category = request.args.get('category')
        store_id = request.args.get('store_id')
        search = request.args.get('search')
        sort = request.args.get('sort', 'default')

        query = "SELECT * FROM products WHERE 1=1"
        params = []

        if category and category != 'all':
            query += " AND category = ?"
            params.append(category)

        if store_id and store_id != 'all':
            query += " AND store_id = ?"
            params.append(store_id)

        if search:
            query += " AND (name LIKE ? OR brand LIKE ? OR description LIKE ?)"
            term = f"%{search}%"
            params.extend([term, term, term])

        if sort == 'price-asc':
            query += " ORDER BY price ASC"
        elif sort == 'price-desc':
            query += " ORDER BY price DESC"
        elif sort == 'rating':
            query += " ORDER BY rating DESC"
        else:
            query += " ORDER BY is_featured DESC, rating DESC, name ASC"

        cur.execute(query, params)
        products = [row_to_dict(r) for r in cur.fetchall()]
        return jsonify({'success': True, 'products': products, 'count': len(products)})

    elif request.method == 'POST':
        # Admin orqali yangi mahsulot qo'shish
        data = request.get_json() or {}
        name = data.get('name', '').strip()
        price = data.get('price')
        if not name or price is None:
            return jsonify({'error': 'Mahsulot nomi va narxi kiritilishi shart'}), 400

        product_id = data.get('id') or f"p-{int(datetime.now().timestamp() * 1000)}"
        orig_price = data.get('originalPrice') or data.get('original_price') or price
        disc_percent = data.get('discountPercent') or data.get('discount_percent') or 0
        if orig_price > price and disc_percent == 0:
            disc_percent = int(round((orig_price - price) / orig_price * 100))

        specs = data.get('specs') or {}
        specs_json = json.dumps(specs) if isinstance(specs, dict) else str(specs)
        now = datetime.now().isoformat()

        cur.execute("""
        INSERT INTO products (id, name, brand, category, store_id, store_name, price,
                              original_price, discount_percent, stock, rating, reviews_count,
                              image, description, is_featured, badge, specs_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            product_id, name, data.get('brand', 'Original'),
            data.get('category', 'smartfonlar'), data.get('store_id') or data.get('storeId'),
            data.get('store_name') or data.get('storeName'), int(price), int(orig_price),
            int(disc_percent), int(data.get('stock', 10)), float(data.get('rating', 5.0)),
            int(data.get('reviews_count', 0)),
            data.get('image', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'),
            data.get('description', ''), 1 if data.get('isFeatured') or data.get('is_featured') else 0,
            data.get('badge', 'Yangi'), specs_json, now
        ))
        db.commit()
        return jsonify({'success': True, 'id': product_id, 'message': 'Mahsulot muvaffaqiyatli qo‘shildi'})

@app.route('/api/products/<product_id>', methods=['GET', 'PUT', 'DELETE'])
def api_product_detail(product_id):
    db = get_db()
    cur = db.cursor()

    if request.method == 'GET':
        cur.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        row = cur.fetchone()
        if not row:
            return jsonify({'error': 'Mahsulot topilmadi'}), 404
        return jsonify({'success': True, 'product': row_to_dict(row)})

    elif request.method == 'PUT':
        data = request.get_json() or {}
        specs_json = json.dumps(data.get('specs')) if 'specs' in data and isinstance(data['specs'], dict) else None

        cur.execute("""
        UPDATE products SET
            name = COALESCE(?, name),
            brand = COALESCE(?, brand),
            category = COALESCE(?, category),
            store_id = COALESCE(?, store_id),
            store_name = COALESCE(?, store_name),
            price = COALESCE(?, price),
            original_price = COALESCE(?, original_price),
            discount_percent = COALESCE(?, discount_percent),
            stock = COALESCE(?, stock),
            image = COALESCE(?, image),
            description = COALESCE(?, description),
            is_featured = COALESCE(?, is_featured),
            badge = COALESCE(?, badge),
            specs_json = COALESCE(?, specs_json)
        WHERE id = ?
        """, (
            data.get('name'), data.get('brand'), data.get('category'),
            data.get('store_id') or data.get('storeId'), data.get('store_name') or data.get('storeName'),
            data.get('price'), data.get('originalPrice') or data.get('original_price'),
            data.get('discountPercent') or data.get('discount_percent'),
            data.get('stock'), data.get('image'), data.get('description'),
            data.get('is_featured'), data.get('badge'), specs_json, product_id
        ))
        db.commit()
        return jsonify({'success': True, 'message': 'Mahsulot yangilandi'})

    elif request.method == 'DELETE':
        cur.execute("DELETE FROM products WHERE id = ?", (product_id,))
        db.commit()
        return jsonify({'success': True, 'message': 'Mahsulot o‘chirildi'})

# 5. Buyurtmalar (Orders — 6 bosqichli) API
ORDER_STAGES = [
    'Buyurtma yaratildi',
    'Do‘kon tasdiqladi',
    'Kuryer qabul qildi',
    'Mahsulot tayyorlandi',
    'Kuryer olib ketdi',
    'Buyurtma yetkazildi'
]

@app.route('/api/orders', methods=['GET', 'POST'])
def api_orders():
    db = get_db()
    cur = db.cursor()

    if request.method == 'GET':
        status = request.args.get('status')
        courier_id = request.args.get('courier_id')
        customer_phone = request.args.get('customer_phone')

        query = "SELECT * FROM orders WHERE 1=1"
        params = []

        if status:
            query += " AND status = ?"
            params.append(status)

        if courier_id:
            query += " AND courier_id = ?"
            params.append(courier_id)

        if customer_phone:
            query += " AND customer_phone = ?"
            params.append(customer_phone)

        query += " ORDER BY created_at DESC"
        cur.execute(query, params)
        orders = [row_to_dict(r) for r in cur.fetchall()]
        return jsonify({'success': True, 'orders': orders})

    elif request.method == 'POST':
        data = request.get_json() or {}
        customer = data.get('customer') or {}
        items = data.get('items') or []

        if not items:
            return jsonify({'error': 'Savatcha bo‘sh'}), 400

        order_id = data.get('id') or f"ORD-{int(datetime.now().timestamp() * 1000) % 10000 + 1000}"
        now = datetime.now().isoformat()

        # Dastlabki bosqich: 1. Buyurtma yaratildi
        initial_history = [
            {"status": "Buyurtma yaratildi", "time": now, "note": "Mijoz buyurtma rasmiylashtirdi"}
        ]

        subtotal = int(data.get('subtotal', 0))
        delivery_fee = int(data.get('deliveryFee', 0))
        discount_applied = int(data.get('discountApplied', 0))
        total = int(data.get('total', subtotal + delivery_fee - discount_applied))

        cur.execute("""
        INSERT INTO orders (id, customer_name, customer_phone, customer_address, district,
                            lat, lng, subtotal, delivery_fee, discount_applied, promo_code,
                            total, payment_method, payment_status, store_id, store_name,
                            distance_km, status, courier_id, courier_name, courier_phone,
                            items_json, status_history_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Buyurtma yaratildi', NULL, NULL, NULL, ?, ?, ?)
        """, (
            order_id,
            customer.get('name', 'Mijoz'),
            customer.get('phone', '+998 90 000-00-00'),
            customer.get('address', 'Toshkent sh.'),
            customer.get('district', 'Chilonzor'),
            float(customer.get('lat', 41.2750)),
            float(customer.get('lng', 69.2100)),
            subtotal, delivery_fee, discount_applied, data.get('promoCode'),
            total, data.get('paymentMethod', 'Naqd pul'),
            data.get('paymentStatus', 'Kutilmoqda'),
            data.get('storeId') or data.get('branchId', 'store-1'),
            data.get('storeName') or data.get('branchName', 'Korzinka Supermarket'),
            float(data.get('distanceKm', 2.0)),
            json.dumps(items),
            json.dumps(initial_history),
            now
        ))

        # Ombordagi mahsulot qoldig'ini kamaytirish
        for it in items:
            p_id = it.get('productId') or it.get('id')
            qty = int(it.get('quantity', 1))
            if p_id:
                cur.execute("UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?", (qty, p_id))

        db.commit()
        return jsonify({'success': True, 'order_id': order_id, 'message': 'Buyurtma muvaffaqiyatli qabul qilindi'})

@app.route('/api/orders/<order_id>/status', methods=['POST'])
def api_update_order_status(order_id):
    """Buyurtma bosqichini yangilash (6 bosqich)"""
    data = request.get_json() or {}
    new_status = data.get('status')
    note = data.get('note', f"Holat yangilandi: {new_status}")

    if not new_status:
        return jsonify({'error': 'Yangi holat ko‘rsatilmadi'}), 400

    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT status, status_history_json FROM orders WHERE id = ?", (order_id,))
    row = cur.fetchone()
    if not row:
        return jsonify({'error': 'Buyurtma topilmadi'}), 404

    history = []
    if row['status_history_json']:
        try:
            history = json.loads(row['status_history_json'])
        except Exception:
            pass

    now = datetime.now().isoformat()
    history.append({
        'status': new_status,
        'time': now,
        'note': note
    })

    # Agar yetkazilgan bo'lsa kuryer daromadini oshirish
    if new_status == 'Buyurtma yetkazildi':
        cur.execute("SELECT courier_id FROM orders WHERE id = ?", (order_id,))
        c_row = cur.fetchone()
        if c_row and c_row['courier_id']:
            cur.execute("""
            UPDATE couriers
            SET completed_orders = completed_orders + 1,
                earnings_total = earnings_total + 15000
            WHERE id = ?
            """, (c_row['courier_id'],))

    cur.execute("""
    UPDATE orders
    SET status = ?, status_history_json = ?
    WHERE id = ?
    """, (new_status, json.dumps(history), order_id))

    db.commit()
    return jsonify({'success': True, 'status': new_status, 'history': history})

@app.route('/api/orders/<order_id>/accept', methods=['POST'])
def api_courier_accept_order(order_id):
    """
    Kuryer tomonidan buyurtmani qabul qilish.
    Atomar qulflash: Bitta buyurtmani bir vaqtning o'zida faqat bitta kuryer oladi!
    """
    data = request.get_json() or {}
    courier_id = data.get('courierId') or data.get('courier_id')
    courier_name = data.get('courierName') or data.get('courier_name')
    courier_phone = data.get('courierPhone') or data.get('courier_phone')

    if not courier_id or not courier_name:
        return jsonify({'error': 'Kuryer ma’lumotlari to‘liq emas'}), 400

    db = get_db()
    cur = db.cursor()

    # Atomar tranzaksiya
    cur.execute("BEGIN IMMEDIATE")
    cur.execute("SELECT status, courier_id, status_history_json FROM orders WHERE id = ?", (order_id,))
    row = cur.fetchone()

    if not row:
        cur.execute("ROLLBACK")
        return jsonify({'error': 'Buyurtma topilmadi'}), 404

    # Agar allaqachon boshqa kuryer olgan bo'lsa
    if row['courier_id'] and row['courier_id'] != courier_id:
        cur.execute("ROLLBACK")
        return jsonify({'error': 'Ushbu buyurtma allaqachon boshqa kuryer tomonidan qabul qilingan!'}), 409

    history = []
    if row['status_history_json']:
        try:
            history = json.loads(row['status_history_json'])
        except Exception:
            pass

    now = datetime.now().isoformat()
    new_status = 'Kuryer qabul qildi'
    history.append({
        'status': new_status,
        'time': now,
        'note': f"Kuryer {courier_name} buyurtmani qabul qildi"
    })

    cur.execute("""
    UPDATE orders
    SET status = ?, courier_id = ?, courier_name = ?, courier_phone = ?, status_history_json = ?
    WHERE id = ?
    """, (new_status, courier_id, courier_name, courier_phone, json.dumps(history), order_id))

    # Kuryer holatini band (busy) ga o'tkazish
    cur.execute("UPDATE couriers SET status = 'busy' WHERE id = ?", (courier_id,))

    cur.execute("COMMIT")
    return jsonify({'success': True, 'message': 'Buyurtma muvaffaqiyatli qabul qilindi', 'status': new_status})

# 6. Kuryerlar (Couriers) API
@app.route('/api/couriers', methods=['GET', 'POST'])
def api_couriers():
    db = get_db()
    cur = db.cursor()

    if request.method == 'GET':
        cur.execute("SELECT * FROM couriers ORDER BY rating DESC")
        couriers = [row_to_dict(r) for r in cur.fetchall()]
        return jsonify({'success': True, 'couriers': couriers})

    elif request.method == 'POST':
        data = request.get_json() or {}
        name = data.get('name', '').strip()
        phone = data.get('phone', '').strip()
        if not name or not phone:
            return jsonify({'error': 'Ism va telefon shart'}), 400

        c_id = data.get('id') or f"cour-{int(datetime.now().timestamp() * 1000)}"
        now = datetime.now().isoformat()

        cur.execute("""
        INSERT INTO couriers (id, name, phone, email, transport, rating, completed_orders, earnings_total, status, lat, lng, assigned_branch_id, created_at)
        VALUES (?, ?, ?, ?, ?, 5.0, 0, 0, 'online', 41.2721, 69.2045, ?, ?)
        """, (c_id, name, phone, data.get('email', ''), data.get('transport', 'Skuter'), data.get('assignedStoreId', 'store-1'), now))
        db.commit()
        return jsonify({'success': True, 'id': c_id, 'message': 'Yangi kuryer ro‘yxatdan o‘tkazildi'})

# 7. Foydalanuvchilar (Users) API
@app.route('/api/users', methods=['GET'])
def api_users():
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT id, name, phone, email, role, default_address, district, created_at FROM users ORDER BY created_at DESC")
    users = [dict(r) for r in cur.fetchall()]
    return jsonify({'success': True, 'users': users})

# 8. Sharhlar va Baholar (Reviews) API
@app.route('/api/products/<product_id>/reviews', methods=['GET', 'POST'])
def api_product_reviews(product_id):
    db = get_db()
    cur = db.cursor()

    if request.method == 'GET':
        cur.execute("SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC", (product_id,))
        reviews = [dict(r) for r in cur.fetchall()]
        return jsonify({'success': True, 'reviews': reviews})

    elif request.method == 'POST':
        data = request.get_json() or {}
        rating = int(data.get('rating', 5))
        comment = data.get('comment', '').strip()
        user_name = data.get('userName', 'Mijoz')
        user_phone = data.get('userPhone', '')

        if not comment:
            return jsonify({'error': 'Izoh matni kiritilishi shart'}), 400

        rev_id = f"rev-{int(datetime.now().timestamp() * 1000)}"
        now = datetime.now().isoformat()

        cur.execute("""
        INSERT INTO reviews (id, product_id, user_name, user_phone, rating, comment, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (rev_id, product_id, user_name, user_phone, rating, comment, now))

        # Mahsulotning umumiy reytingini qayta hisoblash
        cur.execute("SELECT AVG(rating), COUNT(*) FROM reviews WHERE product_id = ?", (product_id,))
        avg_r, count_r = cur.fetchone()
        if avg_r is not None:
            cur.execute("""
            UPDATE products SET rating = ROUND(?, 2), reviews_count = ? WHERE id = ?
            """, (float(avg_r), int(count_r), product_id))

        db.commit()
        return jsonify({'success': True, 'message': 'Sharh muvaffaqiyatli saqlandi'})

# 9. Promo-kodlar (Promos) API
@app.route('/api/promos', methods=['GET', 'POST'])
def api_promos():
    db = get_db()
    cur = db.cursor()

    if request.method == 'GET':
        cur.execute("SELECT * FROM promos ORDER BY code ASC")
        promos = [dict(r) for r in cur.fetchall()]
        return jsonify({'success': True, 'promos': promos})

    elif request.method == 'POST':
        data = request.get_json() or {}
        code = data.get('code', '').strip().upper()
        disc_percent = int(data.get('discountPercent', 10))
        min_order = int(data.get('minOrder', 100000))
        expires = data.get('expiresAt', '2026-12-31')

        if not code:
            return jsonify({'error': 'Promo-kod nomi shart'}), 400

        prm_id = f"prm-{int(datetime.now().timestamp() * 1000)}"
        cur.execute("""
        INSERT INTO promos (id, code, discount_percent, min_order, expires_at, is_active)
        VALUES (?, ?, ?, ?, ?, 1)
        """, (prm_id, code, disc_percent, min_order, expires))
        db.commit()
        return jsonify({'success': True, 'id': prm_id, 'message': 'Promo-kod yaratildi'})

@app.route('/api/promos/<promo_id>', methods=['DELETE'])
def api_delete_promo(promo_id):
    db = get_db()
    cur = db.cursor()
    cur.execute("DELETE FROM promos WHERE id = ?", (promo_id,))
    db.commit()
    return jsonify({'success': True, 'message': 'Promo-kod o‘chirildi'})

@app.route('/api/promos/validate', methods=['POST'])
def api_validate_promo():
    data = request.get_json() or {}
    code = data.get('code', '').strip().upper()
    subtotal = int(data.get('subtotal', 0))

    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM promos WHERE code = ? AND is_active = 1", (code,))
    row = cur.fetchone()

    if not row:
        return jsonify({'valid': False, 'error': 'Bunday promo-kod mavjud emas yoki muddati o‘tgan'}), 404

    promo = dict(row)
    if subtotal < promo['min_order']:
        return jsonify({
            'valid': False,
            'error': f"Ushbu promo-kod kamida {promo['min_order']:,} so‘mlik xaridlar uchun amal qiladi"
        }), 400

    discount_amount = int(subtotal * (promo['discount_percent'] / 100))
    return jsonify({
        'valid': True,
        'code': promo['code'],
        'discountPercent': promo['discount_percent'],
        'discountAmount': discount_amount,
        'message': f"Ajoyib! {promo['discount_percent']}% chegirma qo‘llandi (-{discount_amount:,} so‘m)"
    })

# 10. Dashboard & Statistika (Analytics) API
@app.route('/api/stats', methods=['GET'])
def api_stats():
    db = get_db()
    cur = db.cursor()

    # Jami savdo va buyurtmalar
    cur.execute("SELECT COUNT(*), COALESCE(SUM(total), 0) FROM orders")
    total_orders, total_sales = cur.fetchone()

    # Foydalanuvchilar, Do'konlar, Mahsulotlar, Kuryerlar soni
    cur.execute("SELECT COUNT(*) FROM users WHERE role = 'user'")
    total_users = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM stores WHERE is_active = 1")
    total_stores = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM products")
    total_products = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM couriers")
    total_couriers = cur.fetchone()[0]

    # Do'konlar bo'yicha savdo taqsimoti
    cur.execute("""
    SELECT store_name, COUNT(*) as order_count, COALESCE(SUM(total), 0) as store_sales
    FROM orders
    WHERE store_name IS NOT NULL
    GROUP BY store_name
    ORDER BY store_sales DESC
    LIMIT 6
    """)
    store_sales = [dict(r) for r in cur.fetchall()]

    # Holatlar bo'yicha taqsimot
    cur.execute("""
    SELECT status, COUNT(*) as count
    FROM orders
    GROUP BY status
    """)
    status_counts = {r['status']: r['count'] for r in cur.fetchall()}

    return jsonify({
        'success': True,
        'stats': {
            'totalSales': total_sales,
            'totalOrders': total_orders,
            'totalUsers': total_users,
            'totalStores': total_stores,
            'totalProducts': total_products,
            'totalCouriers': total_couriers,
            'storeSales': store_sales,
            'statusCounts': status_counts
        }
    })

# 11. Sozlamalar (Settings) API
@app.route('/api/settings', methods=['GET', 'POST'])
def api_settings():
    db = get_db()
    cur = db.cursor()

    if request.method == 'GET':
        cur.execute("SELECT key, value FROM settings")
        settings = {r['key']: r['value'] for r in cur.fetchall()}
        return jsonify({'success': True, 'settings': settings})

    elif request.method == 'POST':
        data = request.get_json() or {}
        for k, v in data.items():
            cur.execute("""
            INSERT INTO settings (key, value) VALUES (?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
            """, (k, str(v)))
        db.commit()
        return jsonify({'success': True, 'message': 'Sozlamalar yangilandi'})

# -----------------------------------------------------------------------------
# STATIK FAYLLARNI SERVING QILISH (Frontend Routing)
# -----------------------------------------------------------------------------

@app.route('/')
def index():
    return send_from_directory(BASE_DIR, 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    if os.path.exists(os.path.join(BASE_DIR, filename)):
        return send_from_directory(BASE_DIR, filename)
    return send_from_directory(BASE_DIR, 'index.html')

# -----------------------------------------------------------------------------
# SERVERNI ISHGA TUSHIRISH (Run Flask Server)
# -----------------------------------------------------------------------------

def start_server():
    init_db()
    url = f"http://localhost:{PORT}"
    print("=" * 65)
    print("   🌟 ULASH MARKET — YAGONA ONLAYN MARKETPLACE (FLASK SERVER)")
    print("=" * 65)
    print(f"   ► Veb ilova manzili:     {url}")
    print(f"   ► REST API prefiksi:     {url}/api/...")
    print(f"   ► Maxfiy Admin paroli:   admin123 (yoki Ctrl+Shift+A)")
    print(f"   ► SQLite ma'lumotlar:    {DB_PATH}")
    print("-" * 65)
    print("   Brauzer ochilmoqda... To'xtatish uchun: Ctrl + C")
    print("=" * 65)

    try:
        webbrowser.open(url)
    except Exception:
        pass

    app.run(host='0.0.0.0', port=PORT, debug=False)

if __name__ == '__main__':
    start_server()
