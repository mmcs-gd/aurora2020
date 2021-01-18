import tilemapPng from "../assets/tileset/Dungeon_Tileset.png";
import dungeonRoomJson from "../assets/dungeon_room.json";


let test = new Phaser.Class({
    Extends: Phaser.scene,
    initialize:
        function generateLevelScene() {
            Phaser.Scene.call(this, {key: 'generateLevelScene'})
        },
    preload:function(){
        this.load.image("tiles", tilemapPng);
        this.load.tilemapTiledJSON("map", dungeonRoomJson);
    },
    create:function (){
        this.gameObject = [];
        const level = [
            [0,1,1,1,1,1,1,1,1,2],
            [16,23,24,29,29,29,30,29,29,18],
            [16,88,88,88,85,102,88,88,88,18],
            [16,88,88,88,85,102,88,88,88,18],
            [16,88,88,88,85,102,88,88,88,18],
            [16,88,88,88,85,102,88,88,88,18],
        ];

        const map = this.make.tilemap({data:level,tileWidth:32,tileHeight:32});

        const tileset = map.addTilesetImage("Dungeon_Tileset", "tiles");
        const layer = map.createStaticLayer(0,tileset,0,0)

        map.tileSize = 150;
    },
    update:function(){

    }
})
export default test