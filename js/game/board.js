export const cols = 24;
export const rows = 16;
export const cells = [];

export function createBoard() {
    const gameBoard = document.getElementById("gameBoard");

    gameBoard.innerHTML = "";
    cells.length = 0;

    for (let i = 0; i < cols * rows; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");

        const row = Math.floor(i / cols);
        const col = i % cols;

        if ((row + col) % 2 === 1) {
            cell.classList.add("grass-dark");
        }

        gameBoard.appendChild(cell);
        cells.push(cell);
    }
}