import Phaser from 'phaser'

import MenuScene from '../scenes/scenes-menu';
import CharacterMixin from '../src/characters/character.js';
import CellularAutomataMapGenerator from '../src/utils/automata_generator/map-generator';
import CellularAutomataLevelBuilder from '../src/utils/automata_generator/level-builder';

//https://github.com/mikewesthad/phaser-3-tilemap-blog-posts/blob/master/examples/post-1/05-physics/index.js
Object.assign(Phaser.Physics.Arcade.Sprite.prototype, CharacterMixin);

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  pixelArt: true,
  zoom: 1.2,
  scene: MenuScene,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0,
        debug: true // set to true to view zones
        }
    }
  },
};

// const generator = new CellularAutomataMapGenerator(100, 50);
// generator.buildLevel();
// const tileMap = generator.levelMatrix;

// console.log(tileMap);

// const levelBuilder = new CellularAutomataLevelBuilder(tileMap, 10);

// console.log(levelBuilder.playerPosition);

// for (let i = 0; i < 10; i++) {
//   const npc = levelBuilder.calculateNpcPosition();
//   console.log(npc);
// }

const game = new Phaser.Game(config);
