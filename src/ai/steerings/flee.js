import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2'
import Npc from "../../characters/npc.js";

export default class Flee extends Steering {

    constructor(owner, target, force = 1, ownerMaxSpeed = 50, panicDistSq = 10000) {
        super(owner, [target], force);
        this.maxSpeed = ownerMaxSpeed;
        this.panicDistSq = panicDistSq;
        this.direction = new Vector2(0, 0);
    }

    calculateImpulse () {
        const target = this.objects[0];
        let owner;
        if (target instanceof Npc)
            owner = this.objects[0].Steering.objects[0];
        else    
            owner = this.owner.fleer;
        let newDir = new Vector2(owner.x-target.x, owner.y-target.y);
        if(newDir.lengthSq() > this.panicDistSq)
            return this.direction;
        this.direction = newDir.normalize().scale(this.maxSpeed);
        return this.direction; 
    }
}
