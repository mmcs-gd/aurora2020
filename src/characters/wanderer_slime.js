import Vector2 from 'phaser/src/math/Vector2'
import Slime from "./slime";
import Wandering from "../ai/steerings/wandering";

export default class WandererSlime extends Slime{
  constructor(scene, x, y, name, frame) {
    super(scene, x, y, name, frame);
    scene.physics.world.enable(this);
    scene.add.existing(this);
    this.steering = new Wandering(this,[]);
		this.cnt = 0;
  }
  
	update() {
		if (this.hasArrived() || !this.cntLess(500)){
		//if (this.hasArrived()){
      const body = this.body;
      const dist = this.steering.calculateImpulse();
      this.body.setVelocityX(dist.velocity.x)
      this.body.setVelocityY(dist.velocity.y)
			this.pointOfInterest = dist.target;
			this.cnt = 0;
		}
		this.updateAnimation();
  }
  
	cntLess(steps){
		return this.cnt < steps;
	}
	
	updateAnimation() {
    const animsController = this.anims;
    const x = this.body.velocity.x;
    const y = this.body.velocity.y;
		++this.cnt;
    animsController.play(this.animations[0], true);
  }
}