export default class npc extends Phaser.Physics.Arcade.Sprite{
    constructor(scene,x,y,name,frame,steering) {
        super(scene,x,y,name,frame);
        this.steering = steering;
        scene.add.existing(this);
        scene.physics.world.enable(this);
    }

    update() {
        const newTarget = this.steering.calculateImpulse();
        this.body.setVelocityX(newTarget.x);
        this.body.setVelocityY(newTarget.y);

        this.updateAnimation();
    }

    updateAnimation(){
        const animations = this.animationSets.get('Walk');
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

}