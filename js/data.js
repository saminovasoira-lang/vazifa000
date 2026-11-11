/**
 * ULASH MARKET - Dastlabki Tizim Ma'lumotlari (Initial Seed Data)
 * Kategoriyalar, Do'konlar, Mahsulotlar, Kuryerlar, Buyurtmalar va Promo-kodlar
 */

const INITIAL_CATEGORIES = [
    { id: 'smartfonlar', name: 'Smartfon va gadjetlar', icon: 'smartphone', badge: 'Ommabop', color: 'blue' },
    { id: 'noutbuklar', name: 'Noutbuk va kompyuterlar', icon: 'laptop', badge: 'Top', color: 'indigo' },
    { id: 'maishiy-texnika', name: 'Maishiy texnika', icon: 'tv', badge: 'Kafolatli', color: 'sky' },
    { id: 'kiyim', name: 'Kiyim va poyabzallar', icon: 'shirt', badge: 'Trend', color: 'rose' },
    { id: 'oziq-ovqat', name: 'Oziq-ovqat va ichimliklar', icon: 'shopping-bag', badge: 'Tezkor', color: 'emerald' },
    { id: 'gozallik', name: "Go'zallik va salomatlik", icon: 'sparkles', badge: 'Original', color: 'amber' },
    { id: 'sport', name: 'Sport va hordiq', icon: 'dumbbell', badge: 'Yangi', color: 'cyan' }
];

