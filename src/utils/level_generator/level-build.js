import Aggressive from "../../ai/aggressive";

import QuadSpacePartitioning from "./quad-space-partitioning";
import LevelMetric from "./level-metric";


const TILES = {
    BLANK: 17,
    FLOOR: [
        { index: [88, 89, 92, 93, 104, 105, 108, 109, 105+16*2, 104+16*9], weight: 1 },
    ],
    /*WALL_LEFT: 16,
    WALL_RIGHT: 12,
    WALL_TOP: 25,
    WALL_BOTTOM: 1,
    CORNER_TOP_LEFT: 0,
    CORNER_TOP_RIGHT: 0,
    CORNER_BOTTOM_LEFT: 0,
    CORNER_BOTTOM_RIGHT: 0,*/
}

const LEVEL_TO_TILE = {
    0: TILES.BLANK,
    1: TILES.FLOOR,
    /*2: TILES.WALL_LEFT,
    3: TILES.WALL_RIGHT,
    4: TILES.WALL_TOP,
    5: TILES.WALL_BOTTOM,
    6: TILES.CORNER_TOP_LEFT,
    7: TILES.CORNER_TOP_RIGHT,
    8: TILES.CORNER_BOTTOM_LEFT,
    9: TILES.CORNER_BOTTOM_RIGHT,*/
}

const LEVEL_SETTINGS = {
    // The dungeon's grid size
    //width: 30,
    //height: 30,
    corridor_width: 2,
    rooms: {
      // Random range for the width of a room (grid units)
      width: {
        min: 5,
        max: 8
      },
      // Random range for the height of a room (grid units)
      height: {
        min: 5,
        max: 8
      },
      // Cap the area of a room - e.g. this will prevent large rooms like 10 x 20
      //maxArea: 20,
      // Max rooms to place
      maxRooms: 10,
      // Min rooms to place
      minRooms: 5,
    }
}

export default function buildLevel(width, height, scene) {
    const tileSize = 32;
    
	scene.map = scene.make.tilemap({
		tileWidth: tileSize,
		tileHeight: tileSize,
		width: width,
		height: height
	});

    const tileSet = scene.map.addTilesetImage("tiles", null, tileSize, tileSize);
    
    // уровни сцены
    const outsideLayer = scene.map.createBlankLayer("Outside", tileSet);
    const groundLayer = scene.map.createBlankLayer("Ground", tileSet);
    const wallsLayer = scene.map.createBlankLayer("Walls", tileSet);

    const levelGenerator = new QuadSpacePartitioning(width, height, LEVEL_SETTINGS);
    const { rooms, corridors, mask } = levelGenerator.generateMask();
    const levelMetric = new LevelMetric(width, height, rooms, corridors, mask);

    console.log(rooms);
    console.log(corridors);
    console.log(mask);
    // метрики уровня
    console.log(`${levelMetric.fillPercent() * 100} % заполнения`);
    console.log('связность: ' + levelMetric.connectivity());

    // 
    //outsideLayer.fill(TILES.BLANK, 0,0, width. height);
    //groundLayer.weightedRandomize(0, 0, 10, 10, LEVEL_TO_TILE[1]);
	for (let x = 0; x < width; x++) {
		for (let y = 0; y < height; y++) {
			if (mask[x][y] === 0) {
				outsideLayer.putTileAt(LEVEL_TO_TILE[0], x, y);
            } else if (mask[x][y] === 1) {
                groundLayer.weightedRandomize(x, y, 1, 1, LEVEL_TO_TILE[1]);
            } else {
                outsideLayer.putTileAt(LEVEL_TO_TILE[0], x, y);
            }
		}
    }
    
    // добавляем персонажа Аврору
    const room = rooms[0];
    scene.player = scene.characterFactory.buildCharacter('aurora', room.x*32+32, room.y*32+32, {player: true});
    scene.physics.add.collider(scene.player, outsideLayer);
    scene.physics.add.collider(scene.player, groundLayer);
    scene.gameObjects.push(scene.player);

    // добавляем NPC в сцену. при касании игрок погибает
	/*scene.NPC = scene.characterFactory.buildCharacter('blue', 200, 200);
    scene.gameObjects.push(scene.NPC);
    scene.physics.add.collider(scene.NPC, groundLayer);
    scene.physics.add.collider(scene.NPC, outsideLayer);
    scene.physics.add.collider(scene.NPC, scene.player, onNpcPlayerCollide.bind(scene));*/

    // в комнате с какой-то вероятностью может появиться желешка
    /*scene.slimes =  scene.physics.add.group();
    //let params = {};
    for(let i = 0; i < 1; i++) {
        //const x = Phaser.Math.RND.between(50, scene.physics.world.bounds.width - 50 );
        //const y = Phaser.Math.RND.between(50, scene.physics.world.bounds.height -50 );
        //params.slimeType = Phaser.Math.RND.between(0, 4);
        const slime = scene.characterFactory.buildSlime(300, 300, {slimeType:1}); // params
        //slime.setAI(new Aggressive(slime, [scene.player]), 'idle');
        scene.slimes.add(slime);
        scene.physics.add.collider(slime, groundLayer);
        scene.gameObjects.push(slime);
    }
    scene.physics.add.collider(scene.player, scene.slimes, onNpcPlayerCollide.bind(scene));*/

    // добавляем мины. при касании игрок погибает
    /*const mine = scene.characterFactory.buildCharacter('mine', room.x*32+65, room.y*32);
    scene.gameObjects.push(mine);
    scene.physics.add.collider(mine, scene.player, onNpcPlayerCollide.bind(scene));*/

    // настройки камеры
    // https://photonstorm.github.io/phaser3-docs/Phaser.Cameras.Scene2D.Camera.html
	const camera = scene.cameras.main;
    //camera.setZoom(1.0);
    camera.setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels);
    camera.startFollow(scene.player);
    camera.roundPixels = true;
    //camera.setScroll(room.x*32+32, room.y*32+32);
    //camera.setPosition(0, 0);

    // настройки столкновений с границей пустого уровня
    // https://photonstorm.github.io/phaser3-docs/Phaser.Tilemaps.Tilemap.html#setCollision__anchor
    scene.physics.world.setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels, true, true, true, true);
    groundLayer.setCollisionBetween(1, 500);
    outsideLayer.setDepth(10);
    outsideLayer.setCollisionBetween(0, 320); // с любым tile уровня
    // сделать уровень стен и с ними обрабатывать столкновения Авроры

    return {"Ground" : groundLayer, "Outside" : outsideLayer}
}

/*function onNpcPlayerCollide() {
    alert('Погиб!');
    this.pause(this._runningScene);
}*/