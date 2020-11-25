import Vector2 from "phaser/src/math/Vector2";
import Steering from "./steering"

export default class Wander extends Steering {
    constructor(owner, force = 1, maxRadius = 200) {
        super(owner, [], force);
        this.target = null;
        this.maxRadius = maxRadius;
        this.lastOwnerLoc = new Vector2(this.owner.x, this.owner.y);
    }

    toRad(deg){
		return (Math.PI * deg) / 180;
    }
    
    reachedTarget() {
        const dist = Math.sqrt(
            (this.owner.x - this.target.x) * (this.owner.x - this.target.x) +
            (this.owner.y - this.target.y) * (this.owner.y - this.target.y));
        return dist < 10;
    }

    findNewTarget() {
        const bounds = this.owner.scene.physics.world.bounds;
        const wanderingRadius = Phaser.Math.RND.between(1, this.maxRadius);
        const angle = this.toRad(Phaser.Math.RND.between(0, 360));
        this.target = new Vector2(
            this.owner.x + wanderingRadius*Math.sin(angle),
            this.owner.y + wanderingRadius*Math.cos(angle) 
        );
        if (this.target.x < 5 || this.target.x > bounds.width - 5 ||
            this.target.y < 5 || this.target.y > bounds.height) {
                this.findNewTarget();
            }
    }

    isStuck() {
        const curVelocity = new Vector2(this.owner.body.x - this.owner.body.prev.x, this.owner.body.y - this.owner.body.prev.y)
            .normalize();
        return Math.abs(curVelocity.x) < 0.1 && Math.abs(curVelocity.y) < 0.1;
    }

    calculateImpulse(findNewPoint = false) {  
        if (!this.target || this.reachedTarget() || this.isStuck() || findNewPoint) {
            this.findNewTarget();
        }       

        const desiredVelocity = new Vector2(this.target.x - this.owner.x, this.target.y - this.owner.y)
            .normalize()
            .scale(this.owner.maxSpeed);
        const curVelocity = new Vector2(this.owner.body.x - this.owner.body.prev.x, this.owner.body.y - this.owner.body.prev.y)
            .normalize();
        
        return desiredVelocity.subtract(curVelocity);     
    }
}