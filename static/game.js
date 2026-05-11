const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');

let score = 0;

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
// ENEMY (chase)
// ---------------------------
let enemy = {
    x: 50,
    y: 50,
    size: 20,
    color: 'red',
    baseSpeed: 0.3
};

// ---------------------------
// FOOD (score)
// ---------------------------
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
    update();
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

    food.x = randomPos();
    food.y = randomPos();
}

// ---------------------------
// RANDOM POS
// ---------------------------
function randomPos() {
    return Math.floor(Math.random() * 19) * 20;
}

// ---------------------------
// INPUT (Keyboard)
// ---------------------------
window.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') player.y -= player.speed;
    if (e.key === 'ArrowDown') player.y += player.speed;
    if (e.key === 'ArrowLeft') player.x -= player.speed;
    if (e.key === 'ArrowRight') player.x += player.speed;
});

function move(direction) {

    if (direction === 'up') {
        player.y -= player.speed;
    }

    if (direction === 'down') {
        player.y += player.speed;
    }

    if (direction === 'left') {
        player.x -= player.speed;
    }

    if (direction === 'right') {
        player.x += player.speed;
    }
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
// ENEMY AI (slow chase + scaling)
// ---------------------------
function moveEnemy() {
    let dx = player.x - enemy.x;
    let dy = player.y - enemy.y;

    let dist = Math.sqrt(dx * dx + dy * dy);

    let speed = Math.min(enemy.baseSpeed + (score * 0.03), 2);

    enemy.x += (dx / dist) * speed;
    enemy.y += (dy / dist) * speed;
}

// ---------------------------
// GAME OVER
// ---------------------------
async function gameOver() {

    // Nur speichern wenn >= 2
    if (score >= 2) {
        await saveScore();
    }

    alert("Game Over! Score: " + score);

    resetGame();
}

// ---------------------------
// MAIN LOOP
// ---------------------------
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    moveEnemy();

    draw(player);
    draw(enemy);
    draw(food);

    // Enemy collision
  if (collision(player, food)) {

    score++;
    scoreEl.innerText = score;

    // Neues Food
    food.x = randomPos();
    food.y = randomPos();

    // Enemy wird größer
    enemy.size = Math.min(enemy.size + 2, 120);

    // Optional: minimal schneller
    enemy.baseSpeed = Math.min(enemy.baseSpeed + 0.02, 3);
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