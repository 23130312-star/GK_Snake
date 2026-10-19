const board = document.getElementById('game-board');
const cols = 16;
const rows = 10;
const cells = [];

let time = 90;
let timeInterval = null;
let currentLevel = 1;
let snake = [];
let dx = 1;
let dy = 0;
let directionChanged = false;
let nextDirection = null;
let gameOver = false;
let score = 0;
let foodCount = 0;
let food = {x: -1, y: -1};
let poisonFood = {x: -1, y: -1};
let reverseControl = false;
let poisonTimer = null;
let cloneSnake = [];
let cloneVisible = false;
let snakeHistory = [];

let cloneStartAfter = 10;
let cloneShowTime = 5;
let cloneHideTime = 5;
let cloneDelayStep = 12;
let cloneSafeMoves = 0;

for (let i = 0; i < rows * cols; i++) {
    let cell = document.createElement('div');
    cell.classList.add('cell');
    board.appendChild(cell);
    cells.push(cell);
}

function startTimer() {
    clearInterval(timeInterval);
    timeInterval = setInterval(function () {
        if (gameOver) {
            clearInterval(timeInterval);
            return;
        }
        time--;
        let minutes = Math.floor(time / 60);
        let seconds = time % 60;
        let displayTime = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
        document.getElementById('time').textContent = displayTime;

        if (time <= 0) {
            clearInterval(timeInterval);
            resetGame();
        }
    }, 1000);
}

function changeLevel(level) {
    if (level < 1 || level > 6) return;

    currentLevel = level;
    localStorage.setItem('currentLevel', level);
    document.getElementById('level-title').textContent = 'Level: ' + level;

    let descriptions = ['Xuyên tường', 'Đụng tường', 'Trái độc', 'Rắn nhân bản', 'Thử thách thức ăn', 'Thử thách cuối'];
    document.getElementById('level-description').textContent = descriptions[level - 1];

    let buttons = document.querySelectorAll('.level');
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('active');
    }
    buttons[level - 1].classList.add('active');

    drawMap();
    resetGame();
}

function isWall(x, y) {
    if (currentLevel === 2) {
        return x === 0 || x === cols - 1 || y === 0 || y === rows - 1;
    }
    if (currentLevel === 3) {
        return y === 0 || y === rows - 1;
    }
    if (currentLevel === 4) {
        return y === 0 || y === rows - 1;
    }
    return false;
}

function drawMap() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            let index = y * cols + x;
            cells[index].classList.remove('wall');
            if (isWall(x, y)) {
                cells[index].classList.add('wall');
            }
        }
    }
}

function onSnake(x, y) {
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === x && snake[i].y === y) return true;
    }
    return false;
}

function onClone(x, y) {
    for (let i = 0; i < cloneSnake.length; i++) {
        if (cloneSnake[i].x === x && cloneSnake[i].y === y) {
            return true;
        }
    }
    return false;
}

function updateCloneState() {
    if (currentLevel !== 4) {
        cloneVisible = false;
        cloneSnake = [];
        cloneSafeMoves = 0;
        return;
    }
    let passedTime = 90 - time;
    if (passedTime < cloneStartAfter) {
        cloneVisible = false;
        cloneSnake = [];
        cloneSafeMoves = 0;
        return;
    }
    let cycle = cloneShowTime + cloneHideTime;
    let step = (passedTime - cloneStartAfter) % cycle;

    if (step < cloneShowTime) {
        if (!cloneVisible) {
            cloneSafeMoves = 5; // 5 lượt di chuyển = 1 giây
        }
        cloneVisible = true;
    } else {
        cloneVisible = false;
        cloneSnake = [];
        cloneSafeMoves = 0;
    }
}

function updateCloneSnake() {
    if (!cloneVisible) {
        cloneSnake = [];
        return;
    }
    cloneSnake = [];
    for (let i = 0; i < snake.length; i++) {
        let delay = Math.max(cloneDelayStep, snake.length + 5);
        let index = snakeHistory.length - 1 - delay - i;
        if (index >= 0) {
            cloneSnake.push({
                x: snakeHistory[index].x,
                y: snakeHistory[index].y
            });
        }
    }
}

