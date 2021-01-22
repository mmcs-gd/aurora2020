import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2'

class Pursuit extends Steering {

    constructor (owner, objects, force = 1, ownerSpeed, targetSpeed) {
        super(owner, objects, force);
        this.ownerSpeed = ownerSpeed;
        this.targetSpeed = targetSpeed;
        this._randomDistance = this.getRandom(30, 60);
    }



    calculateImpulse () {
        const target = this.objects[0];
        const sideX = target.x - this.owner.x; 
        const sideY = target.y - this.owner.y; 
        const distance = Math.sqrt(sideX * sideX + sideY * sideY);
        if (distance <= this._randomDistance) return new Vector2(0, 0);
        const toTargetX = (target.x - this.owner.x) / this.ownerSpeed;
        const toTargetY = (target.y - this.owner.y) / this.ownerSpeed;
        return new Vector2(toTargetX, toTargetY);
    }
    getRandom(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

export {Pursuit};