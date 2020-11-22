import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2';

class Shadowing extends Steering {
    constructor(owner, objects, force = 1) {
        super(owner,objects,force);
    }

    calculateImpulse(){

        return new Vector2(0,0);

    }
}

export {Shadowing}