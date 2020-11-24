import Vector2 from 'phaser/src/math/Vector2'

export default class Steering {
    constructor (owner, target, force = 1) {
        this.owner = owner;
        this.target = target;
        this.force = force;
    }

    calculateImpulse () {
        return new Vector2(0, 0);
    }

}
