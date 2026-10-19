const board = document.getElementById("game-board");

let gameOver = false;
let directionChanged = false;
let nextDirection = null;
const cols = 16;
const rows = 10;
let currentLevel = 1;
let dx = 1;
let dy = 0;
let snake = [
    {x: 8, y: 5},
    {x: 7, y: 5},
    {x: 6, y: 5}
];
let food = {x: 0, y: 0};
let poisonFood = {x: -1, y: -1};
let reverseControl = false;
let poisonTimer = null;
let score = 0;
let foodCount = 0;

for (let i = 0; i < rows * cols; i++) {
    let cell = document.createElement("div");
    cell.classList.add("cell");
    board.appendChild(cell);
}

function changeLevel(level) {
    currentLevel = level;
    localStorage.setItem("currentLevel", level);
    document.getElementById("level-title").textContent = "Level: " + level;
    let description = document.getElementById("level-description");
    if (level === 1) {
        description.textContent = "Xuyên tường";
    } else if (level === 2) {
        description.textContent = "Đụng tường";
    } else if (level === 3) {
        description.textContent = "Chướng ngại vật";
    } else if (level === 4) {
        description.textContent = "Tăng tốc";
    } else if (level === 5) {
        description.textContent = "Thử thách thức ăn";
    } else if (level === 6) {
        description.textContent = "Thử thách cuối";
    }
    score = 0;
    foodCount = 0;

    let button = document.querySelectorAll(".level");
    for (let i = 0; i < button.length; i++) {
        button[i].classList.remove("active");
    }
    button[level - 1].classList.add("active");
    drawMap();
    resetGame();
}

function drawSnake() {
    let cells = document.querySelectorAll(".cell");
    for (let i = 0; i < cells.length; i++) {
        cells[i].classList.remove(
            "snake", "snake-head",
            "up", "down", "left", "right", "poisoned"
        );
    }
    for (let i = 0; i < snake.length; i++) {
        let x = snake[i].x;
        let y = snake[i].y;
        let index = y * cols + x;
        cells[index].classList.add("snake");
        if (reverseControl) {
            cells[index].classList.add("poisoned");
        }
        if (i === 0) {
            cells[index].classList.add("snake-head");

            if (dx === 1) {
                cells[index].classList.add("right");
            } else if (dx === -1) {
                cells[index].classList.add("left");
            } else if (dy === -1) {
                cells[index].classList.add("up");
            } else if (dy === 1) {
                cells[index].classList.add("down");
            }
        }
    }
}

function moveSnake() {
    if (gameOver) {
        return;
    }
    directionChanged = false;
    let head = {
        x: snake[0].x + dx,
        y: snake[0].y + dy
    };
    if (currentLevel === 1) {
        // Level 1: Xuyên tường
        if (head.x >= cols) {
            head.x = 0;
        }

        if (head.x < 0) {
            head.x = cols - 1;
        }

        if (head.y >= rows) {
            head.y = 0;
        }

        if (head.y < 0) {
            head.y = rows - 1;
        }
    }
    if (currentLevel === 2) {
        // Level 2: Đụng tường là thua
        if (head.x <= 0 || head.x >= cols - 1 ||
            head.y <= 0 || head.y >= rows - 1) {

            resetGame();
            return;
        }
    }
    if (currentLevel === 3) {
        if (head.x >= cols) {
            head.x = 0;
        }
        if (head.x < 0) {
            head.x = cols - 1;
        }
        if (head.y <= 0 || head.y >= rows - 1) {
            resetGame();
            return;
        }
    }

    let eatFood = false;
    if (head.x === food.x && head.y === food.y) {
        eatFood = true;
    }
    let eatPoisonFood = false;
    if (currentLevel === 3) {
        if (head.x === poisonFood.x &&
            head.y === poisonFood.y) {

            eatPoisonFood = true;
        }
    }
    // level 1 : dung than
    if (checkBody(head, eatFood)) {
        resetGame();
        return;
    }
    snake.unshift(head);
    if (eatFood) {
        score += 10;
        foodCount++;
        document.getElementById("score").textContent = score;
        document.getElementById("food-count").textContent = foodCount;
        if (foodCount >= 5) {
            gameOver = true;
            drawSnake();
            drawFood();
            document.getElementById("win-text").textContent =
                "Bạn đã hoàn thành Level " + currentLevel;
            document.getElementById("final-score").textContent = score;
            document.getElementById("win-message").style.display = "block";
            return;
        }
        createFood();
    } else {
        snake.pop();
    }
    if (eatPoisonFood) {
        eatPoison();
        createPoisonFood();
    }
    drawSnake();
    drawFood();
    if (currentLevel === 3) {
        drawPoisonFood();
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


document.addEventListener("keydown", function (event) {
    if (event.key.startsWith("Arrow")) {
        event.preventDefault();
    } else {
        return;
    }

    if (gameOver) {
        return;
    }

    let newDx = dx;
    let newDy = dy;

    if (event.key === "ArrowUp") {
        newDx = 0;
        newDy = -1;
    } else if (event.key === "ArrowDown") {
        newDx = 0;
        newDy = 1;
    } else if (event.key === "ArrowLeft") {
        newDx = -1;
        newDy = 0;
    } else if (event.key === "ArrowRight") {
        newDx = 1;
        newDy = 0;
    }

    if (currentLevel === 3 && reverseControl) {
        newDx = -newDx;
        newDy = -newDy;
    }
    if (directionChanged) {
        nextDirection = {x: newDx, y: newDy};
        return;
    }
    if (newDx === -dx && newDy === -dy) {
        return;
    }

    dx = newDx;
    dy = newDy;
    directionChanged = true;
});


function createFood() {
    let check = true;
    while (check) {
        food.x = Math.floor(Math.random() * cols);
        food.y = Math.floor(Math.random() * rows);
        check = false;
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === food.x && snake[i].y === food.y) {
                check = true;
                break;
            }
        }
        if (currentLevel === 2) {
            if (food.x === 0 || food.x === cols - 1 ||
                food.y === 0 || food.y === rows - 1) {
                check = true;
            }
        }
        if (currentLevel === 3) {
            let index = food.y * cols + food.x;
            let cells = document.querySelectorAll(".cell");
            if (cells[index].classList.contains("wall")) {
                check = true;
            }
            if (food.x === poisonFood.x &&
                food.y === poisonFood.y) {
                check = true;
            }
        }
    }
}

