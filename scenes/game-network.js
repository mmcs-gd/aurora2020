import tilemapPng from '../assets/tileset/Dungeon_Tileset.png'
import auroraSpriteSheet from '../assets/sprites/characters/aurora.png'
import punkSpriteSheet from '../assets/sprites/characters/punk.png'
import CharacterFactory from "../src/characters/character_factory";
import EffectsFactory from "../src/utils/effects-factory";
import Footsteps from "../assets/audio/footstep_ice_crunchy_run_01.wav";
//import bulletPng from '../assets/sprites/bullet.png'


import buildLevel from '../src/utils/level_generator/level-build';
import LevelMetric from "../src/utils/level_generator/level-metric";
//import Bullets from '../src/characters/bullet';

// сцена под сетевую игру
// карта генерится при запуске сервера
// взаимодействие без проверок и защиты
// https://youtu.be/x-bbflZvuXE
let SceneNetwork = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize: function StartingScene() {
        Phaser.Scene.call(this, {key: 'SceneNetwork'});
    },

    effectsFrameConfig: {frameWidth: 32, frameHeight: 32},
    characterFrameConfig: {frameWidth: 31, frameHeight: 31},

    preload: function () {
        // https://learn.javascript.ru/websockets
        // получить инфу о игровой карте
        this.ws = new WebSocket('ws://localhost:3000');

        // Есть 4 события: onopen, onclose, onerror, onmessage
        // Один при получении данных и три – при изменениях в состоянии соединения
        // Для посылки данных используется метод socket.send(data)

        // callback на событие: соединение установлено
        this.ws.onopen = () => {
            console.log('Соединение установлено');
        }
        // закрытие соединения
        this.ws.onclose = (event) => {
            if (event.wasClean) {
                console.log('Соединение закрыто чисто');
            } else {
                console.log('Обрыв соединения'); // например, "убит" процесс сервера
            }
            console.log(`Код: ${event.code} причина: ${event.reason}`);
        };
        //
        this.ws.onmessage = (event) => {
            console.log("Получены данные");

            const data = JSON.parse(event.data);
            if (data.name === 'mask') {
                this.mask = data.data;
            } else if (data.name === 'rooms') {
                this.rooms = data.data;
            } else if (data.name === 'corridors') {
                this.corridors = data.data;
            } else if (data.name === 'user') {

            }
        };
        //
        this.ws.onerror = (error) => {
            console.log("Ошибка " + error.message);
        };

        //loading map tiles
        this.load.image("tiles", tilemapPng);

        //loading spitesheets
        this.load.spritesheet('aurora', auroraSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('punk', punkSpriteSheet, this.characterFrameConfig);
        this.load.audio('footsteps', Footsteps);

        //loading images
        //this.load.image("bullet", bulletPng);

        this.effectsFactory = new EffectsFactory(this);
    },

    create: function () {
        // ожидаем получения маски карты от сервера
        console.log('game-network.js create');

        this.id = Math.random();
        while (!this.mask || !this.rooms || !this.corridors) {}

        console.log(this.mask);
        console.log(this.rooms);
        console.log(this.corridors);

        this.gameObjects = [];
        this.characterFactory = new CharacterFactory(this);
        this.effectsFactory.loadAnimations();
        this.showMap = false;

        // заполнение уровня по маске уровня
        const layers = buildLevel(50, 50, this, {mask:this.mask, rooms:this.rooms, corridors:this.corridors});
        this.groundLayer = layers["Ground"];
        this.outsideLayer = layers["Outside"];
        this.wallsLayer = layers["Walls"];

        // передаём инфу в сцену с текстом
        this.game.scene.scenes[0]._SceneTextInfo = {
            mapSize: { // canvas 800x600
                width: 50*32,
                height: 50*32
            },
            roomsCount: this.rooms.length,
            fillPercent: undefined,
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
            console.log("game-network.js keydown_M");

            if (!this.showMap) {
                this.scene.pause("SceneText");
                this.scene.stop("SceneText");
                this.scene.run("SceneMap");
            } else {
                this.scene.pause("SceneMap");
                this.scene.stop("SceneMap");
                this.scene.run("SceneText");
            }
            this.showMap = !this.showMap;
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
        // отправить инфу о себе
        // обновить инфу о других

        /*if (this.ws.readyState === WebSocket.OPEN){
            console.log('Отправляем данные');
            //this.ws.send("hello, server" + this.id);
        }*/
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

export default SceneNetwork