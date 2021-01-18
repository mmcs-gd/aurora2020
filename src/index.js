import Phaser from 'phaser'

import MenuScene from '../scenes/scenes-menu'
import test from '../scenes/test'
import CharacterMixin from '../src/characters/character.js';
import generateLevelScene from "../scenes/generateLevelScene";

//https://github.com/mikewesthad/phaser-3-tilemap-blog-posts/blob/master/examples/post-1/05-physics/index.js
Object.assign(Phaser.Physics.Arcade.Sprite.prototype, CharacterMixin);

const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 780,
  pixelArt: true,
  zoom: 1.2,
  scene: generateLevelScene,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0,
        debug: true // set to true to view zones
        }
    }
  },
};

const game = new Phaser.Game(config);
export {config}