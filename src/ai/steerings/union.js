import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2'
import { getMessage } from '../../utils/messages';

export default class Union extends Steering {
	constructor(owner, group, index, player, force = 1, ownerSpeed = 50) {
		super(owner, group, index, [], force);
		this.owner = owner;
		this.group = group;
		this.index = index;
		this.player = player;
		this.ownerSpeed = ownerSpeed;
		this.direction = new Vector2(0, 0);
		this.nextX = -32;
		this.nextY = -32;
	}

	calculateImpulse () {
		if (this.owner.gameObjects[this.index].visible) {
			const { x, y } = this.player;
			let nextX = x - this.owner.gameObjects[this.index].x;
			let nextY = y - this.owner.gameObjects[this.index].y;
			let nextDirection = new Vector2({ x: nextX, y: nextY });
			if (Math.abs(nextDirection.lengthSq() - 10000) < 1000) {
				nextDirection = new Vector2({ x: 0, y: 0 });
			} else if (Math.abs(nextDirection.lengthSq()) < 2000) {
				this.owner.cameras.main.shake(1000, 0.0025);
				this.player.maxSpeed += 5;
				this.owner.effectsFactory.makeOneEffect('phantom', x, y);
				this.owner.gameObjects[this.index].catch();
				getMessage(this.owner, this.owner.gameObjects.filter(npc => npc.visible).length - 1);

			} else if (Math.abs(nextDirection.lengthSq()) < 10000) {
				nextX = this.owner.gameObjects[this.index].x - x;
				nextY = this.owner.gameObjects[this.index].y - y;
				nextDirection = new Vector2({ x: nextX, y: nextY });
			} else {
				if (Math.random() < 0.005) {
					this.nextX = -1 * this.nextX
				}
				if (Math.random() < 0.005) {
					this.nextY = -1 * this.nextY
				}
				nextDirection = new Vector2({ x: this.nextX, y: this.nextY });
			}
			nextDirection.normalize().scale(this.ownerSpeed);
			return nextDirection;
		}
		return this.direction;
	}
}
