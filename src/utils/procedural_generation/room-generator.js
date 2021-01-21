import {default as getMatrixRooms} from './matrix-rooms.js';

const TILE_MAPPING = {
    BLANK: 17,
    FLOOR: 95
};

const LEVEL_TO_TILE = {
    0: TILE_MAPPING.BLANK,
    1: TILE_MAPPING.FLOOR,
};

export default class RoomGenerator {
    constructor(tileSize, scene, width, height) {
        this.tileSize   = tileSize; 
        this.width      = width;
        this.height     = height;

        scene.map = scene.make.tilemap({
            tileWidth: tileSize, 
            tileHeight: tileSize, 
            width: width, 
            height: height
        });

        this.tileSet      = scene.map.addTilesetImage("tiles", null, this.tileSize, this.tileSize)
        this.outsideLayer = scene.map.createBlankDynamicLayer("Water", this.tileSet);
        this.groundLayer  = scene.map.createBlankDynamicLayer("Ground", this.tileSet);
        this.stuffLayer   = scene.map.createBlankDynamicLayer("Stuff", this.tileSet);

        this.scene = scene;

        this.startPointX = 0;
        this.startPointY = 0;
    }
    generateRooms() {
        
        const generatedMatrixAndRooms = getMatrixRooms(this.width, this.height);
        
        const matrix = generatedMatrixAndRooms['Matrix'];
        const rooms = generatedMatrixAndRooms['Rooms'];
        for (let y = 0; y < this.height; y++) 
        {
            for (let x = 0; x < this.width; x++) 
            {
                let field = matrix[y][x];

                if (field === 1) {            
                    this.groundLayer.putTileAt(LEVEL_TO_TILE[field], x, y);
                }
                else {
                    this.outsideLayer.putTileAt(LEVEL_TO_TILE[field], x, y);
                }
            }
        }
        this._settingWorld();
        return {"Ground"    : this.groundLayer, 
                "Stuff"     : this.stuffLayer, 
                "Outside"   : this.outsideLayer,
                "GridRooms" : matrix,
                "SetRooms"  : rooms
            }
    }
    getStartPoint() { return {"X" : this.startPointX, "Y" : this.startPointY};}

    _settingWorld() {
        this.scene.physics.add.collider(this.scene, this.outsideLayer);
        this.scene.physics.add.collider(this.scene, this.groundLayer); 
        this.scene.physics.add.collider(this.scene, this.stuffLayer);

        this.scene.physics.world.setBounds(0,0, this.scene.map.widthInPixels, 
            this.scene.map.heightInPixels, true);
        this.groundLayer.setCollisionBetween(1, 500);
        this.stuffLayer.setDepth(10);
        this.outsideLayer.setDepth(9999);
        this.outsideLayer.setCollisionBetween(1, 500);
    }

    _getRandom(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
}