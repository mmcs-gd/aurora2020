export default class Mine extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, name, frame) {
        super(scene, x, y, name, frame);
        scene.physics.world.enable(this);
        scene.add.existing(this);
        scene.mines.add(this);
        this.lifeTime = 5000;
        this.dangerZone = 100;
        this.createdAt = scene.time.now;
        // this.beep = false; 
        // console.log("mine", this)
        // console.log("scene", scene)
    }

    // https://stackoverflow.com/questions/32262741/how-to-set-timer-animation-in-phaser

    get beeps() {
        return this.scene.time.now - this.createdAt < this.lifeTime;
    }

    get explodes() {
        return this.scene.time.now - this.createdAt < this.lifeTime + 2500;
    }

    update() {     
        if (this.beeps || this.explodes) {
        // console.log("created", this.createdAt)
        // console.log("now", this.scene.time.now)
            this.updateAnimation();
        } else {
            console.log("DESTROY")
            this.destroy();
        }
    }

    updateAnimation() {
        const animsController = this.anims;
        console.log("mine", this.animations)
        if (this.beeps) {
            console.log("beeps")
            animsController.play(this.animations[0], true);
        } else if (this.explodes) {
            console.log("explodes")
            animsController.play(this.animations[1], true);
        }
        // console.log(this.animations)
        // animsController.play(this.animations[0], true);
    }
}