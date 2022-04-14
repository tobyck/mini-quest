// set up the canvas
var canvas = document.getElementById("gameCanvas");
canvas.width = canvas.height = innerHeight - 120;
var ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
var displaySize = 55;

// create an object of all images required
var filenames = ["simpleMap.png", "player.png", "groundTiles.png", "items.png"].map(name => "img/" + name),
    promises = [],
    images = {};

for (var i = 0; i < filenames.length; i++) {
    promises.push(new Promise(resolve => {
        var img = new Image();
        img.src = filenames[i];
        img.onload = () => {
            resolve(img);
        };
    }));
}

Promise.all(promises).then(imagesFromPromise => {
    imagesFromPromise.forEach((image, index) => images[filenames[index].slice(4).split(".")[0]] = image);

    map.offsetX = (images.simpleMap.width * displaySize) / 2 - (canvas.width / 2);
    map.offsetY = (images.simpleMap.height * displaySize) / 2 - (canvas.height / 2);

    generateMap();
    renderMap();
    move();
});

// main game mechanics
var inventory = [],
    visitedNote = false,
    messageOpen = true,
    code = Math.floor(Math.random() * (999 - 100 + 1) + 100);

var messageEl = document.getElementById("messageText"),
    messageContainer = document.getElementById("messageContainer"),
    nextButton = document.getElementById("nextButton");

document.getElementById("messageContainer").style.width = canvas.width + "px";
document.getElementById("inventoryContainer").style.width = canvas.width + "px";
document.getElementById("messageContainer").style.height = canvas.height + "px";
document.getElementById("inventoryContainer").style.height = canvas.height + "px";
messageEl.style.width = innerHeight - 300 + "px";

function removeItem(item) {
    map.tiles.forEach((row, y) => {
        row.forEach((tile, x) => {
            if (tile == item) {
                map.tiles[y][x] = map.tileAt(x - 1, y);
            }
        });
    });
}

function showMessage(messages, end = false) {
    var index = 0;
    messageEl.innerText = messages[index];
    messageContainer.hidden = false;
    messageOpen = true;
    nextButton.onclick = () => {
        index++;
        if (index > messages.length - 1) {
            if (!end) {
                messageContainer.hidden = true;
                messageOpen = false;
            } else {
                messageEl.innerHTML = "Thanks for playing!<br><br>Click <a onclick='location.reload()' href='#'>here</a> to play again, or <a href='https://github.com/tobyck/mini-quest'>here</a> to see the code.";
                nextButton.hidden = true;
            }
        } else {
            messageEl.innerText = messages[index];
        }
    }
}

document.addEventListener("click", event => {
    messageEl.style.width = innerHeight - 400 + "px";
    var rect = canvas.getBoundingClientRect();
    var mouseRelativeToCanvas = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };

    var tileClicked = map.tileAt(
        Math.floor((mouseRelativeToCanvas.x + map.offsetX) / displaySize), 
        Math.floor((mouseRelativeToCanvas.y + map.offsetY) / displaySize)
    );

    switch (tileClicked) {
        case "apple":
            inventory.push("apple");
            removeItem("apple");
            showMessage(["An apple! This should keep me going for the rest of the journey."]);
            break;
        case  "empty":
            showMessage(["Ugh, nothing in here."]);
            break;
        case "hammer":
            inventory.push("hammer");
            removeItem("hammer");
            showMessage(["A hammer! Surely this will come in handy..."]);
            break;
        case "crate":
            if (inventory.includes("hammer")) {
                showMessage([
                    "A crate! I can use my hammer to break it open.", 
                    "Wow, a key. I wonder what it opens..."
                ]);
                inventory.push("key");
                removeItem("crate");
            } else {
                showMessage(["A crate! If only I had a hammer to break it open with..."]);
            }
            break;
        case "note chest":
            if (!visitedNote) {
                if (inventory.includes("key")) {
                    inventory.push("note");
                    visitedNote = true;
                    showMessage([
                        "A chest! I wonder if the key I found earlier will open it.",
                        "It does! Ooh, there's a note. It says that the code is " + code + ".",
                        "But what's the code for? I'd better keep exploring..."
                    ]);
                } else {
                    showMessage(["A chest! There must be a key around here somewhere..."]);
                }
            } else {
                showMessage(["Oh, that's right, I've already been here."]);
            }
            break;
        case "money":
            if (inventory.includes("note")) {
                showMessage([
                    "A chest! Could the code on the note unlock it?",
                    "It worked, aweso - hold on, there's $50,000!"
                ], true);
            } else {
                showMessage(["Ooh, a chest. Oh, it's locked with a code."]);
            }
    }
});

document.addEventListener("keyup", event => {
    if (event.code == "KeyE" && !messageOpen) {
        document.getElementById("inventoryContainer").hidden = !document.getElementById("inventoryContainer").hidden;
        var invCanvas = document.getElementById("inventoryCanvas")
        invCanvas.width = (displaySize + 10) * inventory.length + 8;
        var invCtx = invCanvas.getContext("2d");
        invCtx.imageSmoothingEnabled = false;
        invCtx.clearRect(0, 0, innerHeight - 300, innerHeight - 300);
        document.getElementById("emptyInventory").hidden = true;
        if (inventory.length > 0) {
            inventory.forEach((item, index) => {
                invCtx.lineWidth = 4;
                invCtx.strokeRect(index * (displaySize + 10) + 4, 4, displaySize + 10, displaySize + 10);
                invCtx.drawImage(images.items, tiles[item].x, tiles[item].y, 16, 16, index * (displaySize + 10) + 9, 9, displaySize, displaySize);
            });
        } else {
            document.getElementById("emptyInventory").hidden = false;
        }
    }
});

showMessage(["Welcome to Mini Quest!\n\nUse WASD to move and E to see your inventory. Explore the map and when you find an item, for example a chest, click on it.\n\nHave fun!"]);