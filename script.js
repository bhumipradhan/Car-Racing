const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const scoreEl = document.getElementById('score');
const LANES = 3;
const LW = cv.width / LANES;
let player, enemies, score, speed, over, dash, tick;

function reset() {
  player = { lane: 1 };
  enemies = [];
  score = 0;
  speed = 3;
  over = false;
  dash = 0;
  tick = 0;
}

function move(d) {
  if (over) { reset(); return; }
  player.lane = Math.max(0, Math.min(LANES - 1, player.lane + d));
}

function car(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 40, 70);
  ctx.fillStyle = '#cfe8ff';
  ctx.fillRect(x + 6, y + 14, 28, 14);
  ctx.fillStyle = '#111';
  ctx.fillRect(x - 4, y + 8, 6, 16);
  ctx.fillRect(x + 38, y + 8, 6, 16);
  ctx.fillRect(x - 4, y + 46, 6, 16);
  ctx.fillRect(x + 38, y + 46, 6, 16);
}

function loop() {
  tick++;
  if (!over) {
    dash = (dash + speed) % 40;

    // spawn enemy cars, faster as score grows
    if (tick % Math.max(25, 70 - Math.floor(score / 50)) === 0) {
      enemies.push({ lane: Math.floor(Math.random() * LANES), y: -80 });
    }

    enemies.forEach(e => e.y += speed);

    // remove passed cars, add score, speed up
    enemies = enemies.filter(e => {
      if (e.y > cv.height) { score += 10; speed += 0.08; return false; }
      return true;
    });

    // collision check
    const py = cv.height - 100;
    if (enemies.some(e => e.lane === player.lane && e.y + 70 > py && e.y < py + 70)) {
      over = true;
    }
  }

  // draw
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  ctx.setLineDash([20, 20]);
  ctx.lineDashOffset = -dash;
  for (let i = 1; i < LANES; i++) {
    ctx.beginPath();
    ctx.moveTo(i * LW, 0);
    ctx.lineTo(i * LW, cv.height);
    ctx.stroke();
  }
  enemies.forEach(e => car(e.lane * LW + (LW - 40) / 2, e.y, '#d64545'));
  car(player.lane * LW + (LW - 40) / 2, cv.height - 100, '#2f80ed');
  scoreEl.textContent = 'Score: ' + score;

  if (over) {
    ctx.fillStyle = 'rgba(0,0,0,.6)';
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 32px system-ui';
    ctx.fillText('Crash!', cv.width / 2, cv.height / 2 - 10);
    ctx.font = '16px system-ui';
    ctx.fillText('Press any key or arrow to retry', cv.width / 2, cv.height / 2 + 20);
  }
  requestAnimationFrame(loop);
}

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') move(-1);
  else if (e.key === 'ArrowRight') move(1);
  else if (over) reset();
});
document.getElementById('l').onclick = () => move(-1);
document.getElementById('r').onclick = () => move(1);

reset();
loop();