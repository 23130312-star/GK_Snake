import {createBoard} from "./board.js";
import {drawSnake, moveSnake, changeDirection} from "./snake.js";
import {createFood, clearFood, food} from "./food.js";
import { level1 } from "/js/levels/level_1.js";

let gameLoop = null;
let score = 0;
let foodCount = 0;

export function startGame() {
    clearInterval(gameLoop);

    score = 0;
    foodCount = 0;

    createBoard();
    drawSnake();
    createFood();
    updateHUD();

    document.getElementById("gameMessage").textContent = "";

    gameLoop = setInterval(() => {

        const result = moveSnake(food, level1);

        if (result.gameOver) {
            clearInterval(gameLoop);
            gameLoop = null;

            document.getElementById("gameMessage").textContent = "GAME OVER!";
            return;
        }

        if (result.ateFood) {
            score += 10;
            foodCount++;

            updateHUD();

            if (foodCount >= level1.foodTarget) {
                clearInterval(gameLoop);
                gameLoop = null;

                clearFood();

                document.getElementById("gameMessage").textContent =
                    "LEVEL 1 COMPLETED!";
                return;
            }

            clearFood();
            createFood();
        }

    }, level1.speed);
}

document.addEventListener("keydown", (event) => {
    if (document.getElementById("gameScreen").hidden) {
        return;
    }

    const key = event.key.toLowerCase();

    switch (key) {
        case "arrowup":
        case "w":
            changeDirection(0, -1);
            break;

        case "arrowdown":
        case "s":
            changeDirection(0, 1);
            break;

        case "arrowleft":
        case "a":
            changeDirection(-1, 0);
            break;

        case "arrowright":
        case "d":
            changeDirection(1, 0);
            break;
    }
});

function updateHUD() {
    document.getElementById("score").textContent = score;
    document.getElementById("foodCount").textContent = foodCount;
}