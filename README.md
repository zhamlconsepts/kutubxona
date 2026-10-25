# 📚 Maktab Kutubxonasi — Avtomatlashtirilgan Hisob Tizimi (v2.0)

Zamonaviy, nafis (Pahari pergament estetikasi) va 100% internetsiz (**Offline-First PWA**) ishlaydigan maktab kutubxonalari boshqaruv tizimi.

Ushbu loyiha kutubxonachilarning kundalik ishini osonlashtirish uchun ishlab chiqilgan: kitoblar fondi, o'quvchilarga kitob biriktirish, kechikkan muddatlar nazorati, bir bosishda qo'ng'iroq/SMS eslatmalar va ko'p qurilmali (telefon + kompyuter) sinxronlash imkoniyatini taqdim etadi.

---

## 🌟 Yangilangan Imkoniyatlar

1. **📖 Keltirilgan Kitoblar Fondi (Kirim & Javonlar):**
   - Yangi keltirilgan kitoblarni fondga kiritish (nomi, muallifi, toifasi, nashr yili, soni va javon manzili).
   - **Aqlli nusxa birlashtirish (Merge):** Agar shu kitob fondda allaqachon mavjud bo'lsa, tizim yangi nusxalarni eski kitob ustiga avtomatik qo'shib umumiy sonini ko'paytiradi.
   - Kitob nusxalarini bitta bosishda `[-]` yoki `[+]` bilan kamaytirish va ko'paytirish.

2. **🎓 O'quvchilarga Kitob Berish (Noyob Yechim):**
   - O'quvchi ismi, sinfi (*masalan: 7-A*), telefoni va topshirish muddatini qayd etish.
   - **Fondda yo'q bo'lsa ham berish mumkin:** Agar kitob hali fondga kiritilmagan bo'lsa ham, tizim kutubxonachini to'xtatmaydi, sariq ogohlantirish beradi va kitobni avtomatik qayd etib o'quvchiga beradi.

