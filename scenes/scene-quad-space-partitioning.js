import tilemapPng from '../assets/tileset/Dungeon_Tileset.png'
import auroraSpriteSheet from '../assets/sprites/characters/aurora.png'
import punkSpriteSheet from '../assets/sprites/characters/punk.png'
import blueSpriteSheet from '../assets/sprites/characters/blue.png'
import yellowSpriteSheet from '../assets/sprites/characters/yellow.png'
import greenSpriteSheet from '../assets/sprites/characters/green.png'
import slimeSpriteSheet from '../assets/sprites/characters/slime.png'
import CharacterFactory from "../src/characters/character_factory";
import EffectsFactory from "../src/utils/effects-factory";
import Footsteps from "../assets/audio/footstep_ice_crunchy_run_01.wav";

import buildLevel from '../src/utils/level_generator/level-build';


let SceneQuadSpacePartitioning = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize: function StartingScene () {
        Phaser.Scene.call(this, {key: 'SceneQuadSpacePartitioning'});
    },

    effectsFrameConfig: {frameWidth: 32, frameHeight: 32},
    characterFrameConfig: {frameWidth: 31, frameHeight: 31},
    slimeFrameConfig: {frameWidth: 32, frameHeight: 32},
    //mineFrameConfig: { frameWidth: 130, frameHeight: 130 },

    preload: function () {
        //loading map tiles
        this.load.image("tiles", tilemapPng);
        
        //loading spitesheets
        this.load.spritesheet('aurora', auroraSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('blue', blueSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('green', greenSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('yellow', yellowSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('punk', punkSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('slime', slimeSpriteSheet, this.slimeFrameConfig);
        this.load.audio('footsteps', Footsteps);

        this.effectsFactory = new EffectsFactory(this);
    },

    create: function () {
        this.gameObjects = [];
        this.characterFactory = new CharacterFactory(this);
        this.effectsFactory.loadAnimations();
        
        // генерация уровня
        // убрать while, try после исправления генерации
        while (true) {
            try {
                const layers = buildLevel(50, 50, this);
                this.groundLayer = layers["Ground"];
                this.outsideLayer = layers["Outside"];
                this.wallsLayer = layers["Walls"];
                break;
            } catch (err) {}
        }

        // передаём инфу в сцену с текстом
        this.game.scene.scenes[0]._SceneTextInfo = {
            mapSize: {
                width: 50*32,
                height: 50*32
            },
            roomsCount: 2,
            fillPercent: 38,
        };

        // вешаем события на кнопки
        this.input.keyboard.once("keydown_D", event => {
            // Turn on physics debugging to show player's hitbox
            this.physics.world.createDebugGraphic();

            const graphics = this.add
                .graphics()
                .setAlpha(0.75)
                .setDepth(20);
        });

        this.input.keyboard.once("keydown_M", event => {
            // show/hide game map
            // how to make game map in phaser 3
            // запустить поверх новую сцену. старую не останавливать?
            console.log("dungeon.js keydown_M");
            this.scene.run("SceneMap");
        });

        this.scene.run("SceneText");
    },

    update: function () {
        if (this.gameObjects) {
            this.gameObjects.forEach( function(element) {
                element.update();
            });
        }
        //console.log('dungeon.js update');
    },

    tilesToPixels (tileX, tileY) {
        return [tileX*this.tileSize, tileY*this.tileSize];
    }
});

export default SceneQuadSpacePartitioning