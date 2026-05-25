// 1. DATA THEMES
const themes = {
  fruits: ['🍎', '🍎', '🍌', '🍌', '🍇', '🍇', '🍓', '🍓', '🍒', '🍒', '🍍', '🍍', '🥝', '🥝', '🍉', '🍉'],
  animals: ['🐶', '🐶', '🐱', '🐱', '🐯', '🐯', '🦁', '🦁', '🐮', '🐮', '🐷', '🐷', '🐸', '🐸', '🐵', '🐵'],
  tech: ['💻', '💻', '📱', '📱', '⌨️', '⌨️', '🖱️', '🖱️', '🎮', '🎮', '🎧', '🎧', '📷', '📷', '⌚', '⌚'],
  flags: ['🇮🇩', '🇮🇩', '🇺🇸', '🇺🇸', '🇯🇵', '🇯🇵', '🇰🇷', '🇰🇷', '🇩🇪', '🇩🇪', '🇬🇧', '🇬🇧', '🇫🇷', '🇫🇷', '🇨🇳', '🇨🇳']
};

// 2. VARIABEL STATE
let flippedCards = [];
let matchedCount = 0;
let moves = 0;
let canClick = true;
let firstPiece = null;

// 3. VARIABEL SUARA (Audio)
const soundMatch = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
const soundWrong = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
const soundWin = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');

// 4. REFERENSI ELEMEN
const grid = document.getElementById('grid');
const movesDisplay = document.getElementById('moves');
const themeSelect = document.getElementById('theme-select');
const matchingArea = document.getElementById('matching-area');
const jigsawArea = document.getElementById('jigsaw-area');
const themeWrapper = document.getElementById('theme-wrapper');
const jigsawGrid = document.getElementById('jigsaw-grid');

// 5. FUNGSI UTAMA GAME MATCHING
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function createBoard() {
  if (!grid) return;
  grid.innerHTML = '';
  flippedCards = [];
  matchedCount = 0;
  canClick = true;

  const selectedTheme = themeSelect.value;
  const cardsArray = themes[selectedTheme];
  const shuffledCards = shuffle([...cardsArray]);

  shuffledCards.forEach((symbol, index) => {
    const card = document.createElement('div');
    card.classList.add('card', 'card-appear');
    card.style.animationDelay = `${index * 0.05}s`;
    card.dataset.symbol = symbol;

    card.innerHTML = `
            <div class="card-face card-front">?</div>
            <div class="card-face card-back">${symbol}</div>
        `;

    card.addEventListener('click', flipCard);
    grid.appendChild(card);
  });
}

function flipCard() {
  if (!canClick || this.classList.contains('flipped') || this.classList.contains('matched')) return;

  this.classList.add('flipped');
  flippedCards.push(this);

  if (flippedCards.length === 2) {
    moves++;
    if (movesDisplay) movesDisplay.innerText = moves;
    canClick = false;
    checkMatch();
  }
}

function checkMatch() {
  const [card1, card2] = flippedCards;

  if (card1.dataset.symbol === card2.dataset.symbol) {
    setTimeout(() => {
      card1.classList.add('matched');
      card2.classList.add('matched');
      soundMatch.play();
      flippedCards = [];
      canClick = true;
      matchedCount += 2;

      if (matchedCount === themes[themeSelect.value].length) {
        setTimeout(() => {
          soundWin.play();
          showWinAnimation();
        }, 500);
      }
    }, 600);
  } else {
    setTimeout(() => {
      soundWrong.play();
      card1.classList.remove('flipped');
      card2.classList.remove('flipped');
      flippedCards = [];
      canClick = true;
    }, 1000);
  }
}

// 6. LOGIKA SWITCHER & RESET
function switchGame() {
  const mode = document.getElementById('game-mode').value;
  if (mode === 'matching') {
    matchingArea.style.display = 'block';
    jigsawArea.style.display = 'none';
    themeWrapper.style.display = 'flex';
    createBoard();
  } else {
    matchingArea.style.display = 'none';
    jigsawArea.style.display = 'block';
    themeWrapper.style.display = 'none';
    initJigsaw();
  }
  moves = 0;
  if (movesDisplay) movesDisplay.innerText = moves;
}

