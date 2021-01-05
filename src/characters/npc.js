export default class Npc extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, name, frame, steering, hp = 100) {
        super(scene, x, y, name, frame);
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.steering = steering;
        this.cnt = 0;
        this.hp = hp;
    }

    setAI(ai, initialState)
    {
        this.ai = ai;
        this.currentState = initialState;
    }
    update() {
        
        if (this.ai)
        {
          this.currentState = this.ai.update(this.currentState);
        }
        const delay = 500;
        this.body.setVelocity(0);
        if (this.steering) {
            let dir = this.steering.calculateImpulse(!this.cntLess(delay));
            this.body.setVelocityX(dir.x)
            this.body.setVelocityY(dir.y)
            this.cnt = this.cntLess(delay) ? this.cnt + 1 : 0;
        }
        this.updateAnimation();

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
    cntLess(steps) {
        return this.cnt < steps;
    }
    damage()
    {
        if (this.hp > 0) {
            this.hp = this.hp - 53
        } else {
            this.nextLocation = null
            this.body.destroy()
            this.body.stop()
            //this.destroy();
            this.x = -10;
            this.y = -10;
            //console.log(this)
            //this.body.setActive(false);
            //this.body.setDrag(-10, -10);
            //console.log(this)
        }
    }
}

