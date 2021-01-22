import createLevel from '../src/utils/bsp-level-creator'

import tilemapPng from '../assets/tileset/Dungeon_Tileset.png'
import auroraSpriteSheet from '../assets/sprites/characters/aurora.png'
import punkSpriteSheet from '../assets/sprites/characters/punk.png'
import blueSpriteSheet from '../assets/sprites/characters/blue.png'
import yellowSpriteSheet from '../assets/sprites/characters/yellow.png'
import greenSpriteSheet from '../assets/sprites/characters/green.png'
import slimeSpriteSheet from '../assets/sprites/characters/slime.png'
import CharacterFactory from "../src/characters/character_factory";
import Footsteps from "../assets/audio/footstep_ice_crunchy_run_01.wav";

let HideAndSeekScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

        function StartingScene() {
            Phaser.Scene.call(this, {key: 'Hide-and-seek for your life'});
        },
        characterFrameConfig: {frameWidth: 31, frameHeight: 31},
        slimeFrameConfig: {frameWidth: 32, frameHeight: 32},

    preload: function () {
        //loading map tiles and json with positions
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

		let layers = createLevel(40, 30, this);
		this.groundLayer = layers["Ground"];
        this.stuffLayer = layers["Stuff"];
        this.outsideLayer = layers["Outside"];

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
        if (this.gameObjects)
        {
            this.gameObjects.forEach( function(element) {
                element.update();
            });
        }

		if (this.winTimerId == undefined && this.seekers.every(z => z.seek)) {
			this.winTimerId = setTimeout(() => this.win(), 10000);
		}
    },
    tilesToPixels(tileX, tileY)
    {
        return [tileX*this.tileSize, tileY*this.tileSize];
    },

	collide(seeker) {
		if (seeker.seek) this.lose();
	},

	win() {
        this.game.scene.scenes[0].scene.pause(this.game.scene.scenes[0]._runningScene);
        this.game.scene.scenes[0].scene.stop(this.game.scene.scenes[0]._runningScene);
        this.game.scene.scenes[0]._runningScene = 'HideAndSeekWin';
        this.game.scene.scenes[0].scene.run('HideAndSeekWin');
    },

    lose() {
		if (this.winTimerId != undefined) {
			clearTimeout(this.winTimerId);
		}

        this.game.scene.scenes[0].scene.pause(this.game.scene.scenes[0]._runningScene);
        this.game.scene.scenes[0].scene.stop(this.game.scene.scenes[0]._runningScene);
        this.game.scene.scenes[0]._runningScene = 'HideAndSeekLose';
        this.game.scene.scenes[0].scene.run('HideAndSeekLose');
    }
});

export default HideAndSeekScene
