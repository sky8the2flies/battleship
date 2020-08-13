/*----- constants -----*/
const game = {
    boardSize: 10,
    hit: 'gray',
    miss: '#FF5733',
    ship: '#0BC402',
    water: '#9dc1fc',
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
const computerBoardEls = document.querySelectorAll('tr.computer-parent');
const gridContainerEl = document.querySelector('.grid-container');
const msgEl = document.querySelector('#msg');
const switchBtnEl = document.querySelector('.s-button > button');
const replayBtnEl = document.querySelector('.r-button > button');

/*----- event listeners -----*/
gridContainerEl.addEventListener('click', handleClick);
gridContainerEl.addEventListener('mouseover', handleMouseOver);
gridContainerEl.addEventListener('mouseout', handleMouseOut);
switchBtnEl.addEventListener('click', e => player.direction === 1 ? player.direction = 0 : player.direction = 1);
replayBtnEl.addEventListener('click', init);

/*----- functions -----*/
init();

function init() {
    player = new Player([], [], [], []);
    createRandomBoard();
    turn = Math.floor(Math.random() * (2 - 1 + 1) + 1) === 1 ? 1 : -1;
    resetBoards();
    render();
}

// CREATES RANDOM BOARD FOR COMPUTER
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
    computer = new Computer(playerBoard, shipBoard, [], []);

    // ADD ALL POSITIONS FOR RANDOMIZE HITS
    computer.allPositions = [...freePositions];

    // CREATE A SHIP BOARD AT RANDOM WITH NO SHIPS COLLIDING
    findShipsPositions(freePositions, shipBoard);
}

// FINDS RANDOM SHIP POSITIONS WITH DIFFERENT DIRECTIONS WHILE NOT COLLIDING
function findShipsPositions(freePositions, shipBoard) {
    while (shipBoard.length < 5) {
        let randomDirection = Math.floor(Math.random() * 2);
        let randomIndex = Math.floor(Math.random() * (freePositions.length));
        while (freePositions[randomIndex][randomDirection] > (10 - game[shipBoard.length])) {
            randomIndex = Math.floor(Math.random() * (freePositions.length));
            randomDirection = Math.floor(Math.random() * 2);
        }    
        const freePos = freePositions[randomIndex];
        const posX = freePos[0];
        const posY = freePos[1];
        const xOff = randomDirection === 0 ? game[shipBoard.length]-1 : 0;
        const yOff = randomDirection === 1 ? game[shipBoard.length]-1 : 0;
        let overlap = false;
        
        // CHECK IF SHIPS ARE OVERLAPPING
        for (let i = 0 ; i < game.shipAmount; i++) {
            if (shipBoard[i] === undefined) break;
            for (let x = 0 ; x < game[shipBoard.length-1]; x++) {
                if (isShipInPos(shipBoard[i], posX + (xOff === 0 ? 0 : x), posY + (yOff === 0 ? 0 : x))) {
                    overlap = true;
                }
            }
        }
        if (!overlap) {
            // SHIP HAS BEEN FOUND
            let ship = new Ship(posX, posY, xOff, yOff);
            shipBoard.push(ship);

            // REMOVE NOT FREE POSITIONS
            ship.pos.forEach(sPos => freePositions = freePositions.filter(fPos => fPos.toString() !== sPos.toString()));
        }
    }
}

// HANDLE RENDER FOR PLACING SHIPS
function handleMouseOver(e) {
    if (e.target.id === '' || player.shipBoard.length >= 5) return;
    const posArr = e.target.id.split(',');
    const posX = parseInt(posArr[0]);
    const posY = parseInt(posArr[1]);
    player.tempBoard = [];

    // ADD POSITION TO TEMP BOARD FOR RENDER
    for (let i = 0; i < game[player.shipBoard.length]; i++) {
        let posXOff = posX + (player.direction === 0 ? i : 0)
        let posYOff = posY + (player.direction === 1 ? i : 0)
        player.tempBoard.push([posXOff, posYOff]);
        if (posXOff > 9 
        || posYOff > 9 
        || isShipInArray(player.shipBoard, player.tempBoard)) {
            player.color = game.hit;
        } else {
            player.color = game.ship;
        }
    }
    render();
}

