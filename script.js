/* ──────────────────────────────────────────
   CATEGORIES DATA
────────────────────────────────────────────*/
const CATEGORIES = [
  {
    id: 'Animals', label: 'Animals', icon: '🐾',
    items: [
      { emoji: '🐶', name: 'Dog'   },
      { emoji: '🐱', name: 'Cat'   },
      { emoji: '🐸', name: 'Frog'    },
      { emoji: '🐯', name: 'Tiger'  },
      { emoji: '🦊', name: 'Fox'    },
      { emoji: '🐻', name: 'Bear'  },
      { emoji: '🦁', name: 'Lion'    },
      { emoji: '🐼', name: 'Panda'    }
    ]
  },
  {
    id: 'buah', label: 'Buah', icon: '🍎',
    items: [
      { emoji: '🍎', name: 'Apel'      },
      { emoji: '🍌', name: 'Pisang'    },
      { emoji: '🍇', name: 'Anggur'    },
      { emoji: '🍓', name: 'Stroberi'  },
      { emoji: '🍊', name: 'Jeruk'     },
      { emoji: '🍋', name: 'Lemon'     },
      { emoji: '🍑', name: 'Persik'    },
      { emoji: '🍉', name: 'Semangka'  }
    ]
  },
  {
    id: 'sayur', label: 'Sayuran', icon: '🥦',
    items: [
      { emoji: '🥦', name: 'Brokoli'   },
      { emoji: '🥕', name: 'Wortel'    },
      { emoji: '🌽', name: 'Jagung'    },
      { emoji: '🥒', name: 'Mentimun'  },
      { emoji: '🍆', name: 'Terong'    },
      { emoji: '🥬', name: 'Kangkung'  },
      { emoji: '🧅', name: 'Bawang'    },
      { emoji: '🍄', name: 'Jamur'     }
    ]
  },
  {
    id: 'negara', label: 'Negara', icon: '🌏',
    items: [
      { emoji: '🇮🇩', name: 'Indonesia' },
      { emoji: '🇯🇵', name: 'Jepang'    },
      { emoji: '🇺🇸', name: 'Amerika'   },
      { emoji: '🇫🇷', name: 'Prancis'   },
      { emoji: '🇧🇷', name: 'Brasil'    },
      { emoji: '🇮🇳', name: 'India'     },
      { emoji: '🇰🇷', name: 'Korea'     },
      { emoji: '🇬🇧', name: 'Inggris'   }
    ]
  },
  {
    id: 'planet', label: 'Planet', icon: '🪐',
    items: [
      { emoji: '🌍', name: 'Bumi'      },
      { emoji: '🔴', name: 'Mars'      },
      { emoji: '🪐', name: 'Saturnus'  },
      { emoji: '🔵', name: 'Neptunus'  },
      { emoji: '⚪', name: 'Bulan'     },
      { emoji: '☀️', name: 'Matahari'  },
      { emoji: '🟡', name: 'Venus'     },
      { emoji: '⚫', name: 'Merkurius' }
    ]
  },
  {
    id: 'olahraga', label: 'Olahraga', icon: '⚽',
    items: [
      { emoji: '⚽', name: 'Sepak Bola'   },
      { emoji: '🏀', name: 'Basket'       },
      { emoji: '🎾', name: 'Tenis'        },
      { emoji: '🏊', name: 'Renang'       },
      { emoji: '🏋️', name: 'Angkat Besi' },
      { emoji: '🏸', name: 'Bulutangkis'  },
      { emoji: '🥊', name: 'Tinju'        },
      { emoji: '🏓', name: 'Ping Pong'    }
    ]
  }
];

/* ──────────────────────────────────────────
   GAME STATE
────────────────────────────────────────────*/
let currentMode   = 'match';
let currentCatId  = 'Animals';

// Match state
let cards         = [];
let flipped       = [];
let matched       = new Set();
let lock          = false;

// Shared stats
let score         = 0;
let trial         = 0;
let comboCount    = 1;
let seconds       = 0;
let timerInterval = null;
let gameStarted   = false;

