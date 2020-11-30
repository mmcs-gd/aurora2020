import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2'

class Patrol extends Steering {
    constructor (owner, objects, force = 1, ownerSpeed, targetSpeed) {
        super(owner, objects, force);
        this.ownerSpeed = ownerSpeed;
        this.targetSpeed = targetSpeed
        this._randomDistance = 100;
        this.currentPointOfPatrolX = 0;
        this.currentPointOfPatrolY = 0;
        this.directionX = 1;
        this.directionY = 1;
        this.velocity = 10;
        this.isFound = false;
    }

    calculateImpulse () {
        console.log("a");
        const target = this.objects[0];
        const sideX = this.owner.x - target.x;
        const sideY = this.owner.y - target.y;
        this.directionX = sideX > 0 ? 1 : -1;
        this.directionY = sideY > 0 ? 1 : -1;
        //console.log(this.directionX + " " + this.directionY);
        const distance = Math.sqrt(sideX * sideX + sideY * sideY);
        let toTargetX = 0;
        let toTargetY = 0;
        if (distance == 0) return new Vector2(0, 0);
        if (distance > this._randomDistance && !this.isFound) {
            toTargetX = (target.x - this.owner.x); 
            toTargetY = (target.y - this.owner.y); 
        } else {
            this.isFound = distance <= this._randomDistance;
            if (distance <= 40) {
                toTargetX = 0; toTargetY = 0
            }
            else {
                if (this.directionX == 1 && this.directionY == 1) {
                    toTargetY -= this.velocity;
                }
                if (this.directionX == 1 && this.directionY == -1) {
                    toTargetX -= this.velocity;
                }
                if (this.directionX == -1 && this.directionY == -1) {
                    toTargetY += this.velocity; 
                }
                if (this.directionX == -1 && this.directionY == 1) {
                    toTargetX += this.velocity;
                }
            }
        }
        return new Vector2(toTargetX, toTargetY);
    }
    getRandom(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
export {Patrol};