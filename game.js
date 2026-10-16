const board = document.getElementById("game-board");

const cols = 16;
const rows = 10;
let currentLevel = 1;
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
    document.getElementById("score").textContent = 0;
    document.getElementById("food-count").textContent = 0;

    let button= document.querySelectorAll(".level");
    for (let i = 0; i < button.length; i++) {
        button[i].classList.remove("active");
    }
    button[level - 1].classList.add("active");

}