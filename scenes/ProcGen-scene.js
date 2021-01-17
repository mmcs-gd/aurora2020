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
import Aggressive from "../src/ai/aggressive";

import TILE_MAPPING from '../src/utils/Tile.js'

import EasyStar from "easystarjs";

import gunPng from '../assets/sprites/gun.png'
import bulletPng from '../assets/sprites/bullet.png'
import cursorCur from '../assets/sprites/cursor.cur'

import dungeonRoomJson from '../assets/dungeon_room.json'
import EffectsFactory from "../src/utils/effects-factory";

import UserControlled from '../src/ai/behaviour/user_controlled'

import Vector2 from 'phaser/src/math/Vector2'

let GLOB_WIDTH = 25;
let GLOB_HEIGHT = 25;
let GLOB_MAXROOM = 25;


class Hint extends Phaser.Scene {
    constructor(x = 0, y = 0, text = '', time = 2000) {
        super();
        this.pos = {x, y};
        this.text = text;
        this.ttl = time;

        this._index = Phaser.Math.RND.integer();
    }

    get index() {
        return this._index;
    }

    preload() {
        this._startTime = this.time.now;
    }

    create() {
        const pos = this.pos;
        this._drawingText = this.add.text(
            pos.x, pos.y,
            this.text,
            {
                fill: '#fff',
                backgroundColor: '#333',
                padding: {
                    x : 8,
                    y : 8
                },
                alpha : 0
            }
        );

        this.tweens.add({
            targets: this._drawingText,
            alpha: {from : 0, to : 1},
            y: '+=4',
            ease: 'Linear',
            duration: 200,
            repeat: 0
        });

        this.tweens.add({
            targets: this._drawingText,
            alpha: {from : 1, to : 0},
            ease: 'Linear',
            y: '+=4',
            delay: this.ttl - 400,
            duration: 200,
            repeat: 0
        });
    }

    update(time) {
        if (time > this._startTime + this.ttl) {
            this.scene.remove(this);
        }
    }
}



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
        this.effectsFactory = new EffectsFactory(this);

        this.load.image("gun", gunPng);
        this.load.image("bullet", bulletPng);
    },
    
    create: function () {
        this.input.setDefaultCursor(`url(${cursorCur}), pointer`);

        this.effectsFactory.loadAnimations();
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
        this.ammo = layers["Ammo"];

         // Аналогично предыдущему, можно убрать, 
        // ничего не измениться, но если мы хотим кидать npc или плюшки, пигодиться
        var hint = new Hint(80, 32, '', 300);
        this.hint = hint;
        
        this.input.keyboard.once("keydown_F", event => {
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
                //console.log(this)
                // мы победили, но не приддумал пока ничего лучше этого
                if (this._runningScene !== null) {
                    alert('Победа!');
                    this.scene.pause(this._runningScene);
                    this.scene.stop(this._runningScene);
                    this._runningScene = null;
                }
            }
        }

        if (this.ammo.x != -1 && this.ammo.y != -1)
        { 
            //console.log(this.player, this.ammo)
            if (disance(this.player, this.ammo) < 50)
            {
                let flag = true;
                console.log(this.player.countBullet )
                let str= "";
                if (this.player.countBullet == 25)
                {
                    str = "I\'m overwhelmed";
                }
                else
                {
                    this.player.countBullet += 10;
                    if (this.player.countBullet > 25) this.player.countBullet = 25
                    str =  'Count ammo ' + this.player.countBullet;
                    
                }           
                //alert(str)
                ыconsole.log(str)
                // this.hint.text = str;
                // try {
                //     this.scene.add('HintScene_' + this.hint.index, this.hint, true);
                // } catch (error) { /* Error: Cannot add a Scene with duplicate key */ }
            
            }
        }

        //console.log(this.win)
        //console.log(disance(this.player, this.goal), this.player.x, this.player.y, this.goal.x, this.goal.y)
        if (disance(this.player, this.goal) < 32)
        {
            let width = GLOB_WIDTH; 
            let height = GLOB_HEIGHT; 
            let maxRooms = GLOB_MAXROOM;

            /// отчистить массив объектов      
            if (this.gameObjects) {
                this.gameObjects.forEach( function(element) {
                    element.body.destroy();
                    element.body.stop();
                    element.x = -10;
                    element.y = -10;
                });
            }

            const layers = buildLevel(width, height, maxRooms, this);
            this.gameObjects.push(this.player);
            this.groundLayer = layers["Ground"];
            this.OtherSubjLayer = layers["OtherSubj"];
            this.floorLayer = layers["Floor"];
            this.goal = layers["Goal"];
            this.win = layers["Win"];
            this.ammo = layers["Ammo"];
        }
        //this.player.update(); // так как кинул player в объекты,
                                 //  нет смыла его двадый за frame обновлять
                                 // оствил на случай разделение логики объектов
    },
    tilesToPixels(tileX, tileY) {
        return [tileX*this.tileSize, tileY*this.tileSize];
    },
    onNpcPlayerCollide() 
    {
        alert('Погиб!');
        this.scene.pause(this._runningScene)
    }	
});

export default ProcScene

function disance(p1, p2) {
    return Math.sqrt(((p2.x - p1.x) ** 2) + ((p2.y - p1.y) ** 2));
  }
