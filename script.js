const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreElement = document.getElementById('final-score-value');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

// Game Constants
const GRID_SIZE = 20;
const TILE_COUNT = 25; // 25x25 grid
const CANVAS_SIZE = GRID_SIZE * TILE_COUNT;
const GAME_SPEED = 100; // ms per frame

// Set canvas size
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

// Game State
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoopId = null;
let lastTime = 0;
let isGameRunning = false;

// Snake
let snake = {
    body: [],
    direction: { x: 0, y: 0 },
    nextDirection: { x: 0, y: 0 }
};

// Food
let food = { x: 0, y: 0 };

// Initialize High Score UI
highScoreElement.textContent = highScore;

function initGame() {
    snake.body = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    snake.direction = { x: 1, y: 0 };
    snake.nextDirection = { x: 1, y: 0 };
    score = 0;
    scoreElement.textContent = score;
    placeFood();
    isGameRunning = true;
    
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function placeFood() {
    let validPosition = false;
    while (!validPosition) {
        food.x = Math.floor(Math.random() * TILE_COUNT);
        food.y = Math.floor(Math.random() * TILE_COUNT);
        
        validPosition = !snake.body.some(segment => segment.x === food.x && segment.y === food.y);
    }
}

function gameLoop(currentTime) {
    if (!isGameRunning) return;

    window.requestAnimationFrame(gameLoop);

    const secondsSinceLastRender = (currentTime - lastTime) / 1000;
    if (secondsSinceLastRender < GAME_SPEED / 1000) return;

    lastTime = currentTime;

    update();
    draw();
}

function update() {
    // Update direction
    snake.direction = snake.nextDirection;

    // Calculate new head position
    const head = { ...snake.body[0] };
    head.x += snake.direction.x;
    head.y += snake.direction.y;

    // Check Wall Collision
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        gameOver();
        return;
    }

    // Check Self Collision
    if (snake.body.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    snake.body.unshift(head); // Add new head

    // Check Food Collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        placeFood();
        // Don't pop tail, so snake grows
    } else {
        snake.body.pop(); // Remove tail
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = 'rgba(10, 10, 15, 0.8)'; // Semi-transparent clear for trail effect? No, solid for clean look
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Grid (Optional, subtle)
    ctx.strokeStyle = '#1a1a24';
    ctx.lineWidth = 0.5;
    /*
    for (let i = 0; i < TILE_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(canvas.width, i * GRID_SIZE);
        ctx.stroke();
    }
    */

    // Draw Food
    ctx.fillStyle = '#bd00ff';
    ctx.shadowColor = '#bd00ff';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow

    // Draw Snake
    snake.body.forEach((segment, index) => {
        const isHead = index === 0;
        ctx.fillStyle = isHead ? '#ffffff' : '#00ff88';
        ctx.shadowColor = isHead ? '#ffffff' : '#00ff88';
        ctx.shadowBlur = isHead ? 20 : 10;

        // Smooth rounded rectangles for snake segments
        const x = segment.x * GRID_SIZE;
        const y = segment.y * GRID_SIZE;
        const size = GRID_SIZE - 2;
        
        ctx.fillRect(x + 1, y + 1, size, size);
    });
    ctx.shadowBlur = 0;
}

function gameOver() {
    isGameRunning = false;
    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

// Input Handling
document.addEventListener('keydown', (e) => {
    if (!isGameRunning) return;

    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (snake.direction.y === 0) snake.nextDirection = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (snake.direction.y === 0) snake.nextDirection = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (snake.direction.x === 0) snake.nextDirection = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (snake.direction.x === 0) snake.nextDirection = { x: 1, y: 0 };
            break;
    }
});

startBtn.addEventListener('click', initGame);
restartBtn.addEventListener('click', initGame);
