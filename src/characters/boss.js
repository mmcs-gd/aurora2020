export default class Boss extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, name, frame) {
        super(scene, x, y, name, frame);
        scene.physics.world.enable(this);
        scene.add.existing(this);

        this.health = 1000;
        this.cast = undefined;
        this.skills = {
            shot: undefined,
            slimes: undefined,
        }
    }

    setAI(ai, initialState) {
        this.ai = ai;
        this.currentState = initialState;
    }
    update() {
        // ai призывает желешки при 75%, 50%, 25% хп
        if (this.ai)
        {
          this.currentState = this.ai.update(this.currentState);
        }

        if (this.steering) {
            const dir = this.steering.calculateImpulse();
            if (dir) {
                this.body.setVelocityX(dir.x);
                this.body.setVelocityY(dir.y);
            }
        }

        // https://youtu.be/X1iP7lgBs3U
        // https://youtu.be/w7U-qWWS7LU
        this.health--;
        console.log(this.health);
        this.updateAnimation();
    }
    updateAnimation() {
        const animations = this.animationSets.get('Walk');
        const animsController = this.anims;
        const { x, y } = this.body.velocity;

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