function checkCloneCollision() {
    if (!cloneVisible || cloneSnake.length === 0) {
        return false;
    }
    for (let i = 0; i < cloneSnake.length; i++) {
        if (snake[0].x === cloneSnake[i].x &&
            snake[0].y === cloneSnake[i].y) {
            return true;
        }
    }
    for (let i = 0; i < snake.length; i++) {
        if (cloneSnake[0].x === snake[i].x &&
            cloneSnake[0].y === snake[i].y) {
            return true;
        }
    }
    return false;
}

function randomEmptyCell(avoidX, avoidY) {
    let emptyCells = [];
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (!isWall(x, y) &&
                !onSnake(x, y) &&
                !onClone(x, y) &&
                !(x === avoidX && y === avoidY)) {

                emptyCells.push({x: x, y: y});
            }
        }
    }
    if (emptyCells.length === 0) {
        return {x: -1, y: -1};
    }
    let index = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[index];
}

function createFood() {
    food = randomEmptyCell(poisonFood.x, poisonFood.y);
}

function createPoisonFood() {
    poisonFood = randomEmptyCell(food.x, food.y);
}

function drawSnake() {
    for (let i = 0; i < cells.length; i++) {
        cells[i].classList.remove('snake', 'snake-head', 'up', 'down', 'left', 'right', 'poisoned');
    }

    for (let i = 0; i < snake.length; i++) {
        let index = snake[i].y * cols + snake[i].x;
        cells[index].classList.add('snake');
        if (reverseControl) cells[index].classList.add('poisoned');

        if (i === 0) {
            cells[index].classList.add('snake-head');
            if (dx === 1) cells[index].classList.add('right'); else if (dx === -1) cells[index].classList.add('left'); else if (dy === -1) cells[index].classList.add('up'); else cells[index].classList.add('down');
        }
    }
}

function drawCloneSnake() {
    for (let i = 0; i < cells.length; i++) {
        cells[i].classList.remove('clone-snake', 'clone-head');
    }
    if (!cloneVisible) {
        return;
    }
    for (let i = 0; i < cloneSnake.length; i++) {
        let index = cloneSnake[i].y * cols + cloneSnake[i].x;
        cells[index].classList.add('clone-snake');

        if (i === 0) {
            cells[index].classList.add('clone-head');
        }
    }
}

function drawFood() {
    for (let i = 0; i < cells.length; i++) {
        cells[i].classList.remove('food', 'poison');
        cells[i].textContent = '';
    }
    if (food.x >= 0) {
        let index = food.y * cols + food.x;
        cells[index].classList.add('food');
        cells[index].textContent = '🍎';
    }
    if (currentLevel === 3 && poisonFood.x >= 0) {
        let index = poisonFood.y * cols + poisonFood.x;
        cells[index].classList.add('poison');
        cells[index].textContent = '☠️';
    }
}

function drawGame() {
    drawSnake();
    drawCloneSnake();
    drawFood();
}

function resetGame() {
    clearTimeout(poisonTimer);
    reverseControl = false;
    poisonTimer = null;
    nextDirection = null;
    directionChanged = false;
    gameOver = false;
    dx = 1;
    dy = 0;
    score = 0;
    foodCount = 0;
    snake = [
        {x: 8, y: 5},
        {x: 7, y: 5},
        {x: 6, y: 5}
    ];
    cloneSnake = [];
    cloneVisible = false;
    cloneSafeMoves = 0;
    snakeHistory = [];
    food = {x: -1, y: -1};
    poisonFood = {x: -1, y: -1};
    time = 90;
    document.getElementById('time').textContent = '01:30';
    startTimer();
    document.getElementById('score').textContent = 0;
    document.getElementById('food-count').textContent = 0;
    document.getElementById('win-message').style.display = 'none';
    for (let i = snake.length - 1; i >= 0; i--) {
        snakeHistory.push({
            x: snake[i].x,
            y: snake[i].y
        });
    }
    createFood();
    if (currentLevel === 3) {
        createPoisonFood();
    }
    drawGame();
}

function checkBody(head, eatFood) {
    let length = snake.length;
    if (!eatFood) length--;
    for (let i = 0; i < length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) return true;
    }
    return false;
}

