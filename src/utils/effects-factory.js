import magicSpellSpritesheet from '../../assets/sprites/vfx/1_magicspell_spritesheet.png'
import vortexSpritesheet from '../../assets/sprites/vfx/13_vortex_spritesheet.png'
import flamelashSpritesheet from '../../assets/sprites/vfx/6_flamelash_spritesheet.png'
import effectsConfigJson from '../../assets/animations/vfx/effects.json'

export default class EffectsFactory {

    constructor(scene) {
        this.scene = scene;
        const frameConfig = {frameWidth: 100, frameHeight: 100};
        scene.load.spritesheet('magicSpell', magicSpellSpritesheet, frameConfig);
        scene.load.spritesheet('vortex', vortexSpritesheet, frameConfig);
        scene.load.spritesheet('flamelash', flamelashSpritesheet, frameConfig)

    }

    loadAnimations() {
        for (const key of Object.keys(effectsConfigJson)) {
            const settings = effectsConfigJson[key];

            let frames = [];
            let n = settings['min_frame'];
            while (n <= settings['max_frame']) {
                frames.push(n);
                n++;
            }
            this.scene.anims.create({
                key: key,
                frames: this.scene.anims.generateFrameNumbers(key, { frames: frames }),
                frameRate: settings['framerate'],
                repeat: true
            });
        }

    }

    buildEffect(effectName, x, y, params = {}) {
        let effect = new Phaser.Physics.Arcade.Sprite(this.scene, x, y, effectName, 0);
        this.scene.physics.world.enable(effect);
        this.scene.add.existing(effect);
        // todo: make specific animation loader for vfx
        effect.anims.play(effectName, true)
        effect.anims.setRepeat(-1);
    }


}
