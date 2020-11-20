export default class NPC extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, name, frame, steering) {
        super(scene, x, y, name, frame);
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.steering =  steering;
    }
    update() {
        const body = this.body;
        this.body.setVelocity(0);
        //console.log(this.steering);
        if (this.steering != 1)
        {
            const dir = this.steering.calculateImpulse();
            this.body.setVelocityX(dir.x)
            this.body.setVelocityY(dir.y)

            this.updateAnimation();
        }
    }
    updateAnimation() {
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