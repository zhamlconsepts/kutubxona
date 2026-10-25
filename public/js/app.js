/**
 * Maktab Kutubxonasi - Asosiy Kontroller
 * Loader, Radio-inputs navigatsiyasi, Multi-user Login/Sign-up, Tooltip & Yo'riqnoma
 */

document.addEventListener('DOMContentLoaded', () => {
  const store = new window.LibraryStore();

  // Loader elementlari
  const globalLoader = document.getElementById('global-loader');
  const loaderCaptionText = document.getElementById('loader-caption-text');

  function showLoader(text = 'Yuklanmoqda...') {
    if (loaderCaptionText) loaderCaptionText.textContent = text;
    if (globalLoader) globalLoader.classList.add('active');
  }

  function hideLoader() {
    if (globalLoader) globalLoader.classList.remove('active');
  }

  // Sahifa birinchi yuklanganda silliq loader
  showLoader('Kutubxona yuklanmoqda...');
  setTimeout(() => {
    hideLoader();
  }, 350);

  // DOM Elementlari - Auth
  const screenLogin = document.getElementById('screen-login');
  const screenApp = document.getElementById('screen-app');
  const mainAuthForm = document.getElementById('main-auth-form');
  const authFormTitle = document.getElementById('auth-form-title');
  const authInputSchoolName = document.getElementById('auth-input-school-name');
  const authInputUsername = document.getElementById('auth-input-username');
  const authInputPassword = document.getElementById('auth-input-password');
  const authInputConfirmPassword = document.getElementById('auth-input-confirm-password');
  const authRememberMe = document.getElementById('auth-remember-me');
  const btnAuthSubmit = document.getElementById('btn-auth-submit');
  const btnToggleAuthMode = document.getElementById('btn-toggle-auth-mode');
  const authToggleLabel = document.getElementById('auth-toggle-label');
  const signupExtraFields = document.getElementById('signup-extra-fields');
  const signupConfirmField = document.getElementById('signup-confirm-field');
  const loginErrorAlert = document.getElementById('login-error-alert');
  const loginErrorText = document.getElementById('login-error-text');
  const btnCloseLoginError = document.getElementById('btn-close-login-error');

  let isSignUpMode = false; // false = Login, true = Sign Up
  let currentUser = null;

  // Header & Controls
  const displayUserName = document.getElementById('display-user-name');
  const pageTitle = document.getElementById('page-title');
  const currentUsernameBadge = document.getElementById('current-username-badge');
  const themeToggleInput = document.getElementById('theme-toggle-input');
  const btnToggleScreenMode = document.getElementById('btn-toggle-screen-mode');
  const btnOpenSchoolSettings = document.getElementById('btn-open-school-settings');
  const btnHeaderSettings = document.getElementById('btn-header-settings');
  const btnOpenInstructions = document.getElementById('btn-open-instructions');
  const modalInstructions = document.getElementById('modal-instructions');
  const appViewportWrapper = document.getElementById('app-viewport-wrapper');

  // Eng pastdagi Radio Inputs Navigatsiyasi
  const radioTabBooks = document.getElementById('radio-tab-books');
  const radioTabStudents = document.getElementById('radio-tab-students');
  const viewBooks = document.getElementById('view-books');
  const viewStudents = document.getElementById('view-students');
  let currentActiveTab = 'view-books';

  // 1-Bo'lim: Keltirilgan Kitoblar
  const statTotalCopies = document.getElementById('stat-total-copies');
  const statAvailableCopies = document.getElementById('stat-available-copies');
  const statLentCopies = document.getElementById('stat-lent-copies');
  const btnAddNewBook = document.getElementById('btn-add-new-book');
  const booksSearchInput = document.getElementById('books-search-input');
  const booksListContainer = document.getElementById('books-list-container');
  let currentBookCatFilter = 'all';

  // 2-Bo'lim: O'quvchilarga Kitob Berish
  const btnGiveBookToStudent = document.getElementById('btn-give-book-to-student');
  const studentsSearchInput = document.getElementById('students-search-input');
  const studentsListContainer = document.getElementById('students-list-container');
  const countOverdueEl = document.getElementById('count-overdue');
  const studentsAlertBanner = document.getElementById('students-alert-banner');
  let currentLendFilter = 'all';

  // Modallar
  const modalAddBook = document.getElementById('modal-add-book');
  const formAddBook = document.getElementById('form-add-book');
  const bookInputTitle = document.getElementById('book-input-title');
  const bookInputAuthor = document.getElementById('book-input-author');
  const bookInputType = document.getElementById('book-input-type');
  const bookInputYear = document.getElementById('book-input-year');
  const bookInputQty = document.getElementById('book-input-qty');
  const bookInputShelf = document.getElementById('book-input-shelf');
  const bookInputSource = document.getElementById('book-input-source');

  const modalGiveBook = document.getElementById('modal-give-book');
  const formGiveBook = document.getElementById('form-give-book');
  const giveInputStudent = document.getElementById('give-input-student');
  const giveInputClass = document.getElementById('give-input-class');
  const giveInputPhone = document.getElementById('give-input-phone');
  const giveInputTitle = document.getElementById('give-input-title');
  const giveInputAuthor = document.getElementById('give-input-author');
  const giveInputGivenDate = document.getElementById('give-input-given-date');
  const giveInputDueDate = document.getElementById('give-input-due-date');
  const giveInputNotes = document.getElementById('give-input-notes');
  const giveStockIndicator = document.getElementById('give-stock-indicator');
  const alertBookNotInFund = document.getElementById('alert-book-not-in-fund');
  const btnDismissAlertNotInFund = document.getElementById('btn-dismiss-alert-not-in-fund');

  // Sozlamalar Modali
  const modalSettings = document.getElementById('modal-settings');
  const formSchoolSettings = document.getElementById('form-school-settings');
  const settingsInputSchoolName = document.getElementById('settings-input-school-name');
  const settingsInputDefaultDays = document.getElementById('settings-input-default-days');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnLogoutAction = document.getElementById('btn-logout-action');

  // Eslatma Modali
  const modalReminder = document.getElementById('modal-reminder');
  const reminderStudentInfo = document.getElementById('reminder-student-info');
  const reminderPhoneDisplay = document.getElementById('reminder-phone-display');
  const btnDirectPhoneCall = document.getElementById('btn-direct-phone-call');
  const btnDirectSmsSend = document.getElementById('btn-direct-sms-send');
  const reminderTextarea = document.getElementById('reminder-textarea');
  const btnCopyReminderText = document.getElementById('btn-copy-reminder-text');
  const btnSendTelegramText = document.getElementById('btn-send-telegram-text');

  // Muddat Uzaytirish Modali
  const modalExtend = document.getElementById('modal-extend');
  const extendInfoText = document.getElementById('extend-info-text');
  const extendCustomDate = document.getElementById('extend-custom-date');
  const extendCustomDays = document.getElementById('extend-custom-days');
  const extendPreviewTarget = document.getElementById('extend-preview-target');
  const btnConfirmExtendAction = document.getElementById('btn-confirm-extend-action');
  let targetExtendTxId = null;
  let selectedExtendDays = 7;
  let currentExtendBaseDate = null;

  // =========================================================================
  // 1. MAKTAB NOMI VA DINAMIK YANGILANISH (2-rasm funksiyasi)
  // "agarda maktab nomi ozgarsa ilova nomi ham shu maktab nomiga ozgarsin yani hozzir 8-maktab kutubhonasi turgan bolsa men 10 qilsam 10ga ozgarsin"
  // =========================================================================
  function applySchoolName(rawName, shouldSync = true) {
    const formattedName = store.setSchoolName(rawName);

    if (displayUserName) displayUserName.textContent = formattedName;
    if (pageTitle) pageTitle.textContent = formattedName;
    if (settingsInputSchoolName) settingsInputSchoolName.value = formattedName;

    if (shouldSync) {
      syncUserDataToServer();
    }
    return formattedName;
  }

  // =========================================================================
  // 2. MULTI-USER AUTH & SYNC (Login va Sign Up tizimi)
  // =========================================================================
  function initAuth() {
    const savedUserJson = localStorage.getItem('maktab_active_user_v2');

    if (savedUserJson) {
      try {
        const u = JSON.parse(savedUserJson);
        if (u && u.username) {
          currentUser = u;
          loginUser(u, false);
          return;
        }
      } catch (e) {
        localStorage.removeItem('maktab_active_user_v2');
      }
    }

    showLoginScreen();
  }

  function showLoginScreen() {
    screenLogin.style.display = 'flex';
    screenApp.style.display = 'none';
  }

  async function loginUser(userObj, isNewLogin = true) {
    currentUser = userObj;

    // 1. Store ni AYNAN shu foydalanuvchiga sozlash (oldingi foydalanuvchi ma'lumotlari xotiradan to'liq chiqariladi!)
    store.setUser(userObj.username);

    // 2. Seans doim saqlanadi toki chiqish tugmasini o'zi bosmagunicha!
    localStorage.setItem('maktab_active_user_v2', JSON.stringify(userObj));

    applySchoolName(userObj.schoolName || userObj.username, false);

    if (currentUsernameBadge) {
      currentUsernameBadge.textContent = `${userObj.username} • Saqlanadi`;
    }
    if (settingsInputDefaultDays) {
      settingsInputDefaultDays.value = store.settings.defaultLendDays || 10;
    }

    // 3. Foydalanuvchiga tegishli ma'lumotlarni server/lokaldan yuklash
    await loadUserDataFromServer(userObj.username);

    screenLogin.style.display = 'none';
    screenApp.style.display = 'flex';

    if (isNewLogin) {
      showToast(`Xush kelibsiz, ${userObj.schoolName || userObj.username}!`, 'success');
    }

    refreshAllData();
  }

  // Server bilan ma'lumotlarni sinxronlash (Telefon va Komp mosligi)
  async function loadUserDataFromServer(username) {
    try {
      const res = await fetch(`/api/user-data?username=${encodeURIComponent(username)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          store.books = json.data.books || [];
          store.transactions = json.data.transactions || [];
          if (json.data.settings) {
            store.settings = json.data.settings;
          }
          store.saveBooks();
          store.saveTransactions();
          store.saveSettings();

          if (json.user && json.user.schoolName) {
            applySchoolName(json.user.schoolName, false);
          }
          refreshAllData();
        }
      }
    } catch (e) {
      // Oflayn rejimda foydalanuvchining lokal xotirasidan o'qiladi
    }
  }

  async function syncUserDataToServer() {
    if (!currentUser || !currentUser.username) return;
    try {
      await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser.username,
          books: store.books,
          transactions: store.transactions,
          settings: store.settings
        })
      });
    } catch (e) {}
  }

  // Login <-> Sign Up rejimini almashtirish
  if (btnToggleAuthMode) {
    btnToggleAuthMode.addEventListener('click', () => {
      isSignUpMode = !isSignUpMode;
      hideLoginError();

      if (isSignUpMode) {
        authFormTitle.textContent = "Ro'yxatdan o'tish";
        btnAuthSubmit.textContent = "Ro'yxatdan o'tish (Sign up)";
        signupExtraFields.style.display = 'block';
        signupConfirmField.style.display = 'block';
        authToggleLabel.innerHTML = `Hisobingiz bormi? <span class="sign-up-link" id="btn-toggle-auth-mode">Tizimga kirish</span>`;
      } else {
        authFormTitle.textContent = "Xush kelibsiz";
        btnAuthSubmit.textContent = "Tizimga kirish";
        signupExtraFields.style.display = 'none';
        signupConfirmField.style.display = 'none';
        authToggleLabel.innerHTML = `Hisobingiz yo'qmi? <span class="sign-up-link" id="btn-toggle-auth-mode">Ro'yxatdan o'tish (Sign up)</span>`;
      }

      // Hodisa tinglovchini qayta ulash
      const newToggle = document.getElementById('btn-toggle-auth-mode');
      if (newToggle) {
        newToggle.onclick = () => btnToggleAuthMode.click();
      }
    });
  }

  function showLoginError(msg) {
    if (loginErrorText) loginErrorText.textContent = msg;
    if (loginErrorAlert) loginErrorAlert.style.display = 'flex';
  }

  function hideLoginError() {
    if (loginErrorAlert) loginErrorAlert.style.display = 'none';
  }

  if (btnCloseLoginError) {
    btnCloseLoginError.addEventListener('click', hideLoginError);
  }

  // Asosiy Auth Form Submit
  if (mainAuthForm) {
    mainAuthForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideLoginError();

      const u = authInputUsername.value.trim();
      const p = authInputPassword.value.trim();

      if (!u || !p) {
        showLoginError('Login va parolni kiriting!');
        return;
      }

      showLoader(isSignUpMode ? "Hisob ochilmoqda..." : "Tekshirilmoqda...");

      if (isSignUpMode) {
        // Sign Up
        const p2 = authInputConfirmPassword ? authInputConfirmPassword.value.trim() : '';
        const school = authInputSchoolName.value.trim() || u;

        if (p !== p2) {
          hideLoader();
          showLoginError('Kiritilgan parollar bir-biriga mos kelmadi!');
          return;
        }

        try {
          const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: u, password: p, schoolName: school })
          });
          const json = await res.json();
          hideLoader();

          if (!res.ok || !json.success) {
            showLoginError(json.message || 'Ro\'yxatdan o\'tishda xatolik!');
            return;
          }

          loginUser(json.user, true);

        } catch (err) {
          hideLoader();
          // Offline fallback
          const localUser = { username: u, schoolName: school, password: p };
          loginUser(localUser, true);
        }

      } else {
        // Log in
        try {
          const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: u, password: p })
          });
          const json = await res.json();
          hideLoader();

          if (!res.ok || !json.success) {
            // Login yoki parol xato!
            showLoginError(json.message || 'Login yoki parol xato kiritildi!');
            return;
          }

          loginUser(json.user, true);

        } catch (err) {
          hideLoader();
          showLoginError('Serverga ulanishda xatolik yuz berdi!');
        }
      }
    });
  }

  // Tizimdan chiqish (faqat o'z xohishi bilan)
  if (btnLogoutAction) {
    btnLogoutAction.addEventListener('click', () => {
      if (confirm('Tizimdan chiqishni tasdiqlaysizmi?')) {
        closeAllModals();
        localStorage.removeItem('maktab_active_user_v2');
        currentUser = null;
        store.setUser(null);
        refreshAllData();
        showToast('Tizimdan chiqildi', 'info');
        showLoginScreen();
      }
    });
  }

  // Hisobni va barcha ma'lumotlarni BUTUNLAY o'chirish
  const btnDeleteAccount = document.getElementById('btn-delete-account');
  if (btnDeleteAccount) {
    btnDeleteAccount.addEventListener('click', async () => {
      if (!currentUser || !currentUser.username) return;

      const confirmMsg = `DIQQAT! Ushbu hisobni ("${currentUser.username}") va unga tegishli BARCHA ma'lumotlarni BUTUNLAY o'chirmoqchimisiz?\n\nBarcha kitoblar fondi, o'quvchilar ro'yxati va hisobotlar yo'q bo'ladi va qayta tiklab bo'lmaydi!`;
      
      if (!confirm(confirmMsg)) return;

      showLoader('Hisob va ma\'lumotlar butunlay o\'chirilmoqda...');
      try {
        const res = await fetch('/api/delete-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: currentUser.username })
        });

        const json = await res.json();
        if (json.success) {
          const deletedUser = currentUser.username;
          // Lokal xotirani ham tozalash
          store.clearUserStorage(deletedUser);
          localStorage.removeItem('maktab_active_user_v2');
          currentUser = null;
          store.setUser(null);
          refreshAllData();

          closeAllModals();
          hideLoader();
          showLoginScreen();
          showToast(`"${deletedUser}" hisobi va barcha ma'lumotlari butunlay o'chirildi!`, 'success');
        } else {
          hideLoader();
          showToast(json.message || 'Xatolik yuz berdi', 'error');
        }
      } catch (err) {
        hideLoader();
        showToast('Server bilan bog\'lanishda xatolik yuz berdi', 'error');
      }
    });
  }

  // =========================================================================
  // 3. THEME (SUN / MOON SWITCH), EKRAN & YO'RIQNOMA
  // =========================================================================
  function initThemeAndModes() {
    const isDark = localStorage.getItem('theme_dark') === 'true';
    if (isDark) {
      document.body.classList.add('dark-mode');
      if (themeToggleInput) themeToggleInput.checked = true;
    }

    if (themeToggleInput) {
      themeToggleInput.addEventListener('change', () => {
        const hasDark = themeToggleInput.checked;
        document.body.classList.toggle('dark-mode', hasDark);
        localStorage.setItem('theme_dark', hasDark);
        showToast(hasDark ? 'Tungi rejim yoqildi' : 'Kunduzgi rejim yoqildi', 'info');
      });
    }

    const isWide = localStorage.getItem('screen_wide') === 'true';
    if (isWide && appViewportWrapper) {
      appViewportWrapper.classList.add('wide-mode');
    }

    if (btnToggleScreenMode) {
      btnToggleScreenMode.addEventListener('click', () => {
        const wide = appViewportWrapper.classList.toggle('wide-mode');
        localStorage.setItem('screen_wide', wide);
        showToast(wide ? 'Keng ekran ko\'rinishi' : 'Mobil ekran ko\'rinishi', 'info');
      });
    }

    // Sozlamalar modali
    if (btnOpenSchoolSettings) {
      btnOpenSchoolSettings.addEventListener('click', () => openModal(modalSettings));
    }
    if (btnHeaderSettings) {
      btnHeaderSettings.addEventListener('click', () => openModal(modalSettings));
    }

    // Yo'riqnoma modali
    if (btnOpenInstructions) {
      btnOpenInstructions.addEventListener('click', () => openModal(modalInstructions));
    }

    // Yangilangan Qo'llanma tablari (Guide Tabs Switcher)
    const guideTabBtns = document.querySelectorAll('.guide-tab-btn');
    const guideTabPanels = document.querySelectorAll('.guide-tab-panel');

    guideTabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-guide-tab');
        guideTabBtns.forEach(b => b.classList.remove('active'));
        guideTabPanels.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetPanel = document.getElementById(targetId);
        if (targetPanel) {
          targetPanel.classList.add('active');
        }
      });
    });

    // Tarmoq holati (Online / Offline nazoratchisi)
    const networkToast = document.getElementById('network-toast');
    const networkToastText = document.getElementById('network-toast-text');

    function showNetworkToast(text, isOnline) {
      if (!networkToast) return;
      if (networkToastText) networkToastText.textContent = text;
      networkToast.className = 'network-status-toast visible ' + (isOnline ? 'status-online' : 'status-offline');
      setTimeout(() => {
        networkToast.classList.remove('visible');
      }, 3500);
    }

    window.addEventListener('online', () => {
      showNetworkToast("Internetga ulandi — ma'lumotlar sinxronlanmoqda", true);
      if (currentUser && currentUser.username) {
        syncUserDataToServer();
      }
    });

    window.addEventListener('offline', () => {
      showNetworkToast("Internet uzildi — 100% oflayn rejim faol", false);
    });
  }

  // =========================================================================
  // 4. ENG PASTIDAGI RADIO INPUTS NAVIGATSIYASI
  // =========================================================================
  function switchTab(targetViewId) {
    currentActiveTab = targetViewId;

    if (radioTabBooks) radioTabBooks.checked = targetViewId === 'view-books';
    if (radioTabStudents) radioTabStudents.checked = targetViewId === 'view-students';

    // Silliq tekislovchi loader effekti
    showLoader();
    setTimeout(() => {
      viewBooks.classList.toggle('active', targetViewId === 'view-books');
      viewStudents.classList.toggle('active', targetViewId === 'view-students');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (targetViewId === 'view-books') {
        renderBooks();
      } else {
        renderStudents();
      }
      hideLoader();
    }, 120);
  }

  if (radioTabBooks) {
    radioTabBooks.addEventListener('change', () => {
      if (radioTabBooks.checked) switchTab('view-books');
    });
  }
  if (radioTabStudents) {
    radioTabStudents.addEventListener('change', () => {
      if (radioTabStudents.checked) switchTab('view-students');
    });
  }

  // =========================================================================
  // 5. 1-BO'LIM: KELTIRILGAN KITOBLAR (Fond & Zaxira)
  // =========================================================================
  function renderBooks() {
    updateStatistics();
    if (!booksListContainer) return;
    booksListContainer.innerHTML = '';

    // Faqat 1-bo'lim uchun fonddagi kitoblar (o'quvchiga berilgan unlisted kitoblar bu yerga chiqmaydi!)
    let list = [...store.getFundBooks()];
    const query = booksSearchInput ? booksSearchInput.value.trim().toLowerCase() : '';

    if (currentBookCatFilter !== 'all') {
      list = list.filter(b => b.type && b.type.toLowerCase() === currentBookCatFilter.toLowerCase());
    }

    if (query) {
      list = list.filter(b => 
        (b.title && b.title.toLowerCase().includes(query)) ||
        (b.author && b.author.toLowerCase().includes(query)) ||
        (b.shelf && b.shelf.toLowerCase().includes(query))
      );
    }

    if (list.length === 0) {
      booksListContainer.innerHTML = `
        <div class="empty-box">
          <div class="empty-title">Keltirilgan kitoblar mavjud emas</div>
          <div class="empty-desc">"+ Yangi Kitob Qo'shish" tugmasi orqali kitoblarni fondga kiritishingiz mumkin.</div>
        </div>
      `;
      return;
    }

    list.forEach(book => {
      const card = document.createElement('div');
      card.className = 'paper-card';

      const isAvailable = book.availableQuantity > 0;

      card.innerHTML = `
        <div class="paper-card-header">
          <div class="card-title-serif">${escapeHtml(book.title)}</div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="status-badge ${isAvailable ? 'success' : 'warning'}">
              Javonda: ${book.availableQuantity} / ${book.totalQuantity} dona
            </span>
            <div class="card-quick-qty">
              <button type="button" class="btn-mini-qty" data-qty-action="minus" data-id="${book.id}" title="Sonini 1 dona kamaytirish">-</button>
              <button type="button" class="btn-mini-qty" data-qty-action="plus" data-id="${book.id}" title="Sonini 1 dona ko'paytirish">+</button>
            </div>
          </div>
        </div>
        <div class="card-author-text">Muallif: ${escapeHtml(book.author || 'Noma\'lum')}</div>
        <div class="card-meta-row">
          <span class="meta-chip">${escapeHtml(book.type || 'Badiiy')}</span>
          <span class="meta-chip">${escapeHtml(book.year || '2026')}</span>
          ${book.shelf ? `<span class="meta-chip">Javon: ${escapeHtml(book.shelf)}</span>` : ''}
          <span class="meta-chip" style="color: var(--text-muted);">Berilgan: ${book.lentQuantity || 0} dona</span>
        </div>
        <div class="card-actions-bar">
          <div style="display: flex; gap: 6px; align-items: center;">
            <button type="button" class="btn-card-action" data-edit-book-id="${book.id}" style="color: var(--text-main);">
              Tahrirlash
            </button>
            <button type="button" class="btn-card-action" data-delete-book-id="${book.id}" style="color: var(--color-danger); border-color: rgba(168, 61, 49, 0.3);">
              O'chirish
            </button>
          </div>
          <button type="button" class="btn-card-action" data-lend-book-id="${book.id}">
            O'quvchiga Berish
          </button>
        </div>
      `;

      // Tezkor sonni kamaytirish tugmasi
      const btnMinus = card.querySelector('[data-qty-action="minus"]');
      if (btnMinus) {
        btnMinus.addEventListener('click', () => {
          const res = store.adjustBookQuantity(book.id, -1);
          if (!res.success) {
            showToast(res.message, 'warning');
          } else {
            syncUserDataToServer();
            refreshAllData();
            showToast(`"${book.title}" soni kamaytirildi (Jami: ${res.newTotal} dona)`, 'info');
          }
        });
      }

      // Tezkor sonni ko'paytirish tugmasi
      const btnPlus = card.querySelector('[data-qty-action="plus"]');
      if (btnPlus) {
        btnPlus.addEventListener('click', () => {
          const res = store.adjustBookQuantity(book.id, 1);
          if (!res.success) {
            showToast(res.message, 'warning');
          } else {
            syncUserDataToServer();
            refreshAllData();
            showToast(`"${book.title}" soni ko'paytirildi (Jami: ${res.newTotal} dona)`, 'success');
          }
        });
      }

      // Tahrirlash tugmasi
      const editBtn = card.querySelector(`[data-edit-book-id="${book.id}"]`);
      if (editBtn) {
        editBtn.addEventListener('click', () => {
          openEditBookModal(book);
        });
      }

      // O'chirish tugmasi
      const delBtn = card.querySelector(`[data-delete-book-id="${book.id}"]`);
      if (delBtn) {
        delBtn.addEventListener('click', () => {
          confirmDeleteBook(book);
        });
      }

      // O'quvchiga berish tugmasi
      const lendBtn = card.querySelector(`[data-lend-book-id="${book.id}"]`);
      if (lendBtn) {
        lendBtn.addEventListener('click', () => {
          openGiveBookModal(book);
        });
      }

      booksListContainer.appendChild(card);
    });
  }

  function confirmDeleteBook(book) {
    if (book.lentQuantity > 0) {
      if (!confirm(`Diqqat: Ushbu kitobdan ${book.lentQuantity} donasi o'quvchilarga berilgan! Fonddan o'chirmoqchimisiz?`)) {
        return;
      }
    } else {
      if (!confirm(`Haqiqatan ham "${book.title}" kitobini fonddan o'chirmoqchimisiz?`)) {
        return;
      }
    }

    showLoader('Kitob o\'chirilmoqda...');
    setTimeout(() => {
      store.deleteBook(book.id);
      syncUserDataToServer();
      hideLoader();
      showToast(`"${book.title}" fonddan o'chirildi`, 'info');
      refreshAllData();
    }, 150);
  }

  // Kitobni tahrirlash modali
  const modalEditBook = document.getElementById('modal-edit-book');
  const formEditBook = document.getElementById('form-edit-book');
  const editBookId = document.getElementById('edit-book-id');
  const editBookTitle = document.getElementById('edit-book-title');
  const editBookAuthor = document.getElementById('edit-book-author');
  const editBookType = document.getElementById('edit-book-type');
  const editBookYear = document.getElementById('edit-book-year');
  const editBookQty = document.getElementById('edit-book-qty');
  const editBookShelf = document.getElementById('edit-book-shelf');
  const editBookLentHint = document.getElementById('edit-book-lent-hint');
  const btnQtyMinus = document.getElementById('btn-qty-minus');
  const btnQtyPlus = document.getElementById('btn-qty-plus');
  const btnDeleteBookAction = document.getElementById('btn-delete-book-action');

  function openEditBookModal(book) {
    if (editBookId) editBookId.value = book.id;
    if (editBookTitle) editBookTitle.value = book.title;
    if (editBookAuthor) editBookAuthor.value = book.author || '';
    if (editBookType) editBookType.value = book.type || 'Badiiy';
    if (editBookYear) editBookYear.value = book.year || new Date().getFullYear();
    if (editBookQty) {
      editBookQty.value = book.totalQuantity || 1;
      editBookQty.min = book.lentQuantity || 0;
    }
    if (editBookShelf) editBookShelf.value = book.shelf || '';
    if (editBookLentHint) {
      editBookLentHint.textContent = `Hozirda o'quvchilarda: ${book.lentQuantity || 0} dona. Javonda mavjud: ${book.availableQuantity || 0} dona.`;
    }

    openModal(modalEditBook);
  }

  if (btnQtyMinus && editBookQty) {
    btnQtyMinus.addEventListener('click', () => {
      let current = parseInt(editBookQty.value, 10) || 0;
      const min = parseInt(editBookQty.min, 10) || 0;
      if (current > min) {
        editBookQty.value = current - 1;
      } else {
        showToast(`O'quvchilarga berilgan sonidan (${min}) kam qilib bo'lmaydi!`, 'warning');
      }
    });
  }

  if (btnQtyPlus && editBookQty) {
    btnQtyPlus.addEventListener('click', () => {
      let current = parseInt(editBookQty.value, 10) || 0;
      editBookQty.value = current + 1;
    });
  }

  if (formEditBook) {
    formEditBook.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = editBookId.value;
      const title = editBookTitle.value.trim();
      const author = editBookAuthor.value.trim();
      const type = editBookType.value.trim();
      const year = editBookYear.value.trim();
      const qty = parseInt(editBookQty.value, 10) || 0;
      const shelf = editBookShelf.value.trim();

      if (!title || !author) {
        showToast('Kitob nomi va muallifini kiriting!', 'error');
        return;
      }

      showLoader('O\'zgarishlar saqlanmoqda...');
      setTimeout(() => {
        store.updateBook(id, {
          title,
          author,
          type,
          year,
          totalQuantity: qty,
          shelf
        });

        syncUserDataToServer();
        closeAllModals();
        hideLoader();
        showToast(`"${title}" ma'lumotlari yangilandi`, 'success');
        refreshAllData();
      }, 150);
    });
  }

  if (btnDeleteBookAction) {
    btnDeleteBookAction.addEventListener('click', () => {
      const id = editBookId.value;
      const book = store.getBookById(id);
      if (!book) return;

      if (book.lentQuantity > 0) {
        if (!confirm(`Diqqat: Ushbu kitobdan ${book.lentQuantity} donasi o'quvchilarga berilgan! Fonddan o'chirmoqchimisiz?`)) {
          return;
        }
      } else {
        if (!confirm(`Haqiqatan ham "${book.title}" kitobini fonddan o'chirmoqchimisiz?`)) {
          return;
        }
      }

      showLoader('Kitob o\'chirilmoqda...');
      setTimeout(() => {
        store.deleteBook(id);
        syncUserDataToServer();
        closeAllModals();
        hideLoader();
        showToast(`"${book.title}" fonddan o'chirildi`, 'info');
        refreshAllData();
      }, 150);
    });
  }

  function updateStatistics() {
    const stats = store.getStatistics();
    if (statTotalCopies) statTotalCopies.textContent = stats.totalCopies.toLocaleString();
    if (statAvailableCopies) statAvailableCopies.textContent = stats.availableCopies.toLocaleString();
    if (statLentCopies) statLentCopies.textContent = stats.lentCopies.toLocaleString();
    if (countOverdueEl) countOverdueEl.textContent = stats.overdueCount;

    // Kechikkanlar ogohlantirish banneri
    if (studentsAlertBanner) {
      if (stats.overdueCount > 0) {
        studentsAlertBanner.style.display = 'block';
        studentsAlertBanner.innerHTML = `
          <div style="background: var(--color-danger-bg); border: 1px solid rgba(168, 61, 49, 0.3); padding: 12px 14px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <div style="font-size: 13px; color: var(--color-danger); font-weight: 600;">
              Diqqat: ${stats.overdueCount} ta o'quvchida kitob topshirish muddati o'tib ketgan!
            </div>
            <button type="button" class="btn-card-action" id="btn-banner-filter-overdue" style="border-color: var(--color-danger); color: var(--color-danger); flex-shrink: 0;">
              Ko'rish
            </button>
          </div>
        `;
        const bannerBtn = document.getElementById('btn-banner-filter-overdue');
        if (bannerBtn) {
          bannerBtn.onclick = () => {
            currentLendFilter = 'overdue';
            document.querySelectorAll('[data-lend-filter]').forEach(b => {
              b.classList.toggle('active', b.dataset.lendFilter === 'overdue');
            });
            renderStudents();
          };
        }
      } else {
        studentsAlertBanner.style.display = 'none';
      }
    }
  }

  // Keltirilgan yangi kitobni saqlash
  // "yangi kitob qoshishda hamma malumotlar eskisi bilan birxil bolsa eski va yangi qoshilib soni kopayishi funksiyasini ham unutma"
  if (formAddBook) {
    formAddBook.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = bookInputTitle.value.trim();
      const author = bookInputAuthor.value.trim();
      const type = bookInputType.value.trim();
      const year = bookInputYear.value.trim();
      const qty = parseInt(bookInputQty.value, 10) || 1;
      const shelf = bookInputShelf.value.trim();
      const source = bookInputSource.value.trim();

      if (!title || !author) {
        showToast('Iltimos, kitob nomi va muallifini kiriting', 'error');
        return;
      }

      showLoader('Fondga saqlanmoqda...');
      setTimeout(() => {
        // 1. Fondga saqlash (eskisi bilan bir xil bo'lsa soni ko'payadi!)
        const saveRes = store.saveBook({
          title,
          author,
          type,
          year,
          quantity: qty,
          shelf
        });

        // 2. Kirim amaliyoti qaydnomasi (alreadyAdjusted: true, chunki saveBook allaqachon sonini ko'paytirdi)
        store.addTransaction({
          type: 'kirim',
          bookId: saveRes.book ? saveRes.book.id : null,
          title: saveRes.book ? saveRes.book.title : title,
          author: saveRes.book ? saveRes.book.author : author,
          category: type,
          year,
          quantity: qty,
          shelf,
          recipientOrSource: source || 'Kutubxona fondi',
          alreadyAdjusted: true
        });

        syncUserDataToServer();
        closeAllModals();
        formAddBook.reset();
        hideLoader();

        if (saveRes && saveRes.isMerged) {
          showToast(`"${title}" kitobi fondda mavjud! Soni ${saveRes.addedQty} donaga oshirildi (Jami: ${saveRes.book.totalQuantity} dona)`, 'success');
        } else {
          showToast(`"${title}" yangi kitob sifatida fondga qabul qilindi`, 'success');
        }
        refreshAllData();
      }, 200);
    });
  }

  // =========================================================================
  // 6. 2-BO'LIM: O'QUVCHILARGA KITOB BERISH (FONDDA YO'Q BO'LSA HAM MUMKIN!)
  // =========================================================================
  function renderStudents() {
    updateStatistics();
    if (!studentsListContainer) return;
    studentsListContainer.innerHTML = '';

    let list = store.getStudentLendings();
    const query = studentsSearchInput ? studentsSearchInput.value.trim().toLowerCase() : '';

    if (currentLendFilter === 'overdue') {
      list = list.filter(t => t.status !== 'Qaytarildi' && store.getLendingStatus(t).code === 'overdue');
    } else if (currentLendFilter === 'dueSoon') {
      list = list.filter(t => {
        if (t.status === 'Qaytarildi') return false;
        const code = store.getLendingStatus(t).code;
        return code === 'due_today' || code === 'due_soon';
      });
    } else if (currentLendFilter === 'active') {
      list = list.filter(t => t.status !== 'Qaytarildi');
    } else if (currentLendFilter === 'returned') {
      list = list.filter(t => t.status === 'Qaytarildi');
    }

    if (query) {
      list = list.filter(t => 
        (t.studentName && t.studentName.toLowerCase().includes(query)) ||
        (t.studentClass && t.studentClass.toLowerCase().includes(query)) ||
        (t.bookTitle && t.bookTitle.toLowerCase().includes(query)) ||
        (t.recipientOrSource && t.recipientOrSource.toLowerCase().includes(query))
      );
    }

    if (list.length === 0) {
      studentsListContainer.innerHTML = `
        <div class="empty-box">
          <div class="empty-title">Berilgan kitoblar topilmadi</div>
          <div class="empty-desc">"+ Kitob Berish" tugmasi orqali o'quvchiga kitob biriktiring.</div>
        </div>
      `;
      return;
    }

    list.forEach(tx => {
      const isReturned = tx.status === 'Qaytarildi';
      const statusInfo = store.getLendingStatus(tx);

      const card = document.createElement('div');
      card.className = 'paper-card';

      let statusBadgeClass = 'success';
      if (isReturned) {
        statusBadgeClass = 'returned';
      } else if (statusInfo.alertLevel === 'danger') {
        statusBadgeClass = 'danger';
      } else if (statusInfo.alertLevel === 'warning') {
        statusBadgeClass = 'warning';
      }

      const studentName = tx.studentName || tx.recipientOrSource || 'O\'quvchi';
      const cleanPhone = (tx.studentPhone || '').replace(/[^\d+]/g, '');
      const quickSmsText = encodeURIComponent(`Assalomu alaykum! ${(store.settings.schoolName || 'Maktab kutubxonasi')}dan eslatma: ${studentName} olgan "${tx.bookTitle}" kitobini topshirish muddati: ${tx.dueDate || ''}. Iltimos, kitobni kutubxonaga topshirishingizni so'raymiz.`);

      card.innerHTML = `
        <div class="paper-card-header">
          <div class="card-title-serif">${escapeHtml(studentName)} ${tx.studentClass ? `(${escapeHtml(tx.studentClass)})` : ''}</div>
          <span class="status-badge ${statusBadgeClass}">
            ${isReturned ? 'Kutubxonaga qaytarilgan' : statusInfo.label}
          </span>
        </div>
        <div class="card-author-text">
          Kitob: <strong>${escapeHtml(tx.bookTitle)}</strong> ${tx.author ? `— ${escapeHtml(tx.author)}` : ''}
        </div>
        <div class="card-meta-row">
          <span class="meta-chip">Berilgan: ${escapeHtml(tx.givenDate || '')}</span>
          <span class="meta-chip">Muddati: ${escapeHtml(tx.dueDate || 'Belgilanmagan')}</span>
          ${isReturned && tx.returnDate ? `<span class="meta-chip" style="background: var(--color-success-bg); color: var(--color-success); border-color: rgba(60, 110, 71, 0.3);">Qaytarilgan: ${escapeHtml(tx.returnDate.split('T')[0])}</span>` : ''}
          ${tx.studentPhone ? `<span class="meta-chip">Tel: ${escapeHtml(tx.studentPhone)}</span>` : ''}
        </div>
        <div class="card-actions-bar">
          ${!isReturned ? `
            <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
              <!-- Kitob qaytarildi tugmasi: muddatidan oldin ham, xohlagan vaqtda qaytarish mumkin -->
              <button type="button" class="btn-card-action return-btn" data-action="return" data-id="${tx.id}" title="Kitob kutubxonaga qaytarilganini tasdiqlash">
                Kitob qaytarildi
              </button>
              <button type="button" class="btn-card-action" data-action="extend" data-id="${tx.id}">
                Muddatni Uzaytirish
              </button>
              <button type="button" class="btn-card-action" data-action="remind" data-id="${tx.id}">
                Eslatish
              </button>
              ${cleanPhone ? `
                <a href="tel:${cleanPhone}" class="call-action-btn" title="To'g'ridan-to'g'ri qo'ng'iroq qilish">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  Qo'ng'iroq
                </a>
                <a href="sms:${cleanPhone}?body=${quickSmsText}" class="sms-action-btn" title="SMS shablonini yuborish">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  SMS
                </a>
              ` : ''}
            </div>
          ` : `
            <span style="font-size: 12px; color: var(--color-success); font-weight: 600;">
              Kitob kutubxonaga qaytarilgan
            </span>
          `}
        </div>
      `;

      // Harakatlar
      const btnRet = card.querySelector('[data-action="return"]');
      if (btnRet) {
        btnRet.addEventListener('click', () => {
          if (confirm(`"${studentName}" o'quvchisi "${tx.bookTitle}" kitobini kutubxonaga qaytardimi?`)) {
            showLoader('Kitob qabul qilinmoqda...');
            setTimeout(() => {
              store.returnBook(tx.id);
              syncUserDataToServer();
              hideLoader();
              showToast('Kitob kutubxonaga muvaffaqiyatli qaytarildi', 'success');
              refreshAllData();
            }, 180);
          }
        });
      }

      const btnExt = card.querySelector('[data-action="extend"]');
      if (btnExt) {
        btnExt.addEventListener('click', () => {
          openExtendModal(tx);
        });
      }

      const btnRem = card.querySelector('[data-action="remind"]');
      if (btnRem) {
        btnRem.addEventListener('click', () => {
          openReminderModal(tx);
        });
      }

      studentsListContainer.appendChild(card);
    });
  }

  // O'quvchiga kitob berish modali ochish
  function openGiveBookModal(presetBook = null) {
    if (formGiveBook) formGiveBook.reset();
    if (alertBookNotInFund) alertBookNotInFund.style.display = 'none';
    if (giveStockIndicator) giveStockIndicator.textContent = '';

    const todayStr = new Date().toISOString().split('T')[0];
    if (giveInputGivenDate) giveInputGivenDate.value = todayStr;

    const defaultDays = store.settings.defaultLendDays || 10;
    setDueDate(defaultDays);

    if (presetBook) {
      if (giveInputTitle) giveInputTitle.value = presetBook.title;
      if (giveInputAuthor) giveInputAuthor.value = presetBook.author;
      if (giveStockIndicator) giveStockIndicator.textContent = `(Javonda: ${presetBook.availableQuantity} dona)`;
    }

    openModal(modalGiveBook);
    setTimeout(() => {
      if (!presetBook && giveInputStudent) {
        giveInputStudent.focus();
      }
    }, 150);
  }

  function setDueDate(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    if (giveInputDueDate) giveInputDueDate.value = d.toISOString().split('T')[0];
  }

  // Tezkor muddat tugmalari
  document.querySelectorAll('[data-quick-days]').forEach(btn => {
    btn.addEventListener('click', () => {
      const days = parseInt(btn.dataset.quickDays, 10) || 10;
      setDueDate(days);
    });
  });

  // Kitob nomi kiritilayotganda fondda bor-yo'qligini tekshirish
  if (giveInputTitle) {
    giveInputTitle.addEventListener('input', () => {
      const q = giveInputTitle.value.trim().toLowerCase();
      if (!q) {
        if (alertBookNotInFund) alertBookNotInFund.style.display = 'none';
        if (giveStockIndicator) giveStockIndicator.textContent = '';
        return;
      }

      const found = store.getBooks().find(b => b.title.toLowerCase() === q);
      if (found) {
        if (giveStockIndicator) giveStockIndicator.textContent = `(Javonda: ${found.availableQuantity} dona)`;
        if (giveInputAuthor && !giveInputAuthor.value) giveInputAuthor.value = found.author;
        if (alertBookNotInFund) alertBookNotInFund.style.display = 'none';
      } else {
        // Fondda yo'q - Foydalanuvchi taqdim etgan Info Alert Card chiqadi
        if (giveStockIndicator) giveStockIndicator.textContent = `(Fondda ro'yxatga olinmagan)`;
        if (alertBookNotInFund) alertBookNotInFund.style.display = 'flex';
      }
    });
  }

  if (btnDismissAlertNotInFund) {
    btnDismissAlertNotInFund.addEventListener('click', () => {
      if (alertBookNotInFund) alertBookNotInFund.style.display = 'none';
    });
  }

  // O'quvchiga kitob berish form submit
  if (formGiveBook) {
    formGiveBook.addEventListener('submit', (e) => {
      e.preventDefault();
      const student = giveInputStudent.value.trim();
      const sClass = giveInputClass.value.trim();
      const phone = giveInputPhone.value.trim();
      const title = giveInputTitle.value.trim();
      const author = giveInputAuthor.value.trim();
      const givenDate = giveInputGivenDate.value;
      const dueDate = giveInputDueDate.value;
      const notes = giveInputNotes.value.trim();

      if (!student || !title) {
        showToast('Iltimos, o\'quvchi ismi va kitob nomini kiriting', 'error');
        return;
      }

      showLoader('Kitob topshirilmoqda...');
      setTimeout(() => {
        // Fondda bo'lmasa ham saqlanadi va hech qanday to'siq bo'lmaydi!
        store.addTransaction({
          type: 'chiqim',
          title,
          author: author || 'Noma\'lum',
          studentName: student,
          studentClass: sClass,
          studentPhone: phone,
          recipientOrSource: `${student} (${sClass})`,
          givenDate,
          dueDate,
          notes,
          quantity: 1
        });

        syncUserDataToServer();
        closeAllModals();
        formGiveBook.reset();
        hideLoader();
        showToast(`Kitob ${student}ga muvaffaqiyatli berildi`, 'success');
        refreshAllData();
      }, 200);
    });
  }

  // =========================================================================
  // 7. MAKTAB VA KUTUBXONA MA'LUMOTLARI SOZLAMALAR FORMASI (2-rasm)
  // =========================================================================
  if (formSchoolSettings) {
    formSchoolSettings.addEventListener('submit', (e) => {
      e.preventDefault();
      const newName = settingsInputSchoolName.value.trim();
      const defaultDays = parseInt(settingsInputDefaultDays.value, 10) || 10;

      showLoader('Sozlamalar saqlanmoqda...');
      setTimeout(() => {
        const finalName = applySchoolName(newName);
        store.settings.defaultLendDays = defaultDays;
        store.save(STORAGE_KEYS.SETTINGS, store.settings);
        syncUserDataToServer();

        closeAllModals();
        hideLoader();
        showToast(`Maktab nomi "${finalName}"ga o'zgartirildi`, 'success');
      }, 150);
    });
  }

  // CSV Export
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', () => {
      const rows = [
        ["ID", "Turi", "Kitob nomi", "Muallif", "O'quvchi / Manba", "Sinfi", "Telefon", "Berilgan sana", "Topshirish muddati", "Holati"]
      ];

      store.transactions.forEach(t => {
        rows.push([
          t.id,
          t.type === 'kirim' ? 'Keltirilgan' : 'Berilgan',
          `"${(t.bookTitle || '').replace(/"/g, '""')}"`,
          `"${(t.author || '').replace(/"/g, '""')}"`,
          `"${(t.studentName || t.recipientOrSource || '').replace(/"/g, '""')}"`,
          `"${(t.studentClass || '').replace(/"/g, '""')}"`,
          `"${(t.studentPhone || '').replace(/"/g, '""')}"`,
          t.givenDate || '',
          t.dueDate || '',
          t.status || ''
        ]);
      });

      const csvContent = '\uFEFF' + rows.map(e => e.join(';')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `kutubxona_hisoboti_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('CSV hisoboti yuklab olindi', 'success');
    });
  }

  // =========================================================================
  // 8. ESLATMA VA MUDDATNI UZAYTIRISH MODALLARI
  // =========================================================================
  function openReminderModal(tx) {
    const studentTitle = tx.studentName || tx.recipientOrSource || 'O\'quvchi';
    const school = store.settings.schoolName || 'Maktab Kutubxonasi';
    const msg = `Assalomu alaykum! ${school}dan eslatma: ${studentTitle} olgan "${tx.bookTitle}" kitobini topshirish muddati: ${tx.dueDate || 'Belgilanmagan'}. Iltimos, kitobni o'z vaqtida kutubxonaga topshirishingizni so'raymiz.`;

    if (reminderStudentInfo) {
      reminderStudentInfo.innerHTML = `<strong>${escapeHtml(studentTitle)}</strong> — "${escapeHtml(tx.bookTitle)}" (Muddati: ${escapeHtml(tx.dueDate || 'Belgilanmagan')})`;
    }
    if (reminderTextarea) {
      reminderTextarea.value = msg;
    }

    const cleanPhone = (tx.studentPhone || '').replace(/[^\d+]/g, '');
    if (reminderPhoneDisplay) {
      reminderPhoneDisplay.textContent = tx.studentPhone || 'Raqam kiritilmagan';
    }

    // To'g'ridan-to'g'ri qo'ng'iroq (shablonsiz, terilgan raqamga to'g'ridan-to'g'ri)
    if (btnDirectPhoneCall) {
      if (cleanPhone) {
        btnDirectPhoneCall.href = `tel:${cleanPhone}`;
        btnDirectPhoneCall.style.opacity = '1';
        btnDirectPhoneCall.style.pointerEvents = 'auto';
        btnDirectPhoneCall.onclick = null;
      } else {
        btnDirectPhoneCall.href = '#';
        btnDirectPhoneCall.style.opacity = '0.5';
        btnDirectPhoneCall.onclick = (e) => {
          e.preventDefault();
          showToast('Ushbu o\'quvchi uchun telefon raqami kiritilmagan', 'error');
        };
      }
    }

    // Shablon SMS yuborish
    function updateSmsLink() {
      if (btnDirectSmsSend) {
        if (cleanPhone) {
          const bodyText = reminderTextarea ? encodeURIComponent(reminderTextarea.value) : '';
          btnDirectSmsSend.href = `sms:${cleanPhone}?body=${bodyText}`;
          btnDirectSmsSend.style.opacity = '1';
          btnDirectSmsSend.style.pointerEvents = 'auto';
          btnDirectSmsSend.onclick = null;
        } else {
          btnDirectSmsSend.href = '#';
          btnDirectSmsSend.style.opacity = '0.5';
          btnDirectSmsSend.onclick = (e) => {
            e.preventDefault();
            showToast('Ushbu o\'quvchi uchun telefon raqami kiritilmagan', 'error');
          };
        }
      }
    }

    updateSmsLink();
    if (reminderTextarea) {
      reminderTextarea.oninput = updateSmsLink;
    }

    openModal(modalReminder);
  }

  if (btnCopyReminderText) {
    btnCopyReminderText.addEventListener('click', () => {
      if (reminderTextarea) {
        reminderTextarea.select();
        navigator.clipboard.writeText(reminderTextarea.value).then(() => {
          showToast('Eslatma matni nusxalandi', 'success');
        }).catch(() => {
          document.execCommand('copy');
          showToast('Eslatma nusxalandi', 'success');
        });
      }
    });
  }

  if (btnSendTelegramText) {
    btnSendTelegramText.addEventListener('click', () => {
      if (reminderTextarea) {
        const text = encodeURIComponent(reminderTextarea.value);
        window.open(`https://t.me/share/url?url=&text=${text}`, '_blank');
      }
    });
  }

  function openExtendModal(tx) {
    targetExtendTxId = tx.id;
    const studentTitle = tx.studentName || tx.recipientOrSource || 'O\'quvchi';
    if (extendInfoText) {
      extendInfoText.innerHTML = `<strong>${escapeHtml(studentTitle)}</strong> uchun "${escapeHtml(tx.bookTitle)}" kitobining topshirish muddatini uzaytirish (Hozirgi muddat: <strong>${escapeHtml(tx.dueDate || 'Belgilanmagan')}</strong>)`;
    }

    // Bazaviy muddat: agar muddati o'tgan bo'lsa bugungi kundan, aks holda mavjud muddati
    let base = new Date();
    if (tx.dueDate) {
      const parsed = new Date(tx.dueDate);
      if (!isNaN(parsed.getTime())) {
        base = parsed;
      }
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (base < today) {
      base = today;
    }
    currentExtendBaseDate = base;

    // Standart 7 kunlik shablonni qo'llash
    applyExtendChoice(7);

    openModal(modalExtend);
  }

  function applyExtendChoice(days) {
    selectedExtendDays = days;
    document.querySelectorAll('.extend-choice').forEach(b => {
      const val = parseInt(b.dataset.extendVal, 10);
      b.classList.toggle('active', val === days);
    });

    if (currentExtendBaseDate) {
      const targetDate = new Date(currentExtendBaseDate);
      targetDate.setDate(targetDate.getDate() + days);
      const dateStr = targetDate.toISOString().split('T')[0];

      if (extendCustomDate) extendCustomDate.value = dateStr;
      if (extendCustomDays) extendCustomDays.value = days;
      if (extendPreviewTarget) extendPreviewTarget.textContent = dateStr;
    }
  }

  // Tezkor shablon tugmalari (+7, +10, +14, +30)
  document.querySelectorAll('.extend-choice').forEach(btn => {
    btn.addEventListener('click', () => {
      const days = parseInt(btn.dataset.extendVal, 10) || 7;
      applyExtendChoice(days);
    });
  });

  // Istalgan sanani qo'lda tanlash
  if (extendCustomDate) {
    extendCustomDate.addEventListener('input', () => {
      const val = extendCustomDate.value;
      if (val) {
        document.querySelectorAll('.extend-choice').forEach(b => b.classList.remove('active'));
        if (extendPreviewTarget) extendPreviewTarget.textContent = val;

        if (currentExtendBaseDate) {
          const picked = new Date(val);
          const diffMs = picked - currentExtendBaseDate;
          const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
          if (extendCustomDays && diffDays > 0) {
            extendCustomDays.value = diffDays;
          }
        }
      }
    });
  }

  // Istalgan kun sonini kiritish (masalan 5 kun, 20 kun, 45 kun)
  if (extendCustomDays) {
    extendCustomDays.addEventListener('input', () => {
      const days = parseInt(extendCustomDays.value, 10);
      if (days && days > 0 && currentExtendBaseDate) {
        document.querySelectorAll('.extend-choice').forEach(b => {
          b.classList.toggle('active', parseInt(b.dataset.extendVal, 10) === days);
        });
        const targetDate = new Date(currentExtendBaseDate);
        targetDate.setDate(targetDate.getDate() + days);
        const dateStr = targetDate.toISOString().split('T')[0];
        if (extendCustomDate) extendCustomDate.value = dateStr;
        if (extendPreviewTarget) extendPreviewTarget.textContent = dateStr;
      }
    });
  }

  if (btnConfirmExtendAction) {
    btnConfirmExtendAction.addEventListener('click', () => {
      if (!targetExtendTxId) return;

      const customDateVal = extendCustomDate ? extendCustomDate.value : null;

      showLoader('Muddat uzaytirilmoqda...');
      setTimeout(() => {
        let res;
        if (customDateVal) {
          res = store.setCustomDueDate(targetExtendTxId, customDateVal);
        } else {
          res = store.extendDueDate(targetExtendTxId, selectedExtendDays || 7);
        }

        if (res && res.success) {
          syncUserDataToServer();
          closeAllModals();
          hideLoader();
          showToast(`Topshirish muddati ${res.newDueDate} gacha uzaytirildi`, 'success');
          refreshAllData();
        }
      }, 150);
    });
  }

  // =========================================================================
  // 9. EVENT LISTENERS & MODAL CONTROLS
  // =========================================================================
  if (btnAddNewBook) {
    btnAddNewBook.addEventListener('click', () => openModal(modalAddBook));
  }
  if (btnGiveBookToStudent) {
    btnGiveBookToStudent.addEventListener('click', () => openGiveBookModal(null));
  }

  // Qidiruv va filtrlar
  if (booksSearchInput) {
    booksSearchInput.addEventListener('input', () => renderBooks());
  }

  document.querySelectorAll('[data-book-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-book-cat]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentBookCatFilter = btn.dataset.bookCat;
      renderBooks();
    });
  });

  if (studentsSearchInput) {
    studentsSearchInput.addEventListener('input', () => renderStudents());
  }

  document.querySelectorAll('[data-lend-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-lend-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLendFilter = btn.dataset.lendFilter;
      renderStudents();
    });
  });

  // Modal yopish tugmalari
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.closeModal;
      const m = document.getElementById(modalId);
      if (m) closeModal(m);
    });
  });

  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal(backdrop);
    });
  });

  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('open');
    document.body.style.overflow = '';
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
    document.body.style.overflow = '';
  }

  function refreshAllData() {
    renderBooks();
    renderStudents();
  }

  // Toast
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // =========================================================================
  // 10. YOUTUBE USLUBIDAGI IXCHAM SMART AUTOCOMPLETE (Kitob va Ism uchun)
  // "agar bor bolsa nomi eng yaqin kelganlarini chiqar huddi youtube kabi ammo sal kichikroq bolsin yani saytni yopib qolmasin ismga ham"
  // =========================================================================
  function initAutocompletes() {
    if (!window.SmartAutocomplete) return;

    // 1. Kitob nomi uchun ixcham avtomatik taklif
    if (giveInputTitle) {
      new window.SmartAutocomplete({
        input: giveInputTitle,
        maxSuggestions: 5,
        getItems: () => {
          const books = store.getBooks();
          return books.map(b => ({
            text: b.title,
            subtext: b.availableQuantity > 0 ? (`Javonda: ${b.availableQuantity} dona`) : '0 dona (band)',
            book: b
          }));
        },
        onSelect: (item) => {
          if (item && item.book) {
            if (giveInputAuthor) giveInputAuthor.value = item.book.author || '';
            if (giveStockIndicator) {
              giveStockIndicator.textContent = `(Javonda: ${item.book.availableQuantity} dona)`;
            }
            if (alertBookNotInFund) alertBookNotInFund.style.display = 'none';
          }
        }
      });
    }

    // 2. O'quvchi ismi uchun ixcham taklif ("ismga ham")
    if (giveInputStudent) {
      new window.SmartAutocomplete({
        input: giveInputStudent,
        maxSuggestions: 5,
        getItems: () => {
          const lendings = store.getStudentLendings();
          const seen = new Set();
          const students = [];

          lendings.forEach(tx => {
            const name = (tx.studentName || tx.recipientOrSource || '').trim();
            if (name && !seen.has(name.toLowerCase())) {
              seen.add(name.toLowerCase());
              students.push({
                text: name,
                subtext: tx.studentClass ? `${tx.studentClass} sinf` : '',
                student: {
                  name: name,
                  studentClass: tx.studentClass || '',
                  studentPhone: tx.studentPhone || ''
                }
              });
            }
          });

          return students;
        },
        onSelect: (item) => {
          if (item && item.student) {
            if (giveInputClass && item.student.studentClass) {
              giveInputClass.value = item.student.studentClass;
            }
            if (giveInputPhone && item.student.studentPhone) {
              giveInputPhone.value = item.student.studentPhone;
            }
          }
        }
      });
    }

    // 3. Fondga yangi kitob qo'shishda ham taklif
    if (bookInputTitle) {
      new window.SmartAutocomplete({
        input: bookInputTitle,
        maxSuggestions: 5,
        getItems: () => {
          const books = store.getBooks();
          return books.map(b => ({
            text: b.title,
            subtext: b.author ? `Muallif: ${b.author}` : '',
            book: b
          }));
        },
        onSelect: (item) => {
          if (item && item.book && bookInputAuthor && !bookInputAuthor.value) {
            bookInputAuthor.value = item.book.author || '';
          }
        }
      });
    }
  }

  // =========================================================================
  // 11. PULL TO REFRESH (Instagram & Chrome uslubida silliq yangilash)
  // "ilovani tepaga scrol qilsak refrush bolsin huddi instagram va chrome kabi"
  // =========================================================================
  function initPullToRefresh() {
    const ptrBox = document.getElementById('pull-to-refresh');
    const ptrIcon = document.getElementById('ptr-icon');
    const ptrText = document.getElementById('ptr-text');
    if (!ptrBox) return;

    let startY = 0;
    let currentY = 0;
    let isPulling = false;
    let isRefreshing = false;
    const threshold = 65; // px

    function isAtTop() {
      return (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0) <= 2;
    }

    // Touch events for mobile
    window.addEventListener('touchstart', (e) => {
      if (isRefreshing) return;
      if (isAtTop() && e.touches.length === 1) {
        startY = e.touches[0].clientY;
        isPulling = false;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (isRefreshing || e.touches.length !== 1) return;
      currentY = e.touches[0].clientY;
      const diff = currentY - startY;

      if (diff > 0 && isAtTop()) {
        isPulling = true;
        // Instagram / Chrome elastik qarshilik formulasi
        const pullDistance = Math.min(diff * 0.42, 110);
        
        ptrBox.classList.add('pulling');
        ptrBox.style.transform = `translateY(${pullDistance - 54}px)`;
        ptrBox.style.opacity = Math.min(pullDistance / 45, 1).toString();

        const rot = Math.min((pullDistance / threshold) * 270, 360);
        if (ptrIcon) ptrIcon.style.transform = `rotate(${rot}deg)`;

        if (ptrText) {
          if (pullDistance >= threshold) {
            ptrText.textContent = "Qo'yib yuboring (Yangilanadi)";
          } else {
            ptrText.textContent = "Yangilash uchun torting";
          }
        }
      } else {
        if (isPulling) {
          resetPtr();
        }
      }
    }, { passive: true });

    window.addEventListener('touchend', async () => {
      if (!isPulling || isRefreshing) return;
      isPulling = false;
      const diff = currentY - startY;
      const pullDistance = Math.min(diff * 0.42, 110);

      if (pullDistance >= threshold && isAtTop()) {
        await executeRefresh();
      } else {
        resetPtr();
      }
    });

    // Mouse drag qo'llab-quvvatlashi (kompyuter va test qilish uchun)
    let mouseStartY = 0;
    let isMouseDown = false;

    window.addEventListener('mousedown', (e) => {
      if (isRefreshing) return;
      if (isAtTop() && e.button === 0 && e.clientY < 180) {
        mouseStartY = e.clientY;
        isMouseDown = true;
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!isMouseDown || isRefreshing) return;
      const diff = e.clientY - mouseStartY;
      if (diff > 0 && isAtTop()) {
        isPulling = true;
        const pullDistance = Math.min(diff * 0.42, 110);
        ptrBox.classList.add('pulling');
        ptrBox.style.transform = `translateY(${pullDistance - 54}px)`;
        ptrBox.style.opacity = Math.min(pullDistance / 45, 1).toString();

        const rot = Math.min((pullDistance / threshold) * 270, 360);
        if (ptrIcon) ptrIcon.style.transform = `rotate(${rot}deg)`;

        if (ptrText) {
          ptrText.textContent = pullDistance >= threshold ? "Qo'yib yuboring (Yangilanadi)" : "Yangilash uchun torting";
        }
      }
    });

    window.addEventListener('mouseup', async (e) => {
      if (!isMouseDown) return;
      isMouseDown = false;
      if (!isPulling || isRefreshing) return;
      isPulling = false;

      const diff = e.clientY - mouseStartY;
      const pullDistance = Math.min(diff * 0.42, 110);

      if (pullDistance >= threshold && isAtTop()) {
        await executeRefresh();
      } else {
        resetPtr();
      }
    });

    async function executeRefresh() {
      isRefreshing = true;
      ptrBox.classList.remove('pulling');
      ptrBox.classList.add('refreshing');
      ptrBox.style.transform = 'translateY(14px)';
      ptrBox.style.opacity = '1';
      if (ptrText) ptrText.textContent = "Ma'lumotlar yangilanmoqda...";

      try {
        if (currentUser && currentUser.username) {
          await loadUserDataFromServer(currentUser.username);
        }
        refreshAllData();
        showToast("Ma'lumotlar muvaffaqiyatli yangilandi", 'success');
      } catch (e) {
        showToast("Yangilashda xatolik yuz berdi", 'warning');
      }

      setTimeout(() => {
        resetPtr();
        isRefreshing = false;
      }, 500);
    }

    function resetPtr() {
      ptrBox.classList.remove('pulling');
      ptrBox.classList.remove('refreshing');
      ptrBox.style.transform = '';
      ptrBox.style.opacity = '';
      if (ptrIcon) ptrIcon.style.transform = '';
      if (ptrText) ptrText.textContent = "Yangilash uchun torting";
    }
  }

  // Bootstrap
  initThemeAndModes();
  initAuth();
  initAutocompletes();
  initPullToRefresh();
});
