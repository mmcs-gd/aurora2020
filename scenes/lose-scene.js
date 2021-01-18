import buildLevel from "../src/utils/level-builder";
import CharacterFactory from "../src/characters/character_factory";

import auroraSpriteSheet from '../assets/sprites/characters/aurora.png'
import punkSpriteSheet from '../assets/sprites/characters/punk.png'
import blueSpriteSheet from '../assets/sprites/characters/blue.png'
import yellowSpriteSheet from '../assets/sprites/characters/yellow.png'
import greenSpriteSheet from '../assets/sprites/characters/green.png'
import slimeSpriteSheet from '../assets/sprites/characters/slime.png'
import Footsteps from "../assets/audio/footstep_ice_crunchy_run_01.wav";

import tilemapPng from '../assets/tileset/Dungeon_Tileset.png'
import Aggressive from "../src/ai/aggressive";

let LoseScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize: function StartingScene() {
        Phaser.Scene.call(this, {key: 'LoseScene'});
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
        this.cameras.main.setBackgroundColor('#444444')
        let text = "Вы проиграли. \n Вас поймали панки :(\nESC для выхода в меню сцен.";
        let style = { font: "50px Arial", fill: "#441188", align: "center" };
        let t = this.add.text(this.scale.width/9, this.scale.height/4, text, style);
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
    },
});

export default LoseScene;
