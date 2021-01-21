import buildLevel from "../src/utils/level-builder";
import CharacterFactory from "../src/characters/character_factory";

import auroraSpriteSheet from '../assets/sprites/characters/aurora.png'
import punkSpriteSheet from '../assets/sprites/characters/punk.png'
import blueSpriteSheet from '../assets/sprites/characters/blue.png'
import yellowSpriteSheet from '../assets/sprites/characters/yellow.png'
import greenSpriteSheet from '../assets/sprites/characters/green.png'
import slimeSpriteSheet from '../assets/sprites/characters/slime.png'
import Footsteps from "../assets/audio/footstep_ice_crunchy_run_01.wav";
import Merger from "../src/ai/npcs/merger";

import tilemapPng from '../assets/tileset/Dungeon_Tileset.png'

let RealLevelScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize: function StartingScene() {
            Phaser.Scene.call(this, {key: 'RealLevelScene'});
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
        this.gameObjects = [];
        this.characterFactory = new CharacterFactory(this);
        this.level++;
        let width = 100; let height = 100; let maxRooms = 100; let maxNpcs = 100;
        const layers = buildLevel(width, height, maxRooms, maxNpcs, this);
        this.groundLayer = layers["Ground"];
        //this.stuffLayer = layers["Stuff"];
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
        if (this.gameObjects) {
            this.gameObjects.forEach( function(element) {
                element.update();
            });
        }
        //if (this.hasPlayerReachedStairs) return;

        //this.player.update();

        // Find the player's room using another helper method from the dungeon that converts from
        // dungeon XY (in grid units) to the corresponding room object
        //const playerTileX = this.groundLayer.worldToTileX(this.player.x);
        //const playerTileY = this.groundLayer.worldToTileY(this.player.y);
        // if (!isNaN(playerTileX))
        // {
        //     const playerRoom = this.dungeon.getRoomAt(playerTileX, playerTileY);
        //     this.tilemapVisibility.setActiveRoom(playerRoom);
        // }
    },
    tilesToPixels(tileX, tileY) {
        return [tileX*this.tileSize, tileY*this.tileSize];
    },
    onNpcPlayerCollide(npc, player) {
        if (!npc.isFriendly)
        {
            alert('Погиб!');
        }
        //this.scene.pause(this._runningScene)
    },
    onNpcNpcCollide(npc1, npc2) {
        //destroy old npcs
        //alert('Слияние!');
        console.log(npc1)
        let params = {x: (npc1.x + npc2.x) / 2, y: (npc1.y + npc2.y) / 2, pL: (((npc1.ai.table.powerLevel + npc2.ai.table.powerLevel) / 2) | 0) + 1}
        this.npcs.splice(this.npcs.indexOf(npc1), 1)
        this.npcs.splice(this.npcs.indexOf(npc2), 1)
        for (let npc of this.npcs)
        {
            npc.ai.deleteNpc(npc1)
            npc.ai.deleteNpc(npc2)
        }
        this.gameObjects.splice(this.gameObjects.indexOf(npc1), 1)
        this.gameObjects.splice(this.gameObjects.indexOf(npc2), 1)
        npc1.destroy()
        npc2.destroy()
        
        //create new npc        
        let newNpc = this.characterFactory.buildCharacter('blue', params.x, params.y); 
        newNpc.setAI(new Merger(newNpc, this.player, params.pL), 'idle');
        this.gameObjects.push(newNpc);
        this.physics.add.collider(newNpc, this.groundLayer);
        //this.physics.add.collider(newNpc, stuffLayer);
        this.physics.add.collider(newNpc, this.outsideLayer);
        this.physics.add.collider(newNpc, this.player, this.onNpcPlayerCollide.bind(this));
        for (let otherNpc of this.npcs)
        {
            this.physics.add.collider(newNpc, otherNpc, this.onNpcNpcCollide.bind(this));
        }

        for (let otherNpc of this.npcs)
        {
            otherNpc.ai.addNpcs([newNpc])
        }
        newNpc.ai.addNpcs(this.npcs)
        this.npcs.push(newNpc);
        
        
        //win condition
        if (this.npcs.length <= 1)
        {
            alert('Победа!');
            //this.scene.pause(this._runningScene)   
        }
        //console.log(npc1, npc2)
    }
});

export default RealLevelScene;