// HANDLE RENDER FOR PLACING SHIPS
function handleMouseOut(e) {
    if (e.target.id === '' || player.shipBoard.length >= 5) return;
    // REMOVE COLOR ON MOUSE OUT
    player.color = game.water;
    render();
}

function handleClick(e) {
    if (e.target.id === '' || isGameOver()) return;
    const posArr = e.target.id.split(',');
    const posX = parseInt(posArr[0]);
    const posY = parseInt(posArr[1]);
    const pos = [posX, posY];
    if (player.shipBoard.length < 5) {
        // CALLS WHEN PLAYER NEEDS TO PLACE SHIPS

        // CHECK IF ANOTHER SHIP IS INSIDE TEMP BOARD
        if (isShipInArray(player.shipBoard, player.tempBoard)) return;

        // CHECK IF SHIP IS OFF BOARD
        if (posX + (player.direction === 0 ? game[player.shipBoard.length]-1 : 0) > 9 || posY + (player.direction === 1 ? game[player.shipBoard.length]-1 : 0) > 9) return;

        // CREATE NEW SHIP AT POSITION
        const ship = new Ship(posX, posY, (player.direction === 0 ? game[player.shipBoard.length]-1 : 0), (player.direction === 1 ? game[player.shipBoard.length]-1 : 0));
        player.shipBoard.push(ship);
        player.color = game.ship;
        if (player.shipBoard.length >= 5) {
            // BEGIN GAME
            player.tempBoard = [];
            handleNextMove();
        } else {
            // REMOVE LAST POSITION TO UPDATE RENDER
            player.tempBoard.pop();
        }
        render();
        return;
    }

    // CALLS WHEN GAME BEGINS
    if (turn === 1) {
        // CHECK IF PLAYER HAS ALREADY PLACED SHIP
        if (player.playerBoard.every(pPos => pPos.toString() !== pos.toString())) {
            player.playerBoard.push(pos);
            if (isShipInPosArray(computer.shipBoard, posX, posY)) {
                player.hitBoard.push(pos);
                checkShipArray(computer.shipBoard, pos);
            }
            handleNextMove();
            player.newInput = true;
        } 
    }
    render();
}

// CHANGE TURN AND HANDLE COMPUTER TURN
function handleNextMove() {
    turn = turn * -1;
    if (turn === -1) {
        //COMPUTER TURN
        let positions = (computer.greatMoves.length > 0 ? computer.greatMoves : computer.allPositions);
        const posIndex = Math.floor(Math.random() * positions.length);
        let pos = positions[posIndex];

        //ADD POSITION TO PLAYER BOARD
        computer.playerBoard.push(pos);
        if (isShipInPosArray(player.shipBoard, pos[0], pos[1])) {
            computer.hitBoard.push(pos);
            checkShipArray(player.shipBoard, pos);
        }

        // RUN AI
        handleGreatMoves(pos);

        // REMOVE POSITION FROM ARRAYS
        computer.allPositions = computer.allPositions.filter(aPos => aPos.toString() !== pos.toString());
        computer.greatMoves = computer.greatMoves.filter(gPos => gPos.toString() !== pos.toString());

        handleNextMove();
    } 
}

