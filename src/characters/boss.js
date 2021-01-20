export default class Boss extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, name, frame) {
        super(scene, x, y, name, frame);
        scene.physics.world.enable(this);
        scene.add.existing(this);
    }

    setAI(ai, initialState) {
        this.ai = ai;
        this.currentState = initialState;
    }
    update() {
        // ai призывает желешки при 75%, 50%, 25% хп

        this.updateAnimation();
    }
    updateAnimation() {
        // полоска хп
        // полоска и визуальный эффект каста призыва
    }
}