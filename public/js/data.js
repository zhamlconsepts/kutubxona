/**
 * Maktab Kutubxonasi - Boshlang'ich ma'lumotlar va doimiy xotira (Storage)
 * Ishlab chiqarishga 100% tayyor, toza va xavfsiz tizim
 */

const STORAGE_KEYS = {
  AUTH_SESSION: 'maktab_kutubxona_auth_session_v2',
  SAVED_CREDENTIALS: 'maktab_kutubxona_saved_creds_v2',
  BOOKS: 'maktab_kutubxona_books_v2',
  TRANSACTIONS: 'maktab_kutubxona_transactions_v2',
  VOCABULARY: 'maktab_kutubxona_vocabulary_v2',
  SETTINGS: 'maktab_kutubxona_settings_v2',
  LAST_DRAFT: 'maktab_kutubxona_last_draft_v2'
};

// Yangi toza tizim uchun boshlang'ich bo'sh fond
const INITIAL_BOOKS = [];

// Yangi toza tizim uchun boshlang'ich bo'sh amaliyotlar
const INITIAL_TRANSACTIONS = [];

// O'zbekiston maktab kutubxonalari uchun standart qulay klassifikatorlar
const INITIAL_VOCABULARY = {
  authors: [
    { text: "Alisher Navoiy", count: 10 },
    { text: "Abdulla Qodiriy", count: 9 },
    { text: "Xudoyberdi To'xtaboyev", count: 8 },
    { text: "O'tkir Hoshimov", count: 8 },
    { text: "Pirimqul Qodirov", count: 7 },
    { text: "G'afur G'ulom", count: 7 },
    { text: "Zahiriddin Muhammad Bobur", count: 6 },
    { text: "Chingiz Aytmatov", count: 6 },
    { text: "Erkin Vohidov", count: 5 },
    { text: "Abdulla Oripov", count: 5 },
    { text: "Tohir Malik", count: 5 },
    { text: "Cho'lpon", count: 4 },
    { text: "Said Ahmad", count: 4 },
    { text: "Oybek", count: 4 }
  ],
  types: [
    { text: "Badiiy adabiyot", count: 20 },
    { text: "Darslik (Maktab darsligi)", count: 20 },
    { text: "Ertaklar va bolalar adabiyoti", count: 15 },
    { text: "Lug'at va ensiklopediya", count: 12 },
    { text: "Ilmiy-ommabop", count: 10 },
    { text: "Metodik qo'llanma", count: 8 },
    { text: "Jahon mumtoz adabiyoti", count: 8 },
    { text: "Tarixiy va biografik", count: 6 },
    { text: "She'riyat to'plami", count: 6 }
  ],
  languages: [
    { text: "O'zbekcha (Lotin)", count: 30 },
    { text: "O'zbekcha (Kirill)", count: 15 },
    { text: "Ruscha", count: 15 },
    { text: "Inglizcha", count: 15 },
    { text: "Qoraqalpoqcha", count: 5 },
    { text: "Tojikcha", count: 4 },
    { text: "Nemischa", count: 3 },
    { text: "Fransuzcha", count: 2 }
  ],
  years: [
    { text: "2026", count: 20 },
    { text: "2025", count: 25 },
    { text: "2024", count: 25 },
    { text: "2023", count: 20 },
    { text: "2022", count: 15 },
    { text: "2021", count: 12 },
    { text: "2020", count: 10 },
    { text: "2019", count: 8 }
  ],
  titles: []
};

// Data Management Store
class LibraryStore {
  constructor() {
    this.cleanOldDemoKeys();
    this.currentUsername = null;
    this.books = [];
    this.transactions = [];
    this.vocabulary = this.load(STORAGE_KEYS.VOCABULARY, INITIAL_VOCABULARY);
    this.settings = {
      schoolName: "Maktab Kutubxonasi",
      defaultLendDays: 10
    };
  }

