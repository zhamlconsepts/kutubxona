/**
 * ============================================================================
 * Maktab Kutubxonasi — Rasmiy Backend Serveri (Node.js)
 * Loyiha mazmuniga 100% moslashtirilgan:
 * 1. Kitoblar Fondi (CRUD & Avtomatik Javon Hisobi)
 * 2. O'quvchilarga Kitob Berish, Qaytarish va Muddatni Uzaytirish
 * 3. Kechikkanlarni Avtomatik Hisoblash va Eslatma Tizimi
 * 4. Multi-User & Multi-Device To'liq Sinxronizatsiya (Real-Time Sync)
 * 5. Kutubxona Statistikasi va CSV Hisobotlar
 * 6. 100% Oflayn (PWA & Service Worker) Qo'llab-quvvatlash
 * ============================================================================
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ma'lumotlar papkasini yaratish
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Boshlang'ich ma'lumotlar bazasi tuzilmasi
function loadDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = {
        meta: {
          appName: "Maktab Kutubxonasi",
          version: "2.0.0",
          created: new Date().toISOString()
        },
        users: {},
        libraryData: {}
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Baza yuklashda xatolik:', e);
    return { users: {}, libraryData: {} };
  }
}

function saveDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Baza fayliga yozishda xatolik:', e);
    return false;
  }
}

// MIME turlari
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.csv': 'text/csv; charset=utf-8'
};

// HTTP So'rov tanasini (Body) JSON qilib o'qish
function readBody(req, callback) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      const parsed = body ? JSON.parse(body) : {};
      callback(null, parsed);
    } catch (e) {
      callback(e, null);
    }
  });
}

// Standart JSON javob uzatish yordamchisi
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

// Normalize matn (o'xshashlikni solishtirish uchun)
function cleanNorm(str) {
  return (str || '').toLowerCase().replace(/[`ʻʼ']/g, "'").trim();
}

// Kechikkan va yaqinlashgan muddatlarni aniqlash
function checkLoanStatus(dueDateStr, returnDateStr) {
  if (returnDateStr) return 'Topshirildi';
  if (!dueDateStr) return 'Faol';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Muddati o\'tgan';
  if (diffDays <= 3) return 'Muddati yaqin';
  return 'Faol';
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // =========================================================================
  // 1. AUTHENTICATION & MULTI-USER API
  // =========================================================================

  // Ro'yxatdan o'tish (Sign Up)
  if (req.method === 'POST' && (pathname === '/api/register' || pathname === '/api/auth/register')) {
    readBody(req, (err, data) => {
      if (err || !data.username || !data.password) {
        return sendJSON(res, 400, { success: false, message: 'Login va parol kiritilishi shart' });
      }

      const db = loadDB();
      const cleanUser = cleanNorm(data.username);

      if (db.users[cleanUser]) {
        return sendJSON(res, 409, { success: false, message: 'Bu login allaqachon mavjud! Boshqa login tanlang.' });
      }

      const schoolName = (data.schoolName || data.username).trim();
      const newUser = {
        id: 'usr_' + Date.now(),
        username: cleanUser,
        displayUsername: data.username.trim(),
        schoolName: schoolName,
        password: data.password,
        createdAt: new Date().toISOString()
      };

      db.users[cleanUser] = newUser;
      db.libraryData[cleanUser] = {
        books: [],
        transactions: [],
        settings: {
          schoolName: schoolName,
          defaultLendDays: 10
        }
      };

      saveDB(db);

      return sendJSON(res, 200, {
        success: true,
        message: 'Ro\'yxatdan muvaffaqiyatli o\'tdingiz!',
        user: {
          id: newUser.id,
          username: newUser.username,
          displayUsername: newUser.displayUsername,
          schoolName: newUser.schoolName
        }
      });
    });
    return;
  }

  // Tizimga kirish (Log In)
  if (req.method === 'POST' && (pathname === '/api/login' || pathname === '/api/auth/login')) {
    readBody(req, (err, data) => {
      if (err || !data.username || !data.password) {
        return sendJSON(res, 400, { success: false, message: 'Login va parol kiritilishi shart' });
      }

      const db = loadDB();
      const cleanUser = cleanNorm(data.username);
      const user = db.users[cleanUser];

      if (!user || user.password !== data.password) {
        return sendJSON(res, 401, { success: false, message: 'Login yoki parol xato kiritildi!' });
      }

      if (!db.libraryData[cleanUser]) {
        db.libraryData[cleanUser] = {
          books: [],
          transactions: [],
          settings: {
            schoolName: user.schoolName || user.displayUsername,
            defaultLendDays: 10
          }
        };
        saveDB(db);
      }

      return sendJSON(res, 200, {
        success: true,
        message: 'Xush kelibsiz!',
        user: {
          id: user.id,
          username: user.username,
          displayUsername: user.displayUsername,
          schoolName: user.schoolName
        },
        data: db.libraryData[cleanUser]
      });
    });
    return;
  }

  // =========================================================================
  // 2. KUTUBXONA MA'LUMOTLARINI BUTUNLAY SINXRONLASH (OFFLINE-FIRST SYNC)
  // =========================================================================

  // Ma'lumotlarni serverdan olish (Pull)
  if (req.method === 'GET' && pathname === '/api/user-data') {
    const username = cleanNorm(parsedUrl.searchParams.get('username') || '');
    const db = loadDB();

    if (!username || !db.users[username]) {
      return sendJSON(res, 404, { success: false, message: 'Foydalanuvchi topilmadi' });
    }

    const userData = db.libraryData[username] || { books: [], transactions: [], settings: {} };
    return sendJSON(res, 200, {
      success: true,
      data: userData,
      user: {
        id: db.users[username].id,
        username: db.users[username].username,
        schoolName: db.users[username].schoolName
      }
    });
  }

  // Ma'lumotlarni serverga saqlash (Push)
  if (req.method === 'POST' && pathname === '/api/user-data') {
    readBody(req, (err, data) => {
      const username = cleanNorm(data.username || '');
      const db = loadDB();

      if (!username || !db.users[username]) {
        return sendJSON(res, 404, { success: false, message: 'Foydalanuvchi topilmadi' });
      }

      db.libraryData[username] = {
        books: data.books || [],
        transactions: data.transactions || [],
        settings: data.settings || {
          schoolName: db.users[username].schoolName,
          defaultLendDays: 10
        }
      };

      if (data.settings && data.settings.schoolName) {
        db.users[username].schoolName = data.settings.schoolName;
      }

      saveDB(db);
      return sendJSON(res, 200, { success: true, message: 'Ma\'lumotlar muvaffaqiyatli saqlandi' });
    });
    return;
  }

  // =========================================================================
  // 3. KITOBLAR FONDI (BOOKS REST API)
  // =========================================================================

  // Kitoblar ro'yxati (Qidiruv va toifalar filtri bilan)
  if (req.method === 'GET' && pathname === '/api/books') {
    const username = cleanNorm(parsedUrl.searchParams.get('username') || '');
    const query = cleanNorm(parsedUrl.searchParams.get('q') || '');
    const category = parsedUrl.searchParams.get('category') || 'all';

    const db = loadDB();
    if (!username || !db.users[username]) {
      return sendJSON(res, 404, { success: false, message: 'Foydalanuvchi topilmadi' });
    }

    let books = (db.libraryData[username] && db.libraryData[username].books) || [];

    if (query) {
      books = books.filter(b => 
        cleanNorm(b.title).includes(query) ||
        cleanNorm(b.author).includes(query) ||
        cleanNorm(b.shelf).includes(query)
      );
    }

    if (category && category !== 'all') {
      books = books.filter(b => b.type === category);
    }

    return sendJSON(res, 200, { success: true, total: books.length, books });
  }

  // Yangi kitob kiritish (Fondga qabul qilish)
  if (req.method === 'POST' && pathname === '/api/books') {
    readBody(req, (err, data) => {
      const username = cleanNorm(data.username || '');
      const db = loadDB();

      if (!username || !db.users[username]) {
        return sendJSON(res, 404, { success: false, message: 'Foydalanuvchi topilmadi' });
      }

      if (!data.title) {
        return sendJSON(res, 400, { success: false, message: 'Kitob nomi kiritilishi shart' });
      }

      const userData = db.libraryData[username];
      const targetTitle = cleanNorm(data.title);
      const targetAuthor = cleanNorm(data.author || "Noma'lum muallif");
      const qty = parseInt(data.quantity || data.totalQuantity, 10) || 1;

      // Agar shu nom va muallifdagi kitob allaqachon mavjud bo'lsa - nusxalar sonini oshirish (Merge)
      let existingBook = userData.books.find(b => 
        cleanNorm(b.title) === targetTitle &&
        cleanNorm(b.author) === targetAuthor
      );

      let resultBook;
      if (existingBook) {
        existingBook.totalQuantity += qty;
        existingBook.availableQuantity += qty;
        if (data.shelf) existingBook.shelf = data.shelf;
        if (data.type) existingBook.type = data.type;
        if (data.year) existingBook.year = data.year;
        existingBook.isFundBook = true;
        resultBook = existingBook;
      } else {
        resultBook = {
          id: 'book-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          title: data.title.trim(),
          author: (data.author || "Noma'lum muallif").trim(),
          type: (data.type || "Badiiy adabiyot").trim(),
          language: (data.language || "O'zbekcha (Lotin)").trim(),
          year: (data.year || new Date().getFullYear()).toString().trim(),
          totalQuantity: qty,
          availableQuantity: qty,
          lentQuantity: 0,
          barcode: data.barcode || `MAK-${Math.floor(10000 + Math.random() * 90000)}`,
          shelf: data.shelf || "Umumiy fond",
          isFundBook: true,
          createdAt: new Date().toISOString()
        };
        userData.books.unshift(resultBook);
      }

      saveDB(db);
      return sendJSON(res, 201, {
        success: true,
        message: existingBook ? 'Mavjud kitob nusxalari ko\'paytirildi!' : 'Yangi kitob fondga qabul qilindi!',
        book: resultBook
      });
    });
    return;
  }

  // Kitob nusxasini yoki ma'lumotlarini o'zgartirish (Update)
  if (req.method === 'PUT' && pathname.startsWith('/api/books/')) {
    const bookId = pathname.replace('/api/books/', '').trim();
    readBody(req, (err, data) => {
      const username = cleanNorm(data.username || '');
      const db = loadDB();

      if (!username || !db.users[username]) {
        return sendJSON(res, 404, { success: false, message: 'Foydalanuvchi topilmadi' });
      }

      const userData = db.libraryData[username];
      const bookIndex = userData.books.findIndex(b => b.id === bookId);

      if (bookIndex === -1) {
        return sendJSON(res, 404, { success: false, message: 'Kitob topilmadi' });
      }

      const book = userData.books[bookIndex];
      if (data.title) book.title = data.title.trim();
      if (data.author) book.author = data.author.trim();
      if (data.type) book.type = data.type.trim();
      if (data.year) book.year = data.year.toString().trim();
      if (data.shelf) book.shelf = data.shelf.trim();

      if (data.totalQuantity !== undefined) {
        const newTotal = parseInt(data.totalQuantity, 10) || 0;
        const lent = book.lentQuantity || 0;
        book.totalQuantity = newTotal;
        book.availableQuantity = Math.max(0, newTotal - lent);
      }

      userData.books[bookIndex] = book;
      saveDB(db);

      return sendJSON(res, 200, { success: true, message: 'Kitob ma\'lumotlari yangilandi', book });
    });
    return;
  }

  // Kitobni fonddan o'chirish (Delete)
  if (req.method === 'DELETE' && pathname.startsWith('/api/books/')) {
    const bookId = pathname.replace('/api/books/', '').trim();
    readBody(req, (err, data) => {
      const username = cleanNorm(data.username || parsedUrl.searchParams.get('username') || '');
      const db = loadDB();

      if (!username || !db.users[username]) {
        return sendJSON(res, 404, { success: false, message: 'Foydalanuvchi topilmadi' });
      }

      const userData = db.libraryData[username];
      userData.books = userData.books.filter(b => b.id !== bookId);
      saveDB(db);

      return sendJSON(res, 200, { success: true, message: 'Kitob fonddan o\'chirildi' });
    });
    return;
  }

  // =========================================================================
  // 4. O'QUVCHILARGA KITOB BERISH VA QAYTARIB OLISH (LOANS REST API)
  // =========================================================================

  // O'quvchilarga berilgan kitoblar ro'yxati (Filtrlar: all, overdue, dueSoon, active, returned)
  if (req.method === 'GET' && pathname === '/api/loans') {
    const username = cleanNorm(parsedUrl.searchParams.get('username') || '');
    const filter = parsedUrl.searchParams.get('filter') || 'all';
    const query = cleanNorm(parsedUrl.searchParams.get('q') || '');

    const db = loadDB();
    if (!username || !db.users[username]) {
      return sendJSON(res, 404, { success: false, message: 'Foydalanuvchi topilmadi' });
    }

    let txs = (db.libraryData[username] && db.libraryData[username].transactions) || [];

    // Dinamik holatni belgilash
    txs = txs.map(t => ({
      ...t,
      calculatedStatus: checkLoanStatus(t.dueDate, t.returnDate)
    }));

    if (query) {
      txs = txs.filter(t => 
        cleanNorm(t.studentName).includes(query) ||
        cleanNorm(t.studentClass).includes(query) ||
        cleanNorm(t.bookTitle).includes(query) ||
        cleanNorm(t.studentPhone).includes(query)
      );
    }

    if (filter === 'overdue') {
      txs = txs.filter(t => t.calculatedStatus === 'Muddati o\'tgan');
    } else if (filter === 'dueSoon') {
      txs = txs.filter(t => t.calculatedStatus === 'Muddati yaqin');
    } else if (filter === 'active') {
      txs = txs.filter(t => t.calculatedStatus === 'Faol' || t.calculatedStatus === 'Muddati yaqin' || t.calculatedStatus === 'Muddati o\'tgan');
    } else if (filter === 'returned') {
      txs = txs.filter(t => t.calculatedStatus === 'Topshirildi');
    }

    return sendJSON(res, 200, { success: true, total: txs.length, loans: txs });
  }

  // O'quvchiga yangi kitob berish
  if (req.method === 'POST' && pathname === '/api/loans') {
    readBody(req, (err, data) => {
      const username = cleanNorm(data.username || '');
      const db = loadDB();

      if (!username || !db.users[username]) {
        return sendJSON(res, 404, { success: false, message: 'Foydalanuvchi topilmadi' });
      }

      if (!data.studentName || !data.bookTitle) {
        return sendJSON(res, 400, { success: false, message: 'O\'quvchi ismi va kitob nomi kiritilishi shart' });
      }

      const userData = db.libraryData[username];
      const targetTitle = cleanNorm(data.bookTitle);
      const targetAuthor = cleanNorm(data.bookAuthor || '');

      // Fonddagi kitobni qidirish
      let book = userData.books.find(b => 
        cleanNorm(b.title) === targetTitle &&
        (!targetAuthor || cleanNorm(b.author) === targetAuthor)
      );

      let bookId = data.bookId || (book ? book.id : null);
      let isNotInFund = false;

      if (book) {
        // Kitob fondda bor: Mavjud nusxani kamaytirish
        if (book.availableQuantity > 0) {
          book.availableQuantity -= 1;
        }
        book.lentQuantity = (book.lentQuantity || 0) + 1;
      } else {
        // Kitob fondda yo'q: Avtomatik virtual qayd etish
        isNotInFund = true;
        bookId = 'auto-book-' + Date.now();
        const autoBook = {
          id: bookId,
          title: data.bookTitle.trim(),
          author: (data.bookAuthor || "Noma'lum muallif").trim(),
          type: "Badiiy adabiyot",
          totalQuantity: 1,
          availableQuantity: 0,
          lentQuantity: 1,
          shelf: "Fondga kiritilmagan (O'quvchida)",
          isFundBook: false,
          createdAt: new Date().toISOString()
        };
        userData.books.unshift(autoBook);
      }

      const newTx = {
        id: 'tx-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        type: 'chiqim',
        bookId: bookId,
        bookTitle: data.bookTitle.trim(),
        bookAuthor: (data.bookAuthor || (book ? book.author : "Noma'lum")).trim(),
        studentName: data.studentName.trim(),
        studentClass: (data.studentClass || "Noma'lum").trim(),
        studentPhone: (data.studentPhone || "").trim(),
        date: data.givenDate || new Date().toISOString().split('T')[0],
        dueDate: data.dueDate,
        returnDate: null,
        status: 'O\'quvchida',
        notes: (data.notes || "").trim(),
        isNotInFund: isNotInFund,
        history: [{
          action: 'Berildi',
          date: new Date().toISOString(),
          dueDate: data.dueDate
        }]
      };

      userData.transactions.unshift(newTx);
      saveDB(db);

      return sendJSON(res, 201, {
        success: true,
        message: isNotInFund 
          ? 'Kitob o\'quvchiga berildi (Kutubxonaga avtomatik qayd etildi)' 
          : 'Kitob o\'quvchiga muvaffaqiyatli berildi!',
        loan: newTx
      });
    });
    return;
  }

  // Kitobni qaytarib olish (Topshirildi deb belgilash)
  if (req.method === 'POST' && pathname.endsWith('/return')) {
    const txId = pathname.replace('/api/loans/', '').replace('/return', '').trim();
    readBody(req, (err, data) => {
      const username = cleanNorm(data.username || '');
      const db = loadDB();

      if (!username || !db.users[username]) {
        return sendJSON(res, 404, { success: false, message: 'Foydalanuvchi topilmadi' });
      }

      const userData = db.libraryData[username];
      const tx = userData.transactions.find(t => t.id === txId);

      if (!tx) {
        return sendJSON(res, 404, { success: false, message: 'Ijara amaliyoti topilmadi' });
      }

      tx.returnDate = new Date().toISOString().split('T')[0];
      tx.status = 'Topshirildi';
      tx.history = tx.history || [];
      tx.history.push({
        action: 'Topshirildi',
        date: new Date().toISOString()
      });

      // Fonddagi kitob nusxasini qaytarish
      if (tx.bookId) {
        const book = userData.books.find(b => b.id === tx.bookId);
        if (book) {
          book.availableQuantity = (book.availableQuantity || 0) + 1;
          if (book.lentQuantity > 0) {
            book.lentQuantity -= 1;
          }
        }
      }

      saveDB(db);
      return sendJSON(res, 200, {
        success: true,
        message: 'Kitob kutubxonaga qabul qilindi va javonga qaytarildi!',
        loan: tx
      });
    });
    return;
  }

  // Topshirish muddatini uzaytirish (Extend)
  if (req.method === 'POST' && pathname.endsWith('/extend')) {
    const txId = pathname.replace('/api/loans/', '').replace('/extend', '').trim();
    readBody(req, (err, data) => {
      const username = cleanNorm(data.username || '');
      const newDueDate = data.newDueDate;

      const db = loadDB();
      if (!username || !db.users[username]) {
        return sendJSON(res, 404, { success: false, message: 'Foydalanuvchi topilmadi' });
      }

      if (!newDueDate) {
        return sendJSON(res, 400, { success: false, message: 'Yangi topshirish sanasi kiritilmadi' });
      }

      const userData = db.libraryData[username];
      const tx = userData.transactions.find(t => t.id === txId);

      if (!tx) {
        return sendJSON(res, 404, { success: false, message: 'Ijara amaliyoti topilmadi' });
      }

      const oldDate = tx.dueDate;
      tx.dueDate = newDueDate;
      tx.status = 'O\'quvchida';
      tx.history = tx.history || [];
      tx.history.push({
        action: 'Muddat uzaytirildi',
        from: oldDate,
        to: newDueDate,
        date: new Date().toISOString()
      });

      saveDB(db);
      return sendJSON(res, 200, {
        success: true,
        message: `Topshirish muddati ${newDueDate} gacha uzaytirildi!`,
        loan: tx
      });
    });
    return;
  }

  // =========================================================================
  // 5. STATISTIKA VA CSV EKSPORT (ANALYTICS & REPORTS)
  // =========================================================================

  if (req.method === 'GET' && pathname === '/api/stats') {
    const username = cleanNorm(parsedUrl.searchParams.get('username') || '');
    const db = loadDB();

    if (!username || !db.users[username]) {
      return sendJSON(res, 404, { success: false, message: 'Foydalanuvchi topilmadi' });
    }

    const userData = db.libraryData[username];
    const books = userData.books || [];
    const txs = userData.transactions || [];

    const totalTitles = books.length;
    const totalCopies = books.reduce((acc, b) => acc + (parseInt(b.totalQuantity, 10) || 0), 0);
    const availableCopies = books.reduce((acc, b) => acc + (parseInt(b.availableQuantity, 10) || 0), 0);
    const lentCopies = books.reduce((acc, b) => acc + (parseInt(b.lentQuantity, 10) || 0), 0);

    let overdueCount = 0;
    let dueSoonCount = 0;
    let activeLoans = 0;

    txs.forEach(t => {
      const st = checkLoanStatus(t.dueDate, t.returnDate);
      if (st === 'Muddati o\'tgan') overdueCount++;
      if (st === 'Muddati yaqin') dueSoonCount++;
      if (!t.returnDate) activeLoans++;
    });

    return sendJSON(res, 200, {
      success: true,
      stats: {
        totalTitles,
        totalCopies,
        availableCopies,
        lentCopies,
        activeLoans,
        overdueCount,
        dueSoonCount,
        schoolName: (userData.settings && userData.settings.schoolName) || db.users[username].schoolName
      }
    });
  }

  // CSV Hisobot yuklab olish
  if (req.method === 'GET' && pathname === '/api/export/csv') {
    const username = cleanNorm(parsedUrl.searchParams.get('username') || '');
    const db = loadDB();

    if (!username || !db.users[username]) {
      return sendJSON(res, 404, { success: false, message: 'Foydalanuvchi topilmadi' });
    }

    const userData = db.libraryData[username];
    const books = userData.books || [];
    const txs = userData.transactions || [];

    let csvContent = '\uFEFF'; // UTF-8 BOM
    csvContent += "=== MAKTAB KUTUBXONASI HISOBOTI ===\n";
    csvContent += `Maktab: ${db.users[username].schoolName}\n`;
    csvContent += `Sana: ${new Date().toLocaleDateString('uz-UZ')}\n\n`;

    csvContent += "--- 1. KELTIRILGAN KITOBLAR FONDI ---\n";
    csvContent += "Kitob nomi;Muallifi;Turi;Nashr yili;Jami nusxa;Javonda bor;O'quvchilarda;Javon manzili\n";

    books.forEach(b => {
      csvContent += `"${b.title}";"${b.author}";"${b.type}";"${b.year}";${b.totalQuantity};${b.availableQuantity};${b.lentQuantity};"${b.shelf}"\n`;
    });

    csvContent += "\n--- 2. O'QUVCHILARGA BERILGAN KITOBLAR ---\n";
    csvContent += "O'quvchi F.I.Sh;Sinfi;Telefon;Kitob nomi;Berilgan sana;Topshirish muddati;Holati\n";

    txs.forEach(t => {
      const st = checkLoanStatus(t.dueDate, t.returnDate);
      csvContent += `"${t.studentName}";"${t.studentClass}";"${t.studentPhone || ''}";"${t.bookTitle}";"${t.date}";"${t.dueDate || ''}";"${st}"\n`;
    });

    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="kutubxona_hisobot_${username}.csv"`
    });
    res.end(csvContent);
    return;
  }

  // =========================================================================
  // 6. HISOBNI BUTUNLAY O'CHIRISH
  // =========================================================================

  if (req.method === 'POST' && pathname === '/api/delete-account') {
    readBody(req, (err, data) => {
      const username = cleanNorm(data.username || '');
      const db = loadDB();

      if (!username || !db.users[username]) {
        return sendJSON(res, 404, { success: false, message: 'Foydalanuvchi topilmadi' });
      }

      delete db.users[username];
      delete db.libraryData[username];
      saveDB(db);

      return sendJSON(res, 200, {
        success: true,
        message: 'Hisob va unga tegishli barcha kitoblar fondi butunlay o\'chirildi!'
      });
    });
    return;
  }

  // =========================================================================
  // 7. STATIK FAYLLARNI UZATISH VA SERVICE WORKER XAVFSIZLIGI
  // =========================================================================

  let reqPath = decodeURI(pathname);
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const filePath = path.join(__dirname, reqPath);

  // Path Traversal xavfsizligi
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Access Denied');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const headers = {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    };

    // Service Worker va Manifest uchun maxsus xavfsizlik sarlavhalari
    if (reqPath === '/sw.js') {
      headers['Service-Worker-Allowed'] = '/';
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    } else if (reqPath === '/manifest.json') {
      headers['Cache-Control'] = 'no-cache';
    } else {
      headers['Cache-Control'] = 'public, max-age=3600';
    }

    res.writeHead(200, headers);
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`Maktab Kutubxonasi v2.0 Serveri Ishga Tushdi!`);
  console.log(`Asosiy Havola: http://localhost:${PORT}`);
  console.log(`Offline PWA: Service Worker & Manifest faol.`);
  console.log(`REST API: Kitoblar, O'quvchilar, Statistikalar tayyor.`);
  console.log(`=======================================================`);
});
