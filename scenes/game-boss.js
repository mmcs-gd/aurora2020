import tilemapPng from '../assets/tileset/Dungeon_Tileset.png'
// в программе Tiled файл .tmx сохранить как json
import bossRoomJson from '../assets/boss_room.json'
import auroraSpriteSheet from '../assets/sprites/characters/aurora.png'
//import bossSpriteSheet from '../assets/sprites/characters/boss.png'
import punkSpriteSheet from '../assets/sprites/characters/punk.png'
import slimeSpriteSheet from '../assets/sprites/characters/slime.png'
import CharacterFactory from "../src/characters/character_factory";
import Footsteps from "../assets/audio/footstep_ice_crunchy_run_01.wav";

import EasyStar from "easystarjs";
import Aggressive from "../src/ai/aggressive";
import BossAI from "../src/ai/boss";


let SceneBoss = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize: function StartingScene() {
        Phaser.Scene.call(this, {key: 'SceneBoss'});
    },

    characterFrameConfig: {frameWidth: 31, frameHeight: 31},
    slimeFrameConfig: {frameWidth: 32, frameHeight: 32},
    //bossFrameConfig: {frameWidth: 96, frameHeight: 96},

    preload: function () {

        //loading map tiles and json with positions
        this.load.image("tiles", tilemapPng);
        this.load.tilemapTiledJSON("map", bossRoomJson);

        //loading spitesheets
        this.load.spritesheet('aurora', auroraSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('slime', slimeSpriteSheet, this.slimeFrameConfig);
        this.load.spritesheet('punk', punkSpriteSheet, this.characterFrameConfig);
        //this.load.spritesheet('boss', bossSpriteSheet, this.bossFrameConfig);
        this.load.audio('footsteps', Footsteps);
    },

    create: function () {
        this.gameObjects = [];
        this.slimes = [];
        const map = this.make.tilemap({key: "map"});

        // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
        // Phaser's cache (i.e. the name you used in preload)
        const tileset = map.addTilesetImage("Dungeon_Tileset", "tiles");


        // Parameters: layer name (or index) from Tiled, tileset, x, y
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

        // Creating characters
        this.player = this.characterFactory.buildCharacter('aurora', 100, 100, {player: true});
        this.gameObjects.push(this.player);
        this.physics.add.collider(this.player, worldLayer);

        //
        this.boss = this.characterFactory.buildCharacter('boss', 700, 300);
        this.boss.setAI(new Aggressive(this.boss, [this.player]), 'idle');
        this.gameObjects.push(this.boss);
        this.physics.add.collider(this.boss, worldLayer);
        this.physics.add.collider(this.boss, this.player, this.onNpcPlayerCollide.bind(this));

        //
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
    },

    onNpcPlayerCollide() {
        alert('Погиб!');
        this.scene.pause("SceneBoss");
        this.scene.pause("SceneText");
    },

    createSlimes() {
        console.log('появление желешек');
        this.slimes =  this.physics.add.group();
        let params = {};
        for(let i = 0; i < 5; i++) {
            const x = Phaser.Math.RND.between(50, this.physics.world.bounds.width - 50 );
            const y = Phaser.Math.RND.between(50, this.physics.world.bounds.height -50 );
            params.slimeType = Phaser.Math.RND.between(0, 4);
            const slime = this.characterFactory.buildSlime(x, y, params);
            this.slimes.add(slime);
            this.physics.add.collider(slime, this.worldLayer);
            this.gameObjects.push(slime);
        }
        this.physics.add.collider(this.player, this.slimes);
    },

    killSlimes() {
        console.log('убивает желешеки');
        this.slimes.forEach(s => s.damage());
    }
});

export default SceneBoss