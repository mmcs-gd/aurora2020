import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2';
import Graphics from 'phaser/src/gameobjects/graphics/Graphics'


class Shadowing extends Steering {
    constructor(owner, objects, force = 1) {
        super(owner, objects, force);
    }

    calculateImpulse() {

        const target = this.objects;
        const owner = this.owner.gameObject[1];
        let distance = Math.sqrt(Math.pow(target.x - owner.x, 2) + Math.pow(target.y - owner.y, 2));
        let desiredVelocity = new Vector2(target.x - owner.x, target.y - owner.y)
        desiredVelocity.normalize().scale(50);
        if (distance >= 200) {
            return desiredVelocity;
        }

        if (distance <= 150) {
            const newDesiredVelocity = new Vector2(-desiredVelocity.x, -desiredVelocity.y);
            newDesiredVelocity.normalize().scale(50);
            return newDesiredVelocity;
        }
        return new Vector2(0, 0)

    }
}
export {Shadowing}