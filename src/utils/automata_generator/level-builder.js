import Vector2 from 'phaser/src/math/Vector2';
import { TILE_MAPPING, TILES } from './tiles';

export default class CellularAutomataLevelBuilder {
    constructor(tileMap, minDistanceToPlayer) {
        this.tileMap = tileMap;

        this.width = tileMap.length;
        this.height = tileMap[0].length;

        this.minDistanceToPlayer = minDistanceToPlayer;

        this.playerPosition = this.calculatePlayerPosition();
    }

    /* Looks for safe position (3x3) for a player to spawn */
    calculatePlayerPosition() {
        while (true) {
            const x = this.rand(this.width - 1);
            const y = this.rand(this.height - 1);
            if (this.areCoordsValid({ x , y })) return { x , y };
        }
    }

    /* Looks for safe position (3x3) for NPC to spawn, far enough from player's position */
    calculateNpcPosition() {
        while (true) {
            const x = this.rand(this.width - 1);
            const y = this.rand(this.height - 1);

            if (this.areCoordsValid({ x, y }) && new Vector2(x, y).distance(new Vector2(this.playerPosition)) > this.minDistanceToPlayer) {
                return { x , y };
            }
        }
    }

    areCoordsValid({ x, y }) {
        const coordsAreWithinBounds = x >= 0 && y >= 0 && x < this.width && y < this.height;
        const thereIsAvailable3x3 = 
            this.tileMap[x][y] !== TILE_MAPPING.WALL &&
            this.tileMap[x - 1][y] !== TILE_MAPPING.WALL &&
            this.tileMap[x + 1][y] !== TILE_MAPPING.WALL &&
            this.tileMap[x][y - 1] !== TILE_MAPPING.WALL &&
            this.tileMap[x][y + 1] !== TILE_MAPPING.WALL &&
            this.tileMap[x - 1][y - 1] !== TILE_MAPPING.WALL &&
            this.tileMap[x - 1][y + 1] !== TILE_MAPPING.WALL &&
            this.tileMap[x + 1][y - 1] !== TILE_MAPPING.WALL &&
            this.tileMap[x + 1][y + 1] !== TILE_MAPPING.WALL

        return coordsAreWithinBounds && thereIsAvailable3x3;
    }

    rand(boundary) {
        return Math.floor(Math.random() * Math.floor(boundary));
    }
}