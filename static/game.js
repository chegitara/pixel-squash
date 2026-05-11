const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');

let player = {
    x: 180,
    y: 180,
    size: 20,
    color: 'lime'
};

let enemy = {
    x: randomPos(),
    y: randomPos(),
    size: 20,
    color: 'red',
    dx: 20,
    dy: 20
};

let score = 0;

function randomPos() {
    return Math.floor(Math.random() * 19) * 20;
}

window.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') player.y -= 20;
    if (e.key === 'ArrowDown') player.y += 20;
    if (e.key === 'ArrowLeft') player.x -= 20;
    if (e.key === 'ArrowRight') player.x += 20;
});

function drawRect(obj) {
    ctx.fillStyle = obj.color;
    ctx.fillRect(obj.x, obj.y, obj.size, obj.size);
}

function collision(a, b) {
    return a.x === b.x && a.y === b.y;
}

function moveEnemy() {
    enemy.x += enemy.dx;
    enemy.y += enemy.dy;

    // Rand-Kollision (Bounce)
    if (enemy.x <= 0 || enemy.x >= 380) {
        enemy.dx *= -1;
    }

    if (enemy.y <= 0 || enemy.y >= 380) {
        enemy.dy *= -1;
    }
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    moveEnemy();

    drawRect(player);
    drawRect(enemy);

    if (collision(player, enemy)) {
        score++;
        scoreEl.innerText = score;

        enemy.x = randomPos();
        enemy.y = randomPos();
    }

    requestAnimationFrame(update);
}

async function saveScore() {
    await fetch('/save_score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            score
        })
    });

    loadScores();
}
    

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

window.onload = () => {
    loadScores();
    update();
};