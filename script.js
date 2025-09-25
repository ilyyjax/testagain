// Jobs.fun — enhanced site script
// Features: data-driven job grid, search, categories, favorites (localStorage), dark mode, animations

const JOBS_KEY = 'jobsfun:favorites';

// job dataset (20 jobs). Each job has id, name, category, url, dateAdded (ISO)
const JOBS = [
  { id: 'mcd', name: "McDonald's", category: 'Food', url: 'https://careers.mcdonalds.com/', dateAdded: '2025-09-10' },
  { id: 'starb', name: 'Starbucks', category: 'Food', url: 'https://careers.starbucks.com/', dateAdded: '2025-09-12' },
  { id: 'walmart', name: 'Walmart', category: 'Retail', url: 'https://careers.walmart.com/', dateAdded: '2025-09-04' },
  { id: 'target', name: 'Target', category: 'Retail', url: 'https://www.target.com/careers', dateAdded: '2025-09-02' },
  { id: 'homedepot', name: 'Home Depot', category: 'Retail', url: 'https://careers.homedepot.com/', dateAdded: '2025-09-14' },
  { id: 'lowes', name: "Lowe's", category: 'Retail', url: 'https://jobs.lowes.com/', dateAdded: '2025-09-01' },
  { id: 'chick', name: "Chick-fil-A", category: 'Food', url: 'https://careers-chickfila.icims.com/jobs/intro', dateAdded: '2025-09-20' },
  { id: 'apple', name: 'Apple', category: 'Tech', url: 'https://jobs.apple.com/', dateAdded: '2025-08-28' },
  { id: 'msoft', name: 'Microsoft', category: 'Tech', url: 'https://careers.microsoft.com/', dateAdded: '2025-09-05' },
  { id: 'amazon', name: 'Amazon', category: 'Tech', url: 'https://www.amazon.jobs/', dateAdded: '2025-09-16' },
  { id: 'google', name: 'Google', category: 'Tech', url: 'https://careers.google.com/', dateAdded: '2025-08-24' },
  { id: 'netflix', name: 'Netflix', category: 'Entertainment', url: 'https://jobs.netflix.com/', dateAdded: '2025-09-03' },
  { id: 'tesla', name: 'Tesla', category: 'Automotive', url: 'https://www.tesla.com/careers', dateAdded: '2025-09-07' },
  { id: 'cvs', name: 'CVS', category: 'Healthcare', url: 'https://jobs.cvshealth.com/', dateAdded: '2025-09-11' },
  { id: 'walgreens', name: 'Walgreens', category: 'Healthcare', url: 'https://jobs.walgreens.com/', dateAdded: '2025-09-08' },
  { id: 'costco', name: 'Costco', category: 'Retail', url: 'https://www.costco.com/careers.html', dateAdded: '2025-09-09' },
  { id: 'ups', name: 'UPS', category: 'Logistics', url: 'https://www.jobs-ups.com/us/en/', dateAdded: '2025-09-06' },
  { id: 'fedex', name: 'FedEx', category: 'Logistics', url: 'https://careers.fedex.com/', dateAdded: '2025-09-13' },
  { id: 'nike', name: 'Nike', category: 'Sportswear', url: 'https://jobs.nike.com/', dateAdded: '2025-09-15' },
  { id: 'adidas', name: 'Adidas', category: 'Sportswear', url: 'https://careers.adidas-group.com/', dateAdded: '2025-09-17' }
];

// mapping: category -> sprite icon id
const ICON_MAP = {
  'Food': 'icon-burger',
  'Retail': 'icon-cart',
  'Tech': 'icon-laptop',
  'Logistics': 'icon-truck',
  'Healthcare': 'icon-pill',
  'Entertainment': 'icon-play',
  'Sportswear': 'icon-shoe',
  'Automotive': 'icon-car',
  'default': 'icon-briefcase'
};

// helpers
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const daysBetween = (d1, d2) => Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
const isNew = (isoDate, days=14) => {
  try {
    const then = new Date(isoDate);
    return daysBetween(then, new Date()) <= days;
  } catch { return false; }
};

