/*----- constants -----*/
/*----- app's state (variables) -----*/
/*----- cached element references -----*/
/*----- event listeners -----*/
/*----- functions -----*/

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