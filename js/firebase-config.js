/**
 * ULASH MARKET - Firebase Konfiguratsiyasi va Integratsiyasi
 * 
 * Firebase bilan ulash uchun:
 * 1. https://console.firebase.google.com/ saytiga kiring
 * 2. Yangi loyiha oching (masalan, "ulash-market")
 * 3. Web ilova (</>) qo'shing va quyidagi parametrlarni oling
 * 4. Bu parametrlarni yoki shu faylga, yoki to'g'ridan-to'g'ri "Direktor Paneli -> Sozlamalar" bo'limida kiritishingiz mumkin!
 */

const DEFAULT_FIREBASE_CONFIG = {
    apiKey: "SIZNING_FIREBASE_API_KEY",
    authDomain: "ulash-market.firebaseapp.com",
    projectId: "ulash-market",
    storageBucket: "ulash-market.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456"
};

// LocalStorage dan saqlangan sozlamani olish (agar admin paneldan kiritilgan bo'lsa)
let savedConfig = null;
try {
    const raw = localStorage.getItem('ulash_firebase_config');
    if (raw) savedConfig = JSON.parse(raw);
} catch (e) {}

const firebaseConfig = savedConfig || DEFAULT_FIREBASE_CONFIG;

// Firebase holati
const FirebaseState = {
    isConfigured: false,
    db: null,
    auth: null,
    config: firebaseConfig
};

// Agar haqiqiy API key kiritilgan bo'lsa, Firebase-ni ishga tushirish
if (typeof firebase !== 'undefined' && firebaseConfig.apiKey && firebaseConfig.apiKey !== "SIZNING_FIREBASE_API_KEY" && !firebaseConfig.apiKey.includes("SIZNING")) {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        FirebaseState.db = firebase.firestore();
        FirebaseState.auth = firebase.auth();
        FirebaseState.isConfigured = true;
        console.log("🔥 ULASH MARKET: Firebase muvaffaqiyatli ulandi!");
    } catch (err) {
        console.warn("Firebase initsializatsiyasida xatolik:", err);
    }
} else {
    console.log("ℹ️ ULASH MARKET: Firebase API kalitlari kiritilmagan. Tizim mahalliy (LocalStorage + BroadcastChannel) rejimida to‘liq xatosiz ishlamoqda.");
}

window.firebaseConfig = firebaseConfig;
window.FirebaseState = FirebaseState;
