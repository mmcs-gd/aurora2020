import Vector2 from "phaser/src/math/Vector2";
import Steering from "./steering";

export default class Attack extends Steering {
    constructor(owner, target, force = 1) {
        super(owner, [target], force);
        this.lastTimeAttacked = 0;
        this.attackDelay = 1000;
    }

    get canAttack() {
        const now = (new Date()).getTime();
        return this.lastTimeAttacked === 0 || (now - this.lastTimeAttacked) > this.attackDelay;
    }

    calculateImpulse() {
        if (this.canAttack) {
            const target = this.objects[0];
            this.lastTimeAttacked = (new Date()).getTime();
            target.subtractHP(this.owner.power);
        }
        this.owner.wantToJump = true;    
        return new Vector2(0,0);
    }
}