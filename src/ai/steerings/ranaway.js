import Vector2 from "phaser/src/math/Vector2";
import Steering from "./steering";

export default class Ranaway extends Steering {
    constructor(owner, mines, force = 1, maxSpeed = 10) {
        super(owner, mines, force);
        this.maxSpeed = maxSpeed;
    }

    static calculateDistance(object, mine) {
        return Math.sqrt((object.x - mine.x)*(object.x - mine.x) + (object.y - mine.y)*(object.y - mine.y));
    }

    static isNear(object, mine) {
        const d = Math.sqrt((object.x - mine.x)*(object.x - mine.x) + (object.y - mine.y)*(object.y - mine.y));
        return d < mine.dangerZone + 10;
    }

    static findNearestMine(object, mines) {
        let nearest = mines[0];
        let dist = Ranaway.calculateDistance(object, nearest);
        
        for (const m of mines) {
            const d = Ranaway.calculateDistance(object, m);
            if (d < dist) {
                nearest = m;
            }
        }
        return nearest;
    }

    calculateImpulse() {
        if (this.objects.length === 0) {
            return new Vector2(0,0);
        }
        const mine = Ranaway.findNearestMine(this.owner, this.objects);
        if (!Ranaway.isNear(this.owner, mine)) {
            return new Vector2(0,0);
        }
        // const toMine = new Vector2(mine.x - this.owner.x, mine.y - this.owner.y);
        const vel = new Vector2(this.owner.x - mine.x, this.owner.y - mine.y).normalize().scale(this.maxSpeed);
        return vel;
    }
}