function loadFavorites(){
  try {
    const raw = localStorage.getItem(JOBS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
function saveFavorites(list){
  localStorage.setItem(JOBS_KEY, JSON.stringify(list));
}

// render grid
function renderGrid({search='', category='all', favorites=[]} = {}){
  const grid = $('#grid');
  grid.innerHTML = '';
  const query = search.trim().toLowerCase();

  // filter jobs
  const filtered = JOBS.filter(j => {
    if (category !== 'all' && j.category !== category) return false;
    if (!query) return true;
    return j.name.toLowerCase().includes(query) || j.category.toLowerCase().includes(query);
  });

  // update job count
  $('#jobCount').textContent = `${filtered.length} job${filtered.length === 1 ? '' : 's'}`;

  // create cards
  filtered.forEach((job, i) => {
    const a = document.createElement('a');
    a.className = 'card';
    a.href = job.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('data-id', job.id);
    // accessible label
    a.setAttribute('aria-label', `${job.name} - open application in new tab`);
    // stagger animation delay
    a.style.animationDelay = `${i * 60}ms`;

    // new badge if within threshold
    if (isNew(job.dateAdded, 14)) {
      const nb = document.createElement('div');
      nb.className = 'new-badge';
      nb.textContent = 'NEW';
      a.appendChild(nb);
    }

    // favorite button
    const favBtn = document.createElement('button');
    favBtn.className = 'favorite';
    favBtn.type = 'button';
    favBtn.title = 'Save for later';
    const star = document.createElementNS('http://www.w3.org/2000/svg','svg');
    star.setAttribute('class','icon');
    star.setAttribute('width','18');
    star.setAttribute('height','18');
    star.innerHTML = '<use href="#icon-star"></use>';
    favBtn.appendChild(star);
    a.appendChild(favBtn);

    // icon
    const wrap = document.createElement('div');
    wrap.className = 'icon-wrap';
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('class','icon');
    svg.setAttribute('width','30');
    svg.setAttribute('height','30');
    const iconId = ICON_MAP[job.category] || ICON_MAP['default'];
    svg.innerHTML = `<use href="#${iconId}"></use>`;
    wrap.appendChild(svg);
    a.appendChild(wrap);

    // title/meta
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = job.name;
    a.appendChild(title);
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = job.category;
    a.appendChild(meta);

    // favorite state
    const favs = favorites || loadFavorites();
    if (favs.includes(job.id)) favBtn.classList.add('active');

    // favorite click (prevent anchor immediate navigation)
    favBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const id = job.id;
      let favs = loadFavorites();
      if (favs.includes(id)) favs = favs.filter(x => x !== id);
      else favs.push(id);
      saveFavorites(favs);
      favBtn.classList.toggle('active');
      // small feedback
      favBtn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 250 });
    });

    // pointerdown pop
    a.addEventListener('pointerdown', () => {
      a.classList.add('pop');
      setTimeout(()=>a.classList.remove('pop'), 420);
    });

    // keyboard accessibility: Enter triggers click (anchor does by default)
    grid.appendChild(a);
  });

  // if nothing found
  if (filtered.length === 0) {
    const empt = document.createElement('div');
    empt.style.textAlign = 'center';
    empt.style.padding = '28px';
    empt.style.color = 'var(--muted)';
    empt.textContent = 'No jobs match your search. Try another keyword or category.';
    grid.appendChild(empt);
  }
}

// wiring UI
document.addEventListener('DOMContentLoaded', () => {
  // set year
  document.getElementById('year').textContent = new Date().getFullYear();

  // initial state
  let state = {
    search: '',
    category: 'all',
    favorites: loadFavorites()
  };

  // initial render
  renderGrid(state);

  // search input
  const searchInput = document.getElementById('searchInput');
  let searchTimer = null;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.search = e.target.value;
      renderGrid(state);
    }, 180); // debounce
  });
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { searchInput.value = ''; state.search = ''; renderGrid(state); }
  });

  // tabs
  $$('.tab').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      $$('.tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      state.category = btn.dataset.cat;
      renderGrid(state);
    });
  });

  // dark mode toggle
  const darkToggle = document.getElementById('darkToggle');
  // apply saved preference
  const savedDark = localStorage.getItem('jobsfun:dark') === '1';
  if (savedDark) document.body.classList.add('dark');
  darkToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('jobsfun:dark', isDark ? '1' : '0');
    // subtle button feedback
    darkToggle.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(15deg)' }, { transform: 'rotate(0deg)' }], { duration: 260 });
  });

  // keyboard: focus search on "/" press
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      searchInput.focus();
    }
  });

  // clicking on any anchor card opens link in new tab (native behavior)
  // but we want to track favorites being saved. favorites already handled.

  // update favorites UI if user toggles in another tab
  window.addEventListener('storage', (e) => {
    if (e.key === JOBS_KEY) {
      state.favorites = loadFavorites();
      renderGrid(state);
    }
  });

  // initial focus
  // searchInput.focus(); // optional: uncomment if you want immediate focus
});
