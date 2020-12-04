import Scene from "./scenes-generator.js"


const TILE_MAPPING = {
    BLANK: 17,
    WALL: {
      TOP_LEFT: 3,
      TOP_RIGHT: 5,
      BOTTOM_RIGHT: 53,
      BOTTOM_LEFT: 51,
      TOP: 14,
      LEFT: 18,
      RIGHT: 16,
      BOTTOM: 52
    },
    FLOOR: 95,
  };

  export default function buildLevel(width, height, maxRooms, scene){
    let level = new Scene(width, height, maxRooms);
    const rooms = level.generateScene();
    const levelMatrix = level.SceneMatrix;
    
    const tilesize = 32;
    scene.map = scene.make.tilemap({
        tileWidth: tilesize,
        tileHeight: tilesize,
        width: width,
        height: height
    });

    const tileset = scene.map.addTilesetImage("Dungeon_Tileset", null, tilesize, tilesize);
    const floorLayer = scene.map.createBlankDynamicLayer("Floor", tileset);
    const groundLayer = scene.map.createBlankDynamicLayer("Ground", tileset);
    const OtherSubjLayer = scene.map.createBlankDynamicLayer("OtherSubj", tileset);

    //console.log(levelMatrix)
    for(let y = 0; y < height; y++)
        for(let x = 0; x < width; x++)
            if(levelMatrix[y][x] === 0)
                groundLayer.putTileAt(TILE_MAPPING.BLANK, x, y); // BLANK
            else 
                floorLayer.putTileAt(TILE_MAPPING.FLOOR, x, y); // floor

    
    let flag = true;

    rooms.forEach(room => {
        const {x, y} = room.startCenter;
        const {width, height, left, right, top, down } = room;

        const w = right - left + 1
        const h = down - top + 1
        for (let i = 0; i < w; i++)
        {
            if(levelMatrix[top - 1][i + left] == 0)
            {
              groundLayer.putTileAt(TILE_MAPPING.WALL.TOP, i + left, top);
            }
            if(levelMatrix.length == down + 1 || levelMatrix[down + 1][i + left] == 0)
            {
              groundLayer.putTileAt(TILE_MAPPING.WALL.BOTTOM, i + left, down);
            }
        }

        for (let i = 0; i < h; i++)
        {
            if(levelMatrix[i + top][left - 1] == 0)
            {
              groundLayer.putTileAt(TILE_MAPPING.WALL.LEFT, left, i + top);
            }

            if(levelMatrix[i + top][right + 1] == 0)
            {
              groundLayer.putTileAt(TILE_MAPPING.WALL.RIGHT, right, i + top);
            }
        }

        
        groundLayer.putTileAt(TILE_MAPPING.WALL.TOP_LEFT, left, top);
        groundLayer.putTileAt(TILE_MAPPING.WALL.TOP_RIGHT, right, top);
        groundLayer.putTileAt(TILE_MAPPING.WALL.BOTTOM_RIGHT, right, down);
        groundLayer.putTileAt(TILE_MAPPING.WALL.BOTTOM_LEFT, left, down);
    });

        //console.log(rooms)
        let palyerSpawnX = 0;
        let palyerSpawnY = 0;
        if (rooms.length != 0)
        {
            palyerSpawnX = rooms[0].startCenter.x * 24 + 50;
            palyerSpawnY = rooms[0].startCenter.y * 24 + 50;
        }
        scene.player = scene.characterFactory.buildCharacter("aurora", palyerSpawnX, palyerSpawnY, {player: true});
        scene.physics.add.collider(scene.player, groundLayer);
        scene.physics.add.collider(scene.player, OtherSubjLayer);


        const camera = scene.cameras.main;
        camera.setZoom(1.0)
        // camera.setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels);
        camera.setBounds(0, 0, 5000, 5000);
        camera.startFollow(scene.player);

        groundLayer.setCollisionBetween(1, 500);
        OtherSubjLayer.setDepth(10);

        return {"Ground" : groundLayer, "OtherSubj" : OtherSubjLayer}
};