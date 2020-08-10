class Opponent {
    constructor(playerBoard, shipBoard) {
        this.playerBoard = playerBoard; // Stores hits and misses
        this.shipBoard = shipBoard; // Stores ship positions
    }

}
class Player extends Opponent {
    constructor(playerBoard, shipBoard) {
        super(playerBoard, shipBoard);
        this.tempBoard = [];
        this.direction = 1;
        this.color = game.miss;
        this.newInput = false;
    }
}
class Computer extends Opponent {
    constructor(playerBoard, shipBoard) {
        super(playerBoard, shipBoard);
        this.greatMoves = []; // Stores "great moves" for computer
        this.allPositions = []; // Stores all positions for computer
        this.nodeArray = []; // Stores nodes for AI lookup
    }
}