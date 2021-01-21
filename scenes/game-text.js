// в сцене выводим текст на экран
// инфа по игре, чатик, win, lose
let SceneText = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize: function StartingScene() {
        Phaser.Scene.call(this, {key: 'SceneText'});
    },

    preload: function () {
        console.log('game-text.js preload');
    },

    create: function () {
        console.log('game-text.js create');
        const { mapSize, roomsCount, fillPercent, countNPC } = this.game.scene.scenes[0]._SceneTextInfo;

        this.add.text(0, 0, `map size: ${mapSize.width} x ${mapSize.height}`, {fill: '#FFF', fontSize: 16});
        this.add.text(0, 18, 'rooms count: ' + roomsCount, {fill: '#FFF', fontSize: 16});
        this.add.text(0, 36, `заполнение: ${fillPercent} %`, {fill: '#FFF', fontSize: 16});
        this.add.text(0, 54, 'кол-во NPC: ' + countNPC, {fill: '#FFF', fontSize: 16});

        this.countNPC = countNPC;
    },

    update: function () {
        //console.log('game-text.js update');
        const { countNPC } = this.game.scene.scenes[0]._SceneTextInfo;
        if (countNPC !== this.countNPC){
            // замедляет в 2 раза если обновлять каждый кадр
            this.add.text(0, 54, 'кол-во NPC: ' + countNPC, {fill: '#FFF', fontSize: 16});
            this.countNPC = countNPC;
        }

        // FPS
        const seconds = (new Date()).getSeconds();
        console.log(seconds);
    },
});

export default SceneText