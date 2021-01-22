import tilemapPng from '../assets/tileset/Dungeon_Tileset.png'
import auroraSpriteSheet from '../assets/sprites/characters/aurora.png'
import punkSpriteSheet from '../assets/sprites/characters/punk.png'
import blueSpriteSheet from '../assets/sprites/characters/blue.png'
import yellowSpriteSheet from '../assets/sprites/characters/yellow.png'
import greenSpriteSheet from '../assets/sprites/characters/green.png'
import slimeSpriteSheet from '../assets/sprites/characters/slime.png'
import CharacterFactory from "../src/characters/character_factory";
import Footsteps from "../assets/audio/footstep_ice_crunchy_run_01.wav";

let HideAndSeekWin = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize: function StartingScene() {
        Phaser.Scene.call(this, {key: 'HideAndSeekWin'});
    },
    characterFrameConfig: {frameWidth: 31, frameHeight: 31},
    slimeFrameConfig: {frameWidth: 32, frameHeight: 32},

    preload: function () {
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
        let color1 = '#000000';
		let color2 = '#FFFFFF';

		setInterval(() => {
			let tmp = color1;
			color1 = color2;
			color2 = tmp;

			this.cameras.main.setBackgroundColor(color1)
			let text = "Congrats! You win!\nYou passed this level so easily...\nMaybe you should play Outlast?";
			let style = { font: "40px Arial", fill: color2, align: "center" };
			this.add.text(this.scale.width / 7, this.scale.height / 2.5, text, style);
		}, 500);
    },

    update: function () {
	/*
        if (this.gameObjects) {
            this.gameObjects.forEach( function(element) {
                element.update();
            });
        }
		*/
    },
    tilesToPixels(tileX, tileY) {
        return [tileX*this.tileSize, tileY*this.tileSize];
    },
});

export default HideAndSeekWin;