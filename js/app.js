// OpenAI Book Recommender – front-end logic.
// Live mode: asks our Node server (/api/books), which talks to OpenAI.
// Demo mode: picks books from window.DEMO_BOOKS right in the browser (GitHub Pages).

const GENRE_NAMES = {
  classics: 'Classics',
  'science-fiction': 'Science fiction',
  fantasy: 'Fantasy',
  mystery: 'Mystery & crime',
  'non-fiction': 'Non-fiction',
};

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const els = {
  form: document.getElementById('picker'),
  genre: document.getElementById('genre'),
  count: document.getElementById('count'),
  button: document.getElementById('recommend-btn'),
  grid: document.getElementById('book-grid'),
  status: document.getElementById('status'),
  badge: document.getElementById('mode-badge'),
  template: document.getElementById('book-template'),
  themeToggle: document.getElementById('theme-toggle'),
  statCount: document.getElementById('stat-count'),
  statOldest: document.getElementById('stat-oldest'),
  statNewest: document.getElementById('stat-newest'),
};

let liveMode = false;

/* ---------- Theme ---------- */

function currentTheme() {
  const forced = document.documentElement.dataset.theme;
  if (forced) return forced;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function updateThemeButton() {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  els.themeToggle.setAttribute('aria-label', `Switch to ${next} theme`);
}

els.themeToggle.addEventListener('click', () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem('theme', next);
  } catch (error) {
    // Storage blocked – the choice simply is not remembered.
  }
  updateThemeButton();
});

updateThemeButton();

/* ---------- Ripple effect on buttons ---------- */

document.addEventListener('pointerdown', (event) => {
  const button = event.target.closest('.btn, .theme-toggle');
  if (!button || reduceMotion.matches) return;

  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
  button.append(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
});

/* ---------- Reveal on scroll ---------- */

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

function observeReveals(root = document) {
  root.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => revealObserver.observe(el));
}

/* ---------- Count-up numbers ---------- */

function countUp(el, target) {
  const from = Number(el.dataset.count) || 0;
  el.dataset.count = String(target);

  if (reduceMotion.matches || from === target) {
    el.textContent = String(target);
    return;
  }

  const duration = 900;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    el.textContent = String(Math.round(from + (target - from) * eased));
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function updateStats(books) {
  const years = books.map((book) => book.year).filter(Number.isInteger);
  countUp(els.statCount, books.length);
  countUp(els.statOldest, years.length ? Math.min(...years) : 0);
  countUp(els.statNewest, years.length ? Math.max(...years) : 0);
}

/* ---------- Getting books ---------- */

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function demoBooks(genre, count) {
  const shelves = window.DEMO_BOOKS;
  const pool = genre === 'any'
    ? Object.entries(shelves).flatMap(([key, books]) => books.map((book) => ({ ...book, genre: key })))
    : shelves[genre].map((book) => ({ ...book, genre }));
  return shuffle(pool).slice(0, count);
}

async function liveBooks(genre, count) {
  const params = new URLSearchParams({ genre, count: String(count) });
  const response = await fetch(`api/books?${params}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data.books.map((book) => ({ ...book, genre }));
}

/* ---------- Rendering ---------- */

function renderSkeleton(count) {
  els.grid.replaceChildren();
  for (let i = 0; i < count; i += 1) {
    const card = document.createElement('div');
    card.className = 'book book--loading';
    els.grid.append(card);
  }
}

function renderBooks(books) {
  const cards = books.map((book, index) => {
    const card = els.template.content.firstElementChild.cloneNode(true);
    card.style.setProperty('--i', index);
    card.dataset.spine = String(index % 4);
    card.querySelector('.book__genre').textContent = GENRE_NAMES[book.genre] || 'Any genre';
    card.querySelector('.book__title').textContent = book.title;
    card.querySelector('.book__author').textContent = `by ${book.author}`;
    card.querySelector('.book__why').textContent = book.why;
    card.querySelector('.book__year').textContent = book.year ? String(book.year) : '';
    return card;
  });
  els.grid.replaceChildren(...cards);
  observeReveals(els.grid);
  updateStats(books);
}

function setStatus(message) {
  els.status.textContent = message;
}

async function recommend() {
  const genre = els.genre.value;
  const count = Number(els.count.value);

  els.button.disabled = true;
  els.grid.setAttribute('aria-busy', 'true');
  renderSkeleton(count);
  setStatus(liveMode ? 'Asking the AI librarian…' : 'Pulling books off the demo shelf…');

  try {
    let books;
    if (liveMode) {
      try {
        books = await liveBooks(genre, count);
        setStatus(`${books.length} fresh picks from OpenAI.`);
      } catch (error) {
        books = demoBooks(genre, count);
        setStatus(`The AI is not available (${error.message}). Showing demo picks instead.`);
      }
    } else {
      // A tiny pause so the loading animation is visible, like a real request.
      await new Promise((resolve) => setTimeout(resolve, reduceMotion.matches ? 0 : 450));
      books = demoBooks(genre, count);
      setStatus(`${books.length} picks from the demo shelf. Press the button again for new ones.`);
    }
    renderBooks(books);
  } finally {
    els.button.disabled = false;
    els.grid.removeAttribute('aria-busy');
  }
}

els.form.addEventListener('submit', (event) => {
  event.preventDefault();
  recommend();
});

/* ---------- Start ---------- */

async function detectMode() {
  const staticHost = location.hostname.endsWith('github.io') || location.protocol === 'file:';
  if (staticHost) return false;
  try {
    const response = await fetch('api/health');
    if (!response.ok) return false;
    const data = await response.json();
    return data.ai === true;
  } catch (error) {
    return false;
  }
}

async function start() {
  observeReveals();
  liveMode = await detectMode();
  els.badge.textContent = liveMode ? 'Live · OpenAI' : 'Demo mode';
  els.badge.dataset.mode = liveMode ? 'live' : 'demo';

  if (liveMode) {
    setStatus('Pick a genre and press “Recommend books”.');
  } else {
    // Demo mode costs nothing, so fill the shelf right away.
    recommend();
  }
}

start();
