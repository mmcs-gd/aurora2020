// сцена для отображения карты игры
// падает FPS при запуске этой сцены поверх другой
let SceneMap = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize: function StartingScene() {
        Phaser.Scene.call(this, {key: 'SceneMap'});
    },

    preload: function () {

    },

    create: function () {
        this.time = Date.now();
        this.graphics = this.add.graphics();
        this.tileSize = 32;
        this.canvasSize = {
            width: 800,
            height: 600
        }

        const { sceneSize, rooms, corridors, portal, player, npc } = this.game.scene.scenes[0]._SceneMapInfo;
        this.sceneSize = sceneSize;

        // вычисляем размеры и положение карты на canvas. задано вручную
        // todo: вычисляется автоматически
        const map = {
            x: 100,
            y: 0,
            width: 600,
            height: 600
        }
        this.map = map;

        // коэффициенты для перевода из пикселей сцены в пиксели карты. не забывать про отступ map.x, map.y
        console.log(this.sceneSize);
        const coef = {
            w: this.map.width / this.sceneSize.width,
            h: this.map.height / this.sceneSize.height
        }
        this.coef = coef;

        // переводим из координат tile в координаты canvas
        this.rooms = rooms.map( ({ x,y,w,h }) => {
            return { x: x*32*coef.w + map.x, y: y*32*coef.h + map.y, w: w*32*coef.w, h: h*32*coef.h };
        });

        this.corridors = corridors.map( ({ rect_dx, rect_dy }) => {
            const rx = rect_dx;
            const ry = rect_dy;
            return {
                rect_dx: rect_dx ? { x: rx.x*32*coef.w + map.x, y: rx.y*32*coef.h + map.y, w: rx.w*32*coef.w, h: rx.h*32*coef.h } : rect_dx,
                rect_dy: rect_dy ? { x: ry.x*32*coef.w + map.x, y: ry.y*32*coef.h + map.y, w: ry.w*32*coef.w, h: ry.h*32*coef.h } : rect_dy
            }
        });

        // координаты в пикселях
        this.portal = portal;
        this.player = player;
        this.npc = npc;

        this.drawMap();
    },

    update: function () {
        // обновлять позиции объектов кажд. 0.5 сек
        // красную точку или png изображение на месте где стоит игрок
        const time = Date.now();
        if (500 < time - this.time){
            this.drawMap();

            // draw player
            const coef = this.coef;
            const map = this.map;
            this.graphics.fillStyle(0xFF0000, 1.0);
            this.graphics.fillCircle(map.x + this.player.x * coef.w, map.y + this.player.y * coef.h, 3);

            // draw NPC
            this.graphics.fillStyle(0x0000FF, 1.0);
            this.npc.forEach(obj => this.graphics.fillCircle(map.x + obj.x * coef.w, map.y + obj.y * coef.h, 3));
            this.time = time;
        }
    },

    drawMap() {
        // https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Graphics.html

        // clear
        this.graphics.fillStyle(0x000000, 1.0);
        this.graphics.fillRect(0, 0, this.canvasSize.width, this.canvasSize.height);

        // canvas borders
        this.graphics.lineStyle(1, 0xFFFFFF, 1.0);
        this.graphics.strokeRect(0, 0, this.canvasSize.width, this.canvasSize.height);

        // map borders
        this.graphics.lineStyle(1, 0xFF0000, 1.0);
        this.graphics.strokeRect(this.map.x, this.map.y, this.map.width, this.map.height);

        // corridors
        this.graphics.fillStyle(0xCCCCCC, 1.0);
        this.corridors.forEach( ({ rect_dx, rect_dy }) => {
            if (rect_dx) this.graphics.fillRect(rect_dx.x, rect_dx.y, rect_dx.w, rect_dx.h);
            if (rect_dy) this.graphics.fillRect(rect_dy.x, rect_dy.y, rect_dy.w, rect_dy.h);
        });

        // rooms
        this.graphics.fillStyle(0xAAAAAA, 1.0);
        this.rooms.forEach( ({x,y,w,h}) => this.graphics.fillRect(x, y, w, h));

        // portal
        this.graphics.fillStyle(0x00FF00, 1.0);
        this.graphics.fillCircle(this.map.x + this.portal.x * this.coef.w, this.map.y + this.portal.y * this.coef.h, 5);
    }
});

export default SceneMap