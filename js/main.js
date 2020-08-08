/*----- Classes -----*/
class Ship {
    constructor(posX, posY, dirX, dirY) {
        this.pos = [];
        this.dirX = dirX;
        this.dirY = dirY;
        for (let i = 0; i <= dirX + dirY; i++) {
            this.pos.push([posX + (dirX === 0 ? 0 : i), posY + (dirY === 0 ? 0 : i)]);
        }
    }
}
class Player {
    constructor(playerBoard, shipBoard) {
        this.playerBoard = playerBoard; // Stores hits and misses
        this.shipBoard = shipBoard; // Stores ship positions
    }
}
/*----- constants -----*/
const game = {
    boardSize: 10,
    hit: '#fff',
    miss: '#fff',
    water: '#fff',
    shipAmount: 4, // Total ships
    '0': 5, // Destroyer size
    '1': 4, // Submarine size
    '2': 3, // Cruiser size
    '3': 3, // Battleship size
    '4': 2 // Carrier size
}
/*----- app's state (variables) -----*/
let player;
let computer;
let turn;
let greatMoves = []; // Stores "great moves" for computer
let allPositions; // Stores all positions for computer
let count = 0;
let tempBoard = [];
let direction = 1;
let nodeArray = [];
let color = 'green';
/*----- cached element references -----*/
const gridEl = document.querySelectorAll('tr.grid-parent');
const gridContainerEl = document.querySelector('.grid-container');
const playerBoardEls = document.querySelectorAll('tr.ship-parent');
/*----- event listeners -----*/
gridContainerEl.addEventListener('click', handleClick);
gridContainerEl.addEventListener('mouseover', handleMouseOver);
gridContainerEl.addEventListener('mouseout', handleMouseOut);
document.querySelector('button').addEventListener('click', (e) => direction === 1 ? direction = 0 : direction = 1);
/*----- functions -----*/
init();

function handleMouseOver(e) {
    //TODO render where ship will be placed 
    if (e.target.id === '' || player.shipBoard.length >= 5) return;
    const posArr = e.target.id.split(',');
    const posX = parseInt(posArr[0]);
    const posY = parseInt(posArr[1]);
    for (let i = 0; i < game[player.shipBoard.length]; i++) {
        let posXOff = posX + (direction === 0 ? i : 0)
        let posYOff = posY + (direction === 1 ? i : 0)
        tempBoard.push([posXOff, posYOff]);
        if (posXOff > 9 
        || posYOff > 9 
        || isShipInArray(player.shipBoard, tempBoard)) {
            color = 'red';
        } else {
            color = 'green';
        }
    }
    render();
}

function handleMouseOut(e) {
    if (e.target.id === '' || player.shipBoard.length >= 5) return;
    color = 'white';
    render();
    tempBoard = [];
}

function handleClick(e) {
    if (e.target.id === '') return;
    const posArr = e.target.id.split(',');
    const posX = parseInt(posArr[0]);
    const posY = parseInt(posArr[1]);
    if (player.shipBoard.length < 5) {
        if (isShipInArray(player.shipBoard, tempBoard)) return;
        if (posX + (direction === 0 ? game[player.shipBoard.length]-1 : 0) > 9 || posY + (direction === 1 ? game[player.shipBoard.length]-1 : 0) > 9) return;
        const ship = new Ship(posX, posY, (direction === 0 ? game[player.shipBoard.length]-1 : 0), (direction === 1 ? game[player.shipBoard.length]-1 : 0))
        player.shipBoard.push(ship);
        color = 'red';
        if (player.shipBoard.length >= 5) {
            tempBoard = [];
            handleNextMove();
        } else {
            tempBoard.pop();
        }
        render();
        return;
    }
    // CALLS WHEN GAME BEGINS
    if (turn === 1) {
        player.playerBoard.push([posX, posY]);
        handleNextMove();
    }
    render();
}

function handleNextMove() {
    // WAIT FOR PLAYER INPUT
    if (turn === 1 && player.playerBoard.length === 0 && computer.playerBoard.length === 0)
        return;
    turn = turn * -1;
    if (turn === -1) {
        //COMPUTER TURN
        let positions = (greatMoves.length > 0 ? greatMoves : allPositions);
        const min = 0;
        const max = positions.length-1;
        const posIndex = Math.floor(Math.random() * (max - min + 1) + min);
        let pos = positions[posIndex];
        computer.playerBoard.push(pos);
        handleGreatMoves(pos);
        allPositions = allPositions.filter(aPos => aPos.toString() !== pos.toString()); // must get index of to actually filter [8, 0] is not [8, 0] ????
        greatMoves = greatMoves.filter(gPos => gPos.toString() !== pos.toString());
        handleNextMove();
    } 
}

function handleGreatMoves(pos) { // 5,5 hit [ [5,6], [5,4], [6, 5], [4, 5] ] => 5,5 & 5,6 hit [ [5,7], [5,4] ] => 5,5 & 5,6 & 5,7 miss [ [5, 4] ] => 5,5 & 5,6 & 5,7 & 5,4 destroy
    // Keep moves random if no hit
    if (!isShipInPosArray(player.shipBoard, pos[0], pos[1]) && greatMoves.length === 0) return;

    // First index of 'hit' add initial great moves
    if (nodeArray.length === 0) {
        //greatMoves.push([pos[0]+1, pos[1]],[pos[0]-1, pos[1]],[pos[0], pos[1]+1],[pos[0], pos[1]-1]);
        addPosToArray(greatMoves, pos[0], pos[1], 1, 0);
        addPosToArray(greatMoves, pos[0], pos[1], -1, 0);
        addPosToArray(greatMoves, pos[0], pos[1], 0, 1);
        addPosToArray(greatMoves, pos[0], pos[1], 0, -1);
    }
    // Push current pos to nodeArray
    nodeArray.push(pos);

    // Once node has 2 items, begin comparasin
    if (nodeArray.length > 1) {
        const nodeDirX = nodeArray[nodeArray.length-1][0] - nodeArray[0][0];
        const nodeDirection = (nodeDirX === 0 ? 0 : 1);
        if (nodeDirection === 0) {
            nodeArray = nodeArray.sort((a,b) =>  a[1] - b[1]);
            greatMoves = [];
            addPosToArray(greatMoves, nodeArray[0][0], nodeArray[0][1], 0, -1)
            addPosToArray(greatMoves, nodeArray[nodeArray.length-1][0], nodeArray[nodeArray.length-1][1], 0, 1);
            if (greatMoves.length == 0 || nodeArray.length >= 6) 
                nodeArray = [];
        } else {
            nodeArray = nodeArray.sort((a,b) => a[0] - b[0]);
            greatMoves = [];
            addPosToArray(greatMoves, nodeArray[0][0], nodeArray[0][1], -1, 0)
            addPosToArray(greatMoves, nodeArray[nodeArray.length-1][0], nodeArray[nodeArray.length-1][1], 1, 0);
            if (greatMoves.length == 0 || nodeArray.length >= 6) 
                nodeArray = [];
        }
    }
}

function addPosToArray(arr, x, y, xOff, yOff) {
    if (isShipInPosArray(player.shipBoard, x, y) && x >= 0 && x <= 9 && y >= 0 && y <= 9 && !allPositions.every(pos => pos.toString() !== [x+xOff,y+yOff].toString()))
        arr.push([x+xOff,y+yOff]);
}

function init() {
    player = new Player([], []);
    createRandomBoard();
    turn = Math.floor(Math.random() * (2 - 1 + 1) + 1) === 1 ? 1 : -1;
    render();
}

function createRandomBoard() {
    const playerBoard = [];
    const shipBoard = [];
    const freePositions = [];

    // SET FREE POSITIONS TO EVERYTHING IN BOARD
    for (let x = 0; x < game.boardSize; x++) {
        for (let y = 0; y < game.boardSize; y++) {
            freePositions.push([x, y]);
        }
    }
    allPositions = [...freePositions];

    // CREATE A SHIP BOARD AT RANDOM WITH NO SHIPS COLLIDING
    findShipsPositions(freePositions, shipBoard);

    // MAKE COMPUTER INITIALIZED TO CREATED SHIP BOARD
    computer = new Player(playerBoard, shipBoard);
}

function findShipsPositions(freePositions, shipBoard) {
    const randomDirection = Math.floor(Math.random() * (1+1));
    const min = 0;
    const max = freePositions.length - 1;
    const randomIndex = Math.floor(Math.random() * (max - min + 1) + min);

    // CHECK IF RANDOM NUMBER CAN HOLD SHIP
    if (freePositions[randomIndex][randomDirection] > (10 - game[shipBoard.length])) {
        return findShipsPositions(freePositions, shipBoard);
    }

    // CHECK IF SHIPS ARE OVERLAPPING
    const freePos = freePositions[randomIndex];
    const posX = freePos[0];
    const posY = freePos[1];
    const xOff = randomDirection === 0 ? game[shipBoard.length]-1 : 0;
    const yOff = randomDirection === 1 ? game[shipBoard.length]-1 : 0;
    for (let i = 0 ; i < game.shipAmount; i++) {
        if (shipBoard[i] === undefined) break;
        for (let x = 0 ; x < game[shipBoard.length-1]; x++) {
            if (isShipInPos(shipBoard[i], posX + (xOff === 0 ? 0 : x), posY + (yOff === 0 ? 0 : x))) {
                return findShipsPositions(freePositions, shipBoard);
            }
        }
    }

    // SHIP HAS BEEN FOUND
    let ship = new Ship(posX, posY, xOff, yOff);
    shipBoard.push(ship);

    // REMOVE NOT FREE POSITIONS
    let filterArr = [];
    ship.pos.forEach((pos) => filterArr = freePositions.filter((elm) => pos[0] !== elm[0] && pos[1] !== elm[1]))
    freePositions = filterArr;

    // IF ALL SHIPS AREN'T FOUND, RUN AGAIN
    if (shipBoard.length-1 < game.shipAmount)
        return findShipsPositions(freePositions, shipBoard);
}

// CHECK IF SHIP COLLIDES WITH OTHER SHIPS IN BOARD
function isShipInShip(ship, shipBoard) {
    let inPos = false;
    shipBoard.filter((elm) => ship !== elm);
    shipBoard.forEach(function(s2) {
        s2.pos.forEach(function(pos) {
            if (isShipInPos(ship, pos[0], pos[1])) 
                inPos = true;
        });
    });
    return inPos;
}

function isShipInArray(shipArr, posArr) {
    let inPos = false;
    shipArr.forEach(function(ship) {
        posArr.forEach(function(pos) {
            if (isShipInPos(ship, pos[0], pos[1])) {
                inPos = true;
            }
        });
    });
    return inPos;
}

// CHECK IF ANY SHIP IN ARRAY COLLIDES WITH POSITION
function isShipInPosArray(shipArr, x, y) {
    let inPos = false;
    shipArr.forEach(function(ship) {
        if (isShipInPos(ship, x, y))
            inPos = true;
    });
    return inPos;
}

// CHECK IF SHIP COLLIDES WITH POSITION
function isShipInPos(ship, x, y) {
    return ship.pos.some((pos) => (pos[0] === x) && (pos[1] === y));
}

function render() { // gridEl[Y].children[X]
    if (player.playerBoard.length === 0 && computer.playerBoard.length === 0) {
        renderShipBoard(player.shipBoard, 'white');
    }
    if (player.shipBoard.length < 5) {
        renderShipBoard(player.shipBoard, 'green');
        tempBoard.forEach(function(pos) {
            if (pos !== null) {
                const elmParent = gridEl[pos[0]];
                if (elmParent!== undefined) {
                    const elm = elmParent.children[pos[1]+1];
                    if (elm !== undefined)
                        elm.style.background = color;
                }
            }
        });
    }
    renderHits(player.playerBoard, computer.shipBoard);
    renderComputerHits(computer.playerBoard, player.shipBoard);
}

function getShipIndex(shipBoard, x, y) {
    let index = -1;
    shipBoard.forEach(function(ship, idx) {
        const mapBoard = ship.pos.map(pos => pos.toString());
        if (mapBoard.includes([x,y].toString())) {
            index = idx;
        }
    });
    return index;
}

function getPosIndex(ship, x, y) {
    const mapBoard = ship.pos.map(pos => pos.toString());
    return mapBoard.indexOf([x,y].toString());
}

function renderComputerHits(playerBoard, shipBoard) {
    playerBoard.forEach(function(pos) {
        if (isShipInPosArray(shipBoard, pos[0], pos[1])) {
            let shipIndex = getShipIndex(shipBoard, pos[0], pos[1]);
            let posIndex = getPosIndex(shipBoard[shipIndex], pos[0], pos[1]);
            const shipEl = playerBoardEls[shipIndex].children[posIndex];
            shipEl.style.background = 'red';
        }
    });
}

function renderHits(playerBoard, shipBoard) {
    playerBoard.forEach(pos => {
        const elm = gridEl[pos[0]].children[pos[1]+1];
        if (isShipInPosArray(shipBoard, pos[0], pos[1])) {
            elm.style.background = 'green';
        } else {
            elm.style.background = 'red';
        }
    });
}

function renderShipBoard(shipBoard, color) {
    shipBoard.forEach(function(ship) {
        ship.pos.forEach(function(pos) {
            const elm = gridEl[pos[0]].children[pos[1]+1];
            elm.style.background = color;
        });
    });
}

    // display ships with in-position
    // computer.shipBoard.forEach(function(ship) {
    //     for (let x = 0; x < game.boardSize; x++) {
    //         for (let y = 0; y < game.boardSize; y++) {
    //             if (isShipInPos(ship, x, y)) {
    //                 const elm = gridEl[y].children[x+1];
    //                 elm.style.background = 'green';
    //             }
    //         }
    //     }
    // });
    // display ships with ship arrays
    // computer.shipBoard.forEach(function(ship) {
    //     ship.pos.forEach(function(pos) {
    //         const elm = gridEl[pos[1]].children[pos[0]+1];
    //         elm.style.background = 'green';
    //     });
    // });

/*
PSEDO CODE

const variables:
    colors! hit colors, miss colors, not used colors
    ships: this will be an object with ship-size and type

app variables:
    playerBoard for misses hits and null
    computerBoard for misses hits and null
    turn for computer and player (-1 and 1)?
    greatMoves array for the computer to "think"

init function:
    one board that shows the players hits and misses and null (not used)
    one board that shows the comp hits ans misses and null
    an array for player ship positions and computer ship positions

render function:
    loop through the board of player hits, change colors respectively
    loop through the board of comp hits, change colors respectively
    id for grid can be id="posX,posY"

initialize dom function:
    the dom function will add respective elements 
    this will allow non-tedius html setup, as well as reset the dom after restart

win logic:
    loop through all the arrays at the turn of the player to see if all ships have been destroyed

click logic:
    get position from id splitting it between the "," first value will be posX, second will be posY

AI logic:
    this is going to be the difficult part. The computer will randomly pick a square between the grid until it hits.
    the hits will then be added to a "great moves" array where it'll act like a node that the computer can now use to "look" for other possible hits.
    in battleship you can only put ships verticle and horizontal so once a ship hits the AI will start looking for verticle and horizontal positions.
    if the AI hits again vertically, it'll now know that the ship is verticle.
    once that ship is destroyed, the positions will be removed from the "great moves" array and the computer will go back to being random, repeat.
    example: greatMoves['2,1', '2,2', '1,1'...]

Possible features:
    I believe this will mostly be UI stuff
        1. When picking ships it'll show you orientation and position they will be placed at
        2. Possibility to actually show ships once destroyed <--- I really want to do this I am just unsure of how yet
        3. If I can figure it out, make the ships draggable

*/