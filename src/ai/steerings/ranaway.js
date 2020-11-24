import Vector2 from "phaser/src/math/Vector2";
import Steering from "./steering";

export default class Ranaway extends Steering {
    constructor(owner, mines, force = 1, maxSpeed = 30) {
        super(owner, mines, force);
        this.maxSpeed = maxSpeed;
    }

    static calculateDistance(object, mine) {
        return Math.sqrt((object.x - mine.x)*(object.x - mine.x) + (object.y - mine.y)*(object.y - mine.y));
    }

    static isNear(object, mine, margin = 0) {
        const d = Ranaway.calculateDistance(object, mine);
        return d < mine.dangerZone + margin;
    }

    static findNearMines(object, mines) {
        let nearest = [];
        
        for (const m of mines) {
            if (Ranaway.isNear(object, m, 50)) {
                nearest.push(m);
            }
        }
        return nearest;
    }

    calculateImpulse() {
        if (this.objects.length === 0) {
            return {mines: null, velocity: null};
        }
        const mines = Ranaway.findNearMines(this.owner, this.objects);
        if (mines.length === 0) {
            return {mines: null, velocity: null};
        }
        let vel = new Vector2(0,0);
        for (const m of mines) {
            vel.add(new Vector2(this.owner.x - m.x, this.owner.y - m.y));
        }
        vel.normalize().scale(this.maxSpeed);
        // const toMine = new Vector2(mine.x - this.owner.x, mine.y - this.owner.y);
        // const vel = new Vector2(this.owner.x - mine.x, this.owner.y - mine.y).normalize().scale(this.maxSpeed);
        return { mines, velocity: vel };
    }
}