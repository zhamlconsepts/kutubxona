/**
 * SmartAutocomplete - YouTube uslubidagi ixcham qidiruv va avtomatik taklif tizimi
 * Kiritilayotganda eng yaqin kelganlarini nozik, ixcham (saytni yopib qo'ymaydigan) ko'rinishda chiqaradi.
 * Stikersiz, sof va professional.
 */

class SmartAutocomplete {
  constructor(options) {
    this.input = options.input;
    this.getItems = options.getItems; // elementlarni dinamik olish funksiyasi: () => string[] yoki { text, subtext }[]
    this.onSelect = options.onSelect || null;
    this.maxSuggestions = options.maxSuggestions || 5;

    this.dropdown = null;
    this.selectedIndex = -1;
    this.currentMatches = [];

    this.init();
  }

  init() {
    if (!this.input) return;

    this.createDropdown();

    this.input.addEventListener('input', () => this.handleInput());
    this.input.addEventListener('focus', () => this.handleInput());
    this.input.addEventListener('keydown', (e) => this.handleKeydown(e));

    document.addEventListener('click', (e) => {
      if (!this.input.contains(e.target) && !this.dropdown.contains(e.target)) {
        this.hideDropdown();
      }
    });
  }

  createDropdown() {
    this.dropdown = document.createElement('div');
    this.dropdown.className = 'yt-compact-autocomplete';
    this.dropdown.setAttribute('role', 'listbox');
    this.dropdown.style.display = 'none';

    const parent = this.input.parentElement;
    if (parent) {
      if (getComputedStyle(parent).position === 'static') {
        parent.style.position = 'relative';
      }
      parent.appendChild(this.dropdown);
    }
  }

  handleInput() {
    const query = this.input.value.trim().toLowerCase();
    this.search(query);
  }

  search(query) {
    if (!this.getItems) return;
    const allItems = this.getItems() || [];

    if (!query) {
      this.hideDropdown();
      return;
    }

    // O'zbekcha harflarni normalizatsiya qilish
    const clean = (str) => str.toLowerCase().replace(/[`ʻʼ']/g, "'");
    const cleanQuery = clean(query);

    const startsWith = [];
    const contains = [];

    allItems.forEach(item => {
      const text = typeof item === 'string' ? item : item.text;
      const cleanText = clean(text);

      if (cleanText === cleanQuery) {
        // aynan o'zi bo'lsa ham ko'rsatish
        startsWith.unshift(item);
      } else if (cleanText.startsWith(cleanQuery)) {
        startsWith.push(item);
      } else if (cleanText.includes(cleanQuery)) {
        contains.push(item);
      }
    });

    const matches = [...startsWith, ...contains].slice(0, this.maxSuggestions);
    this.currentMatches = matches;
    this.selectedIndex = -1;

    if (matches.length === 0) {
      this.hideDropdown();
      return;
    }

    this.renderSuggestions(matches, query);
  }

  renderSuggestions(matches, query) {
    this.dropdown.innerHTML = '';

    matches.forEach((item, index) => {
      const text = typeof item === 'string' ? item : item.text;
      const subtext = typeof item === 'object' && item.subtext ? item.subtext : '';

      const itemEl = document.createElement('div');
      itemEl.className = 'yt-compact-item';
      itemEl.setAttribute('role', 'option');
      itemEl.dataset.index = index;

      const highlighted = this.highlightMatch(text, query);

      itemEl.innerHTML = `
        <div class="yt-item-left">
          <svg class="yt-search-svg" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <span class="yt-item-title">${highlighted}</span>
        </div>
        ${subtext ? `<span class="yt-item-subtext">${escapeHtml(subtext)}</span>` : ''}
      `;

      itemEl.addEventListener('mouseenter', () => this.highlightIndex(index));
      itemEl.addEventListener('mousedown', (e) => e.preventDefault());

      itemEl.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.selectItem(item);
      });

      this.dropdown.appendChild(itemEl);
    });

    this.showDropdown();
  }

  selectItem(item) {
    const text = typeof item === 'string' ? item : item.text;
    this.input.value = text;
    this.hideDropdown();

    this.input.dispatchEvent(new Event('input', { bubbles: true }));
    this.input.dispatchEvent(new Event('change', { bubbles: true }));

    if (this.onSelect) {
      this.onSelect(item);
    }
  }

  highlightMatch(text, query) {
    if (!query) return escapeHtml(text);
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return escapeHtml(text).replace(regex, '<strong>$1</strong>');
  }

  handleKeydown(e) {
    if (this.dropdown.style.display === 'none') {
      if (e.key === 'ArrowDown') {
        this.handleInput();
        e.preventDefault();
      }
      return;
    }

    const items = this.dropdown.querySelectorAll('.yt-compact-item');

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.selectedIndex = (this.selectedIndex + 1) % items.length;
      this.updateSelection(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.selectedIndex = (this.selectedIndex - 1 + items.length) % items.length;
      this.updateSelection(items);
    } else if (e.key === 'Enter') {
      if (this.selectedIndex >= 0 && this.currentMatches[this.selectedIndex]) {
        e.preventDefault();
        this.selectItem(this.currentMatches[this.selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      this.hideDropdown();
    }
  }

  updateSelection(items) {
    items.forEach((item, idx) => {
      item.classList.toggle('selected', idx === this.selectedIndex);
      if (idx === this.selectedIndex) item.scrollIntoView({ block: 'nearest' });
    });
  }

  highlightIndex(idx) {
    this.selectedIndex = idx;
    const items = this.dropdown.querySelectorAll('.yt-compact-item');
    items.forEach((item, i) => item.classList.toggle('selected', i === idx));
  }

  showDropdown() {
    this.dropdown.style.display = 'block';
  }

  hideDropdown() {
    this.dropdown.style.display = 'none';
    this.selectedIndex = -1;
  }
}

function escapeHtml(string) {
  if (!string) return '';
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.SmartAutocomplete = SmartAutocomplete;
