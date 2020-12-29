import Steering from "./steering";
import Vector2 from 'phaser/src/math/Vector2'

export default class HideAndSeek extends Steering {
	constructor(owner, objects, target, force = 1) {
        super(owner, objects, force);
		this.target = target;
    }

	distance(obj) {
        return Math.sqrt(
            (this.owner.seeker.x - obj.x) * (this.owner.seeker.x - obj.x) +
            (this.owner.seeker.y - obj.y) * (this.owner.seeker.y - obj.y));
	}

	nearestObject() {
		let result;
		let dist = Number.MAX_VALUE;
		for (let obj of this.objects) {
			const d = this.distance(obj);
			if (d < dist) {
				result = obj;
				dist = d;
			}
		}
		return result;
	}

	calculateImpulse() {
		let seeker = this.owner.seeker;

		if (seeker.hide) {
			const toHide = this.nearestObject();
			const direction = new Vector2(toHide.x - this.target.x, toHide.y - this.target.y).normalize().scale(50);
			const targetPosition = new Vector2(toHide.x + direction.x, toHide.y + direction.y);
			if (this.distance(targetPosition) < 1) {
				seeker.hide = false;
				seeker.hideWait = true;
				return new Vector2(0, 0);
			} else {
				return new Vector2(targetPosition.x - seeker.x, targetPosition.y - seeker.y).normalize().scale(50);
			}
		}

		if (seeker.seek) {
			if (this.distance(this.target) < seeker.width * 1.5) {
				seeker.seek = false;
				seeker.hide = true;
				return new Vector2(0, 0);
			} else {
				return new Vector2(this.target.x - seeker.x, this.target.y - seeker.y).normalize().scale(50);
			}
		}

		if (seeker.hideWait) {
			if (this.distance(this.target) < seeker.width * 1.5) {
				seeker.hideWait = false;
				seeker.seekWait = true;
				setTimeout(function() {
					seeker.seekWait = false;
					seeker.seek = true;
				}, 5000);
			}
			return new Vector2(0, 0);
		}

		if (seeker.seekWait) {
			return new Vector2(0, 0);
		}
	}
}