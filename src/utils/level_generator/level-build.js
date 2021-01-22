import Aggressive from "../../ai/aggressive";

// Tiled Map Editor
const TILES = {
    BLANK: 17,
    FLOOR: [
        { index: [88, 89, 92, 93, 104, 105, 108, 109, 105+16*2, 104+16*9], weight: 1 },
    ],

    WALL_LEFT: 18,
    WALL_RIGHT: 16,
    WALL_TOP: 39,
    WALL_BOTTOM: 52,

    CORNER_TOP_LEFT: 0,
    CORNER_TOP_RIGHT: 0,
    CORNER_BOTTOM_LEFT: 35,
    CORNER_BOTTOM_RIGHT: 37,
}


export default function buildLevel(width, height, scene, { rooms, corridors, mask }) {
    const tileSize = 32;
    
	scene.map = scene.make.tilemap({
		tileWidth: tileSize,
		tileHeight: tileSize,
		width: width,
		height: height
	});

    const tileSet = scene.map.addTilesetImage("tiles", null, tileSize, tileSize);
    
    // создаём уровни сцены
    const outsideLayer = scene.map.createBlankDynamicLayer("Outside", tileSet);
    const groundLayer = scene.map.createBlankDynamicLayer("Ground", tileSet);
    const wallsLayer = scene.map.createBlankDynamicLayer("Walls", tileSet);

    // по маске уровня заполняем уровни outsideLayer, groundLayer
    // fill, putTileAt, weightedRandomize
	for (let x = 0; x < width; x++) {
		for (let y = 0; y < height; y++) {
			if (mask[x][y] === 0) {
				outsideLayer.putTileAt(TILES.BLANK, x, y);
            } else if (mask[x][y] === 2) {
                wallsLayer.putTileAt(TILES.WALL_LEFT, x, y);
                groundLayer.weightedRandomize(x, y, 1, 1, TILES.FLOOR);
            } else if (mask[x][y] === 3) {
                wallsLayer.putTileAt(TILES.WALL_RIGHT, x, y);
                groundLayer.weightedRandomize(x, y, 1, 1, TILES.FLOOR);
            } else if (mask[x][y] === 4) {
				wallsLayer.putTileAt(TILES.WALL_TOP, x, y);
            } else if (mask[x][y] === 5) {
				wallsLayer.putTileAt(TILES.WALL_BOTTOM, x, y);
            } else if (mask[x][y] === 6) {
				wallsLayer.putTileAt(TILES.CORNER_TOP_LEFT, x, y);
            } else if (mask[x][y] === 7) {
				wallsLayer.putTileAt(TILES.CORNER_TOP_RIGHT, x, y);
            } else if (mask[x][y] === 5) {
				wallsLayer.putTileAt(TILES.CORNER_BOTTOM_LEFT, x, y);
            } else if (mask[x][y] === 5) {
				wallsLayer.putTileAt(TILES.CORNER_BOTTOM_RIGHT, x, y);
            } else {
                groundLayer.weightedRandomize(x, y, 1, 1, TILES.FLOOR);
            }
		}
    }
    
    // добавляем персонажа Аврору
    const startRoom = rooms[0];
    scene.player = scene.characterFactory.buildCharacter('aurora', startRoom.x*32+32, startRoom.y*32+32, {player: true});
    scene.physics.add.collider(scene.player, wallsLayer);
    scene.gameObjects.push(scene.player);

    // точка появления игроков
    scene.effectsFactory.buildEffect('flamelash', startRoom.x*32+32, startRoom.y*32+32);

    // портал для перехода на сцену босса
    const portalRoom = rooms[1];
    scene.portal = scene.effectsFactory.buildEffect('vortex', portalRoom.x*32+32, portalRoom.y*32+32);
    scene.physics.add.collider(scene.portal, scene.player, scene.runSceneBoss.bind(scene));

    // добавляем NPC в сцену. при касании игрок погибает
    scene.npc = [];
    for (let i = 2; i < rooms.length; i++) {
        const roomNPC = rooms[i];
        //const npc = scene.characterFactory.buildCharacter('green', roomNPC.x*32+32, roomNPC.y*32+32, { Steering: new Exploring(this) });
        const npc = scene.characterFactory.buildCharacter('punk', roomNPC.x*32+32, roomNPC.y*32+32);
        npc.setAI(new Aggressive(npc, [scene.player]), 'idle');
        scene.physics.add.collider(npc, wallsLayer);
        scene.physics.add.collider(npc, scene.player, scene.onNpcPlayerCollide.bind(scene));
        scene.gameObjects.push(npc);
        scene.npc.push(npc);
    }

    // настройки камеры
    // https://photonstorm.github.io/phaser3-docs/Phaser.Cameras.Scene2D.Camera.html
	const camera = scene.cameras.main;
    camera.setZoom(1.0);
    camera.setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels);
    camera.startFollow(scene.player);
    camera.roundPixels = true;

    // настройки столкновений с уровнями
    // https://photonstorm.github.io/phaser3-docs/Phaser.Tilemaps.Tilemap.html#setCollision__anchor
    scene.physics.world.setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels, true, true, true, true);
    wallsLayer.setDepth(10);
    wallsLayer.setCollisionBetween(0, 320); // столкновение с тайлами у которых индексы 0..320

    return {"Ground" : groundLayer, "Outside" : outsideLayer, "Walls" : wallsLayer}
}