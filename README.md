# ULASH MARKET — YAGONA ONLAYN MARKETPLACE

**ULASH MARKET** — Yandex Market, Yandex Go va zamonaviy supermarket xizmatlari andazasida yaratilgan, barcha do‘konlar, tovarlar, xaridorlar va kuryerlarni bitta platformada birlashtiruvchi yirik milliy onlayn marketplace tizimi.

Ushbu platforma yordamida foydalanuvchilar turli do‘konlardan mahsulotlarni qidirish, narx va parametrlarini solishtirish, savatchaga jamlash, promo-kod bilan chegirma olish, xaritada manzilni belgilab buyurtma berish va eshigigacha jonli 6 bosqichli yetkazib olish jarayonini kuzatish imkoniyatiga ega.

---

## 🌟 Asosiy Bo‘limlar va Imkoniyatlar

### 1. Bosh Sahifa va Do‘konlar Tizimi
- **Katta Qidiruv Paneli**: Barcha do‘konlar, tovar nomlari, brendlar va kategoriyalar bo‘yicha tezkor qidiruv.
- **Kategoriyalar**: Oziq-ovqat va ichimliklar, Smartfon va gadjetlar, Noutbuklar, Maishiy texnika, Kiyim-kechak, Go‘zallik va salomatlik, Sport.
- **Hamkor Do‘konlar (8 ta rasmiy do‘kon)**:
  1. **Korzinka Supermarket** (Oziq-ovqat, kundalik mahsulotlar)
  2. **Makro Supermarket City** (Yangi sabzavot-mevalar, oziq-ovqat)
  3. **Mediapark Bozor Elektronika** (Smartfonlar, noutbuklar, audio)
  4. **Idea Maishiy Texnika** (Televizorlar, konditsionerlar, maishiy buyumlar)
  5. **Terra Pro & Zara Fashion** (Zamonaviy kiyim-kechak, poyabzal)
  6. **Safia Cafe & Bakery** (Shirinliklar, tortlar, qandolatchilik)
  7. **Bellissimo Pizza & Burgers** (Issiq taomlar va fast food)
  8. **Bellstore Cosmetics & Perfumery** (Parfyumeriya va go‘zallik vositalari)
- **Do‘kon ma’lumotlari**: Nomi, logotipi, reytingi, ish vaqti, manzili, telefon raqami, yetkazish shartlari va do‘konga kirish.
- **Yaqin atrofdagi do‘konlar**: Haversine formulasi orqali foydalanuvchi joylashuviga nisbatan masofa (km) va yetkazish vaqti aniqlanadi.
- **Aksiya va Chegirmalar**: Flash Sale chegirmalar banneri va promo-kodlar (`ULASH10`, `YANGI2026`, `BAHOR50`).

### 2. Foydalanuvchi Tizimi va Rollar
- Telefon raqam yoki Gmail orqali ro‘yxatdan o‘tish va kirish.
- **3 ta asosiy rol**:
  1. **Admin (Bosh Direktor)** — maxfiy himoyalangan boshqaruv paneli.
  2. **Foydalanuvchi (Xaridor)** — xarid qilish, solishtirish, sevimliga saqlash, kuzatish.
  3. **Kuryer (Yetkazib beruvchi)** — yangi buyurtmalarni qabul qilish, marshrut xaritasi, daromad hisobi.
- **Direktor (Admin) Kirishi**: Maxfiy parol bilan himoyalangan (`admin123`). Kirish uchun ekrandagi qulf belgisi `🔒`, URL `#admin` yoki klaviatura orqali `Ctrl + Shift + A`.

### 3. Xaridor Paneli
- **Mahsulotlarni Solishtirish (⚖️)**: Bir vaqtning o‘zida 4 tagacha mahsulotning narxi, do‘koni, reytingi, chegirmasi va barcha texnik parametrlarini yonma-yon solishtirish jadvali.
- **Sevimli Mahsulotlar (❤️)**: Yoqqan mahsulotlarni bir bosishda saqlab qo‘yish va alohida ko‘rish.
- **Baho va Sharhlar qoldirish**: 1-5 yulduzli interaktiv reyting va xolisona matnli izoh qoldirish.
- **Interaktiv Xarita orqali Manzil Tanlash**: Leaflet.js orqali xaritada nuqtani belgilash, eng yaqin do‘kon va masofani aniqlash.
- **Savatcha va Promo-kod**: Bepul yetkazish progress bari va chegirma kodlarini qo‘llash.

### 4. Kuryer Tizimi
- **Yangi buyurtmalar hovuzi**: Olish do‘koni, mijoz manzili va komissiya summasi ko‘rsatiladi.
- **Atomar qulflash (Atomic Lock)**: Bitta buyurtmani bir vaqtning o‘zida faqat bitta kuryer qabul qila oladi; qabul qilingach boshqa kuryerlarga yopiladi.
- **Marshrut Xaritasi**: Do‘kondan mahsulotni olish nuqtasi va mijoz eshigi yo‘nalishi xaritada ko‘rsatiladi.
- **Bosqichlarni boshqarish**:
  - `Do‘kondan oldim, yo‘lga chiqdim` ➔ holat `Kuryer olib ketdi`ga o‘tadi.
  - `Mijozga yetkazdim` ➔ holat `Buyurtma yetkazildi`ga o‘tadi, salyut otiladi va kuryer balansiga +15 000 so‘m komissiya yoziladi.

