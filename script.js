// ===== CONFIG =====
const YEAR = document.getElementById('year');
YEAR.textContent = new Date().getFullYear();

const AVATAR_KEY = 'csAvatar';
const ABOUT_KEY = 'csAbout';
const MATERIALS_KEY = 'csMaterials';
const DESIGN_KEY = 'csDesign';
const PRODUCTS_KEY = 'csProducts';

// WhatsApp number for orders
const WA_NUMBER = '87754921806';
const WA_URL = `https://wa.me/${WA_NUMBER}`;

// ===== HELPERS =====
const money = v => (v || 0).toLocaleString('ru-RU') + ' ₸';

function placeholderSVG(label = 'CS') {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%23F7C9D4'/><stop offset='100%' stop-color='%23F5E9E2'/></linearGradient></defs><rect width='320' height='320' rx='28' fill='url(%23g)'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='72' fill='%23333' opacity='.6'>${label}</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// ===== MOBILE MENU =====
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
mobileMenuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('active');
});
document.querySelectorAll('.mobile-menu a').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('active'));
});

// ===== AVATAR =====
const avatarImg = document.getElementById('avatar');
const setAvatarBtn = document.getElementById('setAvatarBtn');
const avatarFile = document.getElementById('avatarFile');
const heroImg = document.getElementById('heroImg');
const favicon = document.getElementById('favicon');

function loadAvatar() {
  const a = localStorage.getItem(AVATAR_KEY);
  if (a) {
    avatarImg.src = a;
    favicon.href = a;
    heroImg.style.backgroundImage = `url('${a}')`;
  } else {
    avatarImg.src = placeholderSVG();
    heroImg.style.backgroundImage = '';
  }
}

function saveAvatar(data) {
  localStorage.setItem(AVATAR_KEY, data);
  loadAvatar();
}

setAvatarBtn.addEventListener('click', () => avatarFile.click());
avatarFile.addEventListener('change', () => {
  const f = avatarFile.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => saveAvatar(r.result);
  r.readAsDataURL(f);
});
loadAvatar();

// ===== ABOUT =====
const aboutDefault = `Добро пожаловать в Charm Store — уютное пространство в белых, розовых и бежевых оттенках 🤍🌸

Мы создаём нежные украшения вручную и даём вам возможность собрать своё уникальное изделие онлайн ✨

Каждое украшение — это маленькая история, созданная с любовью и вниманием к деталям.`;

const aboutContent = document.getElementById('aboutContent');
const aboutModal = document.getElementById('aboutModal');
const aboutInput = document.getElementById('aboutInput');

document.getElementById('editAboutBtn').addEventListener('click', () => {
  aboutInput.value = localStorage.getItem(ABOUT_KEY) || aboutDefault;
  aboutModal.showModal();
});

document.getElementById('saveAbout').addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.setItem(ABOUT_KEY, aboutInput.value || aboutDefault);
  aboutModal.close();
  renderAbout();
});

function renderAbout() {
  const t = localStorage.getItem(ABOUT_KEY) || aboutDefault;
  aboutContent.innerText = t;
}
renderAbout();

// ===== PRODUCTS CATALOG =====
const productsGrid = document.getElementById('productsGrid');
const emptyState = document.getElementById('emptyState');
const filterBtns = [...document.querySelectorAll('.filter-btn')];
const productModal = document.getElementById('productModal');

function getProducts() {
  try {
    return JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
  } catch (_) {
    return [];
  }
}

function saveProducts(list) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(list));
}

// Seed demo products
(function seed() {
  if (getProducts().length) return;
  saveProducts([
    {
      id: crypto.randomUUID(),
      name: 'Pearl Blossom',
      price: 12000,
      category: 'necklaces',
      desc: 'Натуральный жемчуг, фурнитура под золото.',
      image: placeholderSVG('🌸')
    },
    {
      id: crypto.randomUUID(),
      name: 'Браслет Нежность',
      price: 8500,
      category: 'bracelets',
      desc: 'Керамические бусины, розовые оттенки.',
      image: placeholderSVG('📿')
    }
  ]);
})();