function wrapHorizontal(head) {
    if (head.x >= cols) head.x = 0;
    if (head.x < 0) head.x = cols - 1;
}

function wrapAll(head) {
    wrapHorizontal(head);
    if (head.y >= rows) head.y = 0;
    if (head.y < 0) head.y = rows - 1;
}

function eatPoison() {
    reverseControl = true;
    clearTimeout(poisonTimer);
    poisonTimer = setTimeout(function () {
        reverseControl = false;
        drawSnake();
    }, 3000);
}

function finishLevel() {
    gameOver = true;
    clearInterval(timeInterval);
    document.getElementById('win-text').textContent = 'Bạn đã hoàn thành Level ' + currentLevel;
    document.getElementById('final-score').textContent = score;
    document.getElementById('win-message').style.display = 'block';
}

function moveSnake() {
    if (gameOver) return;

    let head = {x: snake[0].x + dx, y: snake[0].y + dy};
    if (currentLevel === 1) {
        wrapAll(head);
    } else if (currentLevel === 2) {
        if (head.x <= 0 || head.x >= cols - 1 || head.y <= 0 || head.y >= rows - 1) {
            resetGame();
            return;
        }
    } else if (currentLevel === 3) {
        wrapHorizontal(head);
        if (head.y <= 0 || head.y >= rows - 1) {
            resetGame();
            return;
        }
    } else if (currentLevel === 4) {
        wrapHorizontal(head);
        if (head.y <= 0 || head.y >= rows - 1) {
            resetGame();
            return;
        }
    } else {
        wrapAll(head);
    }

    let eatFood = head.x === food.x && head.y === food.y;
    let eatPoisonFood = currentLevel === 3 && head.x === poisonFood.x && head.y === poisonFood.y;

    if (checkBody(head, eatFood)) {
        resetGame();
        return;
    }

    snake.unshift(head);
    if (eatFood) {
        score += 10;
        foodCount++;
        document.getElementById('score').textContent = score;
        document.getElementById('food-count').textContent = foodCount;
    } else {
        snake.pop();
    }
    snakeHistory.push({
        x: snake[0].x,
        y: snake[0].y
    });

    if (snakeHistory.length > 200) {
        snakeHistory.shift();
    }

    updateCloneState();
    updateCloneSnake();

    if (cloneSafeMoves > 0) {
        cloneSafeMoves--;
    } else if (checkCloneCollision()) {
        resetGame();
        return;
    }
    if (eatPoisonFood) {
        eatPoison();
        createPoisonFood();
    }
    if (eatFood && foodCount < 5) createFood();
    drawGame();

    if (foodCount >= 5) {
        finishLevel();
        return;
    }

    directionChanged = false;
    if (nextDirection !== null) {
        if (nextDirection.x !== -dx || nextDirection.y !== -dy) {
            dx = nextDirection.x;
            dy = nextDirection.y;
            directionChanged = true;
        }
        nextDirection = null;
    }
}

document.addEventListener('keydown', function (event) {
    let newDx = 0;
    let newDy = 0;
    if (event.key === 'ArrowUp') {
        newDy = -1;
    } else if (event.key === 'ArrowDown') {
        newDy = 1;
    } else if (event.key === 'ArrowLeft') {
        newDx = -1;
    } else if (event.key === 'ArrowRight') {
        newDx = 1;
    } else {
        return;
    }

    event.preventDefault();
    if (gameOver) return;
    if (currentLevel === 3 && reverseControl) {
        newDx = -newDx;
        newDy = -newDy;
    }
    if (directionChanged) {
        nextDirection = {x: newDx, y: newDy};
        return;
    }
    if (newDx === -dx && newDy === -dy) return;

    dx = newDx;
    dy = newDy;
    directionChanged = true;
});

function nextLevel() {
    if (currentLevel < 6) changeLevel(currentLevel + 1); else changeLevel(1);
}

let savedLevel = Number(localStorage.getItem('currentLevel'));
if (savedLevel >= 1 && savedLevel <= 6) changeLevel(savedLevel); else changeLevel(1);

setInterval(moveSnake, 200);