  // Eski versiyadagi demo ma'lumotlarni tozalash
  cleanOldDemoKeys() {
    try {
      const oldKeys = [
        'maktab_kutubxona_books_v1',
        'maktab_kutubxona_transactions_v1',
        'maktab_kutubxona_vocabulary_v1',
        'maktab_kutubxona_last_draft'
      ];
      oldKeys.forEach(k => localStorage.removeItem(k));
    } catch (e) {}
  }

  // Foydalanuvchi hisobiga ulanish va uning alohida mustaqil ma'lumotlarini yuklash
  setUser(username) {
    this.currentUsername = username ? username.trim().toLowerCase() : null;
    if (!this.currentUsername) {
      this.books = [];
      this.transactions = [];
      this.settings = {
        schoolName: "Maktab Kutubxonasi",
        defaultLendDays: 10
      };
      return;
    }

    const booksKey = `maktab_user_${this.currentUsername}_books_v2`;
    const txKey = `maktab_user_${this.currentUsername}_transactions_v2`;
    const settingsKey = `maktab_user_${this.currentUsername}_settings_v2`;

    this.books = this.load(booksKey, []);
    this.transactions = this.load(txKey, []);
    this.settings = this.load(settingsKey, {
      schoolName: "Maktab Kutubxonasi",
      defaultLendDays: 10
    });
  }

  saveBooks() {
    if (this.currentUsername) {
      this.save(`maktab_user_${this.currentUsername}_books_v2`, this.books);
    }
  }

  saveTransactions() {
    if (this.currentUsername) {
      this.save(`maktab_user_${this.currentUsername}_transactions_v2`, this.transactions);
    }
  }

  saveSettings() {
    if (this.currentUsername) {
      this.save(`maktab_user_${this.currentUsername}_settings_v2`, this.settings);
    }
  }

  // Hisob butunlay o'chirilganda unga tegishli barcha lokal xotirani tozalash
  clearUserStorage(username) {
    const u = username ? username.trim().toLowerCase() : this.currentUsername;
    if (u) {
      try {
        localStorage.removeItem(`maktab_user_${u}_books_v2`);
        localStorage.removeItem(`maktab_user_${u}_transactions_v2`);
        localStorage.removeItem(`maktab_user_${u}_settings_v2`);
      } catch (e) {}
    }
    if (u === this.currentUsername) {
      this.books = [];
      this.transactions = [];
      this.currentUsername = null;
    }
  }