function createProductCard(p) {
  const card = document.createElement('article');
  card.className = 'product-card';
  card.innerHTML = `
    <img class="product-card-img" src="${p.image || placeholderSVG('Фото')}" alt="${p.name}"/>
    <div class="product-card-body">
      <div class="product-card-name">${p.name}</div>
      <div class="product-card-price">${money(p.price)}</div>
      <div class="product-card-desc">${p.desc || ''}</div>
    </div>
    <button class="product-delete" title="Удалить" data-id="${p.id}">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  `;
  card.querySelector('.product-delete').addEventListener('click', (e) => {
    e.stopPropagation();
    if (confirm('Удалить товар?')) {
      const products = getProducts().filter(x => x.id !== p.id);
      saveProducts(products);
      renderCatalog(document.querySelector('.filter-btn.active')?.dataset.filter || 'all');
    }
  });
  return card;
}

function renderCatalog(filter = 'all') {
  const list = getProducts();
  productsGrid.innerHTML = '';
  const shown = list.filter(p => filter === 'all' ? true : p.category === filter);
  
  if (shown.length === 0) {
    emptyState.classList.add('visible');
    productsGrid.style.display = 'none';
  } else {
    emptyState.classList.remove('visible');
    productsGrid.style.display = 'grid';
    shown.forEach(p => productsGrid.appendChild(createProductCard(p)));
  }
}

filterBtns.forEach(b => b.addEventListener('click', () => {
  filterBtns.forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  renderCatalog(b.dataset.filter);
}));

document.getElementById('addProductBtn').addEventListener('click', () => {
  document.getElementById('productName').value = '';
  document.getElementById('productPrice').value = '';
  document.getElementById('productDesc').value = '';
  document.getElementById('productImage').value = '';
  productModal.showModal();
});

document.getElementById('saveProduct').addEventListener('click', async (e) => {
  e.preventDefault();
  const name = document.getElementById('productName').value;
  const price = Number(document.getElementById('productPrice').value) || 0;
  const category = document.getElementById('productCategory').value;
  const desc = document.getElementById('productDesc').value;
  const imageFile = document.getElementById('productImage').files[0];
  
  let image = placeholderSVG('Фото');
  if (imageFile) {
    image = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(imageFile);
    });
  }
  
  const products = getProducts();
  products.push({ id: crypto.randomUUID(), name, price, category, desc, image });
  saveProducts(products);
  productModal.close();
  renderCatalog('all');
  document.querySelector('.filter-btn[data-filter="all"]').click();
});

renderCatalog('all');

// ===== MATERIALS =====
const MATERIALS_BASE = [
  { id: 'pearl-6', name: 'Жемчуг 6мм', color: '#f7f3f0', price: 350, size: 6 },
  { id: 'pearl-8', name: 'Жемчуг 8мм', color: '#f3ede9', price: 450, size: 8 },
  { id: 'pearl-pink', name: 'Жемчуг розовый 6мм', color: '#F7C9D4', price: 400, size: 6 },
  { id: 'pearl-white', name: 'Жемчуг белый 8мм', color: '#ffffff', price: 480, size: 8 },
  { id: 'ceramic-pink', name: 'Керамика розовая 8мм', color: '#F7C9D4', price: 200, size: 8 },
  { id: 'ceramic-beige', name: 'Керамика бежевая 8мм', color: '#F5E9E2', price: 200, size: 8 },
  { id: 'ceramic-white', name: 'Керамика белая 8мм', color: '#ffffff', price: 200, size: 8 },
  { id: 'spacer-gold', name: 'Разделитель золото 4мм', color: '#e1c76d', price: 120, size: 4 },
  { id: 'heart-rose', name: 'Сердце керамика 10мм', color: '#f5c6cf', price: 260, size: 10 },
  { id: 'crystal-clear', name: 'Кристалл прозрачный 6мм', color: '#e6f4ff', price: 280, size: 6 }
];

function getMaterials() {
  try {
    const s = localStorage.getItem(MATERIALS_KEY);
    if (s) return JSON.parse(s);
  } catch (_) {}
  localStorage.setItem(MATERIALS_KEY, JSON.stringify(MATERIALS_BASE));
  return [...MATERIALS_BASE];
}

