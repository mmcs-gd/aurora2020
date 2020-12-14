import EasyStar from "easystarjs";
import tilemapPng from '../assets/tileset/Dungeon_Tileset.png'
import dungeonRoomJson from '../assets/dungeon_room.json'
import auroraSpriteSheet from '../assets/sprites/characters/aurora.png'
import punkSpriteSheet from '../assets/sprites/characters/punk.png'
import blueSpriteSheet from '../assets/sprites/characters/blue.png'
import yellowSpriteSheet from '../assets/sprites/characters/yellow.png'
import greenSpriteSheet from '../assets/sprites/characters/green.png'
import slimeSpriteSheet from '../assets/sprites/characters/slime.png'
import CharacterFactory from "../src/characters/character_factory";
import Footsteps from "../assets/audio/footstep_ice_crunchy_run_01.wav";
import {Shadowing} from "../src/ai/steerings/shadowing";
import {Exploring} from "../src/ai/steerings/exploring";


let ExplorationAndShadowingScene = new Phaser.Class({

    Extends: Phaser.scene,
    initialize:
        function explorationAndShadowingScene() {
            Phaser.Scene.call(this, {key: 'explorationAndShadowingScene'});
        },
    characterFrameConfig: {frameWidth: 31, frameHeight: 31},
    slimeFrameConfig: {frameWidth: 32, frameHeight: 32},
    preload: function () {

        //loading map tiles and json with positions
        this.load.image("tiles", tilemapPng);
        this.load.tilemapTiledJSON("map", dungeonRoomJson);
        //loading spitesheets
        this.load.spritesheet('aurora', auroraSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('blue', blueSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('green', greenSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('yellow', yellowSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('punk', punkSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('slime', slimeSpriteSheet, this.slimeFrameConfig);
        this.load.audio('footsteps', Footsteps);
    },
    create:function (){
        this.gameObject = [];
        const  map = this.make.tilemap({key:"map"});
        const tileset = map.addTilesetImage("Dungeon_Tileset", "tiles");

        const belowLayer = map.createStaticLayer("Floor", tileset, 0, 0);
        const worldLayer = map.createStaticLayer("Walls", tileset, 0, 0);
        const aboveLayer = map.createStaticLayer("Upper", tileset, 0, 0);
        this.tileSize = 32;
        this.finder = new EasyStar.js();
        let grid = [];
        for(let y = 0; y < worldLayer.tilemap.height; y++){
            let col = [];
            for(let x = 0; x < worldLayer.tilemap.width; x++) {
                const tile = worldLayer.tilemap.getTileAt(x, y);
                col.push(tile ? tile.index : 0);
            }
            grid.push(col);
        }

        this.finder.setGrid(grid);
        this.finder.setAcceptableTiles([0]);

        worldLayer.setCollisionBetween(1, 500);
        aboveLayer.setDepth(10);
        this.physics.world.bounds.width = map.widthInPixels;
        this.physics.world.bounds.height = map.heightInPixels;
        this.characterFactory = new CharacterFactory(this);
        console.log(this.characterFactory)

        const walker = this.characterFactory.buildNPCCharacter(
           "green",200,300,{Steering: new Exploring(this)}
        );

        const shadowing = this.characterFactory.buildNPCCharacter(
            "punk",500,100,{Steering: new Shadowing(this,walker)}
        );
        this.gameObject.push(walker);
        this.gameObject.push(shadowing);
        this.physics.add.collider(walker, worldLayer);
        this.physics.add.collider(shadowing, worldLayer);
        console.log(this.gameObject);
        this.input.keyboard.once("keydown_D", event => {
            // Turn on physics debugging to show player's hitbox
            this.physics.world.createDebugGraphic();

            const graphics = this.add
                .graphics()
                .setAlpha(0.75)
                .setDepth(20);
        });
    },
    update:function () {
        if (this.gameObject) {
            this.gameObject.forEach(function (element) {
                element.update();
            });
        }
    },
    tilesToPixels(tileX, tileY)
    {
        return [tileX*this.tileSize, tileY*this.tileSize];
    }
})

export default ExplorationAndShadowingScene