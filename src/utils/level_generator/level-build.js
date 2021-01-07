import Aggressive from "../../ai/aggressive";
import BinarySpacePartitioning from "./binary-space-partitioning";
import LevelMetric from "./level-metric";


const TILES = {
    BLANK: 17,
    FLOOR: [
        { index: [88, 89, 92, 93, 104, 105, 108, 109, 105+32, 104+16*9], weight: 1 },
    ],
    LEFT_WALL: 97,
    RIGHT_WALL: 101,
    //TOP_WALL: ,
    //BOTTOM_WALL: 
}

const LEVEL_TO_TILE = {
    0: TILES.BLANK,
    1: TILES.FLOOR,
}

const LEVEL_SETTINGS = {
    // The dungeon's grid size
    width: 30,
    height: 35,
    rooms: {
      // Random range for the width of a room (grid units)
      width: {
        min: 5,
        max: 10
      },
      // Random range for the height of a room (grid units)
      height: {
        min: 8,
        max: 20
      },
      // Cap the area of a room - e.g. this will prevent large rooms like 10 x 20
      maxArea: 150,
      // Max rooms to place
      maxRooms: 20,
      // Min rooms to place
      minRooms: 10
    }
}

export default function buildLevel(width, height, maxRooms, scene) {
    const tileSize = 32;
    
	scene.map = scene.make.tilemap({
		tileWidth: tileSize,
		tileHeight: tileSize,
		width: width,
		height: height
	});

    const tileSet = scene.map.addTilesetImage("tiles", null, tileSize, tileSize);
    
    // создаём уровни сцены
    const outsideLayer = scene.map.createBlankLayer("Outside", tileSet);
    const groundLayer = scene.map.createBlankLayer("Ground", tileSet);
    //const wallsLayer = scene.map.createBlankLayer("Walls", tileSet);

    const levelGenerator = new BinarySpacePartitioning(LEVEL_SETTINGS);
    const { rooms, corridors, mask } = levelGenerator.generateMask();
    const levelMetric = new LevelMetric(width, height, rooms, corridors);

    console.log(rooms);
    console.log(mask);
    // метрики уровня
    console.log(levelMetric.fillPercent());
    //console.log(levelMetric.connectivity());

    // по маске уровня заполняем уровни
    //outsideLayer.fill(TILES.BLANK, 0,0, width. height);
    //groundLayer.fill(95, 5,5, width. height);
    //groundLayer.putTileAt(95, 3, 3);
    //groundLayer.weightedRandomize(0, 0, 10, 10, LEVEL_TO_TILE[1]);
	for (let x = 0; x < width; x++) {
		for (let y = 0; y < height; y++) {
			if (mask[x][y] == 0) {
				outsideLayer.putTileAt(LEVEL_TO_TILE[0], x, y);
            } else {
                //groundLayer.putTileAt(95, x, y);
                groundLayer.weightedRandomize(x, y, 1, 1, LEVEL_TO_TILE[1]); // TILES.FLOOR
			}
		}
    }

    // рисуем стены комнат
    /*for (let i = 0; i < rooms.length; i++) {
        const { x,y,w,h } = rooms[i];

        for (let k = 0; k < w; k++) {
            //groundLayer.putTileAt(x+k, y, TILES.TOP_WALL);
            //groundLayer.putTileAt(x+k, y+h, TILES.BOTTOM_WALL);
        }

        for (let k = 0; k < h; k++) {
            groundLayer.putTileAt(x, y+k, TILES.LEFT_WALL);
            groundLayer.putTileAt(x+w, y+k, TILES.RIGHT_WALL);
        }
    }*/

    // рисуем стены коридоров
    
    // добавляем персонажа Аврору в самую большую комнату сцены
    const room = rooms[0];
    scene.player = scene.characterFactory.buildCharacter('aurora', room.x*32+100, room.y*32+100, {player: true});
    //scene.player.setVelocityX(100);
    scene.gameObjects.push(scene.player);
    //scene.physics.add.collider(scene.player, groundLayer);
    scene.physics.add.collider(scene.player, outsideLayer);

    // добавляем NPC в сцену. при касании игрок погибает
	/*scene.NPC = scene.characterFactory.buildCharacter('blue', 200, 200);
    scene.gameObjects.push(scene.NPC);
    scene.physics.add.collider(scene.NPC, groundLayer);
    scene.physics.add.collider(scene.NPC, outsideLayer);
    scene.physics.add.collider(scene.NPC, scene.player, onNpcPlayerCollide.bind(scene));*/

    // добавляем желешки
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
    /*const mine = scene.characterFactory.buildCharacter('mine', 400, 400);
    scene.gameObjects.push(mine);
    scene.physics.add.collider(mine, scene.player, onNpcPlayerCollide.bind(scene));*/

    // настройки камеры
	const camera = scene.cameras.main;
    camera.setZoom(1.0);
    camera.setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels);
    camera.startFollow(scene.player);
    camera.roundPixels = true;

    // настройки столкновений с границей пустого уровня
    // https://photonstorm.github.io/phaser3-docs/Phaser.Tilemaps.Tilemap.html#setCollision__anchor
    scene.physics.world.setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels, true, true, true, true);
    outsideLayer.setDepth(10);
    outsideLayer.setCollision(TILES.BLANK);

    // сделать уровень стен и с ними обрабатывать столкновения Авроры

    return {"Ground" : groundLayer, "Outside" : outsideLayer}
}

function onNpcPlayerCollide() {
    alert('Погиб!');
    this.pause(this._runningScene)
}