function handleGreatMoves(pos) {
    // RESET IF CAN'T FIND OR SHIP IS DESTROYED
    if (computer.greatMoves.length === 0 || computer.nodeArray.length >= 6) 
        computer.nodeArray = [];
    // KEEP MOVES RANDOM IF NO HIT
    if (!isShipInPosArray(player.shipBoard, pos[0], pos[1]) && computer.greatMoves.length === 0) return;

    // FIRST INDEX OF 'HIT' ADD INITIAL GREAT MOVES
    if (computer.nodeArray.length === 0) {
        addPosToArray(computer.greatMoves, pos[0], pos[1], 1, 0);
        addPosToArray(computer.greatMoves, pos[0], pos[1], -1, 0);
        addPosToArray(computer.greatMoves, pos[0], pos[1], 0, 1);
        addPosToArray(computer.greatMoves, pos[0], pos[1], 0, -1);
    }
    // PUSH CURRENT POS TO COMPUTER.NODEARRAY
    if (isShipInPosArray(player.shipBoard, pos[0], pos[1]))
        computer.nodeArray.push(pos);

    // ONCE NODE HAS 2 ITEMS, BEGIN COMPARING
    if (computer.nodeArray.length > 1) {
        // CHECK DIRECTION, X OR Y
        const nodeDirX = computer.nodeArray[computer.nodeArray.length-1][0] - computer.nodeArray[0][0];
        const nodeDirection = (nodeDirX === 0 ? 0 : 1);
        computer.nodeArray = computer.nodeArray.sort((a,b) =>  a[(nodeDirection === 0 ? 1 : 0)] - b[(nodeDirection === 0 ? 1 : 0)]);
        computer.greatMoves = [];

        // ADD POSITION TO GREAT MOVES -1 Y FROM NODEARRAY
        addPosToArray(computer.greatMoves, computer.nodeArray[0][0], computer.nodeArray[0][1], (nodeDirection === 0 ? 0 : -1), (nodeDirection === 0 ? -1 : 0));

        // ADD POSITION TO GREAT MOVES +1 Y FROM NODEARRAY
        addPosToArray(computer.greatMoves, computer.nodeArray[computer.nodeArray.length-1][0], computer.nodeArray[computer.nodeArray.length-1][1], (nodeDirection === 0 ? 0 : 1), (nodeDirection === 0 ? 1 : 0));
    }
}

// CHECK IF POS CAN BE ADDED TO GREATMOVES ARRAY
function addPosToArray(arr, x, y, xOff, yOff) {
    if (isShipInPosArray(player.shipBoard, x, y) && x >= 0 && x <= 9 && y >= 0 && y <= 9 && !computer.allPositions.every(pos => pos.toString() !== [x+xOff,y+yOff].toString())) {
        arr.push([x+xOff,y+yOff]);
    }
}

function isGameOver() {
    return player.shipBoard.length >= 5 && (isShipsInArray(computer.shipBoard, player.hitBoard) || isShipsInArray(player.shipBoard, computer.hitBoard));
}


// CHECK IF SHIP IS INSIDE POSITION ARRAY
function isShipInArray(shipArr, posArr) {
    let inPos = false;
    shipArr.forEach(ship => {
        posArr.forEach(pos => {
            if (isShipInPos(ship, pos[0], pos[1])) {
                inPos = true;
            }
        });
    });
    return inPos;
}

//TODO FIGURE THIS OUT

// CHECK IF ALL SHIPS ARE IN POSITIONS
function isShipsInArray(shipArr, posArr) {
    // LOOP THROUGH ALL SHIPS, CHECK IF ALL SHIPS HAVE BEEN HIT
    const mapArr = posArr.map(pos => pos.toString());
    let inPos = false;
    inPos = shipArr.every(ship => ship.pos.every(pos => mapArr.includes(pos.toString())));
    return inPos;
}

// CHECK IF ANY SHIP IN ARRAY COLLIDES WITH POSITION
function isShipInPosArray(shipArr, x, y) {
    let inPos = false;
    shipArr.forEach(ship => {
        if (isShipInPos(ship, x, y)) {
            inPos = true;
        }
    });
    return inPos;
}

// CHECK IF SHIP COLLIDES WITH POSITION
function isShipInPos(ship, x, y) {
    return ship.pos.some(pos => (pos[0] === x) && (pos[1] === y));
}

// Check all ships for destroy
function checkShipArray(shipArray, pos) {
    shipArray.forEach(ship => {
        if (isShipInPos(ship, pos[0], pos[1])) {
            checkShip(ship, pos);
        }
    });
}

// Check ship for destroy
function checkShip(ship, pos) {
    const mapArr = ship.pos.map(mPos => mPos.toString());
    if (!mapArr.includes(pos)) {
        ship.hitPositions.push(pos);
        if (ship.hitPositions.length === ship.pos.length) {
            ship.destroyed = true;
        }
    }
}

