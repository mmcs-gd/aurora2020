export default class  Room{
    constructor(x,y,width,height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.door = [];
    }

    center(){
        let x = Math.round(this.x + this.width/2);
        let y = Math.round(this.y +this.height/2);
        return {x,y}


    }

}