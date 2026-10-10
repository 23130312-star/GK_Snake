export const level1 = {
    id: 1,
    name: "LEVEL 1",
    speed: 200,
    foodTarget: 5,

    handleWall(x, y, cols, rows) {
        return {
            x: (x + cols) % cols,
            y: (y + rows) % rows
        };
    },

    checkCollision(snake, newHead, ateFood) {
        const body = ateFood
            ? snake
            : snake.slice(0, -1);

        return body.some(part =>
            part.x === newHead.x &&
            part.y === newHead.y
        );
    }
};