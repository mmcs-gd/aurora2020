import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2'

export default class Pursuit extends Steering {

    constructor (owner, target, force = 1, ownerSpeed= 80, targetSpeed = 100) {
        super(owner, [target], force);
        this.ownerSpeed = ownerSpeed;
        this.targetSpeed = targetSpeed
    }

    static seek(owner, target, maxSpeed) {
        const desiredVelocity = new Vector2(target.x - owner.x, target.y-owner.y)
        .normalize().scale(maxSpeed);
        const prevVelocity = new Vector2(owner.body.x-owner.body.prev.x, owner.body.y-owner.body.prev.y);
        //console.log(owner.evader.body.prev.x,desiredVelocity)
        return desiredVelocity.subtract(prevVelocity);
    }

    calculateImpulse () {
        //console.log(this)
        const searcherDirection = this.owner.evader.body.velocity;
        const target = this.objects[0];
        const targetPos = new Vector2(target.x, target.y);
        const targetDirection = target.body.velocity;
        const toTarget = new Vector2(this.owner.evader.x - target.x, this.owner.evader.y - target.y);
        const relativeHeading = searcherDirection.dot(targetDirection);
        //console.log(target.x, this.owner.evader.x,target.y, this.owner.evader.y)
        
        if (Math.abs(target.x - this.owner.evader.x) < 40 && Math.abs(target.y - this.owner.evader.y) < 40)
            return  new Vector2(0, 0);

        if (toTarget.dot(targetDirection) < 0 || relativeHeading > -0.95)
            return Pursuit.seek(this.owner.evader, targetPos, this.ownerSpeed);

        
            
              
        
        const lookAheadTime = toTarget.length / (this.ownerSpeed + this.targetSpeed)
        
        return Pursuit.seek(this.owner.evader, 
            targetPos.add(target.body.velocity.clone().scale(lookAheadTime)), 
            this.ownerSpeed);
    }
}