const INITIAL_STORES = [
    {
        id: 'store-1',
        name: 'Korzinka Supermarket',
        shortName: 'Korzinka',
        logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=300&q=80',
        category: 'oziq-ovqat',
        address: "Toshkent sh., Chilonzor tumani, Qatortol ko'chasi 45-uy",
        district: 'Chilonzor',
        phone: '+998 71 140-14-14',
        workingHours: '08:00 - 23:00',
        lat: 41.2721,
        lng: 69.2045,
        rating: 4.9,
        reviewsCount: 1420,
        deliveryTime: '25-35 daqiqa',
        deliveryFee: 12000,
        minOrder: 40000,
        isActive: true,
        deliveryConditions: "350 000 so‘mdan yuqori xaridlarga yetkazib berish mutlaqo bepul."
    },
    {
        id: 'store-2',
        name: 'Makro Supermarket City',
        shortName: 'Makro',
        logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80',
        category: 'oziq-ovqat',
        address: "Toshkent sh., Yunusobod tumani, Amir Temur shoh ko'chasi 112-uy",
        district: 'Yunusobod',
        phone: '+998 71 205-12-34',
        workingHours: '08:00 - 23:00',
        lat: 41.3542,
        lng: 69.2889,
        rating: 4.8,
        reviewsCount: 980,
        deliveryTime: '30-40 daqiqa',
        deliveryFee: 15000,
        minOrder: 35000,
        isActive: true,
        deliveryConditions: "Har kuni yangi sabzavot va mevalar to'g'ridan-to'g'ri xonadoningizga."
    },
    {
        id: 'store-3',
        name: 'Mediapark Bozor Elektronika',
        shortName: 'Mediapark',
        logo: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=300&q=80',
        category: 'smartfonlar',
        address: "Toshkent sh., Shayxontohur tumani, Qoratosh ko'chasi 11A",
        district: 'Shayxontohur',
        phone: '+998 71 203-33-33',
        workingHours: '09:00 - 22:00',
        lat: 41.3111,
        lng: 69.2325,
        rating: 4.95,
        reviewsCount: 2150,
        deliveryTime: '35-50 daqiqa',
        deliveryFee: 20000,
        minOrder: 100000,
        isActive: true,
        deliveryConditions: "1 yil rasmiy kafolat, qadoqni ochib tekshirib olish imkoniyati."
    },
    {
        id: 'store-4',
        name: 'Idea Maishiy Texnika',
        shortName: 'Idea',
        logo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=300&q=80',
        category: 'maishiy-texnika',
        address: "Toshkent sh., Mirzo Ulug'bek tumani, Buyuk Ipak Yo'li ko'chasi 78-uy",
        district: "Mirzo Ulug'bek",
        phone: '+998 71 230-77-99',
        workingHours: '09:00 - 21:00',
        lat: 41.3267,
        lng: 69.3312,
        rating: 4.85,
        reviewsCount: 870,
        deliveryTime: '40-60 daqiqa',
        deliveryFee: 25000,
        minOrder: 150000,
        isActive: true,
        deliveryConditions: "Katta o'lchamli texnikalarni qavatga ko'tarib o'rnatib berish xizmati."
    },
    {
        id: 'store-5',
        name: 'Terra Pro & Zara Fashion',
        shortName: 'Terra Pro',
        logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=300&q=80',
        category: 'kiyim',
        address: "Toshkent sh., Mirobod tumani, Shahrisabz ko'chasi 10-uy",
        district: 'Mirobod',
        phone: '+998 71 200-88-11',
        workingHours: '10:00 - 22:00',
        lat: 41.3005,
        lng: 69.2780,
        rating: 4.75,
        reviewsCount: 640,
        deliveryTime: '30-45 daqiqa',
        deliveryFee: 15000,
        minOrder: 50000,
        isActive: true,
        deliveryConditions: "O'lcham to'g'ri kelmasa kuryer kutib turadi yoki almashtirib beriladi."
    },
    {
        id: 'store-6',
        name: 'Safia Cafe & Bakery',
        shortName: 'Safia',
        logo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80',
        category: 'oziq-ovqat',
        address: "Toshkent sh., Yakkasaroy tumani, Shota Rustaveli ko'chasi 32-uy",
        district: 'Yakkasaroy',
        phone: '+998 71 200-50-50',
        workingHours: '08:00 - 22:00',
        lat: 41.2890,
        lng: 69.2530,
        rating: 4.92,
        reviewsCount: 1890,
        deliveryTime: '20-30 daqiqa',
        deliveryFee: 10000,
        minOrder: 30000,
        isActive: true,
        deliveryConditions: "Har doim issiq va yangi pishirilgan sifatli shirinliklar."
    },
    {
        id: 'store-7',
        name: 'Bellissimo Pizza & Burgers',
        shortName: 'Bellissimo',
        logo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80',
        category: 'oziq-ovqat',
        address: "Toshkent sh., Chilonzor 9-mavze, Bunyodkor ko'chasi 15-uy",
        district: 'Chilonzor',
        phone: '+998 71 205-11-11',
        workingHours: '10:00 - 02:00',
        lat: 41.2820,
        lng: 69.2120,
        rating: 4.88,
        reviewsCount: 3120,
        deliveryTime: '25-35 daqiqa',
        deliveryFee: 12000,
        minOrder: 45000,
        isActive: true,
        deliveryConditions: "30 daqiqada yetkazilmasa — keyingi buyurtmaga vaucher beriladi!"
    },
    {
        id: 'store-8',
        name: 'Bellstore Cosmetics & Perfumery',
        shortName: 'Bellstore',
        logo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80',
        category: 'gozallik',
        address: "Toshkent sh., Sergeli tumani, Yangisergeli ko'chasi 24-uy",
        district: 'Sergeli',
        phone: '+998 71 200-44-00',
        workingHours: '09:00 - 21:00',
        lat: 41.2238,
        lng: 69.2215,
        rating: 4.82,
        reviewsCount: 530,
        deliveryTime: '35-50 daqiqa',
        deliveryFee: 15000,
        minOrder: 80000,
        isActive: true,
        deliveryConditions: "100% original brend sertifikatlari bilan ta'minlangan go'zallik vositalari."
    }
];

