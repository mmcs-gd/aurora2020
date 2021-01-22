// в сцене выводим текст на экран
// инфа по игре, win, lose
let SceneText = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize: function StartingScene() {
        Phaser.Scene.call(this, {key: 'SceneText'});
    },

    preload: function () {

    },

    create: function () {
        const { mapSize, roomsCount, fillPercent, npc } = this.game.scene.scenes[0]._SceneTextInfo;

        this.add.text(0, 0, `map size: ${mapSize.width} x ${mapSize.height}`, {fill: '#FFF', fontSize: 16});
        this.add.text(0, 18, `rooms count: ${roomsCount}`, {fill: '#FFF', fontSize: 16});
        this.add.text(0, 36, `заполнение: ${Math.round(fillPercent)} %`, {fill: '#FFF', fontSize: 16});

        this.npcText = this.add.text(0, 54, `кол-во ${npc instanceof Map ? 'игроков' : 'NPC'}: ${npc instanceof Map ? npc.size : npc.length}`, {fill: '#FFF', fontSize: 16});
        this.fpsText = this.add.text(0, 72, `FPS: `, {fill: '#FFF', fontSize: 16});

        this.npc = npc;
        this.lastSecond = (new Date()).getSeconds();
        this.frameCount = 1;
    },

    update: function () {
        this.npcText.text = `кол-во ${this.npc instanceof Map ? 'игроков' : 'NPC'}: ${this.npc instanceof Map ? this.npc.size : this.npc.length}`;

        // FPS
        const second = (new Date()).getSeconds();
        if (second !== this.lastSecond){
            this.fpsText.text = `FPS: ${this.frameCount}`;
            this.lastSecond = second;
            this.frameCount = 0;
        }
        ++this.frameCount;
    },
});

export default SceneText