import {cols, rows, cells} from "./board.js";

export let snake = [
    {x: 12, y: 8},
    {x: 11, y: 8},
    {x: 10, y: 8}
];
let direction = {x: 1, y: 0};
let nextDirection = {x: 1, y: 0};

export function drawSnake() {
    snake.forEach(part => {
        const index = part.y * cols + part.x;
        cells[index].classList.add("snake");
    });
}

export function clearSnake() {
    cells.forEach(cell => {
        cell.classList.remove("snake");
    });
}

export function moveSnake(food, level) {
    direction = nextDirection;
    const head = snake[0];
    const newX = head.x + direction.x;
    const newY = head.y + direction.y;

    const newHead = level.handleWall(newX, newY, cols, rows);
    const ateFood = food !== null &&
        newHead.x === food.x &&
        newHead.y === food.y;

    if (level.checkCollision(snake, newHead, ateFood)) {
        return {
            gameOver: true,
            ateFood: false
        };
    }

    snake.unshift(newHead);
    if (!ateFood) {
        snake.pop();
    }
    clearSnake();
    drawSnake();
    return {
        gameOver: false,
        ateFood
    };
}

export function changeDirection(x, y) {
    //ko cho quay dau
    if (x === -direction.x && y === -direction.y) {
        return;
    }

    nextDirection = {x, y};
}