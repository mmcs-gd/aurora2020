import Vector2 from 'phaser/src/math/Vector2'
const eps = 20;

const delay = 500;

export default class Slime extends Phaser.Physics.Arcade.Sprite{
  constructor(scene, x, y, name, frame) {
    super(scene, x, y, name, frame);
    scene.physics.world.enable(this);
    scene.add.existing(this);
		this.steering = undefined;
		this.cnt = 0;
  }
	
  update() {
		if(this.steering){
			const dir = this.steering.calculateImpulse(!this.cntLess(delay)); //calculate all steerings?
			this.body.setVelocityX(dir.x)
			this.body.setVelocityY(dir.y)
			this.cnt = this.cntLess(delay) ? this.cnt + 1 : 0;
		} else {
			this.wantToJump = true;
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
  }
    
	hasArrived(){
    return this.pointOfInterest === undefined 
		|| this.pointOfInterest.distance(this.body.position) < eps;
  }
	
	cntLess(steps){
		return this.cnt < steps;
	}
}
