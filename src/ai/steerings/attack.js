import Vector2 from "phaser/src/math/Vector2";
import Steering from "./steering";

export default class Attack extends Steering {
    constructor(owner, target, force = 1) {
        super(owner, [target], force);
    }

    calculateImpulse() {
        const target = this.objects[0];
        console.log("attack")
        // target.hp -= this.owner.power * this.owner.hp;
        this.owner.wantToJump = true;
        return new Vector2(0,0);
    }
}