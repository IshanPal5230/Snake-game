const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let box = 20;
let snake, direction, food, bonusFood, score, level, game;
let mode = "classic";
let theme = "classic";
let highScores = JSON.parse(localStorage.getItem("snakeHighScores")) || [];
let speed, timeLeft;

const eatSound = document.getElementById("eatSound");
const bonusSound = document.getElementById("bonusSound");
const levelUpSound = document.getElementById("levelUpSound");
const gameOverSound = document.getElementById("gameOverSound");
const bgMusic = document.getElementById("bgMusic");

function startGame() {
  snake = [{ x: 9 * box, y: 10 * box }];
  direction = null;
  score = 0;
  level = 1;
  speed = 200;
  food = randomFood();
  bonusFood = null;
  timeLeft = 60;
  bgMusic.play();
  clearInterval(game);
  game = setInterval(draw, speed);
}

function pauseGame() {
  clearInterval(game);
  bgMusic.pause();
}

function resumeGame() {
  game = setInterval(draw, speed);
  bgMusic.play();
}

function changeDirection(dir) {
  if (dir === "left" && direction !== "RIGHT") direction = "LEFT";
  else if (dir === "up" && direction !== "DOWN") direction = "UP";
  else if (dir === "right" && direction !== "LEFT") direction = "RIGHT";
  else if (dir === "down" && direction !== "UP") direction = "DOWN";
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") changeDirection("left");
  if (e.key === "ArrowUp") changeDirection("up");
  if (e.key === "ArrowRight") changeDirection("right");
  if (e.key === "ArrowDown") changeDirection("down");
});

function randomFood() {
  return {
    x: Math.floor(Math.random() * 20) * box,
    y: Math.floor(Math.random() * 20) * box
  };
}

function draw() {
  // theme background
  if (theme === "classic") ctx.fillStyle = "black";
  if (theme === "neon") ctx.fillStyle = "#001f3f";
  if (theme === "retro") ctx.fillStyle = "#222";
  if (theme === "dark") ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // snake
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "lime" : "green";
    if (theme === "neon") ctx.fillStyle = i === 0 ? "cyan" : "blue";
    if (theme === "retro") ctx.fillStyle = i === 0 ? "yellow" : "orange";
    if (theme === "dark") ctx.fillStyle = i === 0 ? "white" : "gray";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  // food
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  // bonus food
  if (bonusFood) {
    ctx.fillStyle = "gold";
    ctx.fillRect(bonusFood.x, bonusFood.y, box, box);
  }

  // move snake
  let snakeX = snake[0].x;
  let snakeY = snake[0].y;
  if (direction === "LEFT") snakeX -= box;
  if (direction === "UP") snakeY -= box;
  if (direction === "RIGHT") snakeX += box;
  if (direction === "DOWN") snakeY += box;

  // eat food
  if (snakeX === food.x && snakeY === food.y) {
    score++;
    eatSound.play();
    food = randomFood();
    if (score % 5 === 0) {
      level++;
      speed = Math.max(80, speed - 20);
      levelUpSound.play();
      clearInterval(game);
      game = setInterval(draw, speed);
      if (Math.random() < 0.5) bonusFood = randomFood();
    }
  } else if (bonusFood && snakeX === bonusFood.x && snakeY === bonusFood.y) {
    score += 10;
    bonusSound.play();
    bonusFood = null;
  } else {
    snake.pop();
  }

  let newHead = { x: snakeX, y: snakeY };

  // collision
  if (
    snakeX < 0 ||
    snakeY < 0 ||
    snakeX >= canvas.width ||
    snakeY >= canvas.height ||
    collision(newHead, snake)
  ) {
    clearInterval(game);
    gameOverSound.play();
    bgMusic.pause();
    saveHighScore(score);
    return;
  }

  snake.unshift(newHead);

  document.getElementById("score").innerText = score;
  document.getElementById("level").innerText = level;
  renderHighScores();

  if (mode === "time") {
    timeLeft -= 1 / (1000 / speed);
    if (timeLeft <= 0) {
      clearInterval(game);
      gameOverSound.play();
      bgMusic.pause();
      saveHighScore(score);
    }
  }
}

function collision(head, arr) {
  for (let i = 0; i < arr.length; i++) {
    if (head.x === arr[i].x && head.y === arr[i].y) return true;
  }
  return false;
}

function saveHighScore(score) {
  highScores.push(score);
  highScores.sort((a, b) => b - a);
  highScores = highScores.slice(0, 5);
  localStorage.setItem("snakeHighScores", JSON.stringify(highScores));
  renderHighScores();
}

function renderHighScores() {
  const list = document.getElementById("highScores");
  list.innerHTML = "";
  highScores.forEach(s => {
    let li = document.createElement("li");
    li.textContent = s;
    list.appendChild(li);
  });
}

function changeMode(m) {
  mode = m;
}

function changeTheme(t) {
  theme = t;
}
