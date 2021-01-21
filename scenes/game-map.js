// сцена для отображения карты игры
let SceneMap = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize: function StartingScene() {
        Phaser.Scene.call(this, {key: 'SceneMap'});
    },

    preload: function () {
        //console.log('game-map.js preload');
    },

    create: function () {
        //console.log('game-map.js create');
        this.time = Date.now();

        this.drawMap();
    },

    update: function () {
        //console.log('game-map.js update');
        const { player, npc } = this.game.scene.scenes[0]._SceneMapInfo;

        // обновлять позиции объектов кажд. 0.5 сек
        // красную точку или png изображение на месте где стоит игрок
        const time = Date.now();
        if (500 < time - this.time){
            this.drawMap();
            this.graphics.fillStyle(0xFF0000, 1.0);
            this.graphics.fillCircle(player.x / 32 * 8, player.y / 32 * 8, 3);

            this.graphics.fillStyle(0x0000FF, 1.0);
            npc.forEach(obj => this.graphics.fillCircle(obj.x / 32 * 8, obj.y / 32 * 8, 3));
            this.time = time;
        }
    },

    drawMap() {
        const { mapSize, rooms, corridors, portal } = this.game.scene.scenes[0]._SceneMapInfo;

        // https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Graphics.html
        this.graphics = this.add.graphics();
        this.graphics.fillStyle(0x000000, 1.0);
        this.graphics.fillRect(0, 0, 790, 590);

        this.graphics.lineStyle(2, 0xFF0000, 1.0);
        this.graphics.strokeRect(0, 0, 50*8, 50*8);

        this.graphics.fillStyle(0xCCCCCC, 1.0);
        corridors.forEach( ({ rect_dx, rect_dy }) => {
            if (rect_dx) this.graphics.fillRect(rect_dx.x*8, rect_dx.y*8, rect_dx.w*8, rect_dx.h*8);
            if (rect_dy) this.graphics.fillRect(rect_dy.x*8, rect_dy.y*8, rect_dy.w*8, rect_dy.h*8);
        });

        this.graphics.fillStyle(0xBBBBBB, 1.0);
        rooms.forEach( ({x,y,w,h}) => this.graphics.fillRect(x*8, y*8, w*8, h*8));
    }
});

export default SceneMap