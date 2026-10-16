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
    resetGame();
    drawMap();
}

function drawSnake() {
    let cells = document.querySelectorAll(".cell");
    for (let i = 0; i < cells.length; i++) {
        cells[i].classList.remove(
            "snake", "snake-head",
            "up", "down", "left", "right"
        );
    }
    for (let i = 0; i < snake.length; i++) {
        let x = snake[i].x;
        let y = snake[i].y;
        let index = y * cols + x;
        cells[index].classList.add("snake");
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
    } else if (currentLevel === 2) {
        // Level 2: Đụng tường là thua
        if (head.x <= 0 || head.x >= cols - 1 ||
            head.y <= 0 || head.y >= rows - 1) {

            resetGame();
            return;
        }
    }
    let eatFood = false;
    if (head.x === food.x && head.y === food.y) {
        eatFood = true;
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
        if (currentLevel === 2) {
            if (food.x === 0 || food.x === cols - 1 ||
                food.y === 0 || food.y === rows - 1) {
                check = true;
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

function drawMap() {
    let cells = document.querySelectorAll(".cell");
    for (let i = 0; i < cells.length; i++) {
        cells[i].classList.remove("wall");
    }
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
setInterval(moveSnake, 300);