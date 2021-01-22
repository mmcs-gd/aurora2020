export default class Boss extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, name, frame) {
        super(scene, x, y, name, frame);
        scene.physics.world.enable(this);
        scene.add.existing(this);

        this.scene = scene;
        this.health = 1200;
    }

    setAI(ai, initialState) {
        this.ai = ai;
        this.currentState = initialState;
    }
    update() {
        console.log(this.health--);
        if (this.health <= 0) {
            // остановить сцену и написать что победил
            this.body.setVelocityX(0);
            this.body.setVelocityY(0);
            return;
        } else if (this.health === 750 || this.health === 500 || this.health === 250){
            this.scene.killSlimes();
            console.log('начало призыва желешки');

            this.body.setVelocityX(0);
            this.body.setVelocityY(0);
            return;
        } else if (650 < this.health && this.health < 750 || 400 < this.health && this.health < 500 || 150 < this.health && this.health < 250){
            this.body.setVelocityX(0);
            this.body.setVelocityY(0);
            //console.log('кастует');
            return;
        } else if (this.health === 650 || this.health === 400 || this.health === 150){
            this.scene.createSlimes();
        }

        // ai призывает желешки при 75%, 50%, 25% хп
        if (this.ai)
        {
          this.currentState = this.ai.update(this.currentState);
        }

        if (this.steering) {
            const dir = this.steering.calculateImpulse();
            if (dir) {
                this.body.setVelocityX(dir.x);
                this.body.setVelocityY(dir.y);
            }
        }

        // https://youtu.be/X1iP7lgBs3U
        // https://youtu.be/w7U-qWWS7LU
        this.updateAnimation();
    }
    updateAnimation() {
        const animations = this.animationSets.get('Walk');
        const animsController = this.anims;
        const { x, y } = this.body.velocity;

        if (x < 0) {
            animsController.play(animations[0], true);
        } else if (x > 0) {
            animsController.play(animations[1], true);
        } else if (y < 0) {
            animsController.play(animations[2], true);
        } else if (y > 0) {
            animsController.play(animations[3], true);
        } else {
            const currentAnimation = animsController.currentAnim;
            if (currentAnimation) {
                const frame = currentAnimation.getLastFrame();
                this.setTexture(frame.textureKey, frame.textureFrame);
            }
        }
    }
}