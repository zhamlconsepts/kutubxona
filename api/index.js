/**
 * Vercel Serverless API Handler
 * Maktab Kutubxonasi — REST API
 */

const fs = require('fs');
const path = require('path');

// Vercel serverless muhitida vaqtinchalik /tmp papkasidan foydalanish
const TMP_DATA_DIR = process.env.VERCEL ? '/tmp' : path.join(__dirname, '..', 'data');
const DB_FILE = path.join(TMP_DATA_DIR, 'database.json');

// Xotiradagi kesh (Serverless instansiyasi davomida)
let memoryDB = {
  meta: { appName: "Maktab Kutubxonasi", version: "2.0.0" },
  users: {},
  libraryData: {}
};

function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      memoryDB = JSON.parse(raw);
    }
  } catch (e) {}
  return memoryDB;
}

function saveDB(data) {
  memoryDB = data;
  try {
    if (!fs.existsSync(TMP_DATA_DIR)) {
      fs.mkdirSync(TMP_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {}
}

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function cleanNorm(str) {
  return (str || '').toLowerCase().replace(/[`ʻʼ']/g, "'").trim();
}

function checkLoanStatus(dueDateStr, returnDateStr) {
  if (returnDateStr) return 'Topshirildi';
  if (!dueDateStr) return 'Faol';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Muddati o\'tgan';
  if (diffDays <= 3) return 'Muddati yaqin';
  return 'Faol';
}

function readBody(req, callback) {
  if (req.body && typeof req.body === 'object') {
    return callback(null, req.body);
  }
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    try {
      const parsed = body ? JSON.parse(body) : {};
      callback(null, parsed);
    } catch (e) {
      callback(e, null);
    }
  });
}

module.exports = (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // 1. Auth: Register
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
        settings: { schoolName: schoolName, defaultLendDays: 10 }
      };
      saveDB(db);
      return sendJSON(res, 200, {
        success: true,
        message: 'Ro\'yxatdan muvaffaqiyatli o\'tdingiz!',
        user: { id: newUser.id, username: newUser.username, schoolName: newUser.schoolName }
      });
    });
    return;
  }

  // 2. Auth: Login
  if (req.method === 'POST' && (pathname === '/api/login' || pathname === '/api/auth/login')) {
    readBody(req, (err, data) => {
      if (err || !data.username || !data.password) {
        return sendJSON(res, 400, { success: false, message: 'Login va parol kiritilishi shart' });
      }
      const db = loadDB();
      const cleanUser = cleanNorm(data.username);
      const user = db.users[cleanUser];

      if (!user || user.password !== data.password) {
        // Yangi foydalanuvchi bo'lsa yoki paroli to'g'ri bo'lsa qabul qilish (fallback)
        if (!user) {
          const newUser = {
            id: 'usr_' + Date.now(),
            username: cleanUser,
            displayUsername: data.username.trim(),
            schoolName: (data.schoolName || data.username).trim(),
            password: data.password,
            createdAt: new Date().toISOString()
          };
          db.users[cleanUser] = newUser;
          db.libraryData[cleanUser] = {
            books: [],
            transactions: [],
            settings: { schoolName: newUser.schoolName, defaultLendDays: 10 }
          };
          saveDB(db);
          return sendJSON(res, 200, {
            success: true,
            message: 'Yangi hisob yaratildi!',
            user: newUser,
            data: db.libraryData[cleanUser]
          });
        }
        return sendJSON(res, 401, { success: false, message: 'Login yoki parol xato kiritildi!' });
      }

      if (!db.libraryData[cleanUser]) {
        db.libraryData[cleanUser] = {
          books: [],
          transactions: [],
          settings: { schoolName: user.schoolName || user.displayUsername, defaultLendDays: 10 }
        };
        saveDB(db);
      }

      return sendJSON(res, 200, {
        success: true,
        message: 'Xush kelibsiz!',
        user: user,
        data: db.libraryData[cleanUser]
      });
    });
    return;
  }

  // 3. User Data Sync
  if (req.method === 'GET' && pathname === '/api/user-data') {
    const username = cleanNorm(parsedUrl.searchParams.get('username') || '');
    const db = loadDB();
    const userData = (username && db.libraryData[username]) || { books: [], transactions: [], settings: {} };
    return sendJSON(res, 200, {
      success: true,
      data: userData,
      user: db.users[username] || { username: username, schoolName: "Maktab Kutubxonasi" }
    });
  }

  if (req.method === 'POST' && pathname === '/api/user-data') {
    readBody(req, (err, data) => {
      const username = cleanNorm(data.username || '');
      const db = loadDB();
      if (username) {
        if (!db.users[username]) {
          db.users[username] = { username: username, schoolName: (data.settings && data.settings.schoolName) || username };
        }
        db.libraryData[username] = {
          books: data.books || [],
          transactions: data.transactions || [],
          settings: data.settings || { schoolName: "Maktab Kutubxonasi", defaultLendDays: 10 }
        };
        saveDB(db);
      }
      return sendJSON(res, 200, { success: true, message: 'Ma\'lumotlar saqlandi' });
    });
    return;
  }

  // 4. CSV Export
  if (req.method === 'GET' && pathname === '/api/export/csv') {
    const username = cleanNorm(parsedUrl.searchParams.get('username') || '');
    const db = loadDB();
    const userData = (username && db.libraryData[username]) || { books: [], transactions: [] };

    let csvContent = '\uFEFF';
    csvContent += "=== MAKTAB KUTUBXONASI HISOBOTI ===\n\n";
    csvContent += "--- 1. KELTIRILGAN KITOBLAR FONDI ---\n";
    csvContent += "Kitob nomi;Muallifi;Turi;Nashr yili;Jami nusxa;Javonda bor;O'quvchilarda;Javon manzili\n";
    (userData.books || []).forEach(b => {
      csvContent += `"${b.title}";"${b.author}";"${b.type}";"${b.year}";${b.totalQuantity};${b.availableQuantity};${b.lentQuantity};"${b.shelf}"\n`;
    });
    csvContent += "\n--- 2. O'QUVCHILARGA BERILGAN KITOBLAR ---\n";
    csvContent += "O'quvchi F.I.Sh;Sinfi;Telefon;Kitob nomi;Berilgan sana;Topshirish muddati;Holati\n";
    (userData.transactions || []).forEach(t => {
      const st = checkLoanStatus(t.dueDate, t.returnDate);
      csvContent += `"${t.studentName}";"${t.studentClass}";"${t.studentPhone || ''}";"${t.bookTitle}";"${t.date}";"${t.dueDate || ''}";"${st}"\n`;
    });

    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="kutubxona_hisobot.csv"`
    });
    res.end(csvContent);
    return;
  }

  // Standart status
  return sendJSON(res, 200, { success: true, message: "Kutubxona API faol", timestamp: new Date().toISOString() });
};
