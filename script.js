// Game Constants
const COLORS = [
    'bg-primary-container', // Cyan-like
    'bg-secondary',         // Magenta-like
    'bg-tertiary-container',// Lime-like
    'bg-orange-500',        // Orange (was White)
    'bg-error',             // Red
    'bg-primary'            // Dark Cyan
];

const BOARD_SIZE = 5;
const TARGET_SIZE = 3;
const TOTAL_TILES = BOARD_SIZE * BOARD_SIZE;

// State
let board = []; // 1D array of length 25
let target = []; // 1D array of length 9
let emptyIndex = -1;
let startTime = null;
let timerInterval = null;
let gameActive = false;
let movesCount = 0;

// DOM Elements
const gameBoardEl = document.getElementById('game-board');
const targetBoardEl = document.getElementById('target-board');
const timerMainEl = document.getElementById('timer-main');
const timerMsEl = document.getElementById('timer-ms');
const resetBtn = document.getElementById('reset-btn');
const surrenderBtn = document.getElementById('surrender-btn');
const streakEl = document.getElementById('streak-count');
const opponentProgressText = document.getElementById('opponent-progress-text');
const opponentProgressBar = document.getElementById('opponent-progress-bar');

// Initialize Game
function init() {
    setupBoard();
    generateTarget();
    render();
    resetTimer();
    gameActive = true;
    movesCount = 0;
    
    // Randomize streak for flair
    streakEl.textContent = Math.floor(Math.random() * 15) + 5;
    simulateOpponent();
}

function setupBoard() {
    // 4 tiles of each of 6 colors = 24 tiles + 1 empty
    const tiles = [];
    COLORS.forEach(color => {
        for (let i = 0; i < 4; i++) {
            tiles.push(color);
        }
    });
    
    board = [...tiles, null]; // Last slot is empty
    emptyIndex = TOTAL_TILES - 1;
    
    shuffle();
}

function shuffle() {
    // Perform random valid moves to ensure solvability
    for (let i = 0; i < 1000; i++) {
        const neighbors = getNeighbors(emptyIndex);
        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        swap(emptyIndex, randomNeighbor);
        emptyIndex = randomNeighbor;
    }
}

function getNeighbors(index) {
    const neighbors = [];
    const row = Math.floor(index / BOARD_SIZE);
    const col = index % BOARD_SIZE;

    if (row > 0) neighbors.push(index - BOARD_SIZE); // Up
    if (row < BOARD_SIZE - 1) neighbors.push(index + BOARD_SIZE); // Down
    if (col > 0) neighbors.push(index - 1); // Left
    if (col < BOARD_SIZE - 1) neighbors.push(index + 1); // Right

    return neighbors;
}

function swap(i, j) {
    const temp = board[i];
    board[i] = board[j];
    board[j] = temp;
}

function generateTarget() {
    // Target is a 3x3 grid using the same 6 colors
    // Ensure the target is achievable by using the same distribution
    const pool = [];
    COLORS.forEach(color => {
        for (let i = 0; i < 4; i++) pool.push(color);
    });
    
    // Shuffle the pool
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    
    target = pool.slice(0, 9);
}

function render() {
    // Render Game Board
    gameBoardEl.innerHTML = '';
    board.forEach((color, index) => {
        const tile = document.createElement('div');
        if (color) {
            tile.className = `grid-tile ${color} rounded-DEFAULT shadow-md`;
            tile.addEventListener('click', () => handleMove(index));
        } else {
            tile.className = 'rounded-DEFAULT bg-surface-container-high/40 border border-dashed border-outline-variant/30';
        }
        gameBoardEl.appendChild(tile);
    });

    // Render Target Board
    targetBoardEl.innerHTML = '';
    target.forEach(color => {
        const tile = document.createElement('div');
        tile.className = `${color} rounded-sm shadow-sm`;
        targetBoardEl.appendChild(tile);
    });
}

function handleMove(index) {
    if (!gameActive) return;

    const neighbors = getNeighbors(emptyIndex);
    if (neighbors.includes(index)) {
        if (!startTime) startTimer();
        
        swap(emptyIndex, index);
        emptyIndex = index;
        movesCount++;
        render();
        checkWin();
    }
}

function checkWin() {
    // Win if center 3x3 of 5x5 board matches target 3x3
    let match = true;
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const boardIndex = (row + 1) * BOARD_SIZE + (col + 1);
            const targetIndex = row * 3 + col;
            if (board[boardIndex] !== target[targetIndex]) {
                match = false;
                break;
            }
        }
        if (!match) break;
    }

    if (match) {
        winGame();
    }
}

function winGame() {
    gameActive = false;
    clearInterval(timerInterval);
    setTimeout(() => {
        alert('Congratulations! You matched the pattern!');
    }, 100);
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 10);
}

function updateTimer() {
    const elapsed = Date.now() - startTime;
    const seconds = Math.floor(elapsed / 1000);
    const ms = Math.floor((elapsed % 1000) / 10);
    
    const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
    const ss = (seconds % 60).toString().padStart(2, '0');
    
    timerMainEl.textContent = `${mm}:${ss}`;
    timerMsEl.textContent = `.${ms.toString().padStart(2, '0')}`;
}

function resetTimer() {
    clearInterval(timerInterval);
    startTime = null;
    timerMainEl.textContent = '00:00';
    timerMsEl.textContent = '.00';
}

function simulateOpponent() {
    let progress = 0;
    const interval = setInterval(() => {
        if (!gameActive) {
            clearInterval(interval);
            return;
        }
        progress += Math.random() * 5;
        if (progress > 95) progress = 95; 
        
        opponentProgressText.textContent = `${Math.floor(progress)}%`;
        opponentProgressBar.style.width = `${progress}%`;
    }, 2000);
}

// Event Listeners
resetBtn.addEventListener('click', () => {
    init();
});

surrenderBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to surrender?')) {
        gameActive = false;
        clearInterval(timerInterval);
        alert('Game over. Better luck next time!');
        init();
    }
});

// Start the game
init();
