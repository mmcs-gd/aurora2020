export default function getMatrixRooms(width, height) {
    let matrix = new Array();
    for (let y = 0; y < height; y++) {
        matrix[y] = new Array();
        for (let x = 0; x < width; x++) {
            let rand = _getRandom(0,1);
            matrix[y][x] = rand;
        }
    }
    return matrix;
}
class Room { 
    constructor(x, y, width, height) {
        this.x = x; 
        this.y = y; 
        this.width = width;
        this.height = height;
    }
}

class Road {
    constructor(xBegin, yBegin, xEnd, yEnd, width, height) {
        this.xBegin = xBegin; 
        this.yBegin = yBegin; 
        this.xEnd   = xEnd;
        this.yEnd   = yEnd; 
        this.width  = width;
        this.heigh  = height;
    }
}
/*
function BSPGeneration(width, height, matrix) {

}
*/
function _getRandom(min, max) 
{
     return Math.floor(Math.random() * (max - min + 1)) + min; 
}