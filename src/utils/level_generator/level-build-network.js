// Tiled Map Editor
const TILES = {
    BLANK: 17,
    FLOOR: [
        { index: [88, 89, 92, 93, 104, 105, 108, 109, 105+16*2, 104+16*9], weight: 1 },
    ],
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
    
    // создаём уровни сцены. какой порядок?
    const outsideLayer = scene.map.createBlankDynamicLayer("Outside", tileSet);
    const groundLayer = scene.map.createBlankDynamicLayer("Ground", tileSet);
    const wallsLayer = scene.map.createBlankDynamicLayer("Walls", tileSet);
    //const upperLayer = scene.map.createBlankDynamicLayer("Upper", tileSet);

    // по маске уровня заполняем уровни outsideLayer, groundLayer
    // fill, putTileAt, weightedRandomize
	for (let x = 0; x < width; x++) {
		for (let y = 0; y < height; y++) {
			if (mask[x][y] === 0) {
				outsideLayer.putTileAt(TILES.BLANK, x, y);
            } else if (mask[x][y] === 1) {
                groundLayer.weightedRandomize(x, y, 1, 1, TILES.FLOOR);
            } else {
                groundLayer.weightedRandomize(x, y, 1, 1, TILES.FLOOR);
            }
		}
    }
    
    // добавляем персонажа Аврору
    const startRoom = rooms[0];
    scene.player = scene.characterFactory.buildCharacter('aurora', startRoom.x*32+32, startRoom.y*32+32, {player: true});
    //scene.physics.add.collider(scene.player, wallsLayer);
    scene.physics.add.collider(scene.player, outsideLayer);
    scene.gameObjects.push(scene.player);

    // точка появления игроков
    scene.effectsFactory.buildEffect('flamelash', startRoom.x*32+32, startRoom.y*32+32);

    // портал для перехода на сцену подземелья
    const portalRoom = rooms[1];
    scene.portal = scene.effectsFactory.buildEffect('vortex', portalRoom.x*32+32, portalRoom.y*32+32);
    scene.physics.add.collider(scene.portal, scene.player, scene.runSceneDungeon.bind(scene));

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
    //wallsLayer.setDepth(10);
    //wallsLayer.setCollisionBetween(0, 320); // столкновение с тайлами у которых индексы 0..320
    outsideLayer.setDepth(10);
    outsideLayer.setCollision(TILES.BLANK);

    return {"Ground" : groundLayer, "Outside" : outsideLayer, "Walls" : wallsLayer}
}