// Jigsaw state
let jigsawPieces    = [];   // [{id, row, col, dataURL, placed}]
let jigsawCols      = 3;
let jigsawRows      = 3;
let jigsawPlaced    = 0;
let jigsawTotal     = 0;
let draggedPieceId  = null; // id of currently dragged piece
let jigsawEmoji     = '';
let jigsawEmojiName = '';
let jigsawPieceSize = 110;

/* ──────────────────────────────────────────
   INIT
────────────────────────────────────────────*/
document.addEventListener('DOMContentLoaded', () => {
  buildCategoryBar();
  buildMatchGrid();
});

/* ══════════════════════════════════════════
   CATEGORY BAR
   ══════════════════════════════════════════ */
function buildCategoryBar() {
  const bar = document.getElementById('cat-bar');
  bar.innerHTML = '<span class="cat-label">Pilih Kategori</span>';
  CATEGORIES.forEach(cat => {
    const chip = document.createElement('button');
    chip.className = 'cat-chip' + (cat.id === currentCatId ? ' active' : '');
    chip.innerHTML = `<span class="chip-icon">${cat.icon}</span> ${cat.label}`;
    chip.addEventListener('click', () => selectCategory(cat.id));
    bar.appendChild(chip);
  });
}

function selectCategory(id) {
  if (id === currentCatId) return;
  currentCatId = id;
  document.querySelectorAll('.cat-chip').forEach((chip, i) => {
    chip.classList.toggle('active', CATEGORIES[i].id === id);
  });
  stopTimer();
  resetStats();
  if (currentMode === 'match') buildMatchGrid();
  else buildJigsawGame();
}

/* ══════════════════════════════════════════
   MODE SWITCHING
   ══════════════════════════════════════════ */
function switchMode(mode) {
  currentMode = mode;

  document.getElementById('btn-match').className =
    'mode-pill' + (mode === 'match' ? ' active-match' : '');
  document.getElementById('btn-jigsaw').className =
    'mode-pill' + (mode === 'jigsaw' ? ' active-jigsaw' : '');

  const matchGrid  = document.getElementById('match-grid');
  const catBar     = document.getElementById('cat-bar');
  const jigsawView = document.getElementById('jigsaw-view');

  matchGrid.style.display = mode === 'match' ? 'grid' : 'none';
  catBar.style.display    = mode === 'match' ? 'flex' : 'none';
  jigsawView.classList.toggle('visible', mode === 'jigsaw');

  stopTimer();
  resetStats();

  if (mode === 'jigsaw') buildJigsawGame();
  else buildMatchGrid();
}

/* ══════════════════════════════════════════
   MATCH GAME
   ══════════════════════════════════════════ */
function buildMatchGrid() {
  const cat   = getCategoryById(currentCatId);
  const items = cat.items.slice(0, 8);
  const pairs = [...items, ...items];
  shuffle(pairs);

  cards   = pairs;
  flipped = [];
  matched = new Set();
  lock    = false;

  const grid = document.getElementById('match-grid');
  grid.innerHTML     = '';
  grid.style.display = 'grid';
  document.getElementById('hint-text').textContent = 'Klik kartu untuk memulai!';

  pairs.forEach((item, idx) => grid.appendChild(createMatchCard(item, idx)));
}

function createMatchCard(item, idx) {
  const card = document.createElement('div');
  card.className   = 'match-card';
  card.dataset.idx = idx;
  card.innerHTML   = `
    <div class="match-card-inner">
      <div class="card-face card-front">?</div>
      <div class="card-face card-back">
        <span>${item.emoji}</span>
        <span class="card-text">${item.name}</span>
      </div>
    </div>`;
  card.addEventListener('click', () => flipCard(idx));
  return card;
}

