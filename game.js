const board = document.getElementById("game-board");

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
    snake.unshift(head);
    if (eatFood) {
        score += 10;
        foodCount++;
        document.getElementById("score").textContent = score;
        document.getElementById("food-count").textContent = foodCount;
        createFood();
    } else {
        snake.pop();
    }
    drawSnake();
    drawFood();
}

document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight") {
        event.preventDefault();
    }

    if (event.key === "ArrowUp" && dy !== 1) {
        dx = 0;
        dy = -1;
    } else if (event.key === "ArrowDown" && dy !== -1) {
        dx = 0;
        dy = 1;
    } else if (event.key === "ArrowLeft" && dx !== 1) {
        dx = -1;
        dy = 0;
    } else if (event.key === "ArrowRight" && dx !== -1) {
        dx = 1;
        dy = 0;
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

createFood();
drawSnake();
drawFood();

setInterval(moveSnake, 400);