// create an object for the map array and a function that gets a tile at certain coordinates
var map = {
    tiles: [],
    tileAt: (x, y) => map.tiles[y][x]
}

// function that scans the simplified map and makes a 2d array of tile names
function generateMap() {
    // map rgb values to tile names
    var colorMap = {
        "0,0,255": "water",
        "0,255,0": "empty grass",
        "0,170,0": "short grass",
        "0,153,0": "long grass",
        "0,119,0": "leafy grass",
        "255,0,255": "flowers1",
        "255,119,255": "flowers2",
        "119,119,119": "stone",
        "153,85,17": "dirt"
    }

    // create invisible canvas for the simplified map image
    var canvas = document.createElement("canvas");
    canvas.width = images.simpleMap.width;
    canvas.height = images.simpleMap.height;
    var ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(images.simpleMap, 0, 0);

    // get the image data from the canvas
    for (var i = 0; i < images.simpleMap.height; i++) {
        map.tiles[i] = [];
        for (var j = 0; j < images.simpleMap.width; j++) {
            pixel = ctx.getImageData(j, i, 1, 1).data.toString().slice(0, -4);
            map.tiles[i].push(colorMap[pixel]);
        }
    }

    // add flowers and short grass in random places
    map.tiles.forEach((row, y) => {
        row.forEach((tile, x) => {
            if (["empty grass", "short grass", "long grass"].includes(tile)) {
                if (Math.random() < 0.2) {
                    map.tiles[y][x] = [...Array(10).fill("short grass"), "flowers1", "flowers2"][Math.floor(Math.random() * 12)];
                }
            }
        });
    });

    // add chests and other items in set places
    var itemLocations = {
        "apple": { x: 90, y: 47 },
        "empty": { x: 32, y: 88 },
        "hammer": { x: 61, y: 20 },
        "crate": { x: 91, y: 88 },
        "note chest": { x: 32, y: 47 },
        "money": { x: 50, y: 112 },
    }

    for (item in itemLocations) {
        map.tiles[itemLocations[item].y][itemLocations[item].x] = item;
    }
}

// function that renders the map to the canvas
var tiles = {
    "water": { x: 0, y: 32 },
    "empty grass": { x: 0, y: 0 },
    "short grass": { x: 16, y: 0 },
    "long grass": { x: 32, y: 0 },
    "leafy grass": { x: 32, y: 16 },
    "flowers1": { x: 0, y: 16 },
    "flowers2": { x: 16, y: 16 },
    "stone": { x: 32, y: 32 },
    "dirt": { x: 16, y: 32 },
    "apple": { x: 0, y: 0 },
    "empty": { x: 32, y: 16 },
    "hammer": { x: 16, y: 0 },
    "crate": { x: 16, y: 16 },
    "note chest": { x: 32, y: 16 },
    "money": { x: 0, y: 32 },
    "key": { x: 32, y: 0 },
    "note": { x: 0, y: 16 },
}

function renderMap() {
    map.tiles.forEach((row, y) => {
        row.forEach((tile, x) => {
            function drawTile(offsetX, offsetY) {
                ctx.drawImage(images.groundTiles, offsetX, offsetY, 16, 16, x * displaySize - map.offsetX, y * displaySize - map.offsetY, displaySize, displaySize);
            }

            function drawItem(offsetX, offsetY) {
                var tileToLeft = map.tileAt(x - 1, y);
                ctx.drawImage(images.groundTiles, tiles[tileToLeft].x, tiles[tileToLeft].y, 16, 16, x * displaySize - map.offsetX, y * displaySize - map.offsetY, displaySize, displaySize);
                ctx.drawImage(images.items, offsetX, offsetY, 16, 16, x * displaySize - map.offsetX, y * displaySize - map.offsetY, displaySize, displaySize);
            }

            switch (tile) {
                case "water":
                case "empty grass":
                case "short grass":
                case "long grass":
                case "leafy grass":
                case "flowers1":
                case "flowers2":
                case "stone":
                case "dirt":
                    drawTile(tiles[tile].x, tiles[tile].y);
                    break;
                case "apple":
                case "empty":
                case "hammer":
                case "crate":
                case "note chest":
                case "money":
                    drawItem(tiles[tile].x, tiles[tile].y);
                    break;
            }
        });
    });
}