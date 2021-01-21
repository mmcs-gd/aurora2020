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
        let artifacts = [];
        let countRooms = 0;
        for (let i = 0; i < this.rooms.length; i++) {
            let rand = this._getRandom(0, 1);
            if (i != 0 && countRooms < this.countArtifacts && countRooms < this.rooms.length - 1 && rand == 1) {
                let xArtifact = (this.rooms[i].x + this.rooms[i].width / 2) * 32; 
                let yArtifact = (this.rooms[i].y + this.rooms[i].height / 2) * 32;
                let effect = this.effectsFactory.buildEffect(effectName, xArtifact, yArtifact);
                let artifact = new Artifact(xArtifact, yArtifact, effect, this.rooms[i]);
                artifacts.push(artifact);
                countRooms++
            }
        }   
        this.artifacts = artifacts;
        return artifacts;
    }

    updateArtifacts(player, artifacts) {
        this.artifacts = artifacts;
        for (let i = 0; i < this.artifacts.length; i++) {
            if (player.body.x + player.body.gameObject.width / 2 > this.artifacts[i].x - this.artifacts[i].width / 2
                && player.body.y + player.body.gameObject.height / 2 > this.artifacts[i].y - this.artifacts[i].height / 2
                && player.body.x + player.body.gameObject.width / 2 < this.artifacts[i].x + this.artifacts[i].width / 2 
                && player.body.y + player.body.gameObject.height / 2 < this.artifacts[i].y + this.artifacts[i].height / 2) {
                    this.artifacts[i].effect.destroy();
                    this.artifacts.splice(i, 1);
                    player.countArtifacts++;
                    return true;
                }
        }
        return false;
    }

    _getRandom(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
}