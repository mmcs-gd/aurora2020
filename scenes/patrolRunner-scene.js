//patrol, runner, squareSquad

import EasyStar from "easystarjs";

import tilemapPng from        '../assets/tileset/Dungeon_Tileset.png'
import dungeonRoomJson from   '../assets/dungeon_room.json'
import auroraSpriteSheet from '../assets/sprites/characters/aurora.png'
import punkSpriteSheet from   '../assets/sprites/characters/punk.png'
import blueSpriteSheet from   '../assets/sprites/characters/blue.png'
import yellowSpriteSheet from '../assets/sprites/characters/yellow.png'
import greenSpriteSheet from  '../assets/sprites/characters/green.png'
import slimeSpriteSheet from  '../assets/sprites/characters/slime.png'
import CharacterFactory from  "../src/characters/character_factory";
import Footsteps from         "../assets/audio/footstep_ice_crunchy_run_01.wav";

import { Runner } from "../src/ai/steerings/runner";
import { Patrol } from "../src/ai/steerings/patrol";
import { Pursuit } from "../src/ai/steerings/pursuit";

const countOfSlimesPatrol = 1;
const countOfSlimesRunner = 10;
const countOfSlimesInSquad = 4;

let patrolRunner = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

        function StartingScene() {
            Phaser.Scene.call(this, {key: 'patrolRunner'});
        },
    characterFrameConfig: {frameWidth: 31, frameHeight: 31},
    slimeFrameConfig: {frameWidth: 32, frameHeight: 32},
    preload: function () {

        //loading map tiles and json with positions
        this.load.image("tiles", tilemapPng);
        this.load.tilemapTiledJSON("map", dungeonRoomJson);

        //loading spitesheets
        this.load.spritesheet('aurora', auroraSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('blue',   blueSpriteSheet,   this.characterFrameConfig);
        this.load.spritesheet('green',  greenSpriteSheet,  this.characterFrameConfig);
        this.load.spritesheet('yellow', yellowSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('punk',   punkSpriteSheet,   this.characterFrameConfig);
        this.load.spritesheet('slime',  slimeSpriteSheet,  this.slimeFrameConfig);
        this.load.audio('footsteps', Footsteps);
    },
    create: function () {

        this.gameObjects = [];
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

        this.slimes =  this.physics.add.group();
        let params = {};

        for(let i = 0; i < countOfSlimesPatrol + countOfSlimesRunner; i++) {
            const x = Phaser.Math.RND.between(50, this.physics.world.bounds.width - 50 );
            const y = Phaser.Math.RND.between(50, this.physics.world.bounds.height -50 );
            params.slimeType = i < countOfSlimesPatrol ? 1 : 2;
            const slime = this.characterFactory.buildSlime(x, y, params);
            if (i < countOfSlimesPatrol) {
                slime.setSteering(new Patrol(slime, [this.player], 1, 10, 5));
            }
            else {
                slime.setSteering(new Runner(slime, [this.player], 1, 10, 5));
            }
            this.slimes.add(slime);
            this.physics.add.collider(slime, worldLayer);
            this.gameObjects.push(slime);
        }

        let slimeSquad = [];

        for(let i = 0; i < countOfSlimesInSquad; i++) {
            const x = Phaser.Math.RND.between(50, this.physics.world.bounds.width - 50 );
            const y = Phaser.Math.RND.between(50, this.physics.world.bounds.height -50 );
            params.slimeType = 3;
            const slime = this.characterFactory.buildSlime(x, y, params);
            this.slimes.add(slime);
            this.physics.add.collider(slime, worldLayer);
            slimeSquad.push(slime);
            this.gameObjects.push(slime);
        }

        for (let i = 0; i < countOfSlimesInSquad - 1; i++) {
            slimeSquad[i].setSteering(new Pursuit(slimeSquad[i], [slimeSquad[i + 1]], 1, 5, 5));
        }
        slimeSquad[slimeSquad.length - 1].setSteering(new Pursuit(slimeSquad[slimeSquad.length - 1], [slimeSquad[0]], 1, 5, 5));

        this.physics.add.collider(this.player, this.slimes);

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

export default patrolRunner