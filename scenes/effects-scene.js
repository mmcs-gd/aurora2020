import EasyStar from "easystarjs";

import tilemapPng from '../assets/tileset/Dungeon_Tileset.png'
import dungeonRoomJson from '../assets/dungeon_room.json'
import CharacterFactory from "../src/characters/character_factory";
import EffectsFactory from "../src/utils/effects-factory";
import auroraSpriteSheet from "../assets/sprites/characters/aurora.png";
import blueSpriteSheet from "../assets/sprites/characters/blue.png";
import greenSpriteSheet from "../assets/sprites/characters/green.png";
import yellowSpriteSheet from "../assets/sprites/characters/yellow.png";
import punkSpriteSheet from "../assets/sprites/characters/punk.png";
import slimeSpriteSheet from "../assets/sprites/characters/slime.png";
import Footsteps from "../assets/audio/footstep_ice_crunchy_run_01.wav";

let EffectsScene = new Phaser.Class({

    Extends: Phaser.Scene,
    effectsFrameConfig: {frameWidth: 32, frameHeight: 32},
    characterFrameConfig: {frameWidth: 31, frameHeight: 31},
    initialize: function GroupAligmentScene() {
        Phaser.Scene.call(this, {key: 'EffectsScene'});
    },
    preload: function () {

        //loading map tiles and json with positions
        this.load.image("tiles", tilemapPng);
        this.load.tilemapTiledJSON("map", dungeonRoomJson);
        this.load.spritesheet('aurora', auroraSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('blue', blueSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('green', greenSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('yellow', yellowSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('punk', punkSpriteSheet, this.characterFrameConfig);


        this.load.audio('footsteps', Footsteps);
        this.characterFactory = new CharacterFactory(this);
        this.effectsFactory = new EffectsFactory(this);

    },
    create: function () {
        this.effectsFactory.loadAnimations();
        this.gameObjects = [];
        const map = this.make.tilemap({key: "map"});
        // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
        // Phaser's cache (i.e. the name you used in preload)
        const tileset = map.addTilesetImage("Dungeon_Tileset", "tiles");


        // Parameters: layer name (or index) from Tiled, tileset, x, y
        const belowLayer = map.createStaticLayer("Floor", tileset, 0, 0);
        const worldLayer = map.createStaticLayer("Walls", tileset, 0, 0);
        const aboveLayer = map.createStaticLayer("Upper", tileset, 0, 0);


        worldLayer.setCollisionBetween(1, 500);
        aboveLayer.setDepth(10);

        this.physics.world.bounds.width = map.widthInPixels;
        this.physics.world.bounds.height = map.heightInPixels;

        this.player = this.characterFactory.buildCharacter('aurora', 100, 100, {player: true});
        this.gameObjects.push(this.player);
        this.physics.add.collider(this.player, worldLayer);

        this.effectsFactory.buildEffect('magicSpell', 100, 200);
        this.effectsFactory.buildEffect('vortex', 100, 350);
        this.effectsFactory.buildEffect('flamelash', 400, 350);
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

export default EffectsScene
