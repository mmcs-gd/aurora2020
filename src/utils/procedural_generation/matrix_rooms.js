export default function getMatrixRooms(width, height) {
    let matrix = new Array();
    for (let y = 0; y < height; y++) {
        matrix[y] = new Array();
        for (let x = 0; x < width; x++) {
            matrix[y][x] = 0;
        }
    }
    let rooms = getRooms(matrix, width, height);
    getRoads(matrix, rooms, width, height);
    return matrix;
}

function getRooms(matrix, width, height) {
    let rooms = [];
    for (let currentY = 0; currentY < height; currentY++) 
    {
        for (let currentX = 0; currentX < width; currentX++) 
        {
            let room = new Room(currentX, currentY, _getRandom(3, 5), _getRandom(3,5));
            let subMatrixOfRoom  = room.generateRoom();
            for (let y = 0; y < room.height; y++) 
            {
                for (let x = 0; x < room.width; x++) 
                { 
                    if (currentY + y < height && currentX + x < width) 
                        matrix[currentY + y][currentX + x] = subMatrixOfRoom[y][x];
                }
            }
            rooms.push(room);
            let shiftX = rooms[rooms.length - 1].x + rooms[rooms.length - 1].width + _getRandom(5,10);
            if (shiftX <= width) currentX = shiftX;
        }
        let shiftY = rooms[rooms.length - 1].y + rooms[rooms.length - 1].height + _getRandom(2,5);
        if (shiftY <= height) currentY = shiftY;
    }
    return rooms;
}

function getRoads(matrix, rooms, width, height) {
    let roads = []; 
    for(let room of rooms) {

        let centerLeftSideX = room.x; 
        let centerLeftSideY = Math.round(room.y + room.height / 2);

        let centerTopSideX = Math.round(room.x + room.width / 2);
        let centerTopSideY = room.y;

        let centerRightSideX = room.x + room.width; 
        let centerRightSideY = Math.round(room.y + room.height / 2);

        let centerBottomSideX = Math.round(room.x + room.width / 2);
        let centerBottomSideY = room.y + room.height; 

        if (centerLeftSideX > 0) {
            let x = Math.round(centerLeftSideX);
            while(x >= 0) {
                if (x < width && matrix[centerLeftSideY] != undefined)  
                    matrix[centerLeftSideY][x] = 1;
                x--;
            }
        }

        if (centerTopSideY > 0) {
            let y = Math.round(centerTopSideY);
            while(y >= 0) {
                if (y < height && matrix[y] != undefined)
                    matrix[y][centerTopSideX] = 1;
                y--;
            }
            
        }

        if (centerRightSideX < width) {

        }

        if (centerBottomSideY < height) {

        }

    }
}


class Room {
    constructor(x, y, width, height){ 
        this.x = x; 
        this.y = y;
        this.width = width;
        this.height = height;
    }
    generateRoom() {
        let room = new Array();
        for (let y = 0; y < this.height; y++) {
            room[y] = new Array();
            for (let x = 0; x < this.width; x++) {
                room[y][x] = 1;
            }
        }
        return room;
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
