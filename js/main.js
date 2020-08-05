/*
PSEDO CODE

const variables:
    colors! hit colors, miss colors, not used colors
    ships: this will be an object with ship-size and type

app variables:
    playerBoard for misses hits and null
    computerBoard for misses hits and null
    turn for computer and player (-1 and 1)?

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

*/