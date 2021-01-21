export default class Artifact {
    constructor(x, y, effect, room) {
        this.x = x; 
        this.y = y; 
        this.effect = effect;
        this.width = effect.width;
        this.height = effect.height;
        this.room = room;
    }
}