  load(key, fallback) {
    try {
      const data = localStorage.getItem(key);
      if (!data) {
        return JSON.parse(JSON.stringify(fallback));
      }
      return JSON.parse(data);
    } catch (e) {
      return fallback;
    }
  }

  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      if (this.currentUsername) {
        if (key === STORAGE_KEYS.BOOKS) {
          localStorage.setItem(`maktab_user_${this.currentUsername}_books_v2`, JSON.stringify(data));
        } else if (key === STORAGE_KEYS.TRANSACTIONS) {
          localStorage.setItem(`maktab_user_${this.currentUsername}_transactions_v2`, JSON.stringify(data));
        } else if (key === STORAGE_KEYS.SETTINGS) {
          localStorage.setItem(`maktab_user_${this.currentUsername}_settings_v2`, JSON.stringify(data));
        }
      }
    } catch (e) {
      console.error(`Xotiraga saqlashda xatolik (${key}):`, e);
    }
  }

  // Kitoblar ro'yxatini olish (Barcha kitoblar)
  getBooks() {
    return this.books;
  }

  // Faqat 1-bo'lim uchun fonddagi kitoblar (o'quvchiga berilgan va fondda bo'lmagan kitoblar bu yerga chiqmaydi)
  getFundBooks() {
    return this.books.filter(b => b.shelf !== "Fondga kiritilmagan (O'quvchida)" && b.isFundBook !== false);
  }

  // Kitob qidirish
  getBookById(id) {
    return this.books.find(b => b.id === id);
  }

  // Yangi kitob qo'shish yoki mavjud bo'lsa sonini qo'shib ko'paytirish (Merge)
  saveBook(bookData) {
    const cleanNorm = (str) => (str || '').toLowerCase().replace(/[`ʻʼ']/g, "'").trim();
    const targetTitle = cleanNorm(bookData.title);
    const targetAuthor = cleanNorm(bookData.author);

    let bookIndex = this.books.findIndex(b => 
      cleanNorm(b.title) === targetTitle &&
      cleanNorm(b.author) === targetAuthor
    );

    let savedBook;
    let isMerged = false;
    const qty = parseInt(bookData.quantity, 10) || 1;

    if (bookIndex >= 0) {
      // Mavjud kitob: hamma ma'lumotlar eskisi bilan bir xil bo'lsa eski va yangi qo'shilib soni ko'payadi!
      const existing = this.books[bookIndex];
      existing.totalQuantity += qty;
      existing.availableQuantity += qty;
      if (bookData.shelf) existing.shelf = bookData.shelf;
      if (bookData.year) existing.year = bookData.year;
      if (bookData.type) existing.type = bookData.type;
      existing.isFundBook = true;

      this.books[bookIndex] = existing;
      savedBook = existing;
      isMerged = true;
    } else {
      // Yangi kitob kartochkasi yaratish
      const newBook = {
        id: 'book-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        title: bookData.title.trim(),
        author: (bookData.author || 'Noma\'lum muallif').trim(),
        type: (bookData.type || "Badiiy adabiyot").trim(),
        language: (bookData.language || "O'zbekcha (Lotin)").trim(),
        year: (bookData.year || new Date().getFullYear()).toString().trim(),
        totalQuantity: qty,
        availableQuantity: qty,
        lentQuantity: 0,
        barcode: bookData.barcode || `MAK-${Math.floor(10000 + Math.random() * 90000)}`,
        shelf: bookData.shelf || "Umumiy fond",
        isFundBook: true,
        createdAt: new Date().toISOString()
      };
      this.books.unshift(newBook);
      savedBook = newBook;
    }

    this.saveBooks();
    this.enrichVocabulary(savedBook);
    return { book: savedBook, isMerged, addedQty: qty };
  }

  // Kitob ma'lumotlarini tahrirlash
  updateBook(bookId, updatedFields) {
    const book = this.books.find(b => b.id === bookId);
    if (!book) return null;

    if (updatedFields.title) book.title = updatedFields.title.trim();
    if (updatedFields.author) book.author = updatedFields.author.trim();
    if (updatedFields.type) book.type = updatedFields.type.trim();
    if (updatedFields.year) book.year = updatedFields.year.toString().trim();
    if (updatedFields.shelf !== undefined) book.shelf = updatedFields.shelf.trim();

    if (updatedFields.totalQuantity !== undefined) {
      const newTotal = Math.max(0, parseInt(updatedFields.totalQuantity, 10) || 0);
      const lent = book.lentQuantity || 0;
      book.totalQuantity = Math.max(newTotal, lent);
      book.availableQuantity = Math.max(0, book.totalQuantity - lent);
    }

    this.saveBooks();
    return book;
  }

  // Kitob sonini tezkor kamaytirish yoki ko'paytirish (delta: masalan -1 yoki +1)
  adjustBookQuantity(bookId, delta) {
    const book = this.books.find(b => b.id === bookId);
    if (!book) return { success: false, message: "Kitob topilmadi!" };

    const currentTotal = book.totalQuantity || 0;
    const lent = book.lentQuantity || 0;
    const newTotal = currentTotal + delta;

    if (newTotal < lent) {
      return { 
        success: false, 
        message: `Kitobdan ${lent} donasi o'quvchilarda, sonini bundan kamaytirib bo'lmaydi!` 
      };
    }
    if (newTotal < 0) {
      return { success: false, message: "Kitob soni 0 dan kam bo'la olmaydi!" };
    }

    book.totalQuantity = newTotal;
    book.availableQuantity = Math.max(0, newTotal - lent);
    this.saveBooks();
    return { 
      success: true, 
      book, 
      newTotal: book.totalQuantity, 
      newAvailable: book.availableQuantity 
    };
  }

  // Kitobni fonddan o'chirish
  deleteBook(bookId) {
    this.books = this.books.filter(b => b.id !== bookId);
    this.saveBooks();
  }

  // Kirim / Chiqim amaliyotini ro'yxatga olish (o'quvchiga berish yoki yangi kirim)
  addTransaction(txData) {
    const isKirim = txData.type === 'kirim';
    const qty = parseInt(txData.quantity, 10) || 1;

    // Kitob fondidagi mavjud sonini moslashtirish
    let book = this.books.find(b => 
      (txData.bookId && b.id === txData.bookId) ||
      (b.title.toLowerCase() === (txData.title || '').toLowerCase() && 
       b.author.toLowerCase() === (txData.author || '').toLowerCase())
    );

    if (!book && isKirim) {
      // Agar kirim paytida kitob hali fondda bo'lmasa, uni yaratamiz
      const saveRes = this.saveBook({
        title: txData.title,
        author: txData.author,
        type: txData.category || txData.type || "Badiiy adabiyot",
        language: txData.language || "O'zbekcha (Lotin)",
        year: txData.year || new Date().getFullYear().toString(),
        quantity: qty,
        shelf: txData.shelf || "Yangi kirim"
      });
      book = saveRes ? saveRes.book : null;
    } else if (!book && !isKirim) {
      // O'quvchiga berilayotgan kitob fondda hali kiritilmagan bo'lsa ham berish mumkin,
      // lekin 1-bo'lim (Fond) ga qo'shmaymiz, faqat 2-bo'lim (O'quvchilar) da qayd etiladi!
      book = null;
    } else if (book) {
      if (isKirim) {
        if (!txData.alreadyAdjusted) {
          book.totalQuantity += qty;
          book.availableQuantity += qty;
          this.saveBooks();
        }
      } else {
        // Chiqim (o'quvchiga berish) - agar fonddagi mavjud soni yetmasa ham o'quvchiga berishni to'xtatmaymiz!
        if (book.availableQuantity < qty) {
          const deficit = qty - book.availableQuantity;
          book.totalQuantity += deficit; // jami sonini moslaymiz
          book.availableQuantity = 0;
        } else {
          book.availableQuantity -= qty;
        }
        book.lentQuantity = (book.lentQuantity || 0) + qty;
        this.saveBooks();
      }
    }

    // Bugungi sana va berilgan sana
    const nowIso = new Date().toISOString();
    const givenDate = txData.givenDate || nowIso.split('T')[0];

    const newTx = {
      id: 'tx-' + Date.now(),
      bookId: book ? book.id : null,
      bookTitle: txData.title || (book ? book.title : ''),
      author: txData.author || (book ? book.author : ''),
      type: txData.type, // 'kirim' yoki 'chiqim'
      category: txData.category || (book ? book.type : 'Badiiy adabiyot'),
      quantity: qty,
      language: txData.language || (book ? book.language : 'O\'zbekcha (Lotin)'),
      year: txData.year || (book ? book.year : ''),
      // O'quvchi ma'lumotlari
      studentName: txData.studentName || (isKirim ? '' : (txData.recipientOrSource || '')),
      studentClass: txData.studentClass || '',
      studentPhone: txData.studentPhone || '',
      recipientOrSource: txData.recipientOrSource || (isKirim ? (txData.source || "Kutubxona ta'minoti") : (txData.studentName || "O'quvchi")),
      givenDate: givenDate,
      dueDate: txData.dueDate || '',
      notes: txData.notes || '',
      date: nowIso,
      status: isKirim ? "Bajarildi" : "Qarzda"
    };

    this.transactions.unshift(newTx);
    this.save(STORAGE_KEYS.TRANSACTIONS, this.transactions);

    // Lug'atni yangi so'zlar bilan boyitish
    this.enrichVocabulary({
      title: newTx.bookTitle,
      author: newTx.author,
      type: newTx.category,
      language: newTx.language,
      year: newTx.year
    });

    return { transaction: newTx, book };
  }

  // Kitob qaytarilganda (o'quvchi topshirganda) chiqimni yopish
  returnBook(transactionId) {
    const tx = this.transactions.find(t => t.id === transactionId);
    if (!tx || tx.type !== 'chiqim') return null;

    if (tx.status === "Qaytarildi") {
      return { success: false, message: "Ushbu kitob allaqachon qaytarilgan!" };
    }

    tx.status = "Qaytarildi";
    tx.returnDate = new Date().toISOString();

    // Fondga sonini qaytarish
    const book = this.books.find(b => b.id === tx.bookId || (b.title === tx.bookTitle && b.author === tx.author));
    if (book) {
      book.availableQuantity += tx.quantity;
      book.lentQuantity = Math.max(0, (book.lentQuantity || 0) - tx.quantity);
      this.save(STORAGE_KEYS.BOOKS, this.books);
    }

    this.save(STORAGE_KEYS.TRANSACTIONS, this.transactions);
    return { success: true, transaction: tx, book };
  }

  // Topshirish muddatini uzaytirish (+X kun)
  extendDueDate(transactionId, extraDays = 7) {
    const tx = this.transactions.find(t => t.id === transactionId);
    if (!tx || tx.type !== 'chiqim' || tx.status === 'Qaytarildi') return null;

    let baseDate = new Date();
    if (tx.dueDate) {
      const parsed = new Date(tx.dueDate);
      if (!isNaN(parsed.getTime())) {
        baseDate = parsed;
      }
    }
    // Agar muddati o'tib ketgan bo'lsa, bugundan boshlab uzaytiramiz
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (baseDate < today) {
      baseDate = today;
    }

    baseDate.setDate(baseDate.getDate() + extraDays);
    tx.dueDate = baseDate.toISOString().split('T')[0];
    tx.status = "Qarzda"; // statusni normallashtirish

    this.save(STORAGE_KEYS.TRANSACTIONS, this.transactions);
    return { success: true, transaction: tx, newDueDate: tx.dueDate };
  }

  // Muddatni istalgan aniq sanaga o'zgartirish
  setCustomDueDate(transactionId, targetDateStr) {
    const tx = this.transactions.find(t => t.id === transactionId);
    if (!tx || tx.type !== 'chiqim' || tx.status === 'Qaytarildi') return null;
    if (!targetDateStr) return null;
    tx.dueDate = targetDateStr;
    tx.status = "Qarzda";
    this.save(STORAGE_KEYS.TRANSACTIONS, this.transactions);
    return { success: true, transaction: tx, newDueDate: tx.dueDate };
  }

  // Amaliyotni o'chirish
  deleteTransaction(txId) {
    this.transactions = this.transactions.filter(t => t.id !== txId);
    this.save(STORAGE_KEYS.TRANSACTIONS, this.transactions);
  }

  // O'quvchilarga berilgan kitoblar ro'yxati (Lending records)
  getStudentLendings() {
    return this.transactions.filter(t => t.type === 'chiqim');
  }

  // Muddat holatini tahlil qilish (Kechikkan, Yaqinlashgan, Muddatida)
  getLendingStatus(tx) {
    if (tx.status === 'Qaytarildi') {
      return { code: 'returned', label: 'Topshirilgan', diffDays: 0, alertLevel: 'success' };
    }

    if (!tx.dueDate) {
      return { code: 'no_deadline', label: 'Muddatsiz', diffDays: 0, alertLevel: 'info' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(tx.dueDate);
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const overdueDays = Math.abs(diffDays);
      return {
        code: 'overdue',
        label: `${overdueDays} kun kechikdi!`,
        diffDays,
        overdueDays,
        alertLevel: 'danger'
      };
    } else if (diffDays === 0) {
      return {
        code: 'due_today',
        label: 'Bugun topshirish kuni!',
        diffDays: 0,
        alertLevel: 'warning'
      };
    } else if (diffDays <= 3) {
      return {
        code: 'due_soon',
        label: `${diffDays} kun qoldi`,
        diffDays,
        alertLevel: 'warning'
      };
    } else {
      return {
        code: 'on_track',
        label: `${diffDays} kun bor`,
        diffDays,
        alertLevel: 'normal'
      };
    }
  }

  // Eslatmalar uchun: kechikkan va yaqinlashayotgan qarzlar
  getReminderAlerts() {
    const lendings = this.getStudentLendings().filter(t => t.status !== 'Qaytarildi');
    const overdue = [];
    const dueSoon = [];

    lendings.forEach(tx => {
      const st = this.getLendingStatus(tx);
      if (st.code === 'overdue') {
        overdue.push({ tx, status: st });
      } else if (st.code === 'due_today' || st.code === 'due_soon') {
        dueSoon.push({ tx, status: st });
      }
    });

    return {
      totalActiveDebts: lendings.length,
      overdue,
      dueSoon,
      hasAlerts: overdue.length > 0 || dueSoon.length > 0
    };
  }

  // Aqlli lug'atga yangi ma'lumotlarni kiritish va chastotasini oshirish
  enrichVocabulary(data) {
    const fields = [
      { key: 'authors', val: data.author },
      { key: 'types', val: data.type },
      { key: 'languages', val: data.language },
      { key: 'years', val: data.year ? data.year.toString() : '' },
      { key: 'titles', val: data.title }
    ];

    let changed = false;

    fields.forEach(({ key, val }) => {
      if (!val || typeof val !== 'string') return;
      const trimmed = val.trim();
      if (!trimmed || trimmed.length < 2) return;

      if (!this.vocabulary[key]) {
        this.vocabulary[key] = [];
      }

      const existing = this.vocabulary[key].find(item => 
        item.text.toLowerCase() === trimmed.toLowerCase()
      );

      if (existing) {
        existing.count = (existing.count || 1) + 1;
        changed = true;
      } else {
        this.vocabulary[key].unshift({ text: trimmed, count: 1 });
        changed = true;
      }

      this.vocabulary[key].sort((a, b) => (b.count || 0) - (a.count || 0));
    });

    if (changed) {
      this.save(STORAGE_KEYS.VOCABULARY, this.vocabulary);
    }
  }

  // Lug'atdan qidiruv so'zlarini olish
  getVocabulary(category) {
    if (!this.vocabulary[category]) return [];
    return this.vocabulary[category];
  }

  // Statistika hisoblash
  getStatistics() {
    const totalTitles = this.books.length;
    const totalCopies = this.books.reduce((acc, b) => acc + (parseInt(b.totalQuantity, 10) || 0), 0);
    const availableCopies = this.books.reduce((acc, b) => acc + (parseInt(b.availableQuantity, 10) || 0), 0);
    const lentCopies = this.books.reduce((acc, b) => acc + (parseInt(b.lentQuantity, 10) || 0), 0);

    const kirimCount = this.transactions.filter(t => t.type === 'kirim').length;
    const chiqimCount = this.transactions.filter(t => t.type === 'chiqim').length;
    const activeDebts = this.transactions.filter(t => t.type === 'chiqim' && t.status !== 'Qaytarildi').length;

    const reminders = this.getReminderAlerts();

    return {
      totalTitles,
      totalCopies,
      availableCopies,
      lentCopies,
      kirimCount,
      chiqimCount,
      activeDebts,
      overdueCount: reminders.overdue.length,
      dueSoonCount: reminders.dueSoon.length
    };
  }

  // Maktab nomini yangilash
  setSchoolName(name) {
    let cleanName = (name || '').trim();
    if (!cleanName) cleanName = 'Maktab Kutubxonasi';
    if (/^\d+$/.test(cleanName)) {
      cleanName = `${cleanName}-maktab kutubxonasi`;
    }
    this.settings.schoolName = cleanName;
    this.save(STORAGE_KEYS.SETTINGS, this.settings);
    return cleanName;
  }

  // Tizimni to'liq tozalash (Butunlay yangi boshlash)
  clearAllData() {
    this.books = [];
    this.transactions = [];
    this.save(STORAGE_KEYS.BOOKS, this.books);
    this.save(STORAGE_KEYS.TRANSACTIONS, this.transactions);
    localStorage.removeItem(STORAGE_KEYS.LAST_DRAFT);
  }
}

// Global store obyekti
window.LibraryStore = LibraryStore;

