import BSP from './binary-space-partitioning'
import HideAndSeek from "../ai/steerings/hide&seek"

const TILE_MAPPING = {
    BLANK: 17,
    FLOOR: 95,
	COLUMN: 225 // 110
};

const LEVEL_TO_TILE = {
    0: TILE_MAPPING.BLANK,
    1: TILE_MAPPING.FLOOR,
	2: TILE_MAPPING.COLUMN
}

export default function createLevel(width, height, scene) {
	const tileSize = 32;

	let bsp = new BSP();
	let res = bsp.generate(width, height, 6);
	let mask = res[0], rooms = res[1];
	let objects = res[2].map((z) => ({ x: z.y * tileSize, y: z.x * tileSize }));

	scene.map = scene.make.tilemap({
		tileWidth: tileSize,
		tileHeight: tileSize,
		width: width,
		height: height
	});

	const tileSet = scene.map.addTilesetImage("tiles", null, tileSize, tileSize);
    const outsideLayer = scene.map.createBlankDynamicLayer("Water", tileSet);
    const groundLayer = scene.map.createBlankDynamicLayer("Ground", tileSet);
    const stuffLayer = scene.map.createBlankDynamicLayer("Stuff", tileSet);

	for (let i = 0; i < height; ++i) {
		for (let j = 0; j < width; ++j) {
			if (mask[i][j] == 0) {
				outsideLayer.putTileAt(LEVEL_TO_TILE[0], j, i);
            } else {
                groundLayer.putTileAt(LEVEL_TO_TILE[1], j, i);
			}
			if (mask[i][j] == 2) {
				stuffLayer.putTileAt(LEVEL_TO_TILE[2], j, i);
			}
		}
	}

	let roomAurora = rooms[rooms.length - 1];
	let auroraY = tileSize * (roomAurora.top + roomAurora.height / 2);
	let auroraX = tileSize * (roomAurora.left + roomAurora.width / 2);
	scene.player = scene.characterFactory.buildCharacter('aurora', auroraX, auroraY, {player: true});
    scene.physics.add.collider(scene.player, groundLayer);
    scene.physics.add.collider(scene.player, stuffLayer);
    scene.physics.add.collider(scene.player, outsideLayer);
    scene.gameObjects.push(scene.player);

	scene.seekers = [];
	for (let i = 0; i < rooms.length - 1; ++i) {
		let roomSeeker = rooms[i];
		let seekerY = tileSize * (roomSeeker.top + roomSeeker.height / 2);
		let seekerX = tileSize * (roomSeeker.left + roomSeeker.width / 2);
		let seeker = scene.characterFactory.buildCharacter('blue', seekerX, seekerY, {Steering: new HideAndSeek(i, scene, objects, scene.player)});
		seeker.hide = true;
		scene.gameObjects.push(seeker);
		scene.physics.add.collider(seeker, groundLayer);
		scene.physics.add.collider(seeker, stuffLayer);
		scene.physics.add.collider(seeker, outsideLayer);
		scene.physics.add.collider(seeker, scene.player, scene.collide.bind(scene, seeker));
		scene.seekers.push(seeker);
	}

	const camera = scene.cameras.main;
    camera.setZoom(1.0)
    camera.setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels);
    camera.startFollow(scene.player);
    camera.roundPixels = true;

    scene.physics.world.setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels, true, true, true, true);
    groundLayer.setCollisionBetween(1, 500);
    stuffLayer.setDepth(10);
    stuffLayer.setCollisionBetween(1, 500);
    outsideLayer.setDepth(1000);
    outsideLayer.setCollisionBetween(1, 500);

    return {"Ground" : groundLayer, "Stuff" : stuffLayer, "Outside" : outsideLayer}
}