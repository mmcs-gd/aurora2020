import Slime from "./slime";
import SlimeStates from '../ai/behaviour/slime_states';

export default class SlimeWithStates extends Slime {
    constructor(scene, x, y, name, frame, initialState) {
        super(scene, x, y, name, frame);
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.maxSpeed = 30;
        this.state = initialState;
        
        // states and steerings are set by parameters in character-factory
        this.stateTable = [];
        this.steerings = [];

        this.power = 2;
        this.hp = 82;

        this.lastTimeAttacked = 0;
        this.attackDelay = 1000;
    }

    get isDead() {
        return this.hp <= 0;
    }

    get canAttack() {
        const now = (new Date()).getTime();
        return this.lastTimeAttacked === 0 || (now - this.lastTimeAttacked) > this.attackDelay;
    }
    
    attack(target) {
        if (this.canAttack) {
            this.lastTimeAttacked = (new Date()).getTime();
            target.subtractHP(this.power);
        }
        this.wantToJump = true;
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