function saveMaterials(list) {
  localStorage.setItem(MATERIALS_KEY, JSON.stringify(list));
}

const beadsList = document.getElementById('beadsList');
const customBeadModal = document.getElementById('customBeadModal');
const beadColorInput = document.getElementById('beadColor');
const beadColorHex = document.getElementById('beadColorHex');

beadColorInput.addEventListener('input', () => {
  beadColorHex.value = beadColorInput.value;
});
beadColorHex.addEventListener('input', () => {
  beadColorInput.value = beadColorHex.value;
});

function renderMaterials() {
  beadsList.innerHTML = '';
  getMaterials().forEach(m => {
    const btn = document.createElement('button');
    btn.className = 'bead-btn';
    btn.type = 'button';
    btn.innerHTML = `<span class="bead-swatch" style="background:${m.color}"></span>${m.name} • ${money(m.price)}`;
    btn.addEventListener('click', () => addBead(m.id));
    beadsList.appendChild(btn);
  });
}

document.getElementById('addCustomBead').addEventListener('click', () => {
  document.getElementById('beadName').value = '';
  document.getElementById('beadPrice').value = '';
  document.getElementById('beadSize').value = '8';
  beadColorInput.value = '#F7C9D4';
  beadColorHex.value = '#F7C9D4';
  customBeadModal.showModal();
});

document.getElementById('saveCustomBead').addEventListener('click', (e) => {
  e.preventDefault();
  const name = document.getElementById('beadName').value;
  if (!name) return alert('Введите название материала');
  const price = Number(document.getElementById('beadPrice').value) || 0;
  const size = Number(document.getElementById('beadSize').value) || 8;
  const color = beadColorInput.value;
  
  const mats = getMaterials();
  mats.push({ id: 'm-' + crypto.randomUUID().slice(0, 8), name, color, price, size });
  saveMaterials(mats);
  customBeadModal.close();
  renderMaterials();
});

document.getElementById('resetMaterials').addEventListener('click', () => {
  if (confirm('Сбросить список материалов к значениям по умолчанию?')) {
    localStorage.removeItem(MATERIALS_KEY);
    renderMaterials();
  }
});

renderMaterials();

// ===== DESIGN STATE =====
const presets = {
  keychain: { label: 'Брелок', defaultLen: 12 },
  bracelet: { label: 'Браслет', defaultLen: 17 },
  necklace: { label: 'Ожерелье', defaultLen: 40 }
};

let design = (() => {
  try {
    return JSON.parse(localStorage.getItem(DESIGN_KEY) || '{"type":"keychain","len":12,"beads":[]}');
  } catch (_) {
    return { type: 'keychain', len: 12, beads: [] };
  }
})();

const typeRow = document.getElementById('typeRow');
const sizeRow = document.getElementById('sizeRow');
const strand = document.getElementById('strand');
const t_type = document.getElementById('t_type');
const t_length = document.getElementById('t_length');
const t_count = document.getElementById('t_count');
const t_price = document.getElementById('t_price');
const viz = document.getElementById('viz');
const fillBar = document.getElementById('fillBar');
const progressText = document.getElementById('progressText');
const userNote = document.getElementById('userNote');

function saveDesign() {
  localStorage.setItem(DESIGN_KEY, JSON.stringify(design));
}

function setType(t) {
  design.type = t;
  design.len = presets[t]?.defaultLen || design.len;
  saveDesign();
  render();
  highlightChips();
}

function setLen(t, len) {
  design.type = t;
  design.len = len;
  saveDesign();
  render();
  highlightChips();
}

function addBead(id) {
  design.beads.push(id);
  saveDesign();
  render();
}

function moveBead(i, dir) {
  const j = i + dir;
  if (j < 0 || j >= design.beads.length) return;
  [design.beads[i], design.beads[j]] = [design.beads[j], design.beads[i]];
  saveDesign();
  render();
}

function removeBead(i) {
  design.beads.splice(i, 1);
  saveDesign();
  render();
}

typeRow.addEventListener('click', e => {
  const b = e.target.closest('.chip');
  if (!b) return;
  setType(b.dataset.type);
});

