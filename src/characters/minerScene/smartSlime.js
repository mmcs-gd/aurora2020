import Vector2 from "phaser/src/math/Vector2";
import Ranaway from "../../ai/steerings/ranaway";
import Slime from "../slime";

export default class SmartSlime extends Slime {
    constructor(scene, x, y, name, frame) {
        super(scene, x, y, name, frame);
        scene.physics.world.enable(this);
        scene.add.existing(this);
        const mines = this.scene.mines.children.entries;
        this.dies = false;
        this.dead = false;
        this.steeringRanaway = new Ranaway(this, mines);

    }

    update() {
        if (this.dies) {
            console.log("die")
            this.destroy();
        } else {
            const { mines, velocity } = this.steeringRanaway.calculateImpulse();
            
            if (mines) {
                if (mines.some(m => m.explodes && Ranaway.isNear(this, m))) {
                    // console.log("boom")
                    this.dies = true;
                }
                else {
                    if (velocity) {
                        // console.log("run from mine, vel: ", velocity)
                        this.body.setVelocityX(velocity.x);
                        this.body.setVelocityY(velocity.y);
                    }
                }
            }
            if (!this.dies && !mines) {
                // console.log("just go somewhere")
                super.update();
            }
            this.updateAnimation();
        }
    }

    // updateAnimation() {
    //     const animsController = this.anims;
    //     if (this.wantToJump) {
    //         animsController.play(this.animations[1], true);
    //     } else {
    //         animsController.play(this.animations[0], true);
    //     }
    // }
}