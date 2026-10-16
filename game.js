const board = document.getElementById("game-board");

const cols = 16;
const rows = 10;

for (let i = 0; i < rows * cols; i++) {
    let cell = document.createElement("div");
    cell.classList.add("cell");
    board.appendChild(cell);
}