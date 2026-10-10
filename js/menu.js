import { createBoard } from "./game/board.js";
import {drawSnake} from "./game/snake.js";
const menuItems = document.querySelectorAll('.menu__item');

let selectedIndex = 0;

function updateMenu() {
    menuItems.forEach((item, index) => {
        item.classList.toggle("active", index === selectedIndex);
    });
}

document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
        selectedIndex++;

        if (selectedIndex >= menuItems.length) {
            selectedIndex = 0;
        }
        updateMenu();
    }

    if (event.key === "ArrowUp") {
        selectedIndex--;
        if (selectedIndex < 0) {
            selectedIndex = menuItems.length - 1;
        }
        updateMenu();
    }

    if (event.key === "Enter") {
        selectMenu(menuItems[selectedIndex]);
    }
});

menuItems.forEach((item, index) => {
    item.addEventListener("click", () => {
        selectedIndex = index;
        updateMenu();
        selectMenu(item);
    });
})

function selectMenu(item) {
    const action = item.dataset.action;

    switch (action) {
        case "start":
            document.getElementById("mainMenu").hidden = true;
            document.getElementById("gameScreen").hidden = false;

            createBoard();
            drawSnake();
            break;

        case "level":
            document.getElementById("mainMenu").hidden = true;
            document.getElementById("levelMenu").hidden = false;
            break;

        case "score":
            console.log("HIGH SCORE");
            break;

        case "help":
            console.log("HOW TO PLAY");
            break;
    }
}
