import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2';

const eps = 5;

export default class Wandering extends Steering {
	constructor (owner, target, force = 1, ownerSpeed = 40, wanderingRadius = 70) {
    super(owner, target, force);
    this.ownerSpeed = ownerSpeed;
		this.wanderingRadius = wanderingRadius;
		this.target = null;
  }
	
	degToRad(deg){
		return (Math.PI * deg) / 180;
	}
	
	isArrived(){
		return eps > new Vector2(this.owner.x - this.target.x, this.owner.y - this.target.y).length();
	}
	
	findTarget(){
		const bounds = this.owner.scene.physics.world.bounds;
		const randWanderingRadius = Phaser.Math.RND.between(1, this.wanderingRadius);
		const randAngle = this.degToRad(Phaser.Math.RND.between(0, 360));
		this.target = new Vector2(this.owner.x + randWanderingRadius*Math.sin(randAngle), this.owner.y + randWanderingRadius*Math.cos(randAngle));
		if (this.target.x < 5 || this.target.x > bounds.width - 5 ||
				this.target.y < 5 || this.target.y > bounds.height) {
      this.findTarget();
    }
	}
	
	calculateImpulse(push = false) {
		if (!this.target || this.isArrived() || push) {
      this.findTarget();
    } 
		const desiredVelocity = new Vector2(this.target.x - this.owner.x, this.target.y - this.owner.y)
		.normalize().scale(this.ownerSpeed);
		const prevVelocity = new Vector2(this.owner.x - this.owner.body.prev.x, this.owner.y - this.owner.body.prev.y);
		return desiredVelocity.subtract(prevVelocity.normalize());
  }
}