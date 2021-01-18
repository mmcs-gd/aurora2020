export default class  levelQuarter {
    constructor(x, y,width,height) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.rooms = []
    }

    addRoom(room){
        this.rooms.push(room);
    }

}