sizeRow.addEventListener('click', e => {
  const b = e.target.closest('.chip');
  if (!b) return;
  const [t, l] = b.dataset.size.split(':');
  setLen(t, Number(l));
});

document.getElementById('clearDesign').addEventListener('click', () => {
  if (confirm('Очистить текущий дизайн?')) {
    design.beads = [];
    saveDesign();
    render();
  }
});

// ===== RENDER STRAND =====
function renderStrand() {
  strand.innerHTML = '';
  const mats = getMaterials();
  
  if (design.beads.length === 0) {
    strand.innerHTML = '<span style="color: var(--ink-light); font-size: 13px;">Нажмите на материал, чтобы добавить</span>';
    return;
  }
  
  design.beads.forEach((id, idx) => {
    const m = mats.find(x => x.id === id) || { name: id, color: '#ddd' };
    const item = document.createElement('div');
    item.className = 'strand-item';
    item.innerHTML = `
      <span class="strand-item-color" style="background:${m.color}"></span>
      <span>${m.name}</span>
      <span class="strand-item-actions">
        <button title="Влево">◀</button>
        <button title="Вправо">▶</button>
        <button title="Удалить">✕</button>
      </span>
    `;
    const buttons = item.querySelectorAll('.strand-item-actions button');
    buttons[0].addEventListener('click', () => moveBead(idx, -1));
    buttons[1].addEventListener('click', () => moveBead(idx, +1));
    buttons[2].addEventListener('click', () => removeBead(idx));
    strand.appendChild(item);
  });
}

// ===== SVG VISUALIZER =====
function drawVisualizer() {
  const mats = getMaterials();
  while (viz.firstChild) viz.removeChild(viz.firstChild);

  // Background
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('width', '600');
  bg.setAttribute('height', '300');
  bg.setAttribute('fill', '#faf6f3');
  viz.appendChild(bg);

  if (design.type === 'keychain') {
    // Keychain clip
    const clip = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    clip.setAttribute('transform', 'translate(300,30)');
    
    const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ring.setAttribute('r', '14');
    ring.setAttribute('fill', '#e9d492');
    ring.setAttribute('stroke', '#c9a86d');
    ring.setAttribute('stroke-width', '2');
    
    const hook = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    hook.setAttribute('d', 'M -10 12 Q 0 -8 10 12 L 8 22 Q 0 12 -8 22 Z');
    hook.setAttribute('fill', '#e9d492');
    hook.setAttribute('stroke', '#c9a86d');
    hook.setAttribute('stroke-width', '1.5');
    
    clip.append(hook, ring);
    viz.appendChild(clip);

    // Cord
    const cord = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    cord.setAttribute('x', '298');
    cord.setAttribute('y', '50');
    cord.setAttribute('width', '4');
    cord.setAttribute('height', '200');
    cord.setAttribute('rx', '2');
    cord.setAttribute('fill', '#F7C9D4');
    viz.appendChild(cord);

    // Beads vertical
    let y = 65;
    design.beads.forEach(id => {
      const m = mats.find(x => x.id === id);
      const r = m?.size || 8;
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', '300');
      c.setAttribute('cy', String(y + r));
      c.setAttribute('r', String(r));
      c.setAttribute('fill', m?.color || '#ddd');
      c.setAttribute('stroke', 'rgba(0,0,0,0.1)');
      c.setAttribute('stroke-width', '1');
      viz.appendChild(c);
      y += r * 2 + 4;
    });

    // Loop at bottom
    const loop = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    loop.setAttribute('cx', '300');
    loop.setAttribute('cy', '270');
    loop.setAttribute('rx', '12');
    loop.setAttribute('ry', '15');
    loop.setAttribute('fill', 'none');
    loop.setAttribute('stroke', '#F7C9D4');
    loop.setAttribute('stroke-width', '4');
    viz.appendChild(loop);
  } else {
    // Circular layout for bracelet/necklace
    const centerX = 300, centerY = 150;
    const radius = design.type === 'bracelet' ? 85 : 110;

    // Guide circle
    const guide = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    guide.setAttribute('cx', centerX);
    guide.setAttribute('cy', centerY);
    guide.setAttribute('r', radius);
    guide.setAttribute('fill', 'none');
    guide.setAttribute('stroke', 'rgba(0,0,0,0.06)');
    guide.setAttribute('stroke-dasharray', '6 8');
    viz.appendChild(guide);

    const total = design.beads.length;
    let angle = -90;
    const step = total ? 360 / total : 0;

    design.beads.forEach(id => {
      const m = mats.find(x => x.id === id);
      const r = m?.size || 8;
      const x = centerX + radius * Math.cos(angle * Math.PI / 180);
      const y = centerY + radius * Math.sin(angle * Math.PI / 180);
      
      const bead = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      bead.setAttribute('cx', x);
      bead.setAttribute('cy', y);
      bead.setAttribute('r', r);
      bead.setAttribute('fill', m?.color || '#ddd');
      bead.setAttribute('stroke', 'rgba(0,0,0,0.1)');
      bead.setAttribute('stroke-width', '1');
      viz.appendChild(bead);
      angle += step;
    });

    // Clasp
    const clasp = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    clasp.setAttribute('x', centerX - 12);
    clasp.setAttribute('y', centerY - radius - 8);
    clasp.setAttribute('width', '24');
    clasp.setAttribute('height', '16');
    clasp.setAttribute('rx', '4');
    clasp.setAttribute('fill', '#e9d492');
    clasp.setAttribute('stroke', '#c9a86d');
    viz.appendChild(clasp);
  }
}

