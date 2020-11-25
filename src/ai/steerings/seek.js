import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2';

class Seek extends Steering {

    constructor (owner, objects, force = 1.5, ownerSpeed = 80, targetSpeed = 100) {
        super(owner, objects, force);
        this.ownerSpeed = ownerSpeed;
        this.targetSpeed = targetSpeed
    }

    calculateImpulse () {
        const seeker = this.owner.seeker;
        const target = this.objects[0];
        const desiredVelocity = new Vector2(target.x - seeker.x, target.y-seeker.y)
        .normalize().scale(this.ownerSpeed);
        const previosVelocity = new Vector2(seeker.body.x-seeker.body.prev.x, seeker.body.y-seeker.body.prev.y);
        const steering = desiredVelocity.subtract(previosVelocity);
        return steering;
    }
}

export {Seek};