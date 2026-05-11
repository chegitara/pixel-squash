const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');

let score = 0;
let gameRunning = false;

// ---------------------------
// PLAYER
// ---------------------------
let player = {
    x: 180,
    y: 180,
    size: 20,
    color: 'white',
    speed: 20
};

// ---------------------------
// FOOD
// ---------------------------
let food = {
    x: 100,
    y: 100,
    size: 20,
    color: 'blue'
};

// ---------------------------
// ENEMIES
// ---------------------------
let enemies = [];

function createEnemy() {
    enemies.push({
        x: randomPos(),
        y: randomPos(),
        size: 20,
        color: 'red',
        baseSpeed: 0.3
    });
}

// ---------------------------
// START
// ---------------------------
function startGame() {
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("game").style.display = "block";

    resetGame();

    gameRunning = true;
    update();
}

// ---------------------------
// RESET
// ---------------------------
function resetGame() {

    score = 0;
    scoreEl.innerText = score;

    player.x = 180;
    player.y = 180;

    food.x = randomPos();
    food.y = randomPos();

    enemies = [];
    createEnemy();
}

// ---------------------------
// RANDOM
// ---------------------------
function randomPos() {
    return Math.floor(Math.random() * 19) * 20;
}

// ---------------------------
// INPUT
// ---------------------------
window.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') player.y -= player.speed;
    if (e.key === 'ArrowDown') player.y += player.speed;
    if (e.key === 'ArrowLeft') player.x -= player.speed;
    if (e.key === 'ArrowRight') player.x += player.speed;
});

function move(direction) {
    if (direction === 'up') player.y -= player.speed;
    if (direction === 'down') player.y += player.speed;
    if (direction === 'left') player.x -= player.speed;
    if (direction === 'right') player.x += player.speed;
}

// ---------------------------
// DRAW
// ---------------------------
function draw(obj) {
    ctx.fillStyle = obj.color;
    ctx.fillRect(obj.x, obj.y, obj.size, obj.size);
}

// ---------------------------
// COLLISION
// ---------------------------
function collision(a, b) {
    return (
        a.x < b.x + b.size &&
        a.x + a.size > b.x &&
        a.y < b.y + b.size &&
        a.y + a.size > b.y
    );
}

// ---------------------------
// ENEMY MOVEMENT
// ---------------------------
function moveEnemies() {

    enemies.forEach(enemy => {

        let dx = player.x - enemy.x;
        let dy = player.y - enemy.y;

        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            enemy.x += (dx / dist) * enemy.baseSpeed;
            enemy.y += (dy / dist) * enemy.baseSpeed;
        }

    });
}

// ---------------------------
// CHECK ENEMY COLLISION
// ---------------------------
function checkEnemyCollision() {

    for (let enemy of enemies) {
        if (collision(player, enemy)) {
            return true;
        }
    }

    return false;
}

// ---------------------------
// GAME OVER
// ---------------------------
async function gameOver() {

    if (!gameRunning) return;
    gameRunning = false;

    if (score >= 2) {
        await saveScore();
    }

    setTimeout(() => {

        let retry = confirm("💀 GAME OVER 💀\nScore: " + score + "\nNochmal spielen?");

        if (retry) {
            resetGame();
            gameRunning = true;
            update();
        }

    }, 50);
}

// ---------------------------
// UPDATE LOOP
// ---------------------------
function update() {

    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    moveEnemies();

    // DRAW PLAYER
    draw(player);

    // DRAW ENEMIES
    enemies.forEach(e => draw(e));

    // DRAW FOOD
    draw(food);

    // ENEMY HIT
    if (checkEnemyCollision()) {
        gameOver();
        return;
    }

    // FOOD COLLISION
    if (collision(player, food)) {

    score++;
    scoreEl.innerText = score;

    food.x = randomPos();
    food.y = randomPos();

    // 🔥 Enemy Scaling bei jedem Food
    enemies.forEach(enemy => {

        enemy.size = Math.min(enemy.size + 1, 80);  // Größe + Limit
        enemy.baseSpeed = Math.min(enemy.baseSpeed + 0.02, 3); // optional schneller

    });

    // Enemy Spawn System
    let targetEnemies = Math.min(
        1 + Math.floor(score / 5),
        10
    );

    while (enemies.length < targetEnemies) {
        createEnemy();
    }
}

    requestAnimationFrame(update);
}

// ---------------------------
// SAVE SCORE
// ---------------------------
async function saveScore() {

    await fetch('/save_score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score })
    });

    loadScores();
}

// ---------------------------
// LOAD SCORES
// ---------------------------
async function loadScores() {

    const res = await fetch('/highscores');
    const data = await res.json();

    const list = document.getElementById('highscores');
    list.innerHTML = '';

    data.forEach(item => {
        const li = document.createElement('li');
        li.innerText = `${item[0]} - ${item[1]}`;
        list.appendChild(li);
    });
}

// ---------------------------
// INIT
// ---------------------------
window.onload = () => {
    loadScores();
};