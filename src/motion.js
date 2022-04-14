// create an object that stores data relating to the player
var player = {
    moving: false,
    speed: 3.5,
    col: 0,
    row: 0,
    get x() { return Math.floor((map.offsetX / displaySize) + (canvas.width / 2 / displaySize)); },
    get y() { return Math.floor((map.offsetY / displaySize) + (canvas.height / 2 / displaySize)); },
};

// keep track of the keys that are currently pressed
var keys = [];

document.addEventListener("keydown", event => {
    if ([..."wasd".split(""), "up", "down", "left", "right"].includes(event.code.replace(/[A-Z][^A-Z]+/, "").toLowerCase()) && !event.metaKey) {
        keys.push(event.code)
        player.moving = true;
    } 
});

document.addEventListener("keyup", event => {
    keys = keys.filter(key => key != event.code);
    if (keys.length == 0) {
        player.moving = false;
    }
});

// function to move the map and animate the player
var frames = 0;
function move() {
    if (!messageOpen && document.getElementById("inventoryContainer").hidden) {
        // update x and y
        if (keys.filter(key => ["KeyW", "ArrowUp"].includes(key)).length && map.tileAt(player.x, player.y - 1) != "water") {
            map.offsetY -= player.speed;
            player.row = 1;
        } else if (keys.filter(key => ["KeyS", "ArrowDown"].includes(key)).length && map.tileAt(player.x, player.y + 1) != "water") {
            map.offsetY += player.speed;
            player.row = 0;
        } if (keys.filter(key => ["KeyA", "ArrowLeft"].includes(key)).length && map.tileAt(player.x - 1, player.y) != "water") {
            map.offsetX -= player.speed;
            player.row = 2;
        } else if (keys.filter(key => ["KeyD", "ArrowRight"].includes(key)).length && map.tileAt(player.x + 1, player.y) != "water") {
            map.offsetX += player.speed;
            player.row = 3;
        }

        // render the mwap
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderMap();

        // render the player
        if (player.moving) {
            ctx.drawImage(images.player, player.col * 16, player.row * 16, 16, 16, canvas.width / 2 - (displaySize / 2), canvas.height / 2 - (displaySize / 2), displaySize, displaySize);
            if (frames % 14 == 0) {
                player.col++;
                player.col %= 4;
            }
        } else {
            ctx.drawImage(images.player, 0, player.row * 16, 16, 16, canvas.width / 2 - (displaySize / 2), canvas.height / 2 - (displaySize / 2), displaySize, displaySize);
        }

        frames++;
    }
    requestAnimationFrame(move);
}