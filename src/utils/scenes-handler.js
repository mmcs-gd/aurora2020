import Scene from "./scenes-generator.js"

import Evade from '../ai/steerings/evade'

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
        // отрисовываем стены вернхие и нижние
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

        // отрисовываем стены боковые
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

        // добавляем углы комнаты
        groundLayer.putTileAt(TILE_MAPPING.WALL.TOP_LEFT, left, top);
        groundLayer.putTileAt(TILE_MAPPING.WALL.TOP_RIGHT, right, top);
        groundLayer.putTileAt(TILE_MAPPING.WALL.BOTTOM_RIGHT, right, down);
        groundLayer.putTileAt(TILE_MAPPING.WALL.BOTTOM_LEFT, left, down);
    });


        //console.log(rooms)

        // считаем положение где заспавниться игрок
        let palyerSpawnX = 0;
        let palyerSpawnY = 0;
        if (rooms.length != 0)
        {
            palyerSpawnX = rooms[0].startCenter.x * 32 + 10;
            palyerSpawnY = rooms[0].startCenter.y * 32 + 10;
        }
        scene.player = scene.characterFactory.buildCharacter("aurora", palyerSpawnX, palyerSpawnY, {player: true});
        scene.physics.add.collider(scene.player, groundLayer);
        scene.physics.add.collider(scene.player, OtherSubjLayer);


        //// Добавим что-нибудь

        // Берем рандомную комнату для добавления персонажа, его ещё найти надо будет
        let randdd = Math.floor(Math.random() * rooms.length) + 1
        //console.log(rooms.length, randdd)
        let randomRoom = rooms[randdd == rooms.length? randdd - 1 : randdd]

        let npcX
        let npcY
        npcX = randomRoom.startCenter.x * 32 + 10;
        npcY = randomRoom.startCenter.y * 32 + 10;


        scene.evader = scene.characterFactory.buildCharacter('green', npcX, npcY, 
        {Steering: new Evade(scene, scene.player)});
        scene.gameObjects.push(scene.evader);
        scene.physics.add.collider(scene.evader, groundLayer);
        scene.physics.add.collider(scene.evader, OtherSubjLayer);
        scene.physics.add.collider(scene.evader, scene.player);

        //Можно накидать всё что в голову придёт, но в tileset мало интересного
        ////


        // Меняем настройки камеры, а так же размер карты
        const camera = scene.cameras.main;
        camera.setZoom(1.0)
        scene.physics.world.setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels, true, true, true, true);
        camera.setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels);
        camera.startFollow(scene.player);
        // 
        
        groundLayer.setCollisionBetween(1, 500);
        OtherSubjLayer.setDepth(10);

      return {"Ground" : groundLayer, "OtherSubj" : OtherSubjLayer}
};