import buildLevel from "../src/utils/scenes-handler";

import tilemapPng from '../assets/tileset/Dungeon_Tileset.png'
import auroraSpriteSheet from '../assets/sprites/characters/aurora.png'
import punkSpriteSheet from '../assets/sprites/characters/punk.png'
import blueSpriteSheet from '../assets/sprites/characters/blue.png'
import yellowSpriteSheet from '../assets/sprites/characters/yellow.png'
import greenSpriteSheet from '../assets/sprites/characters/green.png'
import slimeSpriteSheet from '../assets/sprites/characters/slime.png'
import CharacterFactory from "../src/characters/character_factory";

let Rudnev_lab5_scene = new Phaser.Class(
    {

    Extends: Phaser.Scene,


    initialize: function ProceduralScene() {
        Phaser.Scene.call(this, {key: 'Rudnev_lab5_scene'});
    },
    characterFrameConfig: {frameWidth: 31, frameHeight: 31},
    slimeFrameConfig: {frameWidth: 32, frameHeight: 32},
    preload: function () {
        this.load.image("Dungeon_Tileset", tilemapPng);
        this.load.spritesheet('aurora', auroraSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('blue', blueSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('green', greenSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('yellow', yellowSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('punk', punkSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('slime', slimeSpriteSheet, this.slimeFrameConfig);
    },

    create: function () {
        this.characterFactory = new CharacterFactory(this);
        this.gameObjects = [];

        let width = 50;
        let height = 30;
        let maxRooms = 20;

        const layers = buildLevel(width, height, maxRooms, this);
        this.gameObjects.push(this.player);
        this.groundLayer = layers["Ground"];
        this.OtherSubjLayer = layers["OtherSubj"];
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

export default Rudnev_lab5_scene