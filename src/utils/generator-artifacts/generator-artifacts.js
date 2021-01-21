import Artifact from './artifact'
export default class GeneratoArtifacts {
    constructor(rooms, effectsFactory, widthMap, heightMap, countArtifacts) {
        this.rooms = rooms
        this.effectsFactory = effectsFactory;
        this.widthMap = widthMap;
        this.heightMap = heightMap;
        this.countArtifacts = countArtifacts;
    }

    setArtifacts(effectName) {
        let numberRooms = [];

        for (let i = 0; i < this.countArtifacts; i++) {
            numberRooms.push(this._getRandom(1, this.rooms.length));
        }

        for (let i = 0; i < numberRooms.length; i++) {
            for(let j = 0; j < numberRooms.length; j++) {
                while(numberRooms[i] == numberRooms[j]) {
                    numberRooms[i] = this._getRandom(1, this.rooms.length); 
                }
            }
        }
        console.log(numberRooms);
    }
    _getRandom(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
}