### 5. Buyurtmalar Tizimi (6 Bosqichli Jonli Kuzatuv)
Buyurtma quyidagi 6 ta bosqichdan o‘tadi:
1. `Buyurtma yaratildi` (Mijoz buyurtma berdi)
2. `Do‘kon tasdiqladi` (Do‘kon tovarlarni tayyorlashga kirishdi)
3. `Kuryer qabul qildi` (Kuryer biriktirildi)
4. `Mahsulot tayyorlandi` (Do‘kondan olishga shay)
5. `Kuryer olib ketdi` (Kuryer xaridor manzili sari yo‘lda)
6. `Buyurtma yetkazildi` (Mijozga eshik oldida muvaffaqiyatli topshirildi)

Xaridor o‘z buyurtmasining qaysi bosqichda ekanini rangli visual progress stepper va xaritada ko‘rib turadi.

### 6. Direktor (Admin) Boshqaruv Paneli
- **Dashboard**: Jami savdo (UZS), buyurtmalar, tovarlar, do‘konlar va kuryerlar soni. Chart.js orqali haftalik savdo dinamikasi va do‘konlar ulushi diagrammalari.
- **Do‘konlar boshqaruvi (CRUD)**: Yangi do‘kon qo‘shish, tahrirlash, o‘chirish, manzil va logotipini yangilash.
- **Mahsulotlar ombori (CRUD)**: Tovar nomi, rasmi, narxi, eski narxi, chegirma %, ombor qoldig‘i, kategoriyasi va qaysi do‘konga tegishliligini biriktirish.
- **Buyurtmalar nazorati**: Bosqichlarni qo‘lda o‘zgartirish (1-6 bosqichlar), kuryerni qayta biriktirish, bekor qilish.
- **Kuryerlar & Mijozlar nazorati**: Kuryer qo‘shish, reytingi va ishlagan mablag‘ini kuzatish.
- **Promo-kodlar**: Yangi chegirma kodlarini kiritish va o‘chirish.
- **Tizim sozlamalari**: Yetkazish narxi, bepul yetkazish chegarasi, admin paroli.

---

## 💻 Texnologiyalar

- **Frontend**: HTML5, Modern CSS, Tailwind CSS (CDN), Vanilla JavaScript (Modular, Reactive).
- **Backend**: Python 3, Flask 3.1.3 REST API.
- **Ma'lumotlar bazasi**: SQLite 3 (`ulash_market.db`) — avtomatik jadval va dastlabki ma'lumotlar (seed) bilan ta'minlangan.
- **Xarita xizmati**: Leaflet.js & OpenStreetMap (bepul, API limitsiz va cheklovlarsiz ishlaydi).
- **Grafiklar va Vizual**: Chart.js va Canvas Confetti.

---

## 🚀 Ishga Tushirish Qo‘llanmasi

### 1-usul: Windows uchun 1-bosishda ishga tushirish (Tavsiya etiladi)
Loyiha papkasidagi `start.bat` faylini ikki marta bosing. Server ishga tushadi va brauzer avtomatik ravishda `http://localhost:8000` manzilida ochiladi.

### 2-usul: Terminal / Buyruqlar satri orqali
```bash
# Loyiha papkasiga o'ting
cd C:\Users\user\Desktop\mar

# Flask backend serverini ishga tushiring
python server.py
```

Brauzerda oching:
- **Asosiy Marketplace**: `http://localhost:8000`
- **Kuryer Paneli**: `http://localhost:8000#courier`
- **Direktor Paneli**: `http://localhost:8000#admin` (Parol: `admin123`)

---

## 🌐 Xosting va Joylashtirish

1. **Frontend (GitHub Pages)**:
   - Ushbu frontend kodi to‘liq mustaqil (standalone) rejimda ham `LocalStorage` va `BroadcastChannel` orqali ishlay oladi.
   - Loyihani GitHub-ga yuklab, repository sozlamalarida `GitHub Pages`ni yoqish kifoya.

2. **Backend (Alohida server / VPS / Cloud)**:
   - `server.py` faylini har qanday VPS (Ubuntu/Debian) yoki Python cloud hostingga (Render, Railway, Heroku, PythonAnywhere) joylashtirish mumkin.
   - WSGI server bilan ishga tushirish: `gunicorn -w 4 -b 0.0.0.0:8000 server:app`.

---

## 🔒 Xavfsizlik

- Admin paneliga maxsus server va mijoz tomonlama autentifikatsiya orqali kiriladi.
- Parollar SHA-256 xeshlash orqali saqlanadi.
- Kuryer buyurtmani qabul qilishi atomar tranzaksiya bilan himoyalangan (poyga holatlari yo‘q).
- Ombordagi mahsulot soni buyurtma berilganda kamayadi, bekor qilinganda avtomatik tiklanadi.
