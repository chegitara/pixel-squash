const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');

let touchStartX = 0;
let touchStartY = 0;

document.addEventListener("touchstart", e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener("touchend", e => {
    let dx = e.changedTouches[0].clientX - touchStartX;
    let dy = e.changedTouches[0].clientY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) player.x += player.speed;
        else player.x -= player.speed;
    } else {
        if (dy > 0) player.y += player.speed;
        else player.y -= player.speed;
    }
});

let score = 0;
let gameLoop = null;

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
// ENEMY (langsam + KI)
// ---------------------------
let enemy = {
    x: randomPos(),
    y: randomPos(),
    size: 20,
    color: 'red',
    baseSpeed: 0.5
};

let food = {
    x: randomPos(),
    y: randomPos(),
    size: 20,
    color: 'blue'
};

// ---------------------------
// START GAME
// ---------------------------
function startGame() {
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("game").style.display = "block";

    resetGame();

    gameLoop = setInterval(update, 16);
}

// ---------------------------
// RESET GAME
// ---------------------------
function resetGame() {
    score = 0;
    scoreEl.innerText = score;

    player.x = 180;
    player.y = 180;

    enemy.x = randomPos();
    enemy.y = randomPos();
}

// ---------------------------
// RANDOM POSITION
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

// ---------------------------
// DRAW OBJECT
// ---------------------------
function drawRect(obj) {
    ctx.fillStyle = obj.color;
    ctx.fillRect(obj.x, obj.y, obj.size, obj.size);
}

// ---------------------------
// COLLISION (richtig)
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
// ENEMY AI (chase player)
// ---------------------------
function moveEnemy() {
    let dx = player.x - enemy.x;
    let dy = player.y - enemy.y;

    let dist = Math.sqrt(dx * dx + dy * dy);

    let speed = 0,3;

    enemy.x += (dx / dist) * speed;
    enemy.y += (dy / dist) * speed;
}

// ---------------------------
// GAME OVER
// ---------------------------
function gameOver() {
    clearInterval(gameLoop);

    document.getElementById("gameOverScreen").style.display = "flex";
    document.getElementById("game").style.display = "none";

    document.getElementById("finalScore").innerText = "Score: " + score;

    saveScore();
}

// ---------------------------
// RETRY
// ---------------------------
function retryGame() {
    document.getElementById("gameOverScreen").style.display = "none";
    startGame();
}

function resetGame() {
    score = 0;
    scoreEl.innerText = score;

    player.x = 180;
    player.y = 180;

    enemy.x = randomPos();
    enemy.y = randomPos();

    food.x = randomPos();
    food.y = randomPos();
}

// ---------------------------
// MAIN LOOP
// ---------------------------
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    moveEnemy();

    drawRect(player);
    drawRect(enemy);
    drawRect(food); // 🔵 neuer Gegner (Score-Food)

    // 🔴 Enemy (Game Over)
    if (collision(player, enemy)) {
        gameOver();
    }

    // 🔵 Food (Score + Respawn)
    if (collision(player, food)) {
        score++;
        scoreEl.innerText = score;

        food.x = randomPos();
        food.y = randomPos();
    }

    requestAnimationFrame(update);
}

// ---------------------------
// SAVE SCORE (backend)
// ---------------------------
async function saveScore() {
    await fetch('/save_score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
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