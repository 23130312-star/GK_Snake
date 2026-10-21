const board = document.getElementById('game-board');
const cols = 16;
const rows = 10;
const cells = [];
const GAME_TIME = 90;
const FOOD_TARGET = 5;
const ICE_STEPS = 3;
const SPEED_DURATION = 30;

let paused = false;
let time = GAME_TIME;
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
let poisonTicks = 0;
let runawayFoodStep = 0;
let iceTiles = [];
let arrowTiles = [];
let slideSteps = 0;
let speedTile = {x: -1, y: -1};
let speedTicks = 0;
let gameTick = 0;
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
        if (paused) return;
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

    let descriptions = [
        'Xuyên tường',
        'Đụng tường',
        'Trái độc',
        'Mồi chạy trốn',
        'Hỗn Loạn',
        'Sương mù'
    ];
    document.getElementById('level-description').textContent = descriptions[level - 1];

    let buttons = document.querySelectorAll('.level');
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('active');
    }
    buttons[level - 1].classList.add('active');

    drawMap();
    resetGame();
}

function isLevel6Wall(x, y) {
    let topWall = y === 0 && x !== 3 && x !== 12;
    let bottomWall = y === rows - 1 && x !== 3 && x !== 12;
    let leftWall = x === 0 && y !== 2 && y !== 7;
    let rightWall = x === cols - 1 && y !== 2 && y !== 7;
    let middleWall = y === 4 &&
        x >= 3 && x <= 12 &&
        x !== 7 && x !== 8;
    return topWall || bottomWall || leftWall || rightWall || middleWall;
}

function isWall(x, y) {
    if (currentLevel === 2) {
        return x === 0 || x === cols - 1 || y === 0 || y === rows - 1;
    }
    if (currentLevel >= 3 && currentLevel <= 5) {
        return y === 0 || y === rows - 1;
    }
    if (currentLevel === 6) {
        return isLevel6Wall(x, y);
    }
    return false;
}

function createSpecialTiles() {
    iceTiles = [];
    arrowTiles = [];
    speedTile = {x: -1, y: -1};
    if (currentLevel !== 5) return;
    let emptyCells = [];
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (!isWall(x, y) &&
                !onSnake(x, y) &&
                !(food.x === x && food.y === y)) {
                emptyCells.push({x: x, y: y});
            }
        }
    }
    let directions = [
        {dx: 0, dy: -1, icon: '↑'},
        {dx: 0, dy: 1, icon: '↓'},
        {dx: -1, dy: 0, icon: '←'},
        {dx: 1, dy: 0, icon: '→'}
    ];
    for (let i = 0; i < 3 && emptyCells.length > 0; i++) {
        let index = Math.floor(Math.random() * emptyCells.length);
        iceTiles.push(emptyCells.splice(index, 1)[0]);
    }
    directions.sort(() => Math.random() - 0.5);
    for (let direction of directions) {
        let safeCells = emptyCells.filter(cell =>
            isSafeArrow(cell.x, cell.y, direction)
        );
        if (safeCells.length === 0) continue;

        let position = safeCells[Math.floor(Math.random() * safeCells.length)];
        let index = emptyCells.findIndex(cell =>
            cell.x === position.x && cell.y === position.y
        );
        emptyCells.splice(index, 1);
        arrowTiles.push({
            x: position.x,
            y: position.y,
            dx: direction.dx,
            dy: direction.dy,
            icon: direction.icon
        });
    }
    if (emptyCells.length > 0) {
        let index = Math.floor(Math.random() * emptyCells.length);
        speedTile = emptyCells.splice(index, 1)[0];
    }
}

function isSpecialTile(x, y) {
    if (currentLevel !== 5) return false;
    if (speedTile.x === x && speedTile.y === y) return true;
    for (let i = 0; i < iceTiles.length; i++) {
        if (iceTiles[i].x === x && iceTiles[i].y === y) {
            return true;
        }
    }
    for (let i = 0; i < arrowTiles.length; i++) {
        if (arrowTiles[i].x === x && arrowTiles[i].y === y) {
            return true;
        }
    }
    return false;
}