// GET INDEX OF SHIP IN SHIPBOARD AT X, Y
function getShipIndex(shipBoard, x, y) {
    let index = -1;
    shipBoard.forEach((ship, idx) => {
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

function render() {
    renderMessageContents();

    // DISPLAY / HIDE REPLAY BUTTON
    isGameOver() ? replayBtnEl.style.display = 'block' : replayBtnEl.style.display = 'none';

    if (player.shipBoard.length >= 5 && player.playerBoard.length === 0) {
        renderShipBoard(player.shipBoard, game.water, 0.8, gridEl);
    }

    // RENDER SHIPS ON COMPUTER BOARD
    renderShipBoard(player.shipBoard, game.ship, 1, computerBoardEls);

    //RENDER 'DRAG AND DROP'
    renderTempBoard();

    // RENDER HITS AND MISSES
    renderPositions(player.playerBoard, computer.shipBoard, gridEl);
    renderPositions(computer.playerBoard, player.shipBoard, computerBoardEls);

    //RENDER DESTROYED SHIP
    renderDestroyedShips(computer.shipBoard, gridEl);
    renderDestroyedShips(player.shipBoard, computerBoardEls);
}

function renderMessageContents() {
    if (player.shipBoard.length < 5) {
        switchBtnEl.style.display = 'block';
        msgEl.textContent = "Place your ships!";
    } else {
        switchBtnEl.style.display = 'none';
        msgEl.textContent = "Attack the opponent!";
        if (!player.newInput) {
            msgEl.textContent = "Pick an unused position!"
        }
        player.newInput = false;
        if (isShipsInArray(computer.shipBoard, player.hitBoard)) {
            msgEl.textContent = "You have won!"
        } else if (isShipsInArray(player.shipBoard, computer.hitBoard)) {
            msgEl.textContent = "The opponent has won!"
        }
    }
}

function renderTempBoard() {
    // RENDER TEMP BAORD
    if (player.shipBoard.length < 5) {
        renderShipBoard(player.shipBoard, game.ship, 1, gridEl);
        player.tempBoard.forEach(pos => {
            if (pos !== null) {
                const elmParent = gridEl[pos[0]];
                if (elmParent!== undefined) {
                    const elm = elmParent.children[pos[1]+1];
                    if (elm !== undefined)
                        elm.style.backgroundColor = player.color;
                }
            }
        });
    }
}

function renderDestroyedShips(shipBoard, board) {
    shipBoard.forEach(ship => {
        if (ship.destroyed) {
            renderShip(ship, "gray", 0.7, board);
        }
    });
}

// RESET BOARD TO DEFAULT COLORS
function resetBoards() {
    for (row of gridEl) {
        for (grid of row.children) {
            if (grid.id !== '') {
                grid.style.backgroundColor = game.water;
                grid.style.opacity = '0.8';
            }
        }
    }
    for (row of computerBoardEls) {
        for (grid of row.children) {
            if (grid.textContent === '') {
                grid.style.backgroundColor = game.water;
                grid.style.opacity = '0.8';
            }
        }
    }    
}

// RENDER HITS FROM PLAYERBOARD USING SHIPBOARD
function renderPositions(playerBoard, shipBoard, domEl) {
    playerBoard.forEach(pos => {
        const elm = domEl[pos[0]].children[pos[1]+1];
        if (isShipInPosArray(shipBoard, pos[0], pos[1])) {
            elm.style.backgroundColor = game.hit;
            elm.style.opacity = '1';
        } else {
            elm.style.backgroundColor = game.miss;
        }
    });
}

// RENDER SHIPS AT POS TO COLOR
function renderShipBoard(shipBoard, color, opacity, board) {
    shipBoard.forEach(ship => {
        renderShip(ship, color, opacity, board);
    });
}

// RENDER SHIP AT POS TO COLOR
function renderShip(ship, color, opacity, board) {
    ship.pos.forEach(pos => {
        const elm = board[pos[0]].children[pos[1]+1];
        elm.style.backgroundColor = color;
        elm.style.opacity = `${opacity}`;
    });
}