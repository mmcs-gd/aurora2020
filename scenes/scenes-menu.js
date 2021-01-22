import tilemapPng from '../assets/tileset/Crystal_tileset.png'
import menuBackgroundJson from '../assets/background.json'

import TatarovaShkuro from './tatarova-shkuro';

const scenes = [
    ['Начать игру', TatarovaShkuro]
];

let MenuScene = new Phaser.Class({
    Extends: Phaser.Scene,
    scenesButtons: [],
    _runningScene: null,

    initialize: function MenuScene() {
        Phaser.Scene.call(this, {key: 'MenuScene'});
        this._scroll = 0;
    },

    preload: function () {
        scenes.forEach(s => {
            this.scene.add(s[0], s[1], false);
        });

        //loading map tiles and json with positions
        this.load.image('tiles', tilemapPng);
        this.load.tilemapTiledJSON('menu_map', menuBackgroundJson);
    },

    create: function () {
        const map = this.make.tilemap({key: 'menu_map'});
        const tileset = map.addTilesetImage('Crystal_tileset', 'tiles');
        map.createStaticLayer('Main', tileset, 0, 0);
				map.createStaticLayer('Objects', tileset, 0, 0);


        this.add.text(32 * 2, 32 * 1, 'Подземелья наводнили желе-мутанты,', {fill: '#FFF', fontSize : 28})
            .setShadow(2,2,'#000', true);
				this.add.text(32 * 2, 32 * 2, 'объявлена награда за их истребление!', {fill: '#FFF', fontSize : 28} )
				.setShadow(2,2,'#000', true);
				this.add.text(32 * 2, 32 * 3, 'Сразитесь ли вы с соперником за звание', {fill: '#FFF', fontSize : 28} )
				.setShadow(2,2,'#000', true);
				this.add.text(32 * 2, 32 * 4, 'самого успешного охотника на желе?', {fill: '#FFF', fontSize : 28} )
				.setShadow(2,2,'#000', true);
				
        // creating list of buttons
        let k = 0;
        this.scenesButtons = scenes.map(s => {
            return this.add.text(32 * 8, 32 * 6, s[0], {fill: '#AAA', fontSize : 28})
                .setInteractive()
                .setFixedSize(32 * 7, 32 * 2 )
                .setPadding({ top: 8 })
                .setShadow(1,1,'#000')
                .on('pointerdown', () => this.actionOnClick(s[0]));
        });

        this.input.keyboard.on("keydown_ESC", event => {
				if (this._runningScene !== null) {
                this.scene.pause(this._runningScene);
                this.scene.stop(this._runningScene);
                this._runningScene = null;
            }
        });

				this.input.keyboard.on("keydown_ENTER", event => {
						window.location.reload();
        });
    },

    update: function () {
        if (this._runningScene == null) {
            this.scenesButtons.forEach(e => {
                const [x, y] = [this.input.x, this.input.y]
                if (e.input.hitArea.contains(x-e.x - 32,y-e.y - 20)) {
                    e.setFill('#FFF')
                } else {
                    e.setFill('#AAA')
                }
            });
        }
    },

    actionOnClick: function (sceneName) {
        if (this._runningScene == null) {
            this._runningScene = sceneName;
            this.scene.run(sceneName);

            const hint = new Hint(32, 32, 'Press ESC to return', 2000);

            try {
                this.scene.add('HintScene_' + hint.index, hint, true);
            } catch (error) { /* Error: Cannot add a Scene with duplicate key */ }
        }
    },
});

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

export default MenuScene 