3. **⏰ Rangli Muddatlar & To'g'ridan-to'g'ri Aloqa:**
   - 🔴 **Qizil:** Topshirish muddati o'tib ketgan qarzdorlar.
   - 🟡 **Sariq:** Topshirishga 3 kun yoki undan oz qolganlar.
   - 🟢 **Yashil:** O'z vaqtida o'qilayotgan faol kitoblar.
   - **Bir bosishda to'g'ridan-to'g'ri qo'ng'iroq:** Telefonda terish oynasi darhol ochiladi (raqam terib o'tirish shart emas).
   - **SMS va Telegram:** Tayyor shablon eslatma matnini bir zumda jo'natish.

4. **🔄 Qaytarish va Muddatni Uzaytirish:**
   - **"Topshirildi":** Kitob topshirilganda javondagi mavjud zaxira avtomatik **+1 dona**ga oshadi.
   - **"Muddatni Uzaytirish":** Tezkor `+7 kun`, `+10 kun`, `+14 kun`, `+30 kun` yoki taqvimdan istalgan sanagacha uzaytirish.

5. **📴 100% Oflayn (Offline PWA & Service Worker):**
   - Barcha resurslar (skriptlar, piktogrammalar, uslublar, rasmlar) lokal xotirada keshlanadi.
   - Internet butunlay o'chganda ham dastur hech qanday to'siqsiz ishlaydi.
   - Internet ulanganda ma'lumotlar server bilan avtomatik sinxronlashadi.

6. **👥 Multi-Device & Seans Xavfsizligi:**
   - Bir vaqtning o'zida ham telefoningizdan, ham kutubxona kompyuteridan bir xil hisob bilan kirib ishlash mumkin.
   - Seans hech qachon chiqib ketmaydi.
   - CSV / Excel hisobotlarni bitta tugma bilan yuklab olish.

---

## 📂 Fayllar Strukturasi

```plaintext
big3/
├── index.html           # Asosiy PWA interfeysi va Yo'riqnoma modali
├── manifest.json        # PWA mobil ilova sozlamalari va ikonkalari
├── sw.js                # Service Worker (100% Offline kesh yadrosi)
├── server.js            # Node.js REST API va Multi-User sinxronlash serveri
├── package.json         # Loyiha konfiguratsiyasi
├── css/
│   └── style.css        # Pahari pergament estetikasi va Tungi/Kunduzgi rejim
├── js/
│   ├── app.js           # Asosiy kontroller va hodisalar
│   ├── data.js          # Ma'lumotlar ombori (Offline-First Store)
│   └── autocomplete.js  # Aqlli qidiruv va avtoto'ldirish
├── assets/
│   ├── icon-192.png     # PWA 192x192 mobil ilova ikonasi
│   ├── icon-512.png     # PWA 512x512 yuqori aniqlikdagi ikona
│   ├── app-icon.jpg     # Kutubxona logotipi
│   └── logo.jpg         # Asl logotip
└── data/
    └── database.json    # Foydalanuvchilar va kitoblar bazasi
```

---

## 🚀 Serverni Ishga Tushirish

Loyihani ishga tushirish uchun kompyuteringizda **Node.js** o'rnatilgan bo'lishi kifoya (hech qanday tashqi og'ir paketlar talab qilinmaydi).

1. Terminalni oching va loyiha papkasiga kiring:
   ```bash
   cd c:\Users\user\Desktop\big3
   ```

2. Serverni ishga tushiring:
   ```bash
   npm start
   # yoki
   node server.js
   ```

3. Brauzerda oching:
   ```
   http://localhost:3000
   ```

---

## 🛠️ REST API Endpoints

| Metod | Manzil | Vazifasi |
|---|---|---|
| `POST` | `/api/register` | Yangi maktab/kutubxona hisobini ro'yxatdan o'tkazish |
| `POST` | `/api/login` | Tizimga kirish va seansni ochish |
| `GET` | `/api/books?username=...` | Kitoblar fondini olish (qidiruv va toifalar bilan) |
| `POST` | `/api/books` | Yangi kitob kiritish yoki mavjud kitob nusxasini oshirish |
| `PUT` | `/api/books/:id` | Kitob ma'lumotlarini yoki nusxalar sonini tahrirlash |
| `DELETE` | `/api/books/:id` | Kitobni fonddan chiqarish |
| `GET` | `/api/loans?username=...` | O'quvchilarga berilgan kitoblar (overdue, dueSoon filtri) |
| `POST` | `/api/loans` | O'quvchiga kitob berish (javondan avtomatik ayiradi) |
| `POST` | `/api/loans/:id/return` | Kitobni topshirish (javonga avtomatik qaytaradi) |
| `POST` | `/api/loans/:id/extend` | Topshirish muddatini uzaytirish |
| `GET` | `/api/stats?username=...` | Kutubxona statistikasi (fond, javonda, o'quvchilarda) |
| `GET` | `/api/export/csv?username=...`| Excel/CSV hisobot yuklab olish |
| `GET` | `/api/user-data?username=...` | Offline-First ma'lumotlarni serverdan yuklash |
| `POST` | `/api/user-data` | Offline-First ma'lumotlarni serverga saqlash |
| `POST` | `/api/delete-account` | Hisobni va uning ma'lumotlarini butunlay o'chirish |

---

## 📱 Android APK ga Aylantirish Qo'llanmasi (PWABuilder)

Sayt 100% PWA talablariga javob beradi (`manifest.json` + `sw.js` + lokal ikonlar). Uni toza Android **APK** fayliga aylantirish tartibi:

1. **GitHub ga yuklash:**
   Quyidagi buyruqlar orqali loyihangizni GitHub repoga joylang:
   ```bash
   git init
   git add .
   git commit -m "Maktab Kutubxonasi v2.0 - Mukammal Offline va Backend tizimi"
   git branch -M main
   git remote add origin https://github.com/zhamlconsepts/kutubxona.git
   git push -u origin main
   ```

2. **GitHub Pages yoki Vercel/Render ga ulash:**
   - GitHub Pages: Repozitoriy sozlamalaridan (*Settings -> Pages -> Deploy from branch: main*) yoqing yoki bepul Vercel/Netlify ga 1 minutda ulab online havola oling (*Masalan: https://kutubxona.vercel.app*).

3. **PWABuilder orqali APK olish:**
   - [PWABuilder.com](https://www.pwabuilder.com/) saytiga kiring.
   - Saytingiz havolasini kiriting va **Start** tugmasini bosing.
   - Sayt PWA talablariga to'liq javob berishini ko'rsatadi (barcha ko'rsatkichlar yashil chiqadi).
   - **"Package For Stores"** bo'limida **Android** tugmasini tanlang.
   - **"Generate APK / AAB"** tugmasini bosing va tayyor o'rnatish paketini yuklab oling!

---

## 🐙 GitHub ga Yuklash Buyruqlari (Bir martalik)

```bash
git init
git add .
git commit -m "Maktab Kutubxonasi v2.0 - Mukammal Offline va Backend tizimi"
git branch -M main
git remote add origin https://github.com/zhamlconsepts/kutubxona.git
git push -u origin main
```

*(Agar oldin remote qo'shilgan bo'lsa: `git remote set-url origin https://github.com/zhamlconsepts/kutubxona.git` qilib, `git push -u origin main` bering).*

---

## 📄 Litsenziya

MIT License — Maktab kutubxonalari va ta'lim muassasalari uchun bepul va ochiq.
