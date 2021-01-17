export class Potion extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene, x, y) {
        super(scene, x, y, 'potion');
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.setDepth(1);
        this.value = 30;
    }

    interact(target) {
        this.destroy();
        target.addHP(this.value);
    }
}

export class Scroll extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene, x, y) {
        super(scene, x, y, 'scrolls');
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.setDepth(1);
        this.value = 3;
    }

    interact(target) {
        this.destroy();
        target.addScore(this.value);
    }
}

export class Gold extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene, x, y) {
        super(scene, x, y, 'gold');
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.setDepth(1);
        this.value = 5;
    }

    interact(target) {
        this.destroy();
        target.addScore(this.value);
    }
}