function flipCard(idx) {
  if (lock || matched.has(idx) || flipped.includes(idx)) return;
  if (!gameStarted) {
    gameStarted = true;
    startTimer();
    document.getElementById('hint-text').textContent = 'Temukan pasangan yang cocok!';
  }
  const cardEls = document.querySelectorAll('.match-card');
  cardEls[idx].classList.add('flipped');
  flipped.push(idx);

  if (flipped.length === 2) {
    lock = true;
    trial++;
    updateStat('trial', trial);
    const [a, b] = flipped;
    if (cards[a].name === cards[b].name) handleMatch(cardEls, a, b);
    else handleMismatch(cardEls, a, b);
  }
}

function handleMatch(cardEls, a, b) {
  score += 10 * comboCount;
  comboCount++;
  updateStat('score', score);
  updateStat('combo', 'x' + comboCount);
  setTimeout(() => {
    cardEls[a].classList.add('matched');
    cardEls[b].classList.add('matched');
    matched.add(a); matched.add(b);
    flipped = []; lock = false;
    if (matched.size === cards.length) setTimeout(winGame, 400);
  }, 400);
}

function handleMismatch(cardEls, a, b) {
  comboCount = 1;
  updateStat('combo', 'x1');
  setTimeout(() => {
    cardEls[a].classList.remove('flipped');
    cardEls[b].classList.remove('flipped');
    flipped = []; lock = false;
  }, 900);
}

/* ══════════════════════════════════════════
   JIGSAW PUZZLE GAME
   ══════════════════════════════════════════ */

/**
 * Entry point: pick a random emoji from current category,
 * reset state, then render the UI.
 */
function buildJigsawGame() {
  const cat = getCategoryById(currentCatId);
  const item = cat.items[Math.floor(Math.random() * cat.items.length)];
  jigsawEmoji     = item.emoji;
  jigsawEmojiName = item.name;

  jigsawTotal  = jigsawCols * jigsawRows;
  jigsawPlaced = 0;
  jigsawPieces = [];
  draggedPieceId = null;

  document.getElementById('hint-text').textContent =
    `Susun puzzle "${jigsawEmojiName}" — seret potongan ke papan!`;

  renderJigsawUI();
}

/**
 * Build a full-size SVG blob of the emoji, load it into an Image,
 * then slice the rendered pixels into piece dataURLs.
 * Using SVG+Image ensures emoji render fully before slicing.
 */
