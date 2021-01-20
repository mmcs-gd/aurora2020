const delay = 1000;
export default class Npc extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, name, frame) {
        super(scene, x, y, name, frame);
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.steering = undefined;
        this.cnt = 0;
        this.hp = 100
    }

    update() {
        if(this.hp > 0) {
            if (this.steering) {
                const dir = this.steering.calculateImpulse(!this.cntLess(delay));
                this.body.setVelocityX(dir.x)
                this.body.setVelocityY(dir.y)
                this.cnt = this.cntLess(delay) ? this.cnt + 1 : 0;
            }
            this.updateAnimation();
        }
        else{
            this.updateAnimation();
            this.body.setVelocityX(0)
            this.body.setVelocityY(0)
            console.log(this.body)
        }


    }

    updateAnimation() {
        if (this.hp > 0) {
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
        }else {
            const animations = this.animationSets.get('Dead')
            const animsController = this.anims;

            animsController.play(animations[0], true);
        }
    }

    damage(scene)
    {
        if (this.hp > 0)
            this.hp = this.hp - 10
    }

    cntLess(steps) {
        return true;
    }
}