function createPoisonFood() {
    let check = true;
    while (check) {
        poisonFood.x = Math.floor(Math.random() * cols);
        poisonFood.y = Math.floor(Math.random() * rows);
        check = false;
        for (let i = 0; i < snake.length; i++) {
            if (poisonFood.x === snake[i].x &&
                poisonFood.y === snake[i].y) {
                check = true;
            }
        }
        if (poisonFood.x === food.x &&
            poisonFood.y === food.y) {
            check = true;
        }
        let index = poisonFood.y * cols + poisonFood.x;
        let cells = document.querySelectorAll(".cell");

        if (cells[index].classList.contains("wall")) {
            check = true;
        }
    }
}

function drawFood() {
    let cells = document.querySelectorAll(".cell");
    for (let i = 0; i < cells.length; i++) {
        cells[i].classList.remove("food");
        cells[i].textContent = "";
    }
    let index = food.y * cols + food.x;
    cells[index].classList.add("food");
    cells[index].textContent = "🍎";
}


function drawPoisonFood() {
    let cells = document.querySelectorAll(".cell");
    for (let i = 0; i < cells.length; i++) {
        if (cells[i].classList.contains("poison")) {
            cells[i].classList.remove("poison");
            cells[i].textContent = "";
        }
    }
    if (currentLevel === 3) {
        let index = poisonFood.y * cols + poisonFood.x;
        cells[index].classList.add("poison");
        cells[index].textContent = "☠️";
    }
}

function eatPoison() {
    reverseControl = true;
    drawSnake();
    clearTimeout(poisonTimer);
    poisonTimer = setTimeout(function() {
        reverseControl = false;
        drawSnake();
    }, 3000);
}

// Level 1:
function checkBody(head, eatFood) {
    let length = snake.length;
    if (!eatFood) {
        length -= 1;
    }
    for (let i = 0; i < length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            return true;
        }
    }
    return false;
}

function resetGame() {
    nextDirection = null;
    snake = [
        {x: 8, y: 5},
        {x: 7, y: 5},
        {x: 6, y: 5}
    ];

    dx = 1;
    dy = 0;
    score = 0;
    foodCount = 0;
    gameOver = false;
    directionChanged = false;

    document.getElementById("score").textContent = 0;
    document.getElementById("food-count").textContent = 0;
    clearTimeout(poisonTimer);
    reverseControl = false;
    let cells = document.querySelectorAll(".cell");
    for (let i = 0; i < cells.length; i++) {
        cells[i].classList.remove("poison");
    }
    poisonFood = {x: -1, y: -1};
    createFood();
    if (currentLevel === 3) {
        createPoisonFood();
    }
    drawSnake();
    drawFood();
    if (currentLevel === 3) {
        drawPoisonFood();
    }

}

function drawMap() {
    let cells = document.querySelectorAll(".cell");
    for (let i = 0; i < cells.length; i++) {
        cells[i].classList.remove("wall");
    }
    // Level 2: Tường bao quanh
    if (currentLevel === 2) {
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (x === 0 || x === cols - 1 || y === 0 || y === rows - 1) {
                    let index = y * cols + x;
                    cells[index].classList.add("wall");
                }
            }
        }
    }
    // Level 3: Tường bên trong
    if (currentLevel === 3) {
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (y === 0 || y === rows - 1) {
                    let index = y * cols + x;
                    cells[index].classList.add("wall");
                }
            }
        }
    }
}

function nextLevel() {
    document.getElementById("win-message").style.display = "none";

    if (currentLevel < 6) {
        changeLevel(currentLevel + 1);
    } else {
        changeLevel(1);
    }
}

let savedLevel = localStorage.getItem("currentLevel");

if (savedLevel !== null) {
    changeLevel(Number(savedLevel));
} else {
    changeLevel(1);
}
setInterval(moveSnake, 200);