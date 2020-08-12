class Ship {
    constructor(posX, posY, dirX, dirY) {
        this.pos = [];
        this.dirX = dirX;
        this.dirY = dirY;
        this.hitPositions = [];
        this.destroyed = false;
        for (let i = 0; i <= dirX + dirY; i++) {
            this.pos.push([posX + (dirX === 0 ? 0 : i), posY + (dirY === 0 ? 0 : i)]);
        }
    }
}