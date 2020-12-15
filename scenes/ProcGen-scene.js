import buildLevel from "../src/utils/scenes-handler";

import tilemapPng from '../assets/tileset/Dungeon_Tileset.png'
import auroraSpriteSheet from '../assets/sprites/characters/aurora.png'
import punkSpriteSheet from '../assets/sprites/characters/punk.png'
import blueSpriteSheet from '../assets/sprites/characters/blue.png'
import yellowSpriteSheet from '../assets/sprites/characters/yellow.png'
import greenSpriteSheet from '../assets/sprites/characters/green.png'
import slimeSpriteSheet from '../assets/sprites/characters/slime.png'
import CharacterFactory from "../src/characters/character_factory";
import Footsteps from "../assets/audio/footstep_ice_crunchy_run_01.wav";


import TILE_MAPPING from '../src/utils/Tile.js'


let GLOB_WIDTH = 25;
let GLOB_HEIGHT = 25;
let GLOB_MAXROOM = 25;

let ProcScene = new Phaser.Class({

    Extends: Phaser.Scene,


    initialize: function ProceduralScene() {
        Phaser.Scene.call(this, {key: 'ProcScene'});
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
        this.load.audio('footsteps', Footsteps);
    },
    
    create: function () {
        this.characterFactory = new CharacterFactory(this);
        this.gameObjects = []; // Впринципе можн было это не делать, 
                                // но для того, что бы можно было кидать объекты, не только в handler

        let width = GLOB_WIDTH; 
        let height = GLOB_HEIGHT; 
        let maxRooms = GLOB_MAXROOM;

        const layers = buildLevel(width, height, maxRooms, this);
        this.gameObjects.push(this.player);
        this.groundLayer = layers["Ground"];
        this.OtherSubjLayer = layers["OtherSubj"];
        this.floorLayer = layers["Floor"];
        this.goal = layers["Goal"];
        this.win = layers["Win"];

         // Аналогично предыдущему, можно убрать, 
        // ничего не измениться, но если мы хотим кидать npc или плюшки, пигодиться
        
        this.input.keyboard.once("keydown_D", event => {
            // Turn on physics debugging to show player's hitbox
            this.physics.world.createDebugGraphic();

            const graphics = this.add
                .graphics()
                .setAlpha(0.75)
                .setDepth(20);
        });
        //console.log(this)

    },

    update: function () {
        if (this.gameObjects) {
            this.gameObjects.forEach( function(element) {
                element.update();
            });
        }


        if (this.win.x != -1 && this.win.y != -1)
        {
            if (disance(this.player, this.win) < 32)
            {
                // мы победили, но не приддумал пока ничего улчше этого
                if (this._runningScene !== null) {
                    this.scene.pause(this._runningScene);
                    this.scene.stop(this._runningScene);
                    this._runningScene = null;
                }
            }
        }

        //console.log(this.win)
        //console.log(disance(this.player, this.goal), this.player.x, this.player.y, this.goal.x, this.goal.y)
        if (disance(this.player, this.goal) < 32)
        {
            let width = GLOB_WIDTH; 
            let height = GLOB_HEIGHT; 
            let maxRooms = GLOB_MAXROOM;
            const layers = buildLevel(width, height, maxRooms, this);
            this.gameObjects.push(this.player);
            this.groundLayer = layers["Ground"];
            this.OtherSubjLayer = layers["OtherSubj"];
            this.floorLayer = layers["Floor"];
            this.goal = layers["Goal"];
            this.win = layers["Win"];
        }
        //this.player.update(); // так как кинул player в объекты,
                                 //  нет смыла его двадый за frame обновлять
                                 // оствил на случай разделение логики объектов
    },
    tilesToPixels(tileX, tileY) {
        return [tileX*this.tileSize, tileY*this.tileSize];
    }
});

export default ProcScene

function disance(p1, p2) {
    return Math.sqrt(((p2.x - p1.x) ** 2) + ((p2.y - p1.y) ** 2));
  }