function renderJigsawUI() {
  const PS = jigsawPieceSize;           // piece size in px
  const TW = PS * jigsawCols;
  const TH = PS * jigsawRows;

  // Escape emoji for safe SVG embedding
  const safeEmoji = jigsawEmoji
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${TW}" height="${TH}">
    <defs>
      <radialGradient id="bg" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stop-color="#3d2abf"/>
        <stop offset="100%" stop-color="#1a1060"/>
      </radialGradient>
    </defs>
    <rect width="${TW}" height="${TH}" fill="url(#bg)"/>
    <text x="${TW/2}" y="${TH/2}"
      font-size="${Math.floor(TW * 0.65)}"
      font-family="Segoe UI Emoji,Apple Color Emoji,Noto Color Emoji,serif"
      text-anchor="middle" dominant-baseline="central">${safeEmoji}</text>
  </svg>`;

  const blob   = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const objURL = URL.createObjectURL(blob);
  const img    = new Image();

  // Build loading indicator
  const view = document.getElementById('jigsaw-view');
  view.innerHTML = '<div class="jig-loading">⏳ Memuat puzzle...</div>';

  img.onload = () => {
    URL.revokeObjectURL(objURL);

    // ── Master canvas ──
    const master   = document.createElement('canvas');
    master.width   = TW;
    master.height  = TH;
    const mctx     = master.getContext('2d');
    mctx.drawImage(img, 0, 0, TW, TH);

    // ── Preview thumbnail dataURL ──
    const thumbC  = document.createElement('canvas');
    thumbC.width  = 90;
    thumbC.height = 90;
    thumbC.getContext('2d').drawImage(master, 0, 0, 90, 90);
    const thumbURL = thumbC.toDataURL();

    // ── Slice pieces → store as dataURL (not canvas element!) ──
    jigsawPieces = [];
    for (let r = 0; r < jigsawRows; r++) {
      for (let c = 0; c < jigsawCols; c++) {
        const pc   = document.createElement('canvas');
        pc.width   = PS;
        pc.height  = PS;
        const pctx = pc.getContext('2d');

        // Rounded clip mask
        pctx.beginPath();
        roundRect(pctx, 2, 2, PS - 4, PS - 4, 10);
        pctx.clip();

        // Copy region from master
        pctx.drawImage(master, c * PS, r * PS, PS, PS, 0, 0, PS, PS);

        // ★ FIX: toDataURL() snapshots the pixels into a reusable string
        jigsawPieces.push({
          id:      r * jigsawCols + c,
          row:     r,
          col:     c,
          dataURL: pc.toDataURL('image/png'),
          placed:  false
        });
      }
    }

    // ── Now build the full DOM ──
    buildJigsawDOM(thumbURL, TW, TH, PS);
  };

  img.onerror = () => {
    URL.revokeObjectURL(objURL);
    // Fallback: draw with canvas text API directly
    renderJigsawFallback(TW, TH, PS);
  };

  img.src = objURL;
}

/**
 * Fallback renderer using canvas fillText directly.
 * Used when SVG blob loading fails (e.g. some browser restrictions).
 */
function renderJigsawFallback(TW, TH, PS) {
  const master  = document.createElement('canvas');
  master.width  = TW;
  master.height = TH;
  const ctx     = master.getContext('2d');

  // Background
  const grad = ctx.createRadialGradient(TW/2, TH/2, 10, TW/2, TH/2, TW*0.7);
  grad.addColorStop(0, '#3d2abf');
  grad.addColorStop(1, '#1a1060');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, TW, TH);

  // Emoji text
  ctx.font         = `${Math.floor(TW * 0.65)}px serif`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(jigsawEmoji, TW / 2, TH / 2);

  // Thumbnail
  const thumbC = document.createElement('canvas');
  thumbC.width = thumbC.height = 90;
  thumbC.getContext('2d').drawImage(master, 0, 0, 90, 90);
  const thumbURL = thumbC.toDataURL();

  // Slice
  jigsawPieces = [];
  for (let r = 0; r < jigsawRows; r++) {
    for (let c = 0; c < jigsawCols; c++) {
      const pc   = document.createElement('canvas');
      pc.width   = PS;
      pc.height  = PS;
      const pctx = pc.getContext('2d');
      pctx.beginPath();
      roundRect(pctx, 2, 2, PS - 4, PS - 4, 10);
      pctx.clip();
      pctx.drawImage(master, c * PS, r * PS, PS, PS, 0, 0, PS, PS);
      jigsawPieces.push({
        id:      r * jigsawCols + c,
        row:     r,
        col:     c,
        dataURL: pc.toDataURL('image/png'),
        placed:  false
      });
    }
  }

  buildJigsawDOM(thumbURL, TW, TH, PS);
}

/**
 * Build all DOM elements for the jigsaw game.
 * Pieces are rendered as <img> tags (src = dataURL) — always visible.
 */
function buildJigsawDOM(thumbURL, TW, TH, PS) {
  const view = document.getElementById('jigsaw-view');
  view.innerHTML = '';

  // ── Difficulty Row ──
  const diffRow = document.createElement('div');
  diffRow.className = 'jigsaw-diff-row';
  [['3','3×3 (Mudah)'],['4','4×4 (Sedang)'],['5','5×5 (Sulit)']].forEach(([g, lbl]) => {
    const btn = document.createElement('button');
    btn.className   = 'diff-btn' + (parseInt(g) === jigsawCols ? ' active' : '');
    btn.textContent = lbl;
    btn.dataset.grid = g;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      jigsawCols = jigsawRows = parseInt(g);
      jigsawPieceSize = g === '3' ? 110 : g === '4' ? 90 : 72;
      stopTimer(); resetStats(); buildJigsawGame();
    });
    diffRow.appendChild(btn);
  });
  // prepend label
  const diffLabel = document.createElement('span');
  diffLabel.className   = 'diff-label';
  diffLabel.textContent = 'Tingkat Kesulitan:';
  diffRow.prepend(diffLabel);
  view.appendChild(diffRow);

  // ── Top Row: Preview + Progress ──
  const topRow = document.createElement('div');
  topRow.className = 'jigsaw-top-row';

  const previewWrap = document.createElement('div');
  previewWrap.className = 'jigsaw-preview-wrap';
  const thumbImg = document.createElement('img');
  thumbImg.src       = thumbURL;
  thumbImg.className = 'preview-thumb';
  thumbImg.width     = 90;
  thumbImg.height    = 90;
  const thumbLbl = document.createElement('span');
  thumbLbl.className   = 'preview-label';
  thumbLbl.textContent = '🎯 Target';
  previewWrap.append(thumbImg, thumbLbl);

  const progressWrap = document.createElement('div');
  progressWrap.className = 'jigsaw-progress-wrap';
  progressWrap.innerHTML = `
    <div class="progress-info">
      <span id="jig-placed">0</span> / ${jigsawTotal} potongan terpasang
    </div>
    <div class="progress-bar-bg">
      <div class="progress-bar-fill" id="jig-progress" style="width:0%"></div>
    </div>`;

  topRow.append(previewWrap, progressWrap);
  view.appendChild(topRow);

  // ── Main Layout: Board (left) + Tray (right) ──
  const layout = document.createElement('div');
  layout.className = 'jigsaw-layout';

  // Board
  const board = document.createElement('div');
  board.className = 'jigsaw-board';
  board.style.gridTemplateColumns = `repeat(${jigsawCols}, ${PS}px)`;
  board.style.gridTemplateRows    = `repeat(${jigsawRows}, ${PS}px)`;

  for (let i = 0; i < jigsawTotal; i++) {
    const slot = createSlot(i, PS);
    board.appendChild(slot);
  }
  layout.appendChild(board);

  // Tray
  const tray = document.createElement('div');
  tray.className = 'jigsaw-tray';

  const shuffled = [...jigsawPieces];
  shuffle(shuffled);
  shuffled.forEach(piece => tray.appendChild(createPieceDom(piece, PS)));

  layout.appendChild(tray);
  view.appendChild(layout);
}

/** Create one empty drop slot on the board. */
function createSlot(idx, PS) {
  const slot = document.createElement('div');
  slot.className       = 'jigsaw-slot';
  slot.dataset.slotIdx = idx;
  slot.style.width     = PS + 'px';
  slot.style.height    = PS + 'px';

  slot.addEventListener('dragover', e => {
    e.preventDefault();
    if (!slot.classList.contains('slot-filled'))
      slot.classList.add('slot-hover');
  });
  slot.addEventListener('dragleave', () => slot.classList.remove('slot-hover'));
  slot.addEventListener('drop', e => {
    e.preventDefault();
    slot.classList.remove('slot-hover');
    handleJigsawDrop(slot, idx);
  });
  return slot;
}

/**
 * Create a draggable piece using an <img> (src = dataURL).
 * <img> is always visible after load — no cloneNode canvas bug.
 */
function createPieceDom(piece, PS) {
  const wrap = document.createElement('div');
  wrap.className       = 'jigsaw-piece-wrap';
  wrap.dataset.pieceId = piece.id;
  wrap.style.width     = PS + 'px';
  wrap.style.height    = PS + 'px';
  wrap.draggable       = true;

  // ★ KEY FIX: use <img src=dataURL> instead of <canvas>
  const img    = document.createElement('img');
  img.src      = piece.dataURL;
  img.width    = PS;
  img.height   = PS;
  img.draggable = false;   // let the wrapper handle drag
  img.style.cssText = 'display:block;border-radius:8px;pointer-events:none;width:100%;height:100%;';
  wrap.appendChild(img);

  wrap.addEventListener('dragstart', e => {
    draggedPieceId = piece.id;
    wrap.classList.add('piece-dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(piece.id));
    if (!gameStarted) { gameStarted = true; startTimer(); }
  });
  wrap.addEventListener('dragend', () => wrap.classList.remove('piece-dragging'));

  return wrap;
}

/** Handle drop of a piece onto a board slot. */
function handleJigsawDrop(slot, slotIdx) {
  if (draggedPieceId === null) return;
  if (slot.classList.contains('slot-filled')) return;

  const piece = jigsawPieces.find(p => p.id === draggedPieceId);
  if (!piece) { draggedPieceId = null; return; }

  const targetRow = Math.floor(slotIdx / jigsawCols);
  const targetCol = slotIdx % jigsawCols;
  const correct   = (piece.row === targetRow && piece.col === targetCol);

  // ★ Render piece in slot as <img> (guaranteed visible)
  const imgEl    = document.createElement('img');
  imgEl.src      = piece.dataURL;
  imgEl.style.cssText = 'display:block;width:100%;height:100%;border-radius:8px;';
  imgEl.draggable = false;
  slot.appendChild(imgEl);
  slot.classList.add('slot-filled');

  if (correct) {
    slot.classList.add('slot-correct');
    piece.placed = true;
    jigsawPlaced++;
    score += 20;

    // Fade out and remove piece from tray
    const wrap = document.querySelector(`.jigsaw-piece-wrap[data-piece-id="${piece.id}"]`);
    if (wrap) { wrap.classList.add('piece-gone'); setTimeout(() => wrap.remove(), 300); }

    updateStat('score', score);
    updateJigsawProgress();
    if (jigsawPlaced === jigsawTotal) setTimeout(winGame, 500);

  } else {
    // Wrong — shake, then clear the slot
    slot.classList.add('slot-wrong');
    trial++;
    updateStat('trial', trial);
    setTimeout(() => {
      imgEl.remove();
      slot.classList.remove('slot-filled', 'slot-wrong');
    }, 700);
  }

  draggedPieceId = null;
}

/** Update progress bar and counter text. */
function updateJigsawProgress() {
  const pct  = (jigsawPlaced / jigsawTotal) * 100;
  const fill = document.getElementById('jig-progress');
  const lbl  = document.getElementById('jig-placed');
  if (fill) fill.style.width = pct + '%';
  if (lbl)  lbl.textContent  = jigsawPlaced;
}

/* ══════════════════════════════════════════
   TIMER
   ══════════════════════════════════════════ */
function startTimer() {
  seconds = 0;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    seconds++;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    document.getElementById('timer').textContent =
      m + ':' + String(s).padStart(2, '0');
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

/* ══════════════════════════════════════════
   WIN / RESET
   ══════════════════════════════════════════ */
function winGame() {
  stopTimer();
  const timeStr = document.getElementById('timer').textContent;
  document.getElementById('win-sub').textContent =
    `Skor: ${score} | Trial: ${trial} | Waktu: ${timeStr}`;
  document.getElementById('win-overlay').classList.add('show');
}

function resetGame() {
  stopTimer();
  resetStats();
  document.getElementById('win-overlay').classList.remove('show');
  if (currentMode === 'match') buildMatchGrid();
  else buildJigsawGame();
}

function resetStats() {
  score = 0; trial = 0; comboCount = 1; seconds = 0; gameStarted = false;
  document.getElementById('score').textContent = '0';
  document.getElementById('trial').textContent = '0';
  document.getElementById('combo').textContent = 'x1';
  document.getElementById('timer').textContent = '0:00';
  document.getElementById('hint-text').textContent = 'Klik kartu untuk memulai!';
}

/* ══════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════ */
function updateStat(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = value;
  el.classList.remove('pulse');
  void el.offsetWidth;
  el.classList.add('pulse');
  setTimeout(() => el.classList.remove('pulse'), 350);
}

function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[0];
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/** Draw a rounded-rectangle path for canvas clipping. */
function roundRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}