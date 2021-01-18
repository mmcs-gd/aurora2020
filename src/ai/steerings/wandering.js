import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2';
import Circle from 'phaser/src/geom/circle';

const eps = 5;

export default class Wandering extends Steering {
	constructor (owner, target, force = 1, ownerSpeed = 10, wanderingRadius = 70,boundary = []) {
    super(owner, target, force);
    this.ownerSpeed = ownerSpeed;
    this.wanderingRadius = wanderingRadius;
    this.target = new Vector2(0,0);
    this.isArrival = true;
    this.boundary = boundary
  }
	
	degToRad(deg){
		return (Math.PI * deg) / 180;
	}
	
	isArrived(){

		return eps > new Vector2(this.owner.x - this.target.x, this.owner.y - this.target.y).length();
	}

	findTarget(){
		const scaleX = 32;//размер тайла
		const scaleY = 32;
		const randWanderingRadius = Phaser.Math.RND.between(1, this.wanderingRadius);
		const randAngle = (Phaser.Math.RND.between(0, 360));

		const circle = new Circle(this.owner.x,this.owner.y,this.wanderingRadius);

		Circle.CircumferencePoint(circle,randAngle,this.target)

		//this.target = new Vector2(this.owner.x + randWanderingRadius*Math.sin(randAngle), this.owner.y + randWanderingRadius*Math.cos(randAngle));

		let rnd = getRandomIntInclusive(0, 100)
		if(rnd >=80){
			this.target = new Vector2(this.boundary.x * 32 +this.boundary.width * 32 -50,this.boundary.y * 32 + this.boundary.height * 32 -50)
				return
		}

		if (this.target.x  <= this.boundary.x * 32 + 15 || this.target.x >= this.boundary.x * 32 +this.boundary.width * 32 -5 ||
			this.target.y  <= this.boundary.y * 32  + 15|| this.target.y >= this.boundary.y * 32 + this.boundary.height * 32 -5) {
      				this.findTarget();
    }
	}
	
	calculateImpulse(push = false) {



		if (this.isArrival){
			this.isArrival = false;
      		this.findTarget();
    	}

		if((this.owner.x -this.target.x)<=1 &&  (this.owner.y -this.target.y)<=1){
			this.isArrival = true;
			return new Vector2(0,0)
		}

		const desiredVelocity = new Vector2(this.target.x - this.owner.x, this.target.y - this.owner.y)
		.normalize().scale(this.ownerSpeed);
		const prevVelocity = new Vector2(this.owner.x - this.owner.body.prev.x, this.owner.y - this.owner.body.prev.y);
		return desiredVelocity.subtract(prevVelocity.normalize());
  }
}

function getRandomIntInclusive(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.round(Math.random() * (max - min ) + min);
}