function handleReset() {
  moves = 0;
  if (movesDisplay) movesDisplay.innerText = moves;
  const mode = document.getElementById('game-mode').value;
  if (mode === 'matching') createBoard();
  else initJigsaw();
}

function resetGame() {
    handleReset();
}

// 7. FUNGSI JIGSAW PUZZLE
function initJigsaw() {
  if (!jigsawGrid) return;
  jigsawGrid.innerHTML = '';
  jigsawGrid.classList.remove('puzzle-solved');
  let pieces = [];
  const imgUrl = "https://picsum.photos/360/360";

  for (let i = 0; i < 9; i++) pieces.push(i);
  pieces.sort(() => Math.random() - 0.5);

  pieces.forEach((pos, index) => {
    const piece = document.createElement('div');
    piece.classList.add('jigsaw-piece', 'card-appear');
    piece.style.backgroundImage = `url(${imgUrl})`;
    piece.style.backgroundSize = "360px 360px";

    const row = Math.floor(pos / 3);
    const col = pos % 3;
    piece.style.backgroundPosition = `-${col * 120}px -${row * 120}px`;

    piece.dataset.correctPos = pos;
    piece.addEventListener('click', selectPiece);
    jigsawGrid.appendChild(piece);
  });
}

function selectPiece() {
  if (this.classList.contains('selected')) {
    this.classList.remove('selected');
    firstPiece = null;
    return;
  }

  if (!firstPiece) {
    firstPiece = this;
    this.classList.add('selected');
  } else {
    swapPieces(firstPiece, this);
    firstPiece.classList.remove('selected');
    firstPiece = null;
    moves++;
    if (movesDisplay) movesDisplay.innerText = moves;
    checkJigsawWin();
  }
}

function swapPieces(p1, p2) {
  const p1BG = p1.style.backgroundPosition;
  const p1Pos = p1.dataset.correctPos;

  soundMatch.currentTime = 0;
  soundMatch.play();

  p1.style.backgroundPosition = p2.style.backgroundPosition;
  p1.dataset.correctPos = p2.dataset.correctPos;

  p2.style.backgroundPosition = p1BG;
  p2.dataset.correctPos = p1Pos;
}

function checkJigsawWin() {
  const allPieces = document.querySelectorAll('.jigsaw-piece');
  let isCorrect = true;

  allPieces.forEach((piece, index) => {
    if (parseInt(piece.dataset.correctPos) !== index) {
      isCorrect = false;
    }
  });

  if (isCorrect) {
    jigsawGrid.classList.add('puzzle-solved');
    soundWin.play();
    showWinAnimation();
  }
}

// 8. ANIMASI MENANG & MODAL
function showWinAnimation() {
    // 1. EFEK KEMBANG API (CONFETTI)
    const end = Date.now() + (3 * 1000); // Berlangsung selama 3 detik

    (function frame() {
        confetti({
            particleCount: 7,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#00d4ff', '#ff00cc', '#ffffff']
        });
        confetti({
            particleCount: 7,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#00d4ff', '#ff00cc', '#ffffff']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());

    function showWinAnimation() {
    // 1. Jalankan Confetti
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
    });

    // 2. Tampilkan Modal Pop-up
    setTimeout(() => {
        const modal = document.getElementById('win-modal');
        const finalMovesDisplay = document.getElementById('final-moves');
        
        // Update angka percobaan terakhir
        if (finalMovesDisplay) finalMovesDisplay.innerText = moves;
        
        // Munculkan Modal dengan menambahkan class 'show'
        if (modal) modal.classList.add('show');
        
        // Mainkan suara menang
        if (typeof soundWin !== 'undefined') soundWin.play();
    }, 500);
}

function closeWinModal() {
    const modal = document.getElementById('win-modal');
    if (modal) modal.classList.remove('show'); // Sembunyikan kembali
    handleReset(); // Mulai ulang game
}

}

// 9. INISIALISASI AWAL
window.onload = () => {
    switchGame();
};