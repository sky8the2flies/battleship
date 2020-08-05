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
let greatMoves; // Stores "great moves" for computer
let count = 0;
/*----- cached element references -----*/
/*----- event listeners -----*/
/*----- functions -----*/
init();

function init() {
    createRandomBoard();
    console.log(computer);
    turn = 1;
    initDOM();
    render();
}

function createRandomBoard() {
    const playerBoard = [];
    const shipBoard = [];
    const freePositions = [];
    for (let x = 0; x < game.boardSize; x++) {
        for (let y = 0; y < game.boardSize; y++) {
            freePositions.push([x, y]);
        }
    }
    findShipsPositions(freePositions, shipBoard);
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
    const ship = new Ship(posX, posY, xOff, yOff);
    console.log(isShipInShip(ship, shipBoard));
    shipBoard.push(ship);

    // REMOVE NOT FREE POSITIONS
    let filterArr = [];
    ship.pos.forEach((pos) => filterArr = freePositions.filter((elm) => pos[0] !== elm[0] && pos[1] !== elm[1]))
    freePositions = filterArr;

    // IF ALL SHIPS AREN'T FOUND, RUN AGAIN
    if (shipBoard.length-1 < game.shipAmount)
        return findShipsPositions(freePositions, shipBoard);
    return shipBoard;
}

// CHECK IF SHIP COLLIDES WITH OTHER SHIPS IN BOARD
function isShipInShip(ship, shipBoard) {
    shipBoard.filter((elm) => ship !== elm);
    shipBoard.forEach(function(s2) {
        s2.pos.forEach(function(pos) {
            if (isShipInPos(ship, pos[0], pos[1])) 
                return true;
        });
    });
    return false;
}

function isShipInPos(ship, x, y) {
    ship.pos.forEach(function(elm) {
         if (elm.includes([x, y])) 
             return true;
    })
    return false;
}

function initDOM() {
    
}

function render() {

}

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