import Steering from "./steering";
import Vector2 from 'phaser/src/math/Vector2'

export default class HideAndSeek extends Steering {
	constructor(index, owner, objects, target, force = 1) {
        super(owner, objects, force);
		this.target = target;
		this.index = index;
    }

	distance(obj) {
		let seeker = this.owner.seekers[this.index];
        return Math.sqrt(
            (seeker.x - obj.x) * (seeker.x - obj.x) +
            (seeker.y - obj.y) * (seeker.y - obj.y));
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
		let seeker = this.owner.seekers[this.index];

		if (seeker.hide) {
			if (this.distance(this.target) < seeker.width * 1.5) {
				seeker.hide = false;
				seeker.seekWait = true;
				setTimeout(function() {
					seeker.seekWait = false;
					seeker.seek = true;
				}, 5000);
			}

			const toHide = this.nearestObject();
			const direction = new Vector2(toHide.x - this.target.x, toHide.y - this.target.y).normalize().scale(75);
			const targetPosition = new Vector2(toHide.x + direction.x, toHide.y + direction.y);
			if (this.distance(targetPosition) < 1) {
				seeker.hide = false;
				seeker.hideWait = true;
				return new Vector2(0, 0);
			} else {
				return new Vector2(targetPosition.x - seeker.x, targetPosition.y - seeker.y).normalize().scale(75);
			}
		}

		if (seeker.seek) {
			if (this.distance(this.target) < seeker.width) {
				return new Vector2(0, 0);
			} else {
				return new Vector2(this.target.x - seeker.x, this.target.y - seeker.y).normalize().scale(75);
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