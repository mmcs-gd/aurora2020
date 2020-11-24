import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2';

export default class Arrival extends Steering {
	constructor (owner, target, force = 1, ownerSpeed = 40, slowingRadius = 70) {
    super(owner, [target], force);
    this.ownerSpeed = ownerSpeed;
		this.slowingRadius = slowingRadius;
  }
	
	calculateImpulse () {
		const target = this.target;
		const owner = this.owner;
		
		let desiredVelocity = new Vector2(target.x - owner.x, target.y - owner.y);
		const distance = desiredVelocity.length();
		desiredVelocity = desiredVelocity.normalize().scale(this.ownerSpeed); //need targetSpeed??
		if(distance < this.slowingRadius){
			desiredVelocity = desiredVelocity.scale(distance/slowingRadius);
		}
		const prevVelocity = new Vector2(owner.x - owner.body.prev.x, owner.y - owner.body.prev.y);
		return desiredVelocity.subtract(prevVelocity);
  }
}