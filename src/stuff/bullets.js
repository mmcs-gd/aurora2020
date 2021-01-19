export class Bullet extends Phaser.Physics.Arcade.Sprite
{
    constructor (scene, x, y)
    {
        super(scene, x, y, 'bullet');
    }

    fire (x, y, vx, vy)
    {
        this.body.reset(x, y);
        this.body.mass = 3;

        this.setActive(true);
        this.setVisible(true);

        this.setVelocityX(vx);
        this.setVelocityY(vy);
    }

    preUpdate (time, delta)
    {
        super.preUpdate(time, delta);
    }
}

export class Bullets extends Phaser.Physics.Arcade.Group
{
    constructor (scene)
    {
        super(scene.physics.world, scene);

        this.createMultiple({
            frameQuantity: 20,
            key: 'bullet',
            active: false,
            visible: false,
            classType: Bullet
        });
    }

    fireBullet(x, y, vx, vy)
    {
        let b = this.getFirstDead(false);

        if (b)
        {
            b.fire(x, y, vx, vy);
        }
    }
}