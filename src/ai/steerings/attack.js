import Vector2 from "phaser/src/math/Vector2";
import Steering from "./steering";

export default class Attack extends Steering {
    constructor(owner, target, force = 1) {
        super(owner, [target], force);
        this.lastTimeAttacked = 0;
        this.target = target;
    }

    calculateImpulse() {
        this.owner.attack(this.target);
        return new Vector2(0,0);
    }
}