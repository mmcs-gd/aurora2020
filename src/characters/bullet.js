export default class Bullet extends Phaser.Physics.Arcade.Sprite {

    constructor (scene, x, y, vx, vy) {
        super(scene, x, y, 'bullet');

        this.body.reset(x, y);
        this.body.mass = 3;

        this.setActive(true);
        this.setVisible(true);

        this.setVelocityX(vx);
        this.setVelocityY(vy);
    }
}