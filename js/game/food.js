import {cols, rows, cells} from "./board.js";
import {snake} from "./snake.js";

export let food = null;

export function createFood() {
    const emptyCells = [];

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {

            const occupied = snake.some(part =>
                part.x === x && part.y === y
            );

            if (!occupied) {
                emptyCells.push({x, y});
            }
        }
    }

    if (emptyCells.length === 0) {
        food = null;
        return;
    }

    const randomIndex = Math.floor(Math.random() * emptyCells.length);

    food = emptyCells[randomIndex];

    const index = food.y * cols + food.x;
    cells[index].classList.add("food");
}

export function clearFood() {
    cells.forEach(cell => {
        cell.classList.remove("food");
    });
}