import Vector2 from 'phaser/src/math/Vector2'
const eps = 20;
export default class Slime extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, name, frame) {
        super(scene, x, y, name, frame);
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.steering = undefined;
        this.wantToJump = true;
    }
    setSteering(steering) {
        this.steering = steering;
    }
    update() {
        if (this.steering) {
            const vector = this.steering.calculateImpulse();
            if (vector != undefined){
                this.body.setVelocityX(vector.x);
                this.body.setVelocityY(vector.y);
                this.wantToJump = vector.x == 0 && vector.y == 0;
            }
        }
        this.updateAnimation();
    }
    updateAnimation() {
        const animsController = this.anims;
        if (this.wantToJump)
        {
            animsController.play(this.animations[1], true);
        } else
        {
            animsController.play(this.animations[0], true);
        }

    }
}
