import tilemapPng from '../assets/tileset/Dungeon_Tileset.png'
import crystalTilemapPng from '../assets/tileset/Crystal_tileset.png'
import auroraSpriteSheet from '../assets/sprites/characters/aurora.png'
import punkSpriteSheet from '../assets/sprites/characters/punk.png'
import blueSpriteSheet from '../assets/sprites/characters/blue.png'
import yellowSpriteSheet from '../assets/sprites/characters/yellow.png'
import greenSpriteSheet from '../assets/sprites/characters/green.png'
import slimeSpriteSheet from '../assets/sprites/characters/slime.png'
import CharacterFactory from "../src/characters/character_factory";
import Footsteps from "../assets/audio/footstep_ice_crunchy_run_01.wav";

import GeneratorLevel from '../src/utils/generators/level-generator';
import MapLayout from '../src/utils/generators/map-layout';
import TileMapper from '../src/utils/generators/tile-mapper';

import { fillability, info } from '../src/utils/generators/metrics';

const config = {
	cellularAutomata: {
		deathLimit: 3,
		birthLimit: 3, 
		chanceToStartAlive: 0.45
	},
	randomWalk: {
		maxTunnels: 20, 
		maxLength: 30,
		minWidth: 2,
		maxWidth: 4
	}
};

let TatarovaShkuro = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

        function StartingScene() {
            Phaser.Scene.call(this, {key: 'Tatarova-Shkuro'});
        },
    characterFrameConfig: {frameWidth: 31, frameHeight: 31},
    slimeFrameConfig: {frameWidth: 32, frameHeight: 32},
    preload: function () {

        //loading map tiles and json with positions
        this.load.image("tiles", tilemapPng);
        this.load.image("crystals", crystalTilemapPng);

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
        this.characterFactory = new CharacterFactory(this);
        this.gameObjects = [];
        this.tileSize = 32;

        const width = 100;
        const height = 100;
				
				let map = [];
				let markedMap = [];
				do {
					map = (new GeneratorLevel(width, height, config)).createMap();
					markedMap = (new MapLayout(map, width, height)).getMapLayout();
				} while (fillability(markedMap) < 0.13);
			
				//call connectivity
				info(map);
				
        const layers = (new TileMapper(markedMap, this, width, height, this.tileSize)).generateLevel();
        this.gameObjects.push(this.player);
        this.groundLayer = layers.Ground;
        this.otherLayer = layers.Other;
        
				
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

    },
    tilesToPixels(tileX, tileY)
    {
        return [tileX*this.tileSize, tileY*this.tileSize];
    }
});

export default TatarovaShkuro
