const size = 20;
const cells = [];

function createBoard() {
    const gameBoard = document.getElementById("gameBoard");
    gameBoard.innerHTML = "";
    cells.length = 0;
    for (let i = 0; i < size; i++) {
        const cell = document.createElement("div");
        cell.classList.add("board");
        gameBoard.appendChild(cell);
        cells.push(cell);
    }
}