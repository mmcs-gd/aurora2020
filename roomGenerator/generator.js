import Room from './room'
import levelQuarter from "./levelQuarter";
import rectangle from 'phaser/src/geom/rectangle'
import room from "./room";
import EasyStar from "easystarjs";
import coridor from "./coridor";

function matrixArray(rows,columns){
    let arr = new Array();
    for(let i=0; i<rows; i++){
        arr[i] = new Array();
        for(let j=0; j<columns; j++){
            arr[i][j] = 0
        }
    }
    return arr;
}

const roomSize = {
    large: [14,10],
    medium: [10,10],
    small: [8,8],
}

export default class generator {
    constructor(levelHeight, levelWidth, tileHeight, tileWidth) {
        this.rooms = [];
        this.levelHeight = levelHeight;
        this.levelWidth = levelWidth;
        this.tileHeight = tileHeight;
        this.tileWidth = tileWidth;
        this.heightInTiles = Math.round(this.levelHeight / (tileHeight));
        this.widthInTiles = Math.round(this.levelWidth / (tileWidth));
        this.map = matrixArray(this.heightInTiles, this.widthInTiles);
        this.levelQuarters = [];
        const height = Math.round(this.levelHeight / (tileHeight * 2));
        const width = Math.round(this.levelWidth / (tileWidth * 2));
        this.levelQuarters.push(new levelQuarter(0, 0, width, height));
        this.levelQuarters.push(new levelQuarter(width, 0, width, height));
        this.levelQuarters.push(new levelQuarter(0, height, width, height));
        this.levelQuarters.push(new levelQuarter(width, height, width, height));
    }



    generateСorridors() {
        let cor = []
        for (let i = 0;i<this.rooms.length-1;i++) {
            let centerFirst = this.rooms[i].center()
            let centerSecond = this.rooms[i + 1].center()
            cor.push(this.paveWay(centerFirst.x, centerFirst.y, centerSecond.x, centerSecond.y))
        }
        return cor
    }




    generateRoom(){
        let roomCount = getRandomIntInclusive(15,20);
        while (roomCount !=0){
            let ind = getRandomIntInclusive(0,3)
            let x = getRandomIntInclusive(this.levelQuarters[ind].x,this.levelQuarters[ind].width + this.levelQuarters[ind].x )
            let y = getRandomIntInclusive(this.levelQuarters[ind].y,this.levelQuarters[ind].height + this.levelQuarters[ind].y)
            this.levelQuarters[ind].addRoom(new Room(x,y,getRandomIntInclusive(4,12),getRandomIntInclusive(4,12)))
            roomCount--;
        }

        this.levelQuarters.forEach(quater=>{

            if (quater.rooms.length === 0)
                quater.addRoom(new Room(Math.round(quater.width/2),Math.round(quater.height/2),roomSize.large[0],roomSize.large[1]))

            if (quater.rooms.length === 1){
                quater.rooms[0].width = roomSize.large[0];
                quater.rooms[0].height = roomSize.large[1];
            }


            quater.rooms.forEach(room=>{
                if(room.x <= quater.x)
                    room.x = Math.round(quater.x+1);
                if(room.x +room.width >= quater.x+ quater.width)
                    room.x =  Math.round(room.x - ((room.x +room.width) - (quater.x+ quater.width)))
                if(room.y <= quater.y)
                    room.y = Math.round(quater.y+1);
                if(room.y +room.height >= quater.y+ quater.height)
                    room.y =  Math.round(room.y - ((room.y +room.height) - (quater.y+ quater.height)))
            })

            for(let x = 0;x<2;x++) {
                for (let i = 0; i < quater.rooms.length - 1; i++) {
                    for (let j = 1; j < quater.rooms.length; j++) {
                        if (rectangle.Intersection(quater.rooms[i], quater.rooms[j])) {
                            quater.rooms.push(new room(Math.min(quater.rooms[i].x, quater.rooms[j].x),
                                Math.min(quater.rooms[i].y, quater.rooms[j].y)
                                , Math.max(quater.rooms[i].width, quater.rooms[j].width)
                                , Math.max(quater.rooms[i].height, quater.rooms[j].height)
                            ))
                            quater.rooms.splice(i, 1);
                            quater.rooms.splice(j, 1);
                        }
                    }
                }
            }

            quater.rooms.forEach(room=>{
                for (let i = room.y;i<room.height +room.y;i++)
                    for (let j = room.x;j<room.width+room.x;j++)
                        this.map[i][j] = 1;
                this.rooms.push(room)
            });
        })
        this.maybeOneMoreRoom(6)
        this.maybeOneMoreRoom(4)
        return this.rooms;
    }

    maybeOneMoreRoom(h){
        for(let i=h/2; i<this.heightInTiles - h; i++){
            for(let j=h/2; j<this.widthInTiles - h; j++) {
                let flag = true;
                for (let x = -h/2; x < h; x++) {
                    for (let y = -h/2; y <  h; y++) {
                        if (this.map[i+x][j+y] == 1)  {
                            flag = false;
                            break;
                        }
                    }
                }
                if (flag) {
                    let r = new room(j, i, h, h);
                    this.rooms.push(r);

                    for (let ii = r.y;ii < r.height +r.y;ii++)
                        for (let jj = r.x;jj<r.width+r.x;jj++) {
                            this.map[ii][jj] = 1;
                        }
                    flag = false;
                    break;
                }
            }
        }

    }


    paveWay(center1x, center1y, center2x, center2y) {
        let outX = []
        let outY = []
        let dx = 1
        let dy = -1;
        let y,y1,x,x1
        if (center1y>= center2y) {
            y = center1y;
            y1 = center2y;
        } else {
            y1 = center1y;
            y = center2y;
        }

        if (center1x >= center2x) {
            x = center1x
            x1 = center2x
        } else {
            x1 = center1x
            x = center2x
        }
        outX.push(x1);
        while (x-x1 > 0) {
            this.map[y1][x1] = 1
            x1 += dx;
            outX.push(x1);
            outY.push(y1);
        }
        outY.push(y);
        while (y-y1 > 0) {
            this.map[y][x] = 1
            y += dy;
            outY.push(y);
            outX.push(x);
        }
        return new coridor(outX, outY)
    }

}





function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.round(Math.random() * (max - min ) + min);
}