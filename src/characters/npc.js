const eps = 20;
export default class Npc extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, name, frame) {
        super(scene, x, y, name, frame);
        scene.physics.world.enable(this);
        scene.add.existing(this);
				
        this.steering = undefined;
				this.cnt = 0;
    }
    update() {
			if(this.steering){
				if(this.hasArrived() || !this.cntLess(500)){
					const dist = this.steering.calculateImpulse();
					if(dist.target){
						//calculate all steerings?
						this.body.setVelocityX(dist.velocity.x)
						this.body.setVelocityY(dist.velocity.y)
						this.pointOfInterest = dist.target;
					} else {
						this.body.setVelocityX(dist.x)
						this.body.setVelocityY(dist.y)
					}
					this.cnt = 0;
				}
			}
      this.updateAnimation();
    }
    updateAnimation() {
        const animations = this.animationSets.get('Walk');
				++this.cnt;
        const animsController = this.anims;
        const x = this.body.velocity.x;
        const y = this.body.velocity.y;

        if (x < 0) {
            animsController.play(animations[0], true);
        } else if (x > 0) {
            animsController.play(animations[1], true);
        } else if (y < 0) {
            animsController.play(animations[2], true);
        } else if (y > 0) {
            animsController.play(animations[3], true);
        } else {
            const currentAnimation = animsController.currentAnim;
            if (currentAnimation) {
                const frame = currentAnimation.getLastFrame();
                this.setTexture(frame.textureKey, frame.textureFrame);
            }
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