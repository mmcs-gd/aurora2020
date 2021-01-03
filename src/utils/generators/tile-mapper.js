import FillLevel from './fill-level';
import { config, digitToType } from './map-config';

// Dangeon
// const TILE_MAPPING = {
//     BLANK: 17,
//     WALL: {
//         TOP_LEFT: 3,
//         TOP_RIGHT: 5,
//         BOTTOM_RIGHT: 53,
//         BOTTOM_LEFT: 51,

//         TOP: 4,
//         LEFT: 18, //35, //18,
//         RIGHT: 16, // 37, //16,
//         BOTTOM: 52, // 1, //52,
//         INNER_TOP_LEFT: 0,
//         INNER_TOP_RIGHT: 2,
//         INNER_BOTTOM_LEFT: 32,
//         INNER_BOTTOM_RIGHT: 34,
//     },
//     FLOOR: 95
// };

// Crystal
const TILE_MAPPING = {
    BLANK: 13,
    WALL: {
        TOP_LEFT: [{ index: 180, weight: 9 }],
        TOP_RIGHT: [{ index: 181, weight: 9 }],
        BOTTOM_RIGHT: [{ index: 193, weight: 9 }],
        BOTTOM_LEFT: [{ index: 192, weight: 9 }],

        TOP: [{ index: 25, weight: 7 }, { index: 82, weight: 3 }],
        LEFT: [{ index: 14, weight: 7 }, { index: 71, weight: 3 }],
        RIGHT: [{ index: 12, weight: 7 }, { index: 69, weight: 3 }],
        BOTTOM: [{ index: 1, weight: 7 }, { index: 58, weight: 3 }],

        INNER_TOP_LEFT: [{ index: 0, weight: 9 }],
        INNER_TOP_RIGHT: [{ index: 2, weight: 9 }],
        INNER_BOTTOM_LEFT: [{ index: 24, weight: 9 }],
        INNER_BOTTOM_RIGHT: [{ index: 26, weight: 9 }],
    },
    FLOOR:
        [
            { index: 16, weight: 9 },
            { index: 47, weight: 1 },
            { index: 45, weight: 1 },
            { index: 46, weight: 1 },
        ]
};

export default class TileMapper {
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

