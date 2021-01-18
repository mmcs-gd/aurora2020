export default class  Coridor{
    constructor(tilesX,tilesY) {
        this.tilesX = tilesX;
        this.tilesY = tilesY;

        if(this.tilesX.length != this.tilesY.length){
            let div = this.tilesX.length - this.tilesY.length
            if(div < 0){
                let last = this.tilesX[this.tilesX.length-1]
                while (div != 0){
                    this.tilesX.push(last)
                    div++;
                }
            }else{
                let last = this.tilesY[this.tilesY.length-1]
                while (div != 0){
                    this.tilesY.push(last)
                    div--;
                }
            }
        }
    }
}