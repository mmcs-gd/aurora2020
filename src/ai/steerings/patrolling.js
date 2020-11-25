import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2'

export default class Patrolling extends Steering {

    constructor (owner, evader_index, targets, ownerSpeed= 80, force = 1) {
        super(owner, force);
        this.targets = targets
        this.evader_index = evader_index
        if(evader_index >= 3)
            console.log("*******")
        this.ownerSpeed = ownerSpeed;
        this.curentTarget = 0;
        this.target = this.targets[this.curentTarget];
    }

    seek(owner, maxSpeed) {
        const desiredVelocity = new Vector2(this.target.x - owner.x, this.target.y-owner.y)
            .normalize().scale(maxSpeed);
        return desiredVelocity
    }

    next_target()
    {
        this.curentTarget = this.curentTarget + 1
        if(this.curentTarget >= this.targets.length)
            this.curentTarget = 0
        this.target = this.targets[this.curentTarget];
    }

    calculateImpulse (currentBody)
    {
        if(Math.abs(this.target.x - this.owner.evaders[this.evader_index].x) < 10 && Math.abs(this.target.y - this.owner.evaders[this.evader_index].y) < 10)
        {
            this.next_target();
        }
        let pursuitMen;
        pursuitMen = this.owner.evaders[this.evader_index];

        if (Math.abs(this.target.x - pursuitMen.x) < 3 && Math.abs(this.target.y - pursuitMen.y) < 3)
            return  new Vector2(0, 0);

        return this.seek(pursuitMen, this.ownerSpeed);
    }
}