        const tileset = this.scene.map.addTilesetImage("crystals", null, this.tilesize, this.tilesize);
        const floorLayer = this.scene.map.createBlankDynamicLayer("Floor", tileset);
        const groundLayer = this.scene.map.createBlankDynamicLayer("Ground", tileset);
        const otherLayer = this.scene.map.createBlankDynamicLayer("Other", tileset);

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const cell = this.map[x][y];
                if (cell === config.BLANK) {
                    groundLayer.putTileAt(TILE_MAPPING.BLANK, x, y);
                } else {
                    floorLayer.weightedRandomize(x, y, 1, 1, TILE_MAPPING.FLOOR);
                    if (cell !== config.FLOOR) {
                        const type = digitToType[cell];
                        groundLayer.weightedRandomize(x, y, 1, 1, TILE_MAPPING.WALL[type]);
                    }
                }
            }
        }


        
        const levelFiller = new FillLevel(this, groundLayer, otherLayer);
        // this.setPlayer(groundLayer, otherLayer);
        levelFiller.setPlayer();
        this.setCamera(groundLayer, otherLayer);
        levelFiller.spaunMobs();

        //this.spaunMobs(groundLayer, otherLayer);

        return { Ground: groundLayer, Other: otherLayer };
    }

    setCamera(groundLayer, otherLayer) {
        const camera = this.scene.cameras.main;
        camera.setZoom(1.0);
        this.scene.physics.world.setBounds(0, 0, this.scene.map.widthInPixels, this.scene.map.heightInPixels, true);
        camera.setBounds(0, 0, this.scene.map.widthInPixels, this.scene.map.heightInPixels);
        camera.startFollow(this.scene.player);
        camera.roundPixels = true;

        groundLayer.setCollisionBetween(1, 500);
        otherLayer.setDepth(10);
    }

    tileAt(x, y) {
        if (x > 0 && x < this.map.length && y > 0 && y < this.map[0].length) {
            return this.map[x][y];
        }
        return null;
    }

    checkFreeSpace(x, y) {
        return this.tileAt(x,y) === config.FLOOR
            && (this.tileAt(x - 1,y) === null 
                || this.tileAt(x - 1,y) === config.FLOOR)
            && (this.tileAt(x + 1,y) === null 
                || this.tileAt(x + 1,y) === config.FLOOR)
            && (this.tileAt(x, y - 1) === null 
                || this.tileAt(x, y - 1) === config.FLOOR)
            && (this.tileAt(x, y + 1) === null 
                || this.tileAt(x, y + 1) === config.FLOOR);
    }

    setPlayer(groundLayer, otherLayer) {
        // randomize player position
        let playerX = 10, playerY = 10;

        while (!this.checkFreeSpace(playerX, playerY)) {
            playerX = Phaser.Math.RND.between(0, this.map.length);
            playerY = Phaser.Math.RND.between(0, this.map[0].length);
        }

        this.scene.player = this.scene.characterFactory.buildCharacter('aurora', playerX * this.tilesize, playerY * this.tilesize, { player: true });
        this.scene.gameObjects.push(this.scene.player);
        this.scene.physics.add.collider(this.scene.player, groundLayer);
        this.scene.physics.add.collider(this.scene.player, otherLayer);
    }

    calcDistance(obj1, obj2) {
        return Math.sqrt((obj1.x - obj2.x) * (obj1.x - obj2.x) + (obj1.y - obj2.y) * (obj1.y - obj2.y));
    }

    checkFreeSpaceForMobs(x, y, mobs) {
        if (x < 0 || y < 0 || x > this.map.length || x > this.map[0].length) {
            return false;
        }
        if (!this.checkFreeSpace(x, y)) {
            return false;
        }
        if (this.calcDistance({ x, y }, this.scene.player.body) < 5) {
            return false;
        }

        // for (const m of mobs) {
        //     if (this.calcDistance({x,y}, m) < 2) {
        //         return false;
        //     }
        // }
        return true;
    }

    // createSlimesTable = (slime) => {
    //     slime.stateTable = new StateTable(this.scene.characterFactory);
    //     slime.stateTable.addState(new StateTableRow(SlimeStates.Searching, slime.isAttacked, SlimeStates.Running));
    //     slime.stateTable.addState(new StateTableRow(SlimeStates.Jumping, slime.isAttacked, SlimeStates.Running));
    //     slime.stateTable.addState(new StateTableRow(SlimeStates.Attacking, slime.isAttacked, SlimeStates.Running));
    //     slime.stateTable.addState(new StateTableRow(SlimeStates.Pursuing, slime.isAttacked, SlimeStates.Running));
        
    //     slime.stateTable.addState(new StateTableRow(SlimeStates.Searching, slime.isEnemyAround, SlimeStates.Pursuing));
    //     slime.stateTable.addState(new StateTableRow(SlimeStates.Jumping, slime.isEnemyAround, SlimeStates.Pursuing));
        
    //     slime.stateTable.addState(new StateTableRow(SlimeStates.Pursuing, slime.isEnemyClose, SlimeStates.Attacking));

    //     slime.stateTable.addState(new StateTableRow(SlimeStates.Pursuing, (!slime.isEnemyClose && !slime.isEnemyAround && !slime.isAttacked), SlimeStates.Searching));        
    // }

    // initSlimeSteerings = (slime) => {
    //     let steerings = {
    //         [SlimeStates.Searching]: new Wander(slime),
    //         [SlimeStates.Pursuing]: new Pursuit(slime, this.scene.player, 1, slime.maxSpeed, this.scene.player.maxSpeed),
    //         [SlimeStates.Running]: new Ranaway(slime, [this.scene.player]),
    //         [SlimeStates.Attacking]: 
            
    //     };
    // }

    // spaunMobs(groundLayer, otherLayer) {
    //     const slimes = this.scene.physics.add.group();

    //     const params = {
    //         useStates: true,
    //         createStateTable: this.createSlimesTable,
    //         initSteerings: this.initSlimeSteerings
    //     };

    //     const slimesAmount = 1;
    //     for (let i = 0; i < slimesAmount; i++) {
    //         let x = Phaser.Math.RND.between(0, this.map.length);
    //         let y = Phaser.Math.RND.between(0, this.map[0].length);

    //         while (!this.checkFreeSpaceForMobs(x, y, slimes)) {
    //             x = Phaser.Math.RND.between(0, this.map.length);
    //             y = Phaser.Math.RND.between(0, this.map[0].length);
    //         }

    //         if (x < 0 || y < 0) {
    //             console.log({x,y})

    //         }
    //         params.slimeType = Phaser.Math.RND.between(0, 4);
    //         const slime = this.scene.characterFactory.buildSlime(x, y, params);
    //         this.scene.gameObjects.push(slime);

    //         this.scene.physics.add.collider(slime, groundLayer);
    //         this.scene.physics.add.collider(slime, otherLayer);
    //         slimes.add(slime);
    //     }
    //     console.log(slimes)
    //     this.scene.physics.add.collider(this.scene.player, slimes);
    // }
}