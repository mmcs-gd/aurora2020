import Slime from "./slime";
import SlimeStates from '../ai/behaviour/slime_states';

export default class SlimeWithStates extends Slime {
    constructor(scene, x, y, name, frame, stateTable, initialState) {
        super(scene, x, y, name, frame);
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.maxSpeed = 30;
        this.state = initialState;
        this.stateTable = stateTable;
        this.power = 2;
        this.hp = 82;
    }

    updateVelocity() {
        if (this.state === SlimeStates.Jumping) {
            this.wantToJump = true;
        } else {
                this.wantToJump = false;
        }
        const dir = this.steerings[this.state].calculateImpulse();
        this.body.setVelocityX(dir.x);
        this.body.setVelocityY(dir.y);
    }

    update() {
        if (!this.isDead) {
            const nextState = this.stateTable.getNextState(this.state);
            this.state = nextState;
            this.updateVelocity();
            this.updateAnimation();    
        }
    }
}