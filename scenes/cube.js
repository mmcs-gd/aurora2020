//import buildLevel from "../src/utils/level_procedural_generator/level-builder";
import RoomGenerator from "../src/utils/procedural_generation/room_generator"
import CharacterFactory from "../src/characters/character_factory";

import auroraSpriteSheet from '../assets/sprites/characters/aurora.png'
import punkSpriteSheet from '../assets/sprites/characters/punk.png'
import blueSpriteSheet from '../assets/sprites/characters/blue.png'
import yellowSpriteSheet from '../assets/sprites/characters/yellow.png'
import greenSpriteSheet from '../assets/sprites/characters/green.png'
import slimeSpriteSheet from '../assets/sprites/characters/slime.png'
import Footsteps from "../assets/audio/footstep_ice_crunchy_run_01.wav";

import tilemapPng from '../assets/tileset/Dungeon_Tileset.png'

let CubeScene = new Phaser.Class({

    Extends: Phaser.Scene,


    initialize: function StartingScene() {
        Phaser.Scene.call(this, {key: 'CubeScene'});
    },
    characterFrameConfig: {frameWidth: 31, frameHeight: 31},
    slimeFrameConfig: {frameWidth: 32, frameHeight: 32},

    preload: function () {
        //this.load.image("islands-tiles", tilemapPng);
        this.load.image("tiles", tilemapPng);
        //loading spitesheets
        this.load.spritesheet('aurora', auroraSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('blue', blueSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('green', greenSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('yellow', yellowSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('punk', punkSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('slime', slimeSpriteSheet, this.slimeFrameConfig);
        this.load.audio('footsteps', Footsteps);
    },

    create: function () {
        this.gameObjects = [];
        this.characterFactory = new CharacterFactory(this);
        this.level++;
        this.hasPlayerReachedStairs = false;

        const roomGenerator = new RoomGenerator(32, this, 40, 40);
        const layersOfLevel = roomGenerator.generateRooms(3);
        
        this.groundLayer = layersOfLevel["Ground"];
        this.stuffLayer = layersOfLevel["Stuff"];
        this.outsideLayer = layersOfLevel["Outside"];

        const startCoordinates = roomGenerator.getStartPoint();

        this.player = this.characterFactory.buildCharacter('aurora', startCoordinates["X"],  startCoordinates["Y"], {player: true});
        this.gameObjects.push(this.player);
        this.physics.add.collider(this.player, this.groundLayer);
        this.physics.add.collider(this.player, this.stuffLayer);
        this.physics.add.collider(this.player, this.outsideLayer);
        
        const camera = this.cameras.main;
        camera.setZoom(1.0)
        camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        camera.startFollow(this.player);
        camera.roundPixels = true;

        this.input.keyboard.once("keydown_D", event => {
            // Turn on physics debugging to show player's hitbox
            this.physics.world.createDebugGraphic();

            const graphics = this.add
                .graphics()
                .setAlpha(0.75)
                .setDepth(20);
        });


    },

    update: function () {
        if (this.gameObjects) {
            this.gameObjects.forEach( function(element) {
                element.update();
            });
        }
    },
    tilesToPixels(tileX, tileY) {
        return [tileX*this.tileSize, tileY*this.tileSize];
    }
});

export default CubeScene
