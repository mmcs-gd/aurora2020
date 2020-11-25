import EasyStar from "easystarjs";

import tilemapPng from '../assets/tileset/Dungeon_Tileset.png'
import dungeonRoomJson from '../assets/dungeon_room.json'
import auroraSpriteSheet from '../assets/sprites/characters/aurora.png'
import punkSpriteSheet from '../assets/sprites/characters/punk.png'
import blueSpriteSheet from '../assets/sprites/characters/blue.png'
import yellowSpriteSheet from '../assets/sprites/characters/yellow.png'
import greenSpriteSheet from '../assets/sprites/characters/green.png'
import slimeSpriteSheet from '../assets/sprites/characters/slime.png'
import CharacterFactory from "../src/characters/character_factory";
import Footsteps from "../assets/audio/footstep_ice_crunchy_run_01.wav";

import Patrolling from "../src/ai/steerings/patrolling";
import Player from "../src/characters/player";
import Npc from "../src/characters/npc";
import Pursuit from "../src/ai/steerings/pursuit";
import Evade from "../src/ai/steerings/evade";

let SteeringRudnevScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

        function StartingScene() {
            Phaser.Scene.call(this, {key: 'SteeringRudnevScene'});
        },
    characterFrameConfig: {frameWidth: 31, frameHeight: 31},
    slimeFrameConfig: {frameWidth: 32, frameHeight: 32},
    preload: function () {

        //loading map tiles and json with positions
        this.load.image("tiles", tilemapPng);
        this.load.tilemapTiledJSON("map", dungeonRoomJson);

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
        const map = this.make.tilemap({key: "map"});

        // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
        // Phaser's cache (i.e. the name you used in preload)
        const tileset = map.addTilesetImage("Dungeon_Tileset", "tiles");


        // Parameters: layer name (or index) from Tiled, tileset, x, y
        this.belowLayer = map.createStaticLayer("Floor", tileset, 0, 0);
        this.worldLayer = map.createStaticLayer("Walls", tileset, 0, 0);
        this.aboveLayer = map.createStaticLayer("Upper", tileset, 0, 0);
        this.tileSize = 32;
        this.finder = new EasyStar.js();
        let grid = [];

        for(let y = 0; y <  this.worldLayer.tilemap.height; y++){
            let col = [];
            for(let x = 0; x <  this.worldLayer.tilemap.width; x++) {
                const tile =  this.worldLayer.tilemap.getTileAt(x, y);
                col.push(tile ? tile.index : 0);
            }
            grid.push(col);
        }

        this.finder.setGrid(grid);
        this.finder.setAcceptableTiles([0]);

        this.worldLayer.setCollisionBetween(1, 500);
        this.aboveLayer.setDepth(10);

        this.physics.world.bounds.width = map.widthInPixels;
        this.physics.world.bounds.height = map.heightInPixels;
        this.characterFactory = new CharacterFactory(this);



        // Creating characters
        this.player = this.characterFactory.buildCharacter('aurora', 100, 120, {player: true});
        this.player.setVelocityX(50);
        this.gameObjects.push(this.player);
        this.physics.add.collider(this.player,  this.worldLayer);

        this.evaders = []
        this.patroling_sqr_side = 30
        const targets = [
            [{x:320,y:320}, {x:350,y:320}, {x:350,y:350}, {x:320,y:350}],
            [{x:100,y:320}, {x:130,y:320}, {x:130,y:350}, {x:100,y:350}],
            [{x:540,y:320}, {x:570,y:320}, {x:570,y:350}, {x:540,y:350}]
        ]
        const speeds = [80, 30, 50]
        for( let i = 0 ; i < 3; i++)
        {
            this.evaders.push(this.characterFactory.buildCharacter('green', targets[i][0].x, targets[i][0].y, {Steering: new Patrolling(this, i, targets[i], speeds[i])}));
            this.gameObjects.push(this.evaders[i]);
            this.physics.add.collider(this.evaders[i],  this.worldLayer);
            this.physics.add.collider(this.evaders[i], this.player);
        }

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
            const pl_pos = {x: 0, y: 0}
            let pl_index = 0
            for( let i = 0; i < this.gameObjects.length; i++)
            {
                this.gameObjects[i].update();
                if (this.gameObjects[i] instanceof Player)
                {
                    pl_pos.x = this.gameObjects[i].body.x
                    pl_pos.y = this.gameObjects[i].body.y
                    pl_index = i;
                    i = this.gameObjects.length
                }
            }

            for( let i = 0; i < this.gameObjects.length; i++)
            {
                this.gameObjects[i].update();
                if (this.gameObjects[i] instanceof Npc)
                {
                    const dist = Math.sqrt((this.gameObjects[i].body.x - pl_pos.x) * (this.gameObjects[i].body.x - pl_pos.x)
                        + (this.gameObjects[i].body.y - pl_pos.y) * (this.gameObjects[i].body.y - pl_pos.y))

                    if(dist < 150 && dist > 50 && (this.gameObjects[i].Steering instanceof Patrolling))
                    {
                        this.gameObjects[i].Steering = new Pursuit(this.gameObjects[i], this.gameObjects[pl_index])
                        //console.log("set", i, "to Pursuit")
                    }

                    if (dist < 50 && (this.gameObjects[i].Steering instanceof Pursuit))
                    {
                        this.gameObjects[i].Steering = new Evade(this.gameObjects[i], this.gameObjects[pl_index])
                        //console.log("set", i, "to Evade")
                    }

                    if (dist > 250 && (this.gameObjects[i].Steering instanceof Evade))
                    {
                        const x = this.gameObjects[i].body.x
                        const y = this.gameObjects[i].body.y

                        this.gameObjects[i].Steering = new Patrolling(this, i-1,  [{x:x,y:y}, {x:x+30,y:y}, {x:x+30,y:y+30}, {x:x,y:y+30}], 50)
                        //console.log("set", i, "to Patrolling")
                    }
                }
            }


        }

    },
    tilesToPixels(tileX, tileY)
    {
        return [tileX*this.tileSize, tileY*this.tileSize];
    }
});

export default SteeringRudnevScene