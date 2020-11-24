import Patrolling from "../ai/steerings/patrolling";

export default class Npc extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, name, frame, Steering) {
        super(scene, x, y, name, frame);
        scene.physics.world.enable(this);
        scene.add.existing(this);

        this.Steering =  Steering;
    }
    update() {
        const body = this.body;
        this.body.setVelocity(0);
        if (this.Steering != 1)
        {
            let dir = {x:0,y:0}
            /*if(this.Steering instanceof Patrolling)
            {
                console.log("+")
                if(Math.abs(this.Steering.target.x - this.body.x) < 10 && Math.abs(this.Steering.target.y - this.body.y) < 10)
                {
                    this.Steering.next_terget();
                }
            }*/
            dir = this.Steering.calculateImpulse();

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
