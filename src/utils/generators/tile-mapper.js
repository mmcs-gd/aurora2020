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
            { index: 46, weight: 1 }
        ],
		JEWELRY: {
			STATUE_TOP: 272,
			STATUE_BOTTOM: 284,
				
			STATUE_DRAGON_TOP_LEFT: 273,
			STATUE_DRAGON_TOP_RIGHT: 274,
			STATUE_DRAGON_BOTTOM_LEFT: 285,
			STATUE_DRAGON_BOTTOM_RIGHT: 286,
				
			BIG_BONES_TOP_LEFT: 248,
			BIG_BONES_TOP_RIGHT: 249,
			BIG_BONES_BOTTOM_LEFT: 260,
			BIG_BONES_BOTTOM_RIGHT: 261,
				
			BONES: [
			  { index: 250, weight: 1 },
			  { index: 262, weight: 9 }
			],
		  POTION: 287,
		  SCROLLS: 275,
		  CRACK: [
		    { index: 263, weight: 9},
				{ index: 251, weight: 2}
		  ],
			STONE: 213,
		  SMALL_STONE: [
		    { index: 176, weight: 5},
				{ index: 177, weight: 5},
				{ index: 178, weight: 5},
				{ index: 179, weight: 5},
				{ index: 200, weight: 5},
				{ index: 201, weight: 5},
				{ index: 202, weight: 5},
				{ index: 203, weight: 5}
		  ]
		},		

		GOLD: {
			HEAP: [
			  { index: 236, weight: 7 },
				{ index: 237, weight: 3 },
				{ index: 224, weight: 1 },
				{ index: 225, weight: 1 }
			],
			INGOTS: [
			  { index: 226, weight: 7 },
				{ index: 227, weight: 7 },
				{ index: 238, weight: 1 },
				{ index: 239, weight: 1 }
			]
		}
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

        this.scene.groundLayer = groundLayer;
        this.scene.otherLayer = otherLayer;
        
        const levelFiller = new FillLevel(this, groundLayer, otherLayer);
        levelFiller.setPlayer();
        this.setCamera(groundLayer, otherLayer);
        levelFiller.spaunMobs();
        
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

}