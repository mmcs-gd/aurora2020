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
        this.steeringRanaway = new Ranaway(this, mines);

    }



    nearestMine() {
        const mines = this.scene.mines.children.entries;
        if (mines.length === 0) {
            return null;
        }
        const nearest = Ranaway.findNearestMine(this.body, mines);
        if (!Ranaway.isNear(this.body, nearest)) {
            return null;
        }
        return nearest;
    }

    update() {
        let velocity = new Vector2(0, 0);
        const mine = this.nearestMine();
        if (mine) {
            if (mine.beeps) {
                velocity = this.steeringRanaway.calculateImpulse();
                if (velocity.x !== 0 || velocity.y !== 0) {
                    this.body.setVelocityX(velocity.x);
                    this.body.setVelocityY(velocity.y);
                }
            } else if (mine.explodes) {
                console.warn("There's a MINE!!!")
                this.dies = true;
            }
        }
        if (!this.dies && (!mine || (velocity.x === 0 && velocity.y === 0))) {

            super.update();
        }
        this.updateAnimation();
    }

    updateAnimation() {
        const animsController = this.anims;
        if (this.dies) {
            animsController.play(this.animations[2], true);
            // this.destroy();
        } else if (this.wantToJump) {
            animsController.play(this.animations[1], true);
        } else {
            animsController.play(this.animations[0], true);
        }
    }
}