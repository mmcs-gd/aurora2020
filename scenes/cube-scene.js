//import buildLevel from "../src/utils/level_procedural_generator/level-builder";
import RoomGenerator from "../src/utils/procedural_generation/room-generator"
import CharacterFactory from "../src/characters/character_factory";
import auroraSpriteSheet from '../assets/sprites/characters/aurora.png'
import punkSpriteSheet from '../assets/sprites/characters/punk.png'
import blueSpriteSheet from '../assets/sprites/characters/blue.png'
import yellowSpriteSheet from '../assets/sprites/characters/yellow.png'
import greenSpriteSheet from '../assets/sprites/characters/green.png'
import slimeSpriteSheet from '../assets/sprites/characters/slime.png'
import Footsteps from "../assets/audio/footstep_ice_crunchy_run_01.wav";

import EffectsFactory from "../src/utils/effects-factory";
import Portal from "../src/utils/portal/portal"
import tilemapPng from '../assets/tileset/Dungeon_Tileset.png'

let CubeScene = new Phaser.Class({

    Extends: Phaser.Scene,
    effectsFrameConfig: {frameWidth: 32, frameHeight: 32},

    initialize: function StartingScene() {
        Phaser.Scene.call(this, {key: 'CubeScene'});
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
        this.effectsFactory = new EffectsFactory(this);

    },

    create: function () {
        this.effectsFactory.loadAnimations();
        this.gameObjects = [];
        this.characterFactory = new CharacterFactory(this);
        this.level++;
        this.hasPlayerReachedStairs = false;
        
        this.portals = [];

        const roomGenerator = new RoomGenerator(32, this, 420, 420);
        const layersOfLevel = roomGenerator.generateRooms();
        
        console.log(layersOfLevel);

        this.groundLayer = layersOfLevel["Ground"];
        this.stuffLayer = layersOfLevel["Stuff"];
        this.outsideLayer = layersOfLevel["Outside"];

        const startCoordinates = roomGenerator.getStartPoint();

        this.player = this.characterFactory.buildCharacter('aurora', startCoordinates["X"],  startCoordinates["Y"], {player: true});
        this.gameObjects.push(this.player);
        this.physics.add.collider(this.player, this.groundLayer);
        this.physics.add.collider(this.player, this.stuffLayer);
        this.physics.add.collider(this.player, this.outsideLayer);

        //this.effectsFactory.buildEffect('magicSpell', 100, 200);
        
        //this.effectsFactory.buildEffect('flamelash', 400, 350);
        
        const camera = this.cameras.main;
        camera.setZoom(1.0)
        camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        camera.startFollow(this.player);
        camera.roundPixels = true;

        this.input.keyboard.once("keydown_D", event => {
            // Turn on physics debugging to show player's hitbox
            this.physics.world.createDebugGraphic();

            const graphics = this.add
                .graphics()
                .setAlpha(0.75)
                .setDepth(20);
        });
        this.keySetPortal = this.input.keyboard.addKey('S');
        this.KOSTYL = true;
        this.time = 0;
    },

    update: function () {
        this.widthTile = 32;
        this.heightTile = 32;

        if (this.gameObjects) {
            this.gameObjects.forEach( function(element) {
                element.update();
            });
        if (this.portals.length >= 2 && this.portals[0].x == this.portals[1].x && this.portals[0].y == this.portals[1].y) {
            for (let i = 0; i < this.portals.length; i++) {
                this.portals[i].effect.destroy();
            }
            this.portals = [];
        }
        if (this.keySetPortal.isDown && this.KOSTYL) {
            if (this.portals.length == 2) {
                for (let i = 0; i < this.portals.length; i++) {
                    this.portals[i].effect.destroy();
                }
                this.portals = [];
            }
            this.KOSTYL = false;
            this.time++;
            let effectName = 'vortex';

            let x = this.player.body.x;
            let y = this.player.body.y;

            let tileX = Math.floor((x + (this.player.body.gameObject.width / 2)) / this.widthTile);
            let tileY = Math.floor((y + (this.player.body.gameObject.height / 2)) / this.heightTile);

            console.log(tileX + " " + tileY);
            
            if (this.player.faceDirection == 0) tileX -= 2;
            if (this.player.faceDirection == 1) tileX += 2;
            if (this.player.faceDirection == 2) tileY -= 2;
            if (this.player.faceDirection == 3) tileY += 2;
            
            x = tileX * this.widthTile;
            y = tileY * this.heightTile;
            console.log(x + " " + y);
            if (this.portals.length < 2) {
                let effect = this.effectsFactory.buildEffect(effectName, x, y)
                let portal = new Portal(x, y, effect);
                this.portals.push(portal);
            }
            return;
        }
        this.KOSTYL = this.keySetPortal.isUp;
    }
},
    tilesToPixels(tileX, tileY) {
        return [tileX*this.tileSize, tileY*this.tileSize];
    },


});

export default CubeScene