// ===== TOTALS & PROGRESS =====
function calcTotals() {
  const mats = getMaterials();
  const price = design.beads.reduce((s, id) => s + (mats.find(x => x.id === id)?.price || 0), 0);
  const mm = design.beads.reduce((s, id) => s + (mats.find(x => x.id === id)?.size || 0), 0);
  const cmApprox = (mm / 10).toFixed(1);
  return { price, mm, cmApprox };
}

function renderTotals() {
  const { price, mm, cmApprox } = calcTotals();
  t_type.textContent = presets[design.type]?.label || design.type;
  t_length.textContent = `${design.len} см`;
  t_count.textContent = String(design.beads.length);
  t_price.textContent = money(price);
  
  const target = design.len * 10;
  const percent = Math.min(100, (mm / target) * 100);
  fillBar.style.width = percent + '%';
  progressText.textContent = `${percent.toFixed(0)}% заполнено (≈${cmApprox} см)`;
}

function highlightChips() {
  [...typeRow.querySelectorAll('.chip')].forEach(c => c.classList.toggle('active', c.dataset.type === design.type));
  [...sizeRow.querySelectorAll('.chip')].forEach(c => {
    const [t, l] = c.dataset.size.split(':');
    c.classList.toggle('active', t === design.type && Number(l) === Number(design.len));
  });
}

function render() {
  renderStrand();
  drawVisualizer();
  renderTotals();
}

highlightChips();
render();

// ===== SAVE DESIGN TO FILE =====
document.getElementById('addDesignToCart').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(design, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'charm-design.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
});

// ===== WHATSAPP ORDER =====
document.getElementById('orderWA').addEventListener('click', () => {
  if (design.beads.length === 0) {
    alert('Добавьте материалы в дизайн');
    return;
  }
  
  const mats = getMaterials();
  const { price, cmApprox } = calcTotals();
  const label = presets[design.type]?.label || design.type;
  
  // Count beads
  const counts = {};
  design.beads.forEach(id => counts[id] = (counts[id] || 0) + 1);
  
  const lines = Object.entries(counts).map(([id, c]) => {
    const n = mats.find(m => m.id === id)?.name || id;
    return `• ${n} × ${c}`;
  }).join('\n');
  
  const message = `Здравствуйте! Хочу заказать кастомное изделие.

Тип: ${label}
Длина: ${design.len} см (≈${cmApprox} см собрано)

Состав:
${lines}

Итого: ${money(price)}

Комментарий: ${userNote.value || 'нет'}`;
  
  const encodedMessage = encodeURIComponent(message);
  window.open(`${WA_URL}?text=${encodedMessage}`, '_blank');
});
