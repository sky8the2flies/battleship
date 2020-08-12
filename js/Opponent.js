class Opponent {
    constructor(playerBoard, shipBoard, hitBoard, missBoard) {
        this.playerBoard = playerBoard; // Stores hits and misses
        this.shipBoard = shipBoard; // Stores ship positions
        this.hitBoard = hitBoard; // Stores hit positions
    }

}
class Player extends Opponent {
    constructor(playerBoard, shipBoard, hitBoard, missBoard) {
        super(playerBoard, shipBoard, hitBoard, missBoard);
        this.tempBoard = [];
        this.direction = 1;
        this.color = game.miss;
        this.newInput = false;
    }
}
class Computer extends Opponent {
    constructor(playerBoard, shipBoard, hitBoard, missBoard) {
        super(playerBoard, shipBoard, hitBoard, missBoard);
        this.greatMoves = []; // Stores "great moves" for computer
        this.allPositions = []; // Stores all positions for computer
        this.nodeArray = []; // Stores nodes for AI lookup
    }
}