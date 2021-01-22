import EasyStar from "easystarjs";
import tilemapPng from '../assets/tileset/Dungeon_Tileset.png'
import crystalTilemapPng from '../assets/tileset/Crystal_tileset.png'
import auroraSpriteSheet from '../assets/sprites/characters/aurora.png'
import punkSpriteSheet from '../assets/sprites/characters/punk.png'
import blueSpriteSheet from '../assets/sprites/characters/blue.png'
import yellowSpriteSheet from '../assets/sprites/characters/yellow.png'
import greenSpriteSheet from '../assets/sprites/characters/green.png'
import slimeSpriteSheet from '../assets/sprites/characters/slime.png'
import CharacterFactory from "../src/characters/character_factory";
import EffectsFactory from "../src/utils/effects-factory";

import Footsteps from "../assets/audio/footstep_ice_crunchy_run_01.wav";

import GeneratorLevel from '../src/utils/generators/level-generator';
import MapLayout from '../src/utils/generators/map-layout';
import TileMapper from '../src/utils/generators/tile-mapper';

import gunPng from '../assets/sprites/gun.png'
import bulletPng from '../assets/sprites/bullet.png'
import gold from '../assets/sprites/gold.png'
import potion from '../assets/sprites/potion.png'
import scrolls from '../assets/sprites/scrolls.png'

import cursorCur from '../assets/sprites/cursor.cur'


const config = {
	cellularAutomata: {
		deathLimit: 4,
		birthLimit: 5, 
		chanceToStartAlive: 0.33
	},
	randomWalk: {
		maxTunnels: 5, 
		maxLength: 10,
		minWidth: 2,
		maxWidth: 3
	}
};

let TatarovaShkuro = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

        function StartingScene() {
            Phaser.Scene.call(this, {key: 'Начать игру'});
        },
    characterFrameConfig: {frameWidth: 31, frameHeight: 31},
    slimeFrameConfig: {frameWidth: 32, frameHeight: 32},
    preload: function () {

        //loading map tiles and json with positions
        this.load.image("tiles", tilemapPng);
        this.load.image("crystals", crystalTilemapPng);
        this.load.image("gun", gunPng);
        this.load.image("bullet", bulletPng);
        this.load.image("gold", gold);
        this.load.image("potion", potion);
        this.load.image("scrolls", scrolls);
  
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
        this.input.setDefaultCursor(`url(${cursorCur}), pointer`);

        this.characterFactory = new CharacterFactory(this);
        this.effectsFactory = new EffectsFactory(this);
        this.gameObjects = [];
        this.tileSize = 32;
        this.finder = new EasyStar.js();
        const width = 100;
        const height = 100;
				
        let map = [];
        let markedMap = [];
        map = (new GeneratorLevel(width, height, config)).createMap();
        markedMap = (new MapLayout(map, width, height)).getMapLayout();
				
        (new TileMapper(markedMap, this, width, height, this.tileSize)).generateLevel();
        
        let grid = [];
        for(let y = 0; y < this.groundLayer.tilemap.height; y++){
            let col = [];
            for(let x = 0; x < this.groundLayer.tilemap.width; x++) {
                const tile = this.groundLayer.tilemap.getTileAt(x, y);
                const jewelry = this.collideObjectsLayer.tilemap.getTileAt(x, y);
                if (jewelry || tile || !markedMap[x][y]) {
                    col.push(0);
                } else {
                    col.push(1);
                }

            }
            grid.push(col);
        }
        this.finder.setGrid(grid);
        this.finder.setAcceptableTiles([0]);
    },
    update: function () {
				if (this.gameObjects)
        {
            this.gameObjects.forEach( function(element) {
                element.update();
            });
        }
				const camera = this.cameras.main;
				this.events.emit('moveCamera', camera.scrollX, camera.scrollY);
    },
    tilesToPixels(tileX, tileY)
    {
        return [tileX*this.tileSize, tileY*this.tileSize];
    },
    showText(text, height = 200, style = {}) {
        const textStyle = {
            fontFamily: 'cursive',
            fontSize: '32px',
            fill: '#ffffff', 
            backgroundColor: '#000000cc', 
            fixedWidth: this.game.canvas.width + 60, 
            align: 'center',
            ...style
        }
        const gameOver = this.add.text(0,height, text, textStyle);
        const exitText = this.add.text(0, height + gameOver.height, '\nДля выхода нажмите Enter\n',
        {
            ...textStyle,
            fontSize: '28px',
            fontStyle: 'italic',
        });
        gameOver.setDepth(11);
        exitText.setDepth(11);
        
        this.events.on('moveCamera', (x, y) => {
            gameOver.setX(x);
            gameOver.setY(y + height);
            exitText.setX(x);
            exitText.setY(y + height + gameOver.height);
        }, this);
        
        this.scene.pause();        
    }
});

export default TatarovaShkuro
