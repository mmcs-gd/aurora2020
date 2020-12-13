

const BLANK = 0;
const TILE_MAPPING = {
    BLANK: 17,
    WALL: {
        TOP_LEFT: 3,
        TOP_RIGHT: 5,
        BOTTOM_RIGHT: 53,
        BOTTOM_LEFT: 51,
        
        TOP: 4,
        LEFT: 18, //35, //18,
        RIGHT: 16, // 37, //16,
        BOTTOM: 52, // 1, //52,
        INNER_TOP_LEFT: 0,
        INNER_TOP_RIGHT: 2,
        INNER_BOTTOM_LEFT: 32,
        INNER_BOTTOM_RIGHT: 34,
    },
    FLOOR: 95
};

export default class LevelMapper {
    constructor(map, scene, width, height, tilesize) {
        this.width = width;
        this.height = height;
        this.scene = scene;
        this.map = map;
        this.tilesize = tilesize;
    }

    generateLevel() {
        this.scene.map = this.scene.make.tilemap({
            tileWidth: this.tilesize,
            tileHeight: this.tilesize,
            width: this.width,
            height: this.height
        });

        const tileset = this.scene.map.addTilesetImage("tiles", null, this.tilesize, this.tilesize);
        const floorLayer = this.scene.map.createBlankDynamicLayer("Floor", tileset);
        const groundLayer = this.scene.map.createBlankDynamicLayer("Ground", tileset);
        const otherLayer = this.scene.map.createBlankDynamicLayer("Other", tileset);

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (this.map[x][y] === BLANK) {
                    groundLayer.putTileAt(TILE_MAPPING.BLANK, x, y); // BLANK
                } else {
                    let type;
                    type = this.getCellType({ x, y });
                    if (type) {
                        floorLayer.putTileAt(TILE_MAPPING.FLOOR, x, y); // floor
                        groundLayer.putTileAt(TILE_MAPPING.WALL[type], x, y); // wall
                    } else {
                        floorLayer.putTileAt(TILE_MAPPING.FLOOR, x, y); // floor
                    }
                }
            }
        }

        // randomize player position
        let playerX = 10, playerY = 10;

        while (this.map[playerX][playerY] === 0) {
            playerX = Math.floor(Math.random() * this.map.length);
            playerY = Math.floor(Math.random() * this.map[0].length);
        }

        this.scene.player = this.scene.characterFactory.buildCharacter('punk', playerX * this.tilesize, playerY * this.tilesize, { player: true });
        this.scene.physics.add.collider(this.scene.player, groundLayer);
        this.scene.physics.add.collider(this.scene.player, otherLayer);

        const camera = this.scene.cameras.main;
        camera.setZoom(1.0);
        this.scene.physics.world.setBounds(0, 0, this.scene.map.widthInPixels, this.scene.map.heightInPixels, true);
        camera.setBounds(0, 0, this.scene.map.widthInPixels, this.scene.map.heightInPixels);
        camera.startFollow(this.scene.player);

        groundLayer.setCollisionBetween(1, 500);
        otherLayer.setDepth(10);

        return { Ground: groundLayer, Other: otherLayer };

    }

    getCell(x, y) {
        if (x < 0 || x >= this.map.length) {
            return null;
        }
        if (y < 0 || y >= this.map[x].length) {
            return null;
        }
        return this.map[x][y];
    }

    isBlank(cell) {
        return cell !== null && cell === BLANK;
    }

    isFilled(cell) {
        return cell !== null && cell !== BLANK;
    }

    getCellType(cellPos) {
        // return null;
        // 0 1 2
        // 7 * 3
        // 6 5 4

        let neighbors = {};
        neighbors.topLeft = this.getCell(cellPos.x - 1, cellPos.y - 1);
        neighbors.top = this.getCell(cellPos.x, cellPos.y - 1);
        neighbors.topRight = this.getCell(cellPos.x + 1, cellPos.y - 1);
        neighbors.right = this.getCell(cellPos.x + 1, cellPos.y);
        neighbors.bottomRight = this.getCell(cellPos.x + 1, cellPos.y + 1);
        neighbors.bottom = this.getCell(cellPos.x, cellPos.y + 1);
        neighbors.bottomLeft = this.getCell(cellPos.x - 1, cellPos.y + 1);
        neighbors.left = this.getCell(cellPos.x - 1, cellPos.y);

        //#region OUTER CORNERS

        if (this.cellIsTopLeft(neighbors)) {
            return 'TOP_LEFT';
        }

        if (this.cellIsTopRight(neighbors)) {
            return 'TOP_RIGHT';
        }

        if (this.cellIsBottomLeft(neighbors)) {
            return 'BOTTOM_LEFT';
        }

        if (this.cellIsBottomRight(neighbors)) {
            return 'BOTTOM_RIGHT';
        }
        //#endregion

        //#region INNER CORNERS
        if (this.cellIsInnerTopLeft(neighbors)) {
            return 'INNER_TOP_LEFT';
        }

        if (this.cellIsInnerTopRight(neighbors)) {
            return 'INNER_TOP_RIGHT';
        }

        if (this.cellIsInnerBottomLeft(neighbors)) {
            return 'INNER_BOTTOM_LEFT';
        }

        if (this.cellIsInnerBottomRight(neighbors)) {
            return 'INNER_BOTTOM_RIGHT';
        }
        //#endregion

        //#region PLAIN SIDES
        if (this.cellIsTop(neighbors)) {
            return 'TOP';
        }

        if (this.cellIsLeft(neighbors)) {
            return 'LEFT';
        }

        if (this.cellIsRight(neighbors)) {
            return 'RIGHT';
        }

        if (this.cellIsBottom(neighbors)) {
            return 'BOTTOM';
        }
        //#endregion
        
        return null;
    }

    //#region PLAIN SIDES
    cellIsTop(cells) {
        // * * *
        // - - -
        return this.isBlank(cells.top) &&
            (this.isBlank(cells.topLeft) ||
            this.isBlank(cells.topRight));
    }

    cellIsLeft(cells) {
        // * -
        // * -
        // * -
        return this.isBlank(cells.left) &&
            (this.isBlank(cells.topLeft) ||
            this.isBlank(cells.bottomLeft));
    }

    cellIsRight(cells) {
        // - * 
        // - *
        // - * 
        return this.isBlank(cells.right) &&
            (this.isBlank(cells.topRight) ||
            this.isBlank(cells.bottomRight));
    }

    cellIsBottom(cells) {
        // - * 
        // - *
        // - * 
        return this.isBlank(cells.bottom) &&
            (this.isBlank(cells.bottomLeft) ||
            this.isBlank(cells.bottomRight));
    }
    //#endregion

    //#region OUTER CORNERS

    cellIsTopLeft(cells) {
        // * * *
        // * - -
        // * - -
        return this.isBlank(cells.top) &&
            this.isBlank(cells.topLeft) &&
            this.isBlank(cells.left);
    }

    cellIsTopRight(cells) {
        // * * *
        // - - *
        // - - *
        return this.isBlank(cells.top) &&
        this.isBlank(cells.topRight) &&
        this.isBlank(cells.right);
    }

    cellIsBottomLeft(cells) {
        // * - -
        // * - -
        // * * *
        // return false;
        return this.isBlank(cells.bottom) &&
        this.isBlank(cells.bottomLeft) &&
        this.isBlank(cells.left);
    }

    cellIsBottomRight(cells) {
        // - - *
        // - - *
        // * * *
        // return false;
        return this.isBlank(cells.bottom) &&
        this.isBlank(cells.bottomRight) &&
        this.isBlank(cells.right);
    }
    //#endregion

    //#region INNER CORNERS
    cellIsInnerTopLeft(cells) {
        // - - -
        // - * *
        // - * *
        // return false;
        return this.isBlank(cells.bottomRight) &&
        this.isFilled(cells.bottom) &&
        this.isFilled(cells.right);
    }

    cellIsInnerTopRight(cells) {
        // - - -
        // * * -
        // * * -
        // return false;
        return this.isBlank(cells.bottomLeft) &&
        this.isFilled(cells.bottom) &&
        this.isFilled(cells.left);
    }

    cellIsInnerBottomLeft(cells) {
        // - * *
        // - * *
        // - - -
        // return false;
        return this.isBlank(cells.topRight) &&
        this.isFilled(cells.top) &&
        this.isFilled(cells.right);
    }

    cellIsInnerBottomRight(cells) {
        // * * -
        // * * -
        // - - -
        // return false;
        return this.isBlank(cells.topLeft) &&
        this.isFilled(cells.top) &&
        this.isFilled(cells.left);
    }
    //#endregion
}