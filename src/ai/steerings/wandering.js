import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2';

export default class Wandering extends Steering {
	constructor (owner, target, force = 1, ownerSpeed = 40, wanderingRadius = 20) { //wanderingDistance
    super(owner, [target], force);
    this.ownerSpeed = ownerSpeed;
		this.wanderingRadius = wanderingRadius;
  }
	
	degToRad(deg){
		return (Math.PI * deg) / 180;
	}
	
	calculateImpulse () {
		const wanderer = this.owner;
		const randWanderingRadius = Phaser.Math.RND.between(1, this.wanderingRadius);
		const randAngle = this.degToRad(Phaser.Math.RND.between(0, 360));
		const target = new Vector2(wanderer.x + randWanderingRadius*Math.sin(randAngle), wanderer.y + randWanderingRadius*Math.cos(randAngle));
    
		const desiredVelocity = new Vector2(target.x - wanderer.x, target.y - wanderer.y)
		.normalize().scale(this.ownerSpeed);
		const prevVelocity = new Vector2(wanderer.x - wanderer.body.prev.x, wanderer.y - wanderer.body.prev.y);
		return { target: target, velocity: desiredVelocity.subtract(prevVelocity.normalize())};
		//return { target: target, velocity: desiredVelocity};
  }
}