function drawSpecialTiles() {
    for (let i = 0; i < cells.length; i++) {
        cells[i].classList.remove('ice-tile', 'arrow-tile', 'speed-tile');
    }
    if (currentLevel !== 5) return;
    for (let i = 0; i < iceTiles.length; i++) {
        let tile = iceTiles[i];
        let index = tile.y * cols + tile.x;
        cells[index].classList.add('ice-tile');
    }
    for (let i = 0; i < arrowTiles.length; i++) {
        let tile = arrowTiles[i];
        let index = tile.y * cols + tile.x;
        cells[index].classList.add('arrow-tile');
        cells[index].textContent = tile.icon;
    }
    if (speedTile.x >= 0) {
        let index = speedTile.y * cols + speedTile.x;
        cells[index].classList.add('speed-tile');
        cells[index].textContent = '⚡';
    }
}

function isSafeArrow(x, y, direction) {
    let nextX = x + direction.dx;
    let nextY = y + direction.dy;
    if (nextX < 0) nextX = cols - 1;
    if (nextX >= cols) nextX = 0;
    if (nextY <= 0 || nextY >= rows - 1) {
        return false;
    }
    if (onSnake(nextX, nextY)) {
        return false;
    }
    return true;
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

function moveRunawayFood() {
    if (currentLevel !== 4 || food.x < 0) return;

    let head = snake[0];
    let distance = Math.abs(head.x - food.x) + Math.abs(head.y - food.y);
    if (distance > 3) return;

    let directions = [
        {x: 0, y: -1},
        {x: 0, y: 1},
        {x: -1, y: 0},
        {x: 1, y: 0}
    ];

    let bestPositions = [];
    let maxDistance = distance;

    for (let i = 0; i < directions.length; i++) {
        let x = food.x + directions[i].x;
        let y = food.y + directions[i].y;

        if (x < 0 || x >= cols || y < 0 || y >= rows) continue;
        if (isWall(x, y) || onSnake(x, y)) continue;

        let newDistance = Math.abs(head.x - x) + Math.abs(head.y - y);
        if (newDistance > maxDistance) {
            maxDistance = newDistance;
            bestPositions = [{x: x, y: y}];
        } else if (newDistance === maxDistance && newDistance > distance) {
            bestPositions.push({x: x, y: y});
        }
    }

    if (bestPositions.length > 0) {
        let index = Math.floor(Math.random() * bestPositions.length);
        food = bestPositions[index];
    }
}

function randomEmptyCell(avoidX, avoidY) {
    let emptyCells = [];
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (!isWall(x, y) &&
                !isSpecialTile(x, y) &&
                !onSnake(x, y) &&
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
            if (dx === 1) cells[index].classList.add('right');
            else if (dx === -1) cells[index].classList.add('left');
            else if (dy === -1) cells[index].classList.add('up');
            else cells[index].classList.add('down');
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

function applyDarkLevel() {
    for (let i = 0; i < cells.length; i++) {
        cells[i].classList.remove('dark-hide', 'dark-light');
    }
    if (currentLevel !== 6) return;
    for (let i = 0; i < cells.length; i++) {
        cells[i].classList.add('dark-hide');
    }
    let head = snake[0];
    cells[head.y * cols + head.x].classList.remove('dark-hide');
    if (food.x >= 0) {
        cells[food.y * cols + food.x].classList.remove('dark-hide');
    }
}

function drawGame() {
    drawSnake();
    drawFood();
    drawSpecialTiles();
    applyDarkLevel();
}

function resetGame() {
    reverseControl = false;
    poisonTicks = 0;
    nextDirection = null;
    directionChanged = false;
    gameOver = false;
    dx = 1;
    dy = 0;
    score = 0;
    foodCount = 0;
    paused = false;
    document.getElementById('pause-btn').textContent = 'Ⅱ';
    snake = [
        {x: 8, y: 5},
        {x: 7, y: 5},
        {x: 6, y: 5}
    ];
    runawayFoodStep = 0;
    food = {x: -1, y: -1};
    poisonFood = {x: -1, y: -1};
    time = GAME_TIME;
    document.getElementById('time').textContent = '01:30';
    startTimer();
    document.getElementById('score').textContent = 0;
    document.getElementById('food-count').textContent = 0;
    document.getElementById('win-message').style.display = 'none';
    iceTiles = [];
    arrowTiles = [];
    slideSteps = 0;
    speedTicks = 0;
    gameTick = 0;
    speedTile = {x: -1, y: -1};
    createFood();
    createSpecialTiles();
    if (currentLevel === 3) {
        createPoisonFood();
    }
    drawGame();
}

function checkBody(head, eatFood) {
    let length = eatFood ? snake.length : snake.length - 1;
    for (let i = 0; i < length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            return true;
        }
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
    poisonTicks = 30;
}

function finishLevel() {
    gameOver = true;
    clearInterval(timeInterval);
    document.getElementById('win-text').textContent = 'Bạn đã hoàn thành Level ' + currentLevel;
    document.getElementById('final-score').textContent = score;
    document.getElementById('win-message').style.display = 'block';
}

function moveSnake() {
    if (gameOver || paused) return;
    let wasSliding = currentLevel === 5 && slideSteps > 0;
    let turnedByArrow = false;
    let head = {x: snake[0].x + dx, y: snake[0].y + dy};
    if (currentLevel === 1) {
        wrapAll(head);
    } else if (currentLevel === 2) {
        if (head.x <= 0 || head.x >= cols - 1 || head.y <= 0 || head.y >= rows - 1) {
            resetGame();
            return;
        }
    } else if (currentLevel >= 3 && currentLevel <= 5) {
        wrapHorizontal(head);
        if (head.y <= 0 || head.y >= rows - 1) {
            resetGame();
            return;
        }
    } else if (currentLevel === 6) {
        if (head.x < 0) head.x = cols - 1;
        if (head.x >= cols) head.x = 0;
        if (head.y < 0) head.y = rows - 1;
        if (head.y >= rows) head.y = 0;
        if (isWall(head.x, head.y)) {
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
    if (eatPoisonFood) {
        eatPoison();
        createPoisonFood();
    }
    if (currentLevel === 5 && head.x === speedTile.x && head.y === speedTile.y) {
        speedTicks = SPEED_DURATION; // Pauses when the game is paused.
        speedTile = {x: -1, y: -1};
    }
    if (foodCount >= FOOD_TARGET) {
        drawGame();
        finishLevel();
        return;
    }
    if (eatFood) {
        createFood();
        runawayFoodStep = 0;
        if (currentLevel === 5) {
            createSpecialTiles();
        }
    } else if (currentLevel === 4) {
        runawayFoodStep++;
        if (runawayFoodStep >= 3) {
            runawayFoodStep = 0;
            moveRunawayFood();
        }
    }
    if (currentLevel === 5) {
        if (wasSliding) {
            slideSteps--;
        }
        let onArrow = false;
        for (let i = 0; i < arrowTiles.length; i++) {
            let tile = arrowTiles[i];
            if (head.x === tile.x && head.y === tile.y) {
                onArrow = true;
                if (tile.dx !== -dx || tile.dy !== -dy) {
                    dx = tile.dx;
                    dy = tile.dy;
                    slideSteps = 0;
                    nextDirection = null;
                    turnedByArrow = true;
                }
                break;
            }
        }
        if (!onArrow && !wasSliding) {
            for (let i = 0; i < iceTiles.length; i++) {
                let tile = iceTiles[i];
                if (head.x === tile.x && head.y === tile.y) {
                    slideSteps = ICE_STEPS;
                    nextDirection = null;
                    break;
                }
            }
        }
    }
    drawGame();
    if (turnedByArrow) {
        directionChanged = false;
        return;
    }
    if (currentLevel === 5 && slideSteps > 0) {
        nextDirection = null;
        directionChanged = false;
        return;
    }
    directionChanged = false;
    if (nextDirection !== null) {
        if (nextDirection.x !== -dx ||
            nextDirection.y !== -dy) {
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
    if (gameOver || paused) return;
    if (currentLevel === 5 && slideSteps > 0) {
        return;
    }
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
document.getElementById('pause-btn').addEventListener('click', function () {
    if (gameOver) return;

    paused = !paused;
    this.textContent = paused ? '▶' : 'Ⅱ';
});
setInterval(function () {
    if (paused || gameOver) return;
    if (currentLevel !== 5) speedTicks = 0;

    if (poisonTicks > 0) {
        poisonTicks--;
        if (poisonTicks === 0) {
            reverseControl = false;
            drawSnake();
        }
    }
    gameTick++;
    let isFast = currentLevel === 5 && speedTicks > 0;
    if (isFast && speedTicks > 0) speedTicks--;
    if (isFast || gameTick % 2 === 0) moveSnake();
}, 100);
