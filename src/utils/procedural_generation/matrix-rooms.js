import { Textures } from "phaser";

// Algorithm of procedural generation 'SEREZHKA2021' by Serezhka
export default function getMatrixRooms(width, height) {
    let matrix = new Array();
    for (let y = 0; y < height; y++) {
        matrix[y] = new Array();
        for (let x = 0; x < width; x++) {
            matrix[y][x] = 0;
        }
    }
    let rooms = getRooms(matrix, width, height);
    return matrix;
}

function getRooms(matrix, width, height) {
    let rooms = [];
    let shiftX = 10;
    let shiftY = 10;
    for (let currentY = 0; currentY < height; currentY += shiftY) {
        for (let currentX = 0; currentX < width; currentX += shiftX) {
            let room = new Room(currentX, currentY, 6, 6);
            rooms.push(room);
            for (let y = 0; y < room.height; y++) {
                for (let x = 0; x < room.width; x++) {
                    if (matrix[currentY + y] != undefined)
                        matrix[currentY + y][currentX + x] = room.matrixRoom[y][x];
                }
            }
        }
    }
    getRoads(matrix, rooms, width, height);
    return rooms;
}

function getRoads(matrix, rooms, width, height) {
    let roads = [];
    for (let i = 0; i < rooms.length; i++) {
        let currentRoom = rooms[i];

        let beginPositionRightSideRoomX = currentRoom.x + currentRoom.width
        let beginPositionRightSideRoomY = currentRoom.y + currentRoom.height / 2;

        let beginPositionDownSideRoomX = currentRoom.x + currentRoom.width / 2;
        let beginPositionDownSideRoomY = currentRoom.y + currentRoom.height;

        if (beginPositionRightSideRoomX >= width 
            || beginPositionRightSideRoomY >= height 
            || beginPositionDownSideRoomX >= width
            || beginPositionDownSideRoomY >= height) break;

        let isEndRight = false;
        let isEndDown = false;

        for (let x = beginPositionRightSideRoomX; x < width; x++) {
            if (isEndRight) break;
            let stepUp = 0;
            let countSteps = _getRandom(2, 3);
            while(stepUp != countSteps){
                if (matrix[beginPositionRightSideRoomY - stepUp] != undefined 
                    && matrix[beginPositionRightSideRoomY - stepUp][x] != 1) {
                    matrix[beginPositionRightSideRoomY - stepUp][x] = 1;
                }
                else isEndRight = true;
                stepUp++;
            }
        }
        for (let y = beginPositionDownSideRoomY; y < height; y++) {
            if (matrix[y] == undefined || isEndDown) break;
            let stepLeft = 0; 
            let countSteps = _getRandom(2, 4);
            while(stepLeft != countSteps) { 
                if (matrix[y][beginPositionDownSideRoomX - stepLeft] != 1) {
                    matrix[y][beginPositionDownSideRoomX - stepLeft] = 1
                }
                else isEndDown = true;
                stepLeft++;
            }
        }
    }
    return roads;
}
class Room {
    constructor(x, y, width, height){ 
        this.x = x; 
        this.y = y;
        this.width = width;
        this.height = height;

        this.room = new Array();
        for (let y = 0; y < height; y++) {
            this.room[y] = new Array();
            for (let x = 0; x < width; x++) {
                this.room[y][x] = 1;
            }
        }
        let rand = _getRandom(0, 2);
        switch (rand) {
            case 1:
                this._generateHollowMatrix(); break;
            case 2: 
                this._generateDiagMatrix(); break;
            default:
                break;
        }
        
    }

    get matrixRoom() { return this.room; }

    _generateHollowMatrix() {
        let shiftX = _getRandom(0, 1) * _getRandom(0, 1) == 1 ? 1 : -1;
        let shiftY = _getRandom(0, 1) * _getRandom(0, 1) == 1 ? 1 : -1;
        let startX = (this.width / 2 - 1) - shiftX;
        let startY = (this.height / 2 - 1) - shiftY;
        let endX = (this.width / 2) - shiftX; 
        let endY = (this.height / 2) - shiftY;
        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                this.room[y][x] = 0;
            }
        }
    }

    _generateDiagMatrix() {
        let startX = (this.width / 2 - 1);
        let startY = (this.height / 2 - 1);
        let endX = (this.width / 2); 
        let endY = (this.height / 2);
        let randSide = _getRandom(0, 1);
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (randSide == 0) {
                    if (x == y || x == 0 || y == 0 || x == y - 1 || y == x - 1 || x == this.width - 1 || y == this.height - 1)
                    {
                        this.room[y][x] = 1;
                    }
                    else this.room[y][x] = 0;
                }
                if (randSide == 1) {
                    if (y == this.width - 1 - x 
                        || x == 0 
                        || y == 0  
                        || x == this.width - 1 
                        || y == this.height - 1

                        || x == this.height - y
                        || y == this.width - x)
                    {
                        this.room[y][x] = 1;
                    }
                    else this.room[y][x] = 0;
                }
            }
        }
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