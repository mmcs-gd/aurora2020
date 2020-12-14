import Vector2 from "phaser/src/math/Vector2";
import Chase from "../../ai/steerings/chase";
import Ranaway from "../../ai/steerings/ranaway";
import Wander from "../../ai/steerings/wander";
import Slime from "../slime";

export default class SmartSlime extends Slime {
    constructor(scene, x, y, name, frame) {
        super(scene, x, y, name, frame);
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.maxSpeed = 30;
        this.dies = false;

        const mines = this.scene.mines.children.entries;
        this.ranawaySteering = new Ranaway(this, mines);
        this.chaseSteering = new Chase(this, [this.scene.player]);
        this.wanderSteering = new Wander(this);
        this.prevSteeringWasWandering = false;
    }

    update() {
        if (this.dies) {
            this.destroy();
        } else {
            let { objects: mines, velocity } = this.ranawaySteering.calculateImpulse();

            if (mines) {
                this.wantToJump = false;
                if (mines.some(m => m.explodes && Ranaway.isNear(this, m))) {
                    this.dies = true;
                }
                else {
                    if (velocity) {
                        this.body.setVelocityX(velocity.x);
                        this.body.setVelocityY(velocity.y);
                    }
                }
                this.prevSteeringWasWandering = false;
            }
            if (!this.dies && !mines) {
                velocity = this.chaseSteering.calculateImpulse();
                if (velocity) {
                    if (velocity.x !== 0 || velocity.y !== 0) {
                        this.body.setVelocityX(velocity.x);
                        this.body.setVelocityY(velocity.y);
                        this.wantToJump = false;
                    } else {
                        this.wantToJump = true;
                    }
                    this.prevSteeringWasWandering = false;
                } else {
                    this.wantToJump = false;
                    velocity = this.wanderSteering.calculateImpulse(!this.prevSteeringWasWandering);
                    this.body.setVelocityX(velocity.x);
                    this.body.setVelocityY(velocity.y);
                    this.prevSteeringWasWandering = true;
                }
           }
            this.updateAnimation();
        }
    }

}