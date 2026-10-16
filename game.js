const board = document.getElementById("game-board");

let gameOver = false;
let directionChanged = false;
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
let score = 0;
let foodCount = 0;

for (let i = 0; i < rows * cols; i++) {
    let cell = document.createElement("div");
    cell.classList.add("cell");
    board.appendChild(cell);
}

function changeLevel(level) {
    currentLevel = level;
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
    resetGame();
}

function drawSnake() {
    let cells = document.querySelectorAll(".cell");
    for (let i = 0; i < cells.length; i++) {
        cells[i].classList.remove("snake");
    }
    for (let i = 0; i < snake.length; i++) {
        let x = snake[i].x;
        let y = snake[i].y;
        let index = y * cols + x;
        cells[index].classList.add("snake");
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
    let eatFood = false;
    if (head.x === food.x && head.y === food.y) {
        eatFood = true;
    }
    // level 1 : dung than
    if (checkBody(head, eatFood)) {
        gameOver = true;
        alert("Game Over! Rắn đã đụng vào thân!")
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
            alert("Chúc mừng! Bạn đã hoàn thành Level 1!");
            return;
        }
        createFood();
    } else {
        snake.pop();
    }
    drawSnake();
    drawFood();
}


document.addEventListener("keydown", function (event) {
    if (event.key.startsWith("Arrow")) {
        event.preventDefault();
    }

    if (gameOver || directionChanged) {
        return;
    }

    if (event.key === "ArrowUp" && dy !== 1) {
        dx = 0;
        dy = -1;
        directionChanged = true;
    } else if (event.key === "ArrowDown" && dy !== -1) {
        dx = 0;
        dy = 1;
        directionChanged = true;
    } else if (event.key === "ArrowLeft" && dx !== 1) {
        dx = -1;
        dy = 0;
        directionChanged = true;
    } else if (event.key === "ArrowRight" && dx !== -1) {
        dx = 1;
        dy = 0;
        directionChanged = true;
    }
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

    createFood();
    drawSnake();
    drawFood();
}
resetGame();

setInterval(moveSnake, 300);