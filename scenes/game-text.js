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
        const { mapSize, roomsCount, fillPercent } = this.game.scene.scenes[0]._SceneTextInfo;

        this.add.text(0, 0, `map size: ${mapSize.width} x ${mapSize.height}`, {fill: '#FFF', fontSize: 16});
        this.add.text(0, 18, 'rooms count: ', {fill: '#FFF', fontSize: 16});
        this.add.text(0, 36, ' % заполнения', {fill: '#FFF', fontSize: 16});
    },

    update: function () {
        //console.log('game-text.js update');
        const { countNPC, countPlayers } = this.game.scene.scenes[0]._SceneTextInfo;
        const seconds = (new Date()).getSeconds();
        console.log(seconds);
        if (0 === seconds % 2) {
            // замедляет в 2 раза если обновлять каждый кадр
            this.add.text(0, 54, 'кол-во NPC: ' + countNPC, {fill: '#FFF', fontSize: 16});
            this.add.text(0, 72, 'кол-во игроков: ' + countPlayers, {fill: '#FFF', fontSize: 16});
        }
    },
});

export default SceneText