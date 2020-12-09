import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2';

export default class Arrival extends Steering {
	constructor (owner, target, force = 1, ownerSpeed = 40, slowingRadius = 50) {
    super(owner, [target], force);
    this.target = target;
    this.ownerSpeed = ownerSpeed;
    this.slowingRadius = slowingRadius;
  }
	
	calculateImpulse () {
		const owner = this.owner;
		
		let desiredVelocity = new Vector2(this.target.x - owner.x, this.target.y - owner.y);
		const distance = desiredVelocity.length();
		desiredVelocity = desiredVelocity.normalize().scale(this.ownerSpeed);
		if(distance < this.slowingRadius){
			desiredVelocity = desiredVelocity.scale(distance/this.slowingRadius);
		}
		const prevVelocity = new Vector2(owner.x - owner.player.body.prev.x,
			owner.y - owner.player.body.prev.y);
		return desiredVelocity.subtract(prevVelocity);
  }
}