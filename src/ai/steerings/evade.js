import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2'
import Npc from "../../characters/npc.js";

export default class Evade extends Steering {

    constructor(owner, pursuer, force = 1, ownerMaxSpeed=100, panicDistSquare = 10e3) {
        super(owner, [pursuer], force);
        this.panicDistSq = panicDistSquare;
        this.ownerMaxSpeed = ownerMaxSpeed;
    }

    static calculateFlee (owner, target, maxSpeed, panicDistSq) {
        if(new Vector2(owner.x-target.x, owner.y-target.y).lengthSq() > panicDistSq)
            return new Vector2(0, 0);
        const desiredVelocity = new Vector2(owner.x - target.x, owner.y-target.y).normalize().scale(maxSpeed);
        const prevVelocity = new Vector2(owner.body.x-owner.body.prev.x, owner.body.y-owner.body.prev.y);
        //console.log(prevVelocity, desiredVelocity, target)
        //console.log(desiredVelocity.subtract(prevVelocity))
        return desiredVelocity.subtract(prevVelocity);
    }

    calculateImpulse () {
        //console.log(this)
        const pursuer = this.objects[0];
        let owner;
        if (pursuer instanceof Npc)
            owner = this.objects[0].Steering.objects[0];
        else    
            owner = this.owner.evader;
        // console.log("owner")
        // console.log(owner.x, owner.y)
        // console.log("pursuer")
        // console.log(pursuer.x, pursuer.y)

        const toPursuer = new Vector2(pursuer.x - owner.x, pursuer.y-owner.y);
        //console.log(toPursuer)
        const prevPursuerVelocity = new Vector2(pursuer.body.x-pursuer.body.prev.x, 
            pursuer.body.y-pursuer.body.prev.y); 
        const lookAheadTime = toPursuer.length() / 
                        (this.ownerMaxSpeed + prevPursuerVelocity.length());                                    
        const targetPos = new Vector2(pursuer.x, pursuer.y).add((pursuer.body.velocity.clone()).scale(lookAheadTime));
        
        
        return Evade.calculateFlee(owner, targetPos, this.ownerMaxSpeed, this.panicDistSq);
    }
}