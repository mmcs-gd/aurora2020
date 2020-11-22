import Vector2 from 'phaser/src/math/Vector2'
const eps = 20;
export default class Slime extends Phaser.Physics.Arcade.Sprite{
  constructor(scene, x, y, name, frame) {
    super(scene, x, y, name, frame);
    scene.physics.world.enable(this);
    scene.add.existing(this);
		this.steering = undefined;
		this.cnt = 0;
  }
	
  update() {
		//kostyl :)
    if (this.hasArrived() || !this.cntLess(500)){
		//if (this.hasArrived()){
			if(this.steering){
				const dist = this.steering.calculateImpulse(); //calculate all steerings?
				this.body.setVelocityX(dist.velocity.x)
				this.body.setVelocityY(dist.velocity.y)
				this.pointOfInterest = dist.target;
			} else {
				this.wantToJump = true;
			}
			this.cnt = 0;
    }
		this.updateAnimation();
	}
    
	updateAnimation() {
    const animsController = this.anims;
    if (this.wantToJump){
			animsController.play(this.animations[1], true);
    } else {
			animsController.play(this.animations[0], true);
    }
		++this.cnt;
  }
    
	hasArrived(){
    return this.pointOfInterest === undefined 
		|| this.pointOfInterest.distance(this.body.position) < eps;
  }
	
	cntLess(steps){
		return this.cnt < steps;
	}
}