const INITIAL_PRODUCTS = [
    {
        id: 'p-1',
        name: 'iPhone 16 Pro Max 256GB Natural Titanium',
        brand: 'Apple',
        category: 'smartfonlar',
        storeId: 'store-3',
        storeName: 'Mediapark Bozor Elektronika',
        price: 16500000,
        originalPrice: 18200000,
        discountPercent: 9,
        stock: 14,
        rating: 4.9,
        reviewsCount: 148,
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
        description: "Eng so'nggi A18 Pro chipiga ega flagman smartfon. Titan korpus, 48 MP asosiy kamera, 5x optik zoom va ajoyib avtonomlik. 1 yil rasmiy kafolat bilan.",
        isFeatured: true,
        badge: 'Xit savdo',
        specs: {
            "Ekran": "6.9 dyuym Super Retina XDR OLED, 120Hz",
            "Protsessor": "Apple A18 Pro (3 nm)",
            "Doimiy xotira": "256 GB",
            "Kamera": "48 MP + 48 MP + 12 MP",
            "Batareya": "4685 mA/soat, tezkor quvvatlash"
        }
    },
    {
        id: 'p-2',
        name: 'Samsung Galaxy S24 Ultra 12/512GB Titanium Gray',
        brand: 'Samsung',
        category: 'smartfonlar',
        storeId: 'store-3',
        storeName: 'Mediapark Bozor Elektronika',
        price: 14200000,
        originalPrice: 16000000,
        discountPercent: 11,
        stock: 9,
        rating: 4.8,
        reviewsCount: 92,
        image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
        description: "Galaxy AI imkoniyatlari bilan boyitilgan titan korpusli super-flagman. S-Pen qalami, 200MP kamera va yorqin 2600 nit AMOLED displey.",
        isFeatured: true,
        badge: 'AI Tavsiya',
        specs: {
            "Ekran": "6.8 dyuym Dynamic AMOLED 2X, 120Hz",
            "Protsessor": "Snapdragon 8 Gen 3 for Galaxy",
            "Xotira": "12 GB RAM / 512 GB ROM",
            "Kamera": "200 MP + 50 MP + 12 MP + 10 MP",
            "Batareya": "5000 mA/soat"
        }
    },
    {
        id: 'p-3',
        name: 'MacBook Air 13 M3 8-Core CPU / 16GB / 512GB Space Gray',
        brand: 'Apple',
        category: 'noutbuklar',
        storeId: 'store-3',
        storeName: 'Mediapark Bozor Elektronika',
        price: 15800000,
        originalPrice: 17500000,
        discountPercent: 10,
        stock: 6,
        rating: 4.95,
        reviewsCount: 84,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
        description: "Apple M3 chipi bilan quvvatlangan engil va kuchli ultrabuk. Kun bo'yi quvvatsiz ishlaydi (18 soatgacha). Silent fanless sovutish tizimi.",
        isFeatured: true,
        badge: 'Top Tanlov',
        specs: {
            "Ekran": "13.6 dyuym Liquid Retina Display",
            "Chip": "Apple M3 (8 yadroli CPU, 10 yadroli GPU)",
            "Tezkor xotira": "16 GB birlashgan xotira",
            "SSD xotira": "512 GB tezkor NVMe",
            "Vazni": "1.24 kg"
        }
    },
    {
        id: 'p-4',
        name: 'Asus ROG Strix G16 i7-13650HX / RTX 4060 / 16GB / 1TB',
        brand: 'Asus',
        category: 'noutbuklar',
        storeId: 'store-3',
        storeName: 'Mediapark Bozor Elektronika',
        price: 17200000,
        originalPrice: 19800000,
        discountPercent: 13,
        stock: 4,
        rating: 4.85,
        reviewsCount: 57,
        image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
        description: "Eng og'ir zamonaviy o'yinlar va 3D modellashtirish uchun mo'ljallangan qudratli o'yin noutbuki. 165Hz tezkor ROG Nebula displey.",
        isFeatured: false,
        badge: 'Gaming',
        specs: {
            "Protsessor": "Intel Core i7-13650HX (14 yadro, 24 potok)",
            "Videokarta": "NVIDIA GeForce RTX 4060 8GB GDDR6",
            "Xotira": "16 GB DDR5 / 1 TB PCIe 4.0 NVMe",
            "Ekran": "16 dyuym FHD+ 165Hz, 100% sRGB"
        }
    },
    {
        id: 'p-5',
        name: 'LG 55 OLED 4K Smart TV evo C3 Series (2024)',
        brand: 'LG',
        category: 'maishiy-texnika',
        storeId: 'store-4',
        storeName: 'Idea Maishiy Texnika',
        price: 13500000,
        originalPrice: 15900000,
        discountPercent: 15,
        stock: 8,
        rating: 4.92,
        reviewsCount: 61,
        image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=80',
        description: "Mukammal qora rang va cheksiz kontrast beruvchi OLED evo matritsa. Dolby Vision va Dolby Atmos qo'llab-quvvatlaydi, 120Hz geyming rejimi mavjud.",
        isFeatured: true,
        badge: 'Kinozal',
        specs: {
            "Diagonal": "55 dyuym (139 sm)",
            "Displey turi": "OLED evo 4K UHD",
            "Chastota": "120Hz (VRR, G-Sync, FreeSync)",
            "Operatsion tizim": "webOS 24 sun'iy intellekt bilan"
        }
    },
    {
        id: 'p-6',
        name: 'Artel Inverter Konditsioner 12000 BTU Grand White',
        brand: 'Artel',
        category: 'maishiy-texnika',
        storeId: 'store-4',
        storeName: 'Idea Maishiy Texnika',
        price: 4600000,
        originalPrice: 5200000,
        discountPercent: 12,
        stock: 18,
        rating: 4.75,
        reviewsCount: 115,
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
        description: "35 kv.m gacha bo'lgan xonalarni tez va tejamkor sovitish va isitish. A++ energiya tejamkorlik toifasi va past shovqin darajasi (21 dB). 3 yil to'liq kafolat.",
        isFeatured: false,
        badge: 'Tejamkor',
        specs: {
            "Xona maydoni": "35 kv.m gacha",
            "Freon turi": "R32 ekologik toza",
            "Kompressor": "Inverter energiya tejovchi",
            "Kafolat": "3 yil rasmiy Artel servis kafolati"
        }
    },
    {
        id: 'p-7',
        name: 'Sony WH-1000XM5 Shovqinni bekor qiluvchi quloqchin',
        brand: 'Sony',
        category: 'smartfonlar',
        storeId: 'store-3',
        storeName: 'Mediapark Bozor Elektronika',
        price: 4300000,
        originalPrice: 4900000,
        discountPercent: 12,
        stock: 12,
        rating: 4.93,
        reviewsCount: 186,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        description: "Bozordagi eng kuchli faol shovqin bekor qilish (ANC) tizimi. 30 soatgacha to'xtovsiz musiqa tinglash va kristaldek toza mikrofon suhbati.",
        isFeatured: true,
        badge: 'Premium Ovoz',
        specs: {
            "Batareya": "30 soat (ANC yoniq holda)",
            "Ulanish": "Bluetooth 5.2, LDAC, Hi-Res Audio",
            "Og'irligi": "250 gramm"
        }
    },
    {
        id: 'p-8',
        name: 'Nike Air Max 270 Black & White Original Krossovka',
        brand: 'Nike',
        category: 'kiyim',
        storeId: 'store-5',
        storeName: 'Terra Pro & Zara Fashion',
        price: 1450000,
        originalPrice: 1800000,
        discountPercent: 19,
        stock: 22,
        rating: 4.82,
        reviewsCount: 143,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
        description: "Nike brendining eng qulay kundalik krossovkasi. Tovondagi ulkan Max Air yostiqchasi qadamni nihoyatda yumshoq va elastik qiladi. Nafas oluvchi to'rli mato.",
        isFeatured: true,
        badge: 'Trend 2026',
        specs: {
            "O'lchamlar": "40, 41, 42, 43, 44, 45",
            "Tepa qismi": "Yengil tekstil va mustahkam polimer",
            "Amortizatsiya": "Max Air 270 havo yostig'i"
        }
    },
    {
        id: 'p-9',
        name: 'Erkaklar uchun Klassik Paxta Kostyum-Shim Navy Blue',
        brand: 'Zara',
        category: 'kiyim',
        storeId: 'store-5',
        storeName: 'Terra Pro & Zara Fashion',
        price: 1850000,
        originalPrice: 2300000,
        discountPercent: 20,
        stock: 11,
        rating: 4.65,
        reviewsCount: 42,
        image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
        description: "Yuqori sifatli Turkiya matosidan tikilgan zamonaviy slim-fit bichimli kostyum-shim. To'y, tantanalar va ish uchrashuvlari uchun ideal.",
        isFeatured: false,
        badge: 'Klassika',
        specs: {
            "Tarkibi": "70% paxta, 25% viskoza, 5% elastan",
            "Bichimi": "Slim Fit",
            "Rang": "To'q ko'k (Navy)"
        }
    },
    {
        id: 'p-10',
        name: 'Lattafe Asad Eau de Parfum 100ml Erkaklar Atiri',
        brand: 'Lattafa',
        category: 'gozallik',
        storeId: 'store-8',
        storeName: 'Bellstore Cosmetics & Perfumery',
        price: 390000,
        originalPrice: 550000,
        discountPercent: 29,
        stock: 28,
        rating: 4.88,
        reviewsCount: 230,
        image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
        description: "Sharqona qora qahva, vanil va xushbo'y ziravorlar notalari bilan boyitilgan, 24 soatdan ortiq saqlanuvchi hashamatli erkaklar parfyumi.",
        isFeatured: true,
        badge: 'Bestseller',
        specs: {
            "Hajmi": "100 ml",
            "Turi": "Eau De Parfum",
            "Mustahkamligi": "24 soatgacha shleyfli"
        }
    },
    {
        id: 'p-11',
        name: 'Dyson Airwrap Multi-Styler Complete Long Soch Shakllantirgich',
        brand: 'Dyson',
        category: 'gozallik',
        storeId: 'store-8',
        storeName: 'Bellstore Cosmetics & Perfumery',
        price: 7200000,
        originalPrice: 8100000,
        discountPercent: 11,
        stock: 5,
        rating: 4.96,
        reviewsCount: 95,
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
        description: "Haddan tashqari qizdirmasdan soch turmaklovchi Coanda effekti. Sochni bir vaqtning o'zida quritadi va jiloli to'lqin hosil qiladi.",
        isFeatured: true,
        badge: 'Top Brend',
        specs: {
            "Quvvat": "1300 Vt",
            "Nasatkalar": "6 xil professional nasadka",
            "Kafolat": "2 yil xalqaro kafolat"
        }
    },
    {
        id: 'p-12',
        name: 'Rio Mare Zaytun moyidagi Tuns balig‘i 3x80g (Italiya)',
        brand: 'Rio Mare',
        category: 'oziq-ovqat',
        storeId: 'store-1',
        storeName: 'Korzinka Supermarket',
        price: 98000,
        originalPrice: 120000,
        discountPercent: 18,
        stock: 65,
        rating: 4.9,
        reviewsCount: 312,
        image: 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=800&q=80',
        description: "Toza zaytun moyida konservalangan, tabiiy oqsil va Omega-3 ga boy xushbo'y tuns balig'i filesi. Salatlar va pishiriqlar uchun a'lo tanlov.",
        isFeatured: false,
        badge: 'Italiya',
        specs: {
            "Og'irligi": "3 dona x 80 gramm",
            "Tarkibi": "Sariq qanotli tunes, zaytun moyi, tuz"
        }
    },
    {
        id: 'p-13',
        name: 'Lavazza Qualita Oro Tabiiy Donli Qahva 1kg',
        brand: 'Lavazza',
        category: 'oziq-ovqat',
        storeId: 'store-1',
        storeName: 'Korzinka Supermarket',
        price: 320000,
        originalPrice: 380000,
        discountPercent: 16,
        stock: 35,
        rating: 4.85,
        reviewsCount: 177,
        image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80',
        description: "100% Markaziy va Janubiy Amerika Arabikasi donalari. Gullar va mevali nozik notalarga ega bo'lgan klassik italyancha espresso qahvasi.",
        isFeatured: false,
        badge: '100% Arabica',
        specs: {
            "Og'irligi": "1000 gramm (1 kg)",
            "Qovurilish darajasi": "O'rtacha (Medium Roast)"
        }
    },
    {
        id: 'p-14',
        name: 'Safia Qizil Baxmal (Red Velvet) Torti 1.2kg',
        brand: 'Safia',
        category: 'oziq-ovqat',
        storeId: 'store-6',
        storeName: 'Safia Cafe & Bakery',
        price: 175000,
        originalPrice: 210000,
        discountPercent: 17,
        stock: 20,
        rating: 4.94,
        reviewsCount: 280,
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
        description: "Krem-chizli yumshoq qatlamlar va qizil nozik biskvit. Safia qandolatchiligining eng sevimli desertlaridan biri. Har kuni yangi tayyorlanadi.",
        isFeatured: true,
        badge: 'Shirinlik',
        specs: {
            "Vazni": "1.2 kg",
            "Tarkibi": "Krem-chiz, tabiiy sariyog', vanil, biskvit"
        }
    },
    {
        id: 'p-15',
        name: 'Bellissimo Peperoni & Qazili Maxsus Pitsa 35cm',
        brand: 'Bellissimo',
        category: 'oziq-ovqat',
        storeId: 'store-7',
        storeName: 'Bellissimo Pizza & Burgers',
        price: 95000,
        originalPrice: 115000,
        discountPercent: 17,
        stock: 50,
        rating: 4.89,
        reviewsCount: 410,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
        description: "Qarsildoq xamir, ko'p miqdordagi mozzarella pishlog'i, achchiq peperoni va milliy sifatli qazi bo'laklari bilan issiq pitsa.",
        isFeatured: true,
        badge: 'Issiq yetkazish',
        specs: {
            "Diametri": "35 sm (Katta o'lcham)",
            "Bo'laklar soni": "8 bo'lak"
        }
    },
    {
        id: 'p-16',
        name: 'Xiaomi Electric Scooter 4 Pro Elektr Samokat 25km/soat',
        brand: 'Xiaomi',
        category: 'sport',
        storeId: 'store-3',
        storeName: 'Mediapark Bozor Elektronika',
        price: 6800000,
        originalPrice: 7900000,
        discountPercent: 14,
        stock: 7,
        rating: 4.78,
        reviewsCount: 88,
        image: 'https://images.unsplash.com/photo-1559348349-86f1f65817fe?auto=format&fit=crop&w=800&q=80',
        description: "Bir zaryad bilan 55 km masofani bosib o'tuvchi yangi avlod elektr samokati. 10 dyuymli tubeless mustahkam g'ildiraklar va ikki tomonlama disk tormoz.",
        isFeatured: true,
        badge: 'Tezkor Shahar',
        specs: {
            "Tezlik": "25 km/soat gacha",
            "Yurish masofasi": "55 km gacha",
            "Maksimal yuk": "120 kg"
        }
    },
    {
        id: 'p-17',
        name: 'Fitnes Gantellar To‘plami 2x15kg Xrom Qoplamali',
        brand: 'Torneo',
        category: 'sport',
        storeId: 'store-4',
        storeName: 'Idea Maishiy Texnika',
        price: 850000,
        originalPrice: 1100000,
        discountPercent: 23,
        stock: 19,
        rating: 4.7,
        reviewsCount: 64,
        image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
        description: "Uy sharoitida shug'ullanish uchun yig'iladigan qulay xromlangan gantellar to'plami. Maxsus qulflar va qulay ushlagich bilan to'liq xavfsiz.",
        isFeatured: false,
        badge: 'Sport',
        specs: {
            "Jami og'irligi": "30 kg (har biri 15 kg)",
            "Material": "Yuqori sifatli xromli po'lat"
        }
    },
    {
        id: 'p-18',
        name: 'Sony PlayStation 5 Slim 1TB + 2 ta DualSense Joystik',
        brand: 'Sony',
        category: 'noutbuklar',
        storeId: 'store-3',
        storeName: 'Mediapark Bozor Elektronika',
        price: 7400000,
        originalPrice: 8200000,
        discountPercent: 10,
        stock: 10,
        rating: 4.97,
        reviewsCount: 204,
        image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
        description: "Ultra ixcham o'lchamli yangi PS5 Slim versiyasi. 1TB tezkor SSD xotira va to'plamda 2 ta original oq rangli DualSense geympadi bilan.",
        isFeatured: true,
        badge: 'Xit Sotuv',
        specs: {
            "Xotira": "1 TB ultra-tezkor NVMe SSD",
            "Ruxsat": "4K 120Hz va 8K qo'llab-quvvatlaydi"
        }
    }
];

const INITIAL_COURIERS = [
    {
        id: 'cour-1',
        name: 'Sardor Aliyev',
        phone: '+998 90 123-45-67',
        email: 'sardor.kuryer@gmail.com',
        transport: 'Skuter (Honda Dio)',
        rating: 4.95,
        completedOrders: 142,
        earningsTotal: 2130000,
        status: 'online', // online, busy, offline
        lat: 41.278,
        lng: 69.215,
        assignedStoreId: 'store-1'
    },
    {
        id: 'cour-2',
        name: 'Jasur Karimov',
        phone: '+998 93 987-65-43',
        email: 'jasur.kuryer@gmail.com',
        transport: 'Chevrolet Spark (Oq)',
        rating: 4.88,
        completedOrders: 98,
        earningsTotal: 1470000,
        status: 'online',
        lat: 41.350,
        lng: 69.282,
        assignedStoreId: 'store-2'
    },
    {
        id: 'cour-3',
        name: 'Bobur Rahimov',
        phone: '+998 97 555-44-33',
        email: 'bobur.kuryer@gmail.com',
        transport: 'Elektr Velosiped',
        rating: 4.91,
        completedOrders: 64,
        earningsTotal: 960000,
        status: 'online',
        lat: 41.320,
        lng: 69.325,
        assignedStoreId: 'store-4'
    }
];

const INITIAL_USERS = [
    {
        id: 'usr-admin',
        name: 'Direktor (Admin)',
        phone: '+998 71 200-00-00',
        email: 'admin@ulash.market',
        role: 'admin',
        defaultAddress: "Toshkent sh., Amir Temur shoh ko‘chasi 1-uy",
        district: 'Yunusobod',
        lat: 41.3110,
        lng: 69.2790,
        registeredAt: '2026-01-01'
    },
    {
        id: 'usr-1',
        name: 'Anvar Qosimov',
        phone: '+998 90 555-11-22',
        email: 'anvar@gmail.com',
        role: 'user',
        defaultAddress: "Chilonzor 7-mavze, 12-uy, 45-xonadon",
        district: 'Chilonzor',
        lat: 41.2750,
        lng: 69.2100,
        registeredAt: '2026-01-15'
    },
    {
        id: 'usr-2',
        name: 'Dilnoza Karimova',
        phone: '+998 94 333-22-11',
        email: 'dilnoza@gmail.com',
        role: 'user',
        defaultAddress: "Yunusobod 14-mavze, 5-uy, 18-xonadon",
        district: 'Yunusobod',
        lat: 41.3580,
        lng: 69.2850,
        registeredAt: '2026-02-01'
    },
    {
        id: 'usr-3',
        name: 'Olimjon Vohidov',
        phone: '+998 91 777-88-99',
        email: 'olim@gmail.com',
        role: 'user',
        defaultAddress: "Mirzo Ulug'bek, Qorasuv 4-mavze, 23-uy",
        district: "Mirzo Ulug'bek",
        lat: 41.3310,
        lng: 69.3380,
        registeredAt: '2026-02-10'
    }
];

const INITIAL_ORDERS = [
    {
        id: 'ORD-1092',
        createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        customer: {
            name: 'Anvar Qosimov',
            phone: '+998 90 555-11-22',
            address: "Chilonzor 7-mavze, 12-uy, 45-xonadon (Orientir: 173-maktab ro'parasida)",
            district: 'Chilonzor',
            lat: 41.2750,
            lng: 69.2100
        },
        items: [
            {
                productId: 'p-1',
                name: 'iPhone 16 Pro Max 256GB Natural Titanium',
                price: 16500000,
                quantity: 1,
                image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80'
            },
            {
                productId: 'p-7',
                name: 'Sony WH-1000XM5 Shovqinni bekor qiluvchi quloqchin',
                price: 4300000,
                quantity: 1,
                image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
            }
        ],
        subtotal: 20800000,
        deliveryFee: 0,
        discountApplied: 0,
        promoCode: null,
        total: 20800000,
        paymentMethod: 'Click / Payme',
        paymentStatus: 'To‘langan',
        storeId: 'store-3',
        storeName: 'Mediapark Bozor Elektronika',
        distanceKm: 2.3,
        status: 'Kuryer qabul qildi', // 3-bosqich
        courierId: 'cour-1',
        courierName: 'Sardor Aliyev',
        courierPhone: '+998 90 123-45-67',
        statusHistory: [
            { status: 'Buyurtma yaratildi', time: new Date(Date.now() - 1000 * 60 * 18).toISOString(), note: 'Mijoz tomonidan buyurtma berildi' },
            { status: 'Do‘kon tasdiqladi', time: new Date(Date.now() - 1000 * 60 * 15).toISOString(), note: 'Do‘kon buyurtmani qabul qildi' },
            { status: 'Kuryer qabul qildi', time: new Date(Date.now() - 1000 * 60 * 10).toISOString(), note: 'Kuryer Sardor Aliyev buyurtmani qabul qildi' }
        ]
    },
    {
        id: 'ORD-1093',
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        customer: {
            name: 'Dilnoza Karimova',
            phone: '+998 94 333-22-11',
            address: "Yunusobod 14-mavze, 5-uy, 18-xonadon",
            district: 'Yunusobod',
            lat: 41.3580,
            lng: 69.2850
        },
        items: [
            {
                productId: 'p-10',
                name: 'Lattafe Asad Eau de Parfum 100ml Erkaklar Atiri',
                price: 390000,
                quantity: 1,
                image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80'
            },
            {
                productId: 'p-13',
                name: 'Lavazza Qualita Oro Tabiiy Donli Qahva 1kg',
                price: 320000,
                quantity: 1,
                image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80'
            }
        ],
        subtotal: 710000,
        deliveryFee: 0,
        discountApplied: 0,
        promoCode: null,
        total: 710000,
        paymentMethod: 'Naqd pul (kuryerga)',
        paymentStatus: 'Kutilmoqda',
        storeId: 'store-1',
        storeName: 'Korzinka Supermarket',
        distanceKm: 1.8,
        status: 'Do‘kon tasdiqladi', // 2-bosqich (kuryer qabul qilishi kutilmoqda)
        courierId: null,
        courierName: null,
        courierPhone: null,
        statusHistory: [
            { status: 'Buyurtma yaratildi', time: new Date(Date.now() - 1000 * 60 * 5).toISOString(), note: 'Mijoz tomonidan buyurtma berildi' },
            { status: 'Do‘kon tasdiqladi', time: new Date(Date.now() - 1000 * 60 * 3).toISOString(), note: 'Do‘kon mahsulotlarni qadoqlashga kirishdi' }
        ]
    },
    {
        id: 'ORD-1088',
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        customer: {
            name: 'Olimjon Vohidov',
            phone: '+998 91 777-88-99',
            address: "Mirzo Ulug'bek, Qorasuv 4-mavze, 23-uy",
            district: "Mirzo Ulug'bek",
            lat: 41.3310,
            lng: 69.3380
        },
        items: [
            {
                productId: 'p-8',
                name: 'Nike Air Max 270 Black & White Original Krossovka',
                price: 1450000,
                quantity: 1,
                image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'
            }
        ],
        subtotal: 1450000,
        deliveryFee: 0,
        discountApplied: 0,
        promoCode: null,
        total: 1450000,
        paymentMethod: 'Click / Payme',
        paymentStatus: 'To‘langan',
        storeId: 'store-5',
        storeName: 'Terra Pro & Zara Fashion',
        distanceKm: 1.2,
        status: 'Buyurtma yetkazildi', // 6-bosqich
        courierId: 'cour-3',
        courierName: 'Bobur Rahimov',
        courierPhone: '+998 97 555-44-33',
        statusHistory: [
            { status: 'Buyurtma yaratildi', time: new Date(Date.now() - 1000 * 60 * 120).toISOString(), note: 'Buyurtma rasmiylashtirildi' },
            { status: 'Do‘kon tasdiqladi', time: new Date(Date.now() - 1000 * 60 * 115).toISOString(), note: 'Do‘kon buyurtmani tasdiqladi' },
            { status: 'Kuryer qabul qildi', time: new Date(Date.now() - 1000 * 60 * 110).toISOString(), note: 'Kuryer Bobur Rahimov biriktirildi' },
            { status: 'Mahsulot tayyorlandi', time: new Date(Date.now() - 1000 * 60 * 95).toISOString(), note: 'Do‘kondan olishga tayyor' },
            { status: 'Kuryer olib ketdi', time: new Date(Date.now() - 1000 * 60 * 80).toISOString(), note: 'Kuryer manzil sari yo‘lga chiqdi' },
            { status: 'Buyurtma yetkazildi', time: new Date(Date.now() - 1000 * 60 * 45).toISOString(), note: 'Mijozga topshirildi' }
        ]
    }
];

const INITIAL_PROMOS = [
    { id: 'prm-1', code: 'ULASH10', discountPercent: 10, minOrder: 100000, expiresAt: '2026-12-31', isActive: true },
    { id: 'prm-2', code: 'YANGI2026', discountPercent: 15, minOrder: 200000, expiresAt: '2026-12-31', isActive: true },
    { id: 'prm-3', code: 'BAHOR50', discountPercent: 5, minOrder: 50000, expiresAt: '2026-06-30', isActive: true }
];

const INITIAL_REVIEWS = [
    { id: 'rev-1', productId: 'p-1', userName: 'Anvar Qosimov', rating: 5, comment: "Nihoyatda sifatli va original telefon. 30 daqiqada Mediaparkdan kuryer keltirib berdi!", createdAt: '2026-02-15' },
    { id: 'rev-2', productId: 'p-1', userName: 'Sardor M.', rating: 5, comment: "Kameralari juda zo'r. Rahmat Ulash Market jamoasiga!", createdAt: '2026-02-20' },
    { id: 'rev-3', productId: 'p-2', userName: 'Dilnoza K.', rating: 5, comment: "S-Pen qalami juda qulay ekan. AI funksiyalari a'lo darajada.", createdAt: '2026-02-25' },
    { id: 'rev-4', productId: 'p-14', userName: 'Kamola S.', rating: 5, comment: "Safia tortlari doimgidek eng sarasi. Yangi va mazali!", createdAt: '2026-03-01' }
];

const INITIAL_SETTINGS = {
    storeName: 'ULASH MARKET',
    tagline: 'Barcha do‘konlar, mahsulotlar va kuryerlar yagona onlayn marketplace tizimida',
    baseDeliveryFee: 15000, // so'm
    freeDeliveryThreshold: 350000, // so'm dan yuqori bepul
    courierCommission: 15000, // har bir buyurtma uchun kuryer daromadi
    adminSecretPin: 'admin123',
    supportPhone: '+998 71 200-00-00',
    telegramBot: '@ulash_market_bot'
};
