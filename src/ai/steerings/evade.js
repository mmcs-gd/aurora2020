import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2'

export default class Evade extends Steering {

    constructor(owner, pursuer, force = 1, ownerMaxSpeed=100, panicDistSquare = 10e4) {
        super(owner, [pursuer], force);
        this.panicDistSq = panicDistSquare;
        this.ownerMaxSpeed = ownerMaxSpeed;
    }

    static calculateFlee (owner, target, maxSpeed, panicDistSq) {
        //console.log(owner.x,target.x, owner.y,target.y)
        //console.log(new Vector2(owner.x-target.x, owner.y-target.y).lengthSq())
        if(new Vector2(owner.x-target.x, owner.y-target.y).lengthSq() > panicDistSq)
            return new Vector2(0, 0);
        const desiredVelocity = new Vector2(owner.x - target.x, owner.y-target.y).normalize().scale(maxSpeed);
        const prevVelocity = new Vector2(owner.body.x-owner.body.prev.x, owner.body.y-owner.body.prev.y);
        return desiredVelocity.subtract(prevVelocity);
    }

    calculateImpulse () {

        const pursuer = this.objects[0];
        const owner = this.owner.evader;

        const toPursuer = new Vector2(pursuer.x - owner.x, pursuer.y-owner.y);
        const prevPursuerVelocity = new Vector2(pursuer.body.x-pursuer.body.prev.x, 
            pursuer.body.y-pursuer.body.prev.y); 
        const lookAheadTime = toPursuer.length() / 
                        (this.ownerMaxSpeed + prevPursuerVelocity.length());                                    
        const targetPos = new Vector2(pursuer.x, pursuer.y).add((pursuer.body.velocity.clone()).scale(lookAheadTime));

        return Evade.calculateFlee(owner, targetPos, this.ownerMaxSpeed, this.panicDistSq);
    }
}