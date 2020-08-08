/*
            TODO
    [] Update html #msg tag respectively
    [] possibly add delay for computer decision
    [] Check for win on either side
    [] game.'color' change to hits and misses
    [] refactor code, there are so many improvements I can currently think of:
     [X] create "player class", will reduce amount of "lets in app state variables"
     [X] create "computer class", will also clear of some more lets in app state
     [] organize code to where functions that do certain things are in their place
     [] check for ";" on all lines.
     [] Make sure that all "loops" are done to the best that they can, this will take the most time.
     [] lable code for project presentation.


*/
/*----- constants -----*/
const game = {
    boardSize: 10,
    hit: 'red',
    miss: 'green',
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

/*----- cached element references -----*/
const gridEl = document.querySelectorAll('tr.grid-parent');
const gridContainerEl = document.querySelector('.grid-container');
const playerBoardEls = document.querySelectorAll('tr.ship-parent');

/*----- event listeners -----*/
gridContainerEl.addEventListener('click', handleClick);
gridContainerEl.addEventListener('mouseover', handleMouseOver);
gridContainerEl.addEventListener('mouseout', handleMouseOut);
document.querySelector('button').addEventListener('click', (e) => player.direction === 1 ? player.direction = 0 : player.direction = 1);

/*----- functions -----*/
init();

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
    // MAKE COMPUTER INITIALIZED TO CREATE SHIP BOARD
    computer = new Computer(playerBoard, shipBoard);

    // ADD ALL POSITIONS FOR RANDOMIZE HITS
    computer.allPositions = [...freePositions];

    // CREATE A SHIP BOARD AT RANDOM WITH NO SHIPS COLLIDING
    findShipsPositions(freePositions, shipBoard);
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
    ship.pos.forEach(sPos => freePositions = freePositions.filter(fPos => fPos.toString() !== sPos.toString()));

    // IF ALL SHIPS AREN'T FOUND, RUN AGAIN
    if (shipBoard.length-1 < game.shipAmount)
        return findShipsPositions(freePositions, shipBoard);
}

function handleMouseOver(e) {
    //TODO render where ship will be placed 
    if (e.target.id === '' || player.shipBoard.length >= 5) return;
    const posArr = e.target.id.split(',');
    const posX = parseInt(posArr[0]);
    const posY = parseInt(posArr[1]);
    for (let i = 0; i < game[player.shipBoard.length]; i++) {
        let posXOff = posX + (player.direction === 0 ? i : 0)
        let posYOff = posY + (player.direction === 1 ? i : 0)
        player.tempBoard.push([posXOff, posYOff]);
        if (posXOff > 9 
        || posYOff > 9 
        || isShipInArray(player.shipBoard, player.tempBoard)) {
            player.color = game.hit;
        } else {
            player.color = game.miss;
        }
    }
    render();
}

function handleMouseOut(e) {
    if (e.target.id === '' || player.shipBoard.length >= 5) return;
    player.color = game.water;
    render();
    player.tempBoard = [];
}

function handleClick(e) {
    if (e.target.id === '') return;
    const posArr = e.target.id.split(',');
    const posX = parseInt(posArr[0]);
    const posY = parseInt(posArr[1]);
    if (player.shipBoard.length < 5) {
        if (isShipInArray(player.shipBoard, player.tempBoard)) return;
        if (posX + (player.direction === 0 ? game[player.shipBoard.length]-1 : 0) > 9 || posY + (player.direction === 1 ? game[player.shipBoard.length]-1 : 0) > 9) return;
        const ship = new Ship(posX, posY, (player.direction === 0 ? game[player.shipBoard.length]-1 : 0), (player.direction === 1 ? game[player.shipBoard.length]-1 : 0))
        player.shipBoard.push(ship);
        player.color = game.hit;
        if (player.shipBoard.length >= 5) {
            player.tempBoard = [];
            handleNextMove();
        } else {
            player.tempBoard.pop();
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
        let positions = (computer.greatMoves.length > 0 ? computer.greatMoves : computer.allPositions);
        const min = 0;
        const max = positions.length-1;
        const posIndex = Math.floor(Math.random() * (max - min + 1) + min);
        let pos = positions[posIndex];
        computer.playerBoard.push(pos);
        handleGreatMoves(pos);
        computer.allPositions = computer.allPositions.filter(aPos => aPos.toString() !== pos.toString()); // must get index of to actually filter [8, 0] is not [8, 0] ????
        computer.greatMoves = computer.greatMoves.filter(gPos => gPos.toString() !== pos.toString());
        handleNextMove();
    } 
}

function handleGreatMoves(pos) {
    // Keep moves random if no hit
    if (!isShipInPosArray(player.shipBoard, pos[0], pos[1]) && computer.greatMoves.length === 0) return;

    // First index of 'hit' add initial great moves
    if (computer.nodeArray.length === 0) {
        addPosToArray(computer.greatMoves, pos[0], pos[1], 1, 0);
        addPosToArray(computer.greatMoves, pos[0], pos[1], -1, 0);
        addPosToArray(computer.greatMoves, pos[0], pos[1], 0, 1);
        addPosToArray(computer.greatMoves, pos[0], pos[1], 0, -1);
    }
    // Push current pos to computer.nodeArray
    computer.nodeArray.push(pos);

    // Once node has 2 items, begin comparasin
    if (computer.nodeArray.length > 1) {
        const nodeDirX = computer.nodeArray[computer.nodeArray.length-1][0] - computer.nodeArray[0][0];
        const nodeDirection = (nodeDirX === 0 ? 0 : 1);
        if (nodeDirection === 0) {
            computer.nodeArray = computer.nodeArray.sort((a,b) =>  a[1] - b[1]);
            computer.greatMoves = [];
            addPosToArray(computer.greatMoves, computer.nodeArray[0][0], computer.nodeArray[0][1], 0, -1)
            addPosToArray(computer.greatMoves, computer.nodeArray[computer.nodeArray.length-1][0], computer.nodeArray[computer.nodeArray.length-1][1], 0, 1);
            if (computer.greatMoves.length == 0 || computer.nodeArray.length >= 6) 
                computer.nodeArray = [];
        } else {
            computer.nodeArray = computer.nodeArray.sort((a,b) => a[0] - b[0]);
            computer.greatMoves = [];
            addPosToArray(computer.greatMoves, computer.nodeArray[0][0], computer.nodeArray[0][1], -1, 0)
            addPosToArray(computer.greatMoves, computer.nodeArray[computer.nodeArray.length-1][0], computer.nodeArray[computer.nodeArray.length-1][1], 1, 0);
            if (computer.greatMoves.length == 0 || computer.nodeArray.length >= 6) 
                computer.nodeArray = [];
        }
    }
}

// CHECK IF SHIP IS INSIDE POSITION ARRAY
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

// GET INDEX OF SHIP IN SHIPBOARD AT X, Y
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

// GET INDEX OF POS IN SHIP.POS AT X, Y
function getPosIndex(ship, x, y) {
    const mapBoard = ship.pos.map(pos => pos.toString());
    return mapBoard.indexOf([x,y].toString());
}

// CHECK IF POS CAN BE ADDED TO GREATMOVES ARRAY
function addPosToArray(arr, x, y, xOff, yOff) {
    if (isShipInPosArray(player.shipBoard, x, y) && x >= 0 && x <= 9 && y >= 0 && y <= 9 && !computer.allPositions.every(pos => pos.toString() !== [x+xOff,y+yOff].toString())) {
        arr.push([x+xOff,y+yOff]);
    }
}

function render() {
    if (player.playerBoard.length === 0 && computer.playerBoard.length === 0) {
        renderShipBoard(player.shipBoard, game.water);
    }
    if (player.shipBoard.length < 5) {
        renderShipBoard(player.shipBoard, game.miss);
        player.tempBoard.forEach(function(pos) {
            if (pos !== null) {
                const elmParent = gridEl[pos[0]];
                if (elmParent!== undefined) {
                    const elm = elmParent.children[pos[1]+1];
                    if (elm !== undefined)
                        elm.style.background = player.color;
                }
            }
        });
    }
    renderHits(player.playerBoard, computer.shipBoard);
    renderPlayerShips(player.shipBoard);
    renderComputerHits(computer.playerBoard, player.shipBoard);

    // RENDER COMPUTER BOARD
    //renderShipBoard(computer.shipBoard, game.miss);
}

//RENDER PLAYER SHIP BOARD TO COLOR
function renderPlayerShips(shipBoard) {
    shipBoard.forEach(ship => {
        ship.pos.forEach(pos => {
            let shipIndex = getShipIndex(shipBoard, pos[0], pos[1]);
            let posIndex = getPosIndex(shipBoard[shipIndex], pos[0], pos[1]);
            const shipEl = playerBoardEls[shipIndex].children[posIndex];
            shipEl.style.background = game.miss;
        });
    });
}

// RENDER COMPUTER HITS ON PLAYER 'SHIP BOARD'
function renderComputerHits(playerBoard, shipBoard) {
    playerBoard.forEach(function(pos) {
        if (isShipInPosArray(shipBoard, pos[0], pos[1])) {
            let shipIndex = getShipIndex(shipBoard, pos[0], pos[1]);
            let posIndex = getPosIndex(shipBoard[shipIndex], pos[0], pos[1]);
            const shipEl = playerBoardEls[shipIndex].children[posIndex];
            shipEl.style.background = game.hit;
        } 
    });
}

// RENDER HITS FROM PLAYERBOARD USING SHIPBOARD
function renderHits(playerBoard, shipBoard) {
    playerBoard.forEach(pos => {
        const elm = gridEl[pos[0]].children[pos[1]+1];
        if (isShipInPosArray(shipBoard, pos[0], pos[1])) {
            elm.style.background = game.miss;
        } else {
            elm.style.background = game.hit;
        }
    });
}

// RENDER SHIPS AT POS TO COLOR
function renderShipBoard(shipBoard, color) {
    shipBoard.forEach(function(ship) {
        ship.pos.forEach(function(pos) {
            const elm = gridEl[pos[0]].children[pos[1]+1];
            elm.style.background = color;
        });
    });
}
/*
PSEDO CODE
render function:
    loop through the board of player hits, change colors respectively
    loop through the board of comp hits, change colors respectively
    id for grid can be id="posX,posY"

win logic:
    loop through all the arrays at the turn of the player to see if all ships have been destroyed

[X] - AI logic:
    this is going to be the difficult part. The computer will randomly pick a square between the grid until it hits.
    the hits will then be added to a "great moves" array where it'll act like a node that the computer can now use to "look" for other possible hits.
    in battleship you can only put ships verticle and horizontal so once a ship hits the AI will start looking for verticle and horizontal positions.
    if the AI hits again vertically, it'll now know that the ship is verticle.
    once that ship is destroyed, the positions will be removed from the "great moves" array and the computer will go back to being random, repeat.
    example: computer.greatMoves['2,1', '2,2', '1,1'...]

Possible features:
    I believe this will mostly be UI stuff
        [X] When picking ships it'll show you orientation and position they will be placed at
        [] Possibility to actually show ships once destroyed <--- I really want to do this I am just unsure of how yet
        [] If I can figure it out, make the ships draggable

*/