import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2'
import Npc from "../../characters/npc.js";

export default class Exploring extends Steering {

    constructor(owner, force = 1, ownerSpeed = 50) {
        super(owner, [], force);
        this.ownerSpeed = ownerSpeed;
        const angle = Phaser.Math.RND.realInRange(-Math.PI, Math.PI);
        this.direction = new Vector2(Math.cos(angle), Math.sin(angle)).scale(this.ownerSpeed);
    }

    calculateImpulse () {
        const angle = Phaser.Math.RND.realInRange(-Math.PI / 5, Math.PI / 5);
        let currentAngle = this.direction.angle()
        this.direction = new Vector2(Math.cos(currentAngle + angle), Math.sin(currentAngle + angle)).scale(this.ownerSpeed);
        return this.direction;
    }
}
