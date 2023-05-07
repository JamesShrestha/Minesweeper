const fieldSize = 30;
const minefield = [];

let mouse = {
    x: undefined,
    y: undefined,
}

let canvas = document.querySelector("#minefield");
let ctx = canvas.getContext("2d");
canvas.height = 604;
canvas.width = 604;
let number = Math.floor(canvas.width / fieldSize);

let gameOver = false;

let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener('click', function (e) {
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
    let index = findIndex(mouse.x, mouse.y);
    if (!minefield[index].opened) {
        if (minefield[index].count === -1) {
            for (let i = 0; i < minefield.length; i++) {
                minefield[i].opened = true;
                minefield[i].marked = true;
            }
            gameOver = true;
            handleFields();
            ctx.fillStyle = 'black';
            ctx.font = '50px Arial';
            ctx.fillText('Game Over', Math.floor(number / 3) * fieldSize, Math.floor(number /2) * fieldSize);
        }
        else if (minefield[index].count === 0) {
            minefield[index].opened = true;
            minefield[index].marked = true;
            openZeros(index);
        }
        else {
            minefield[index].opened = true;
            minefield[index].marked = true;
            handleFields();
        }
    }
});
function openZeros(index) {
    let adj = minefield[index].neighbours;
    for (let i = 0; i < adj.length; i++) {
        if(!minefield[adj[i]].opened && !minefield[adj[i]].marked){
            minefield[adj[i]].opened = true;
            minefield[adj[i]].marked = true;
            if(minefield[adj[i]].count == 0){
                openZeros(adj[i]);
            }
        }
    }
    handleFields();
}
canvas.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
    let index = findIndex(mouse.x, mouse.y);
    if (!minefield[index].opened) {
        if (minefield[index].marked) {
            minefield[index].marked = false;
        }
        else {
            minefield[index].marked = true;
        }
    }
    handleFields();
});

function findIndex(x, y) {
    for (let i = 0; i < minefield.length; i++) {
        if (x < minefield[i].x + fieldSize &&
            x >= minefield[i].x &&
            y < minefield[i].y + fieldSize &&
            y >= minefield[i].y) {
            return i;
        }
    }
}

class Field {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = fieldSize;
        this.height = fieldSize;
        this.count = 0;
        this.neighbours = [];
        this.opened = false;
        this.marked = false;
    }
    draw() {
        ctx.strokeStyle = 'rgb(129,129,129)';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        if (this.opened && this.count !== -1 && this.marked) {
            let fontsize = Math.floor(fieldSize / 2);
            let xOffset = (fieldSize + fontsize) * 0.25;
            let yOffset = (fieldSize + fontsize) * 0.45;
            ctx.fillStyle = 'rgb(214,212,212)';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = 'black';
            ctx.font = fontsize + 'px Arial';
            ctx.fillText(this.count, this.x + xOffset, this.y + yOffset);
        }
        if (this.marked && !this.opened) {
            ctx.fillStyle = 'rgb(214,212,212)';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.beginPath();
            ctx.moveTo(this.x + fieldSize/4, this.y + fieldSize/4 - 2);
            ctx.lineTo(this.x + fieldSize/4, this.y + (3*fieldSize)/4);
            ctx.lineTo(this.x + (3*fieldSize)/4, this.y + fieldSize/2);
            ctx.lineTo(this.x + fieldSize/4, this.y+ fieldSize/4);
            ctx.fillStyle = 'rgb(110,95,95)';
            ctx.fill();
            ctx.lineWidth = 4;
            ctx.strokeStyle = 'rgb(71,60,60)';
            ctx.stroke();
        }
        if (!this.marked && !this.opened) {
            ctx.fillStyle = 'rgb(214,212,212)';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        if (this.count === -1 && this.opened && gameOver) {
            ctx.fillStyle = 'rgb(214,212,212)';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.beginPath();
            ctx.arc(this.x+fieldSize/2, this.y+fieldSize/2, fieldSize/4, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'rgb(129,129,129)';
            ctx.fill();
            ctx.lineWidth = 5;
            ctx.strokeStyle = 'rgb(90,90,90)';
            ctx.stroke();      
        }
    }
}

for (let y = 0; y < number; y++) {
    for (let x = 0; x < number; x++) {
        minefield.push(new Field(x * fieldSize + 2, y * fieldSize + 2));
    }
}


// random locations for the bombs
let bombNo = Math.floor(minefield.length / 5)
let bombs = []

while (bombs.length != bombNo) {
    let bombLoc = (Math.floor(Math.random() * 1000)) % minefield.length;
    if (!bombs.includes(bombLoc)) {
        bombs.push(bombLoc);
    }
}

function findNeighbours(fieldIndex) {
    let temp = {
        x: minefield[fieldIndex].x,
        y: minefield[fieldIndex].y,
    };
    for (let k = -fieldSize; k <= fieldSize; k += fieldSize) {
        for (let j = -fieldSize; j <= fieldSize; j += fieldSize) {
            for (let i = 0; i < minefield.length; i++) {
                if (k !== 0 || j !== 0) {
                    if (minefield[i].x === temp.x + k &&
                        minefield[i].y === temp.y + j) {
                        minefield[fieldIndex].neighbours.push(i);
                    }
                }
            }
        }
    }
}

for (let i = 0; i < bombs.length; i++) {
    let bombPos = bombs[i];
    minefield[bombPos].count = -1;
    findNeighbours(bombPos);
    let bombPosNeighbours = minefield[bombPos].neighbours;
    for (let i = 0; i < bombPosNeighbours.length; i++) {
        if (!bombs.includes(bombPosNeighbours[i])) {
            let index = bombPosNeighbours[i];
            minefield[index].count += 1;
        }
    }
}

for (let i = 0; i < minefield.length; i++) {
    if (minefield[i].count === 0) {
        findNeighbours(i);
    }
}
function handleFields() {
    for (let i = 0; i < minefield.length; i++) {
        minefield[i].draw();
    }
}
handleFields();