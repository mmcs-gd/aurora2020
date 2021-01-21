import tilemapPng from '../assets/tileset/Dungeon_Tileset.png'
import auroraSpriteSheet from '../assets/sprites/characters/aurora.png'
import punkSpriteSheet from '../assets/sprites/characters/punk.png'
import CharacterFactory from "../src/characters/character_factory";
import EffectsFactory from "../src/utils/effects-factory";
import Footsteps from "../assets/audio/footstep_ice_crunchy_run_01.wav";
import bulletPng from '../assets/sprites/bullet.png'

import buildLevel from '../src/utils/level_generator/level-build';
import Bullet from '../src/characters/bullet';


let SceneDungeon = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize: function StartingScene () {
        Phaser.Scene.call(this, {key: 'SceneDungeon'});
    },

    effectsFrameConfig: {frameWidth: 32, frameHeight: 32},
    characterFrameConfig: {frameWidth: 31, frameHeight: 31},

    preload: function () {
        //loading map tiles
        this.load.image("tiles", tilemapPng);
        
        //loading spitesheets
        this.load.spritesheet('aurora', auroraSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('punk', punkSpriteSheet, this.characterFrameConfig);
        this.load.audio('footsteps', Footsteps);

        //loading images
        this.load.image("bullet", bulletPng);

        this.effectsFactory = new EffectsFactory(this);
    },

    create: function () {
        this.gameObjects = [];
        this.bullets = [];
        this.characterFactory = new CharacterFactory(this);
        this.effectsFactory.loadAnimations();
        this.showMap = false;
        
        // генерация уровня
        // убрать while, try после исправления генерации
        while (true) {
            try {
                const layers = buildLevel(50, 50, this);
                this.groundLayer = layers["Ground"];
                this.outsideLayer = layers["Outside"];
                this.wallsLayer = layers["Walls"];

                // убрать потом
                this.rooms = layers["rooms"];
                this.corridors = layers["corridors"];
                this.fillPercent = layers["fillPercent"];
                break;
            } catch (err) {}
        }

        // передаём инфу в сцену с текстом
        this.game.scene.scenes[0]._SceneTextInfo = {
            mapSize: { // canvas 800x600
                width: 50*32,
                height: 50*32
            },
            roomsCount: this.rooms.length,
            fillPercent: this.fillPercent,
            npc: this.npc, // buildLevel добавил npc
        };

        // передаём инфу в сцену с картой
        this.game.scene.scenes[0]._SceneMapInfo = {
            sceneSize: {
                width: 50*32,
                height: 50*32
            },
            rooms: this.rooms,
            corridors: this.corridors,
            portal: this.portal, // buildLevel добавил portal
            npc: this.npc,
            player: this.player,
        };

        // вешаем события на кнопки
        this.input.keyboard.once("keydown_D", event => {
            // Turn on physics debugging to show player's hitbox
            this.physics.world.createDebugGraphic();

            const graphics = this.add
                .graphics()
                .setAlpha(0.75)
                .setDepth(20);
        });

        this.input.keyboard.on("keydown_M", event => {
            // show/hide game map
            console.log("dungeon.js keydown_M");

            if (!this.showMap) {
                //this.scene.pause("SceneDungeon");
                this.scene.pause("SceneText");
                this.scene.stop("SceneText");
                this.scene.run("SceneMap");
            } else {
                this.scene.pause("SceneMap");
                this.scene.stop("SceneMap");
                this.scene.run("SceneText");
                //this.scene.run("SceneDungeon");
            }
            this.showMap = !this.showMap;
        });

        this.input.on('pointerdown', (pointer) => {
            // стрельба
            const [ x, y ] = [ this.player.x + 40, this.player.y + 40 ];

            const vx = pointer.x - x;
            const vy = pointer.y - y;

            const BULLET_SPEED = 400;
            const mult = BULLET_SPEED / Math.sqrt(vx*vx + vy*vy);

            const bullet = new Bullet(x, y, vx * mult, vy * mult);
            this.bullets.push(bullet);

            // прописать столкновения
            // столкновение со стеной
            /*this.physics.add.collider(this.bullets, wallLayer, (bullet) => {
                bullet.setVisible(false);
                bullet.setActive(false);
            });

            // столкновение с npc
            this.physics.add.collider(bullet, this.npc, (npc) => {
                if (bullet.active) {
                    npc.damage();
                    bullet.setActive(false);
                    bullet.setVisible(false);
                }
            });*/
        });

        // https://www.html5gamedevs.com/topic/10139-phaser-keyboard-codes-cheatsheet/
        this.input.keyboard.on("keydown_ONE", event => {
            // skill 1
            console.log("skill 1");
        });

        // запускаем сцену в которой выводим текст
        this.scene.run("SceneText");
    },

    update: function () {
        if (this.gameObjects) {
            this.gameObjects.forEach( function(element) {
                element.update();
            });
        }
    },

    tilesToPixels (tileX, tileY) {
        return [tileX*this.tileSize, tileY*this.tileSize];
    },

    onNpcPlayerCollide() {
        alert('Погиб!');
        this.scene.pause("SceneDungeon");
        this.scene.pause("SceneText");
        this.scene.pause("SceneMap");
    },

    runSceneBoss() {
        // переход на сцену босса
        console.log('runSceneBoss');
        this.scene.pause("SceneDungeon");
        this.scene.stop("SceneDungeon");
        this.scene.run("SceneBoss");
    }
});

export default SceneDungeon