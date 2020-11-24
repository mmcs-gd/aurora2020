import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2'
import Npc from "../../characters/npc.js";

export default class Evade extends Steering {

    constructor(owner, pursuer, force = 1, ownerMaxSpeed=50) {
        super(owner, [pursuer], force);
        this.runner = owner
        this.ownerMaxSpeed = ownerMaxSpeed;
    }

    static calculateFlee (owner, target, maxSpeed) {

        const desiredVelocity = new Vector2(owner.x - target.x, owner.y-target.y).normalize().scale(maxSpeed);
        const prevVelocity = new Vector2(owner.body.x-owner.body.prev.x, owner.body.y-owner.body.prev.y);
        return desiredVelocity.subtract(prevVelocity);
    }

    calculateImpulse () {
        const pursuer = this.objects[0];

        const toPursuer = new Vector2(pursuer.x - this.runner.x, pursuer.y-this.runner.y);

        const prevPursuerVelocity = new Vector2(pursuer.body.x-pursuer.body.prev.x, 
            pursuer.body.y-pursuer.body.prev.y); 
        const lookAheadTime = toPursuer.length() / 
                        (this.ownerMaxSpeed + prevPursuerVelocity.length());                                    
        const targetPos = new Vector2(pursuer.x, pursuer.y).add((pursuer.body.velocity.clone()).scale(lookAheadTime));

        
        return Evade.calculateFlee(this.runner, targetPos, this.ownerMaxSpeed);
    }
}