// в сцене выводим текст на экран

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

        this.add.text(0, 0, `map size: ${mapSize.width} x ${mapSize.height}`, {fill: '#FFF', fontSize : 18});
        this.add.text(0, 32, 'rooms count: ', {fill: '#FFF', fontSize : 18});
        this.add.text(0, 64, ' % заполнения', {fill: '#FFF', fontSize : 18});
    },

    update: function () {
        //console.log('game-text.js update');
        //const time = new Date;
        //this.add.text(0, 96, 'время: ' + time, {fill: '#FFF', fontSize : 18});
    },
});

export default SceneText