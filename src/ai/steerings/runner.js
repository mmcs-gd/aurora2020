import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2'

class Runner extends Steering {

    constructor (owner, objects, force = 1, ownerSpeed, targetSpeed) {
        super(owner, objects, force);
        this.ownerSpeed = ownerSpeed;
        this.targetSpeed = targetSpeed
        this._randomDistance = this.getRandom(50, 200);
    }

    calculateImpulse () {
        const target = this.objects[0];
        const sideX = this.owner.x - target.x;
        const sideY = this.owner.y - target.y;
        const distance = Math.sqrt(sideX * sideX + sideY * sideY);
        if (distance > this._randomDistance) return new Vector2(0, 0);
        return new Vector2(sideX * this.ownerSpeed / this.targetSpeed, sideY * this.ownerSpeed / this.targetSpeed);
    }
    getRandom(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
export {Runner};