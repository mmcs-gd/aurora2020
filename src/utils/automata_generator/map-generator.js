import Vector2 from 'phaser/src/math/Vector2';

import { TILE_MAPPING } from './tiles';

export default class CellularAutomataMapGenerator {
  /** 
   * Width and height are denoded in tile count.
   * InitialDensity is walls vs floors relation in starting matrix
   * Epoch is number of epochs to run generation for
   * WallsToFloor1 is transition rule for Moore neighboors on level1
   * wallsToFloor2 is transition rule for Moore neighboors in level2
   * 
   * NOTE: touch default values with care, it might break the generation for various reasons....
   * Default values generate dungeon-like structure, with a lot of narrow paths leading to bigger caves.
   */
  constructor(width, height, epoch = 5, initialDensity = 0.46, wallsToFloor1 = 5, wallsToFloor2 = 2) {
    this.width = width;
    this.height = height;

    this.initialDensity = initialDensity;

    this.wallsToFloor1 = wallsToFloor1;
    this.wallsToFloor2 = wallsToFloor2;

    this.epoch = epoch;

    let tileMatrix = Array(this.width).fill().map(() => Array(this.height).fill());
    let transitionMatrix = Array(this.width).fill().map(() => Array(this.height).fill(TILE_MAPPING.WALL));

    for (let y = 1; y < this.height - 1; y++)
      for (let x = 1; x < this.width - 1; x++)
        tileMatrix[x][y] = Math.random() < this.initialDensity ? TILE_MAPPING.WALL : TILE_MAPPING.FLOOR;

    for (let y = 0; y < this.height; y++)
      tileMatrix[0][y] = tileMatrix[this.width - 1][y] = TILE_MAPPING.WALL;

    for (let x = 0; x < this.width; x++)
      tileMatrix[x][0] = tileMatrix[x][this.height - 1] = TILE_MAPPING.WALL;

    this.tileMatrix = tileMatrix;
    this.transitionMatrix = transitionMatrix;
  }

  buildLevel() {
    for (let i = 0; i < this.epoch; i++) 
      this.transitionStep();

    this.removeUnreachable()
    return this.tileMatrix;
  }

  transitionStep() {
    for (let y = 1; y < this.height - 1; y++)
      for (let x = 1; x < this.width - 1; x++) {

        let wallsLevel1 = 0;
        let wallsLevel2 = 0;

        // Level 1, Moore neightbors lvl1
        for (let i = -1; i <= 1; i++)
          for (let j = -1; j <= 1; j++)
            if (this.tileMatrix[x + j][y + i] != TILE_MAPPING.FLOOR)
              wallsLevel1++;

        // Level 2, Moore neighbors lvl2
        for (let i = y - 2; i <= y + 2; i++)
          for (let j = x - 2; j <= x + 2; j++) {
            const inCorner = Math.abs(i - y) == 2 && Math.abs(j - x) == 2;
            const outOfBounds = i < 0 || j < 0 || i >= this.height || j >= this.width;

            if (inCorner || outOfBounds) continue;

            if (this.tileMatrix[j][i] != TILE_MAPPING.FLOOR) wallsLevel2++;
          }

        this.transitionMatrix[x][y] = (wallsLevel1 >= this.wallsToFloor1 || wallsLevel2 <= this.wallsToFloor2) 
          ? this.transitionMatrix[x][y] = TILE_MAPPING.WALL 
          : this.transitionMatrix[x][y] = TILE_MAPPING.FLOOR;
      }

    /* Copy transition matrix over */
    for (let y = 1; y < this.height - 1; y++)
      for (let x = 1; x < this.width - 1; x++)
        this.tileMatrix[x][y] = this.transitionMatrix[x][y];
  }

  removeUnreachable() {
    let marker = 2;

    for (let x = 0; x < this.width; x++)
      for (let y = 0; y < this.height; y++) {
        if (this.floodFill(x, y, marker)) {
          marker++;
        }
      }

    let markerCounts = new Array(marker).fill(0);
    for (let x = 0; x < this.width; x++)
      for (let y = 0; y < this.height; y++)
        markerCounts[this.tileMatrix[x][y]]++;

    const max = Math.max(...markerCounts.slice(2));
    const mostFilledMarker = markerCounts.findIndex(index => index === max);

    for (let x = 0; x < this.width; x++)
      for (let y = 0; y < this.height; y++)
        if (this.tileMatrix[x][y] !== TILE_MAPPING.WALL)
          if (this.tileMatrix[x][y] === mostFilledMarker)
            this.tileMatrix[x][y] = TILE_MAPPING.FLOOR;
          else this.tileMatrix[x][y] = TILE_MAPPING.WALL;
  }

  floodFill(x, y, marker) {
    const notFillableTile =  (this.tileMatrix[x][y] === TILE_MAPPING.WALL || this.tileMatrix[x][y] !== TILE_MAPPING.FLOOR)
    const outOfBounds = x < 0 || x >= this.width || y < 0 || y >= this.height;
    
    const cantFill = notFillableTile || outOfBounds;
    
    if (cantFill) return false;
    else {
      this.tileMatrix[x][y] = marker;

      this.floodFill(x + 1, y, marker);
      this.floodFill(x - 1, y, marker);
      this.floodFill(x, y + 1, marker);
      this.floodFill(x, y - 1, marker);

      return true;
    } 
  }
}
