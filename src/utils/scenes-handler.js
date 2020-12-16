import Scene from "./scenes-maker.js"

import Evade from '../ai/steerings/evade'

const TILE_MAPPING = {
    DIRT: 0,
    WATER: 1,
    COIN: 2,
    WALL: 3,
    SWORD: 4,
    WOODENWALL:5,
    WINDOW: 6,
    GRASS: 7,
    DOOR: 8,
    WOODENFLOOR: 9,
};

export default function buildLevel(width, height, maxRooms, scene)
{
    let level = new Scene(width, height, maxRooms);
    const rooms = level.generateScene();
    const levelMatrix = level.SceneMatrix;

    const tilesize = 32;
    scene.map = scene.make.tilemap({tileWidth: tilesize, tileHeight: tilesize, width: width, height: height});

    const tileset = scene.map.addTilesetImage("Rudnev_Tileset", null, tilesize, tilesize);
    const floorLayer = scene.map.createBlankDynamicLayer("Floor", tileset);
    const mygroundLayer = scene.map.createBlankDynamicLayer("Ground", tileset);
    const OtherSubjLayer = scene.map.createBlankDynamicLayer("OtherSubj", tileset);



    for(let y = 0 + 1; y < height - 1; y++)
        for(let x = 0 + 1; x < width - 1; x++)
            if(levelMatrix[y][x] === 0)
                mygroundLayer.putTileAt(TILE_MAPPING.GRASS, x, y);
            else
                floorLayer.putTileAt(TILE_MAPPING.DIRT, x, y);

    for(let x = 0; x < width; x++)
    {
        mygroundLayer.putTileAt(TILE_MAPPING.WALL, x, 0);
        mygroundLayer.putTileAt(TILE_MAPPING.WALL, x, height - 1);
        if(floorLayer.getTileAt( x,  0) != null)
            floorLayer.removeTileAt( x,  0);
        if(floorLayer.getTileAt( x,  height - 1) != null)
            floorLayer.removeTileAt( x,  height - 1);

    }

    for(let y = 0; y < height; y++)
    {
        mygroundLayer.putTileAt(TILE_MAPPING.WALL, 0, y);
        mygroundLayer.putTileAt(TILE_MAPPING.WALL,width - 1, y);
        if(floorLayer.getTileAt( 0,  y) != null)
            floorLayer.removeTileAt( 0,  y);
        if(floorLayer.getTileAt( width - 1,  y) != null)
            floorLayer.removeTileAt( width - 1,  y);
    }

    // gras can't touch dirt. make from grass walls
    for(let y = 0; y < height; y++)
    {
        for (let x = 0; x < width; x++)
        {
            if(mygroundLayer.getTileAt(x,y) != null && mygroundLayer.getTileAt(x,y).index == 7) // for all grass
            {
                if(x != 0 && floorLayer.getTileAt(x - 1,y) != null && floorLayer.getTileAt(x - 1,y).index == 0) // if left dirt
                    mygroundLayer.putTileAt(TILE_MAPPING.WALL, x, y);
                else if(x != width - 1 && floorLayer.getTileAt(x + 1,y) != null && floorLayer.getTileAt(x + 1,y).index == 0) // if right dirt
                    mygroundLayer.putTileAt(TILE_MAPPING.WALL, x, y);
                else if(y != 0 && floorLayer.getTileAt(x,y - 1) != null && floorLayer.getTileAt(x,y - 1).index == 0) // if top dirt
                    mygroundLayer.putTileAt(TILE_MAPPING.WALL, x, y);
                else if(y != height - 1 && floorLayer.getTileAt(x,y + 1) != null && floorLayer.getTileAt(x,y + 1).index == 0) // if bottom dirt
                    mygroundLayer.putTileAt(TILE_MAPPING.WALL, x, y);
            }
        }
    }

    // locate doors
    let door_location_candidates = [];
    for(let y = 0; y < height-1; y++)
    {
        for (let x = 0+1; x < width-2; x++)
        {
            if ((mygroundLayer.getTileAt(x-1, y) != null && mygroundLayer.getTileAt(x-1, y).index == 3) &&
                (mygroundLayer.getTileAt(x, y) != null && mygroundLayer.getTileAt(x, y).index == 3) &&
                (mygroundLayer.getTileAt(x+1, y) != null && mygroundLayer.getTileAt(x+1, y).index == 3) &&
                (mygroundLayer.getTileAt(x+2, y) != null && mygroundLayer.getTileAt(x+2, y).index == 3) &&
                (floorLayer.getTileAt(x-1, y + 1) != null && floorLayer.getTileAt(x-1, y + 1).index == 0) &&
                (floorLayer.getTileAt(x, y + 1) != null && floorLayer.getTileAt(x, y + 1).index == 0) &&
                (floorLayer.getTileAt(x+1, y + 1) != null && floorLayer.getTileAt(x+1, y + 1).index == 0) &&
                (floorLayer.getTileAt(x+2, y + 1) != null && floorLayer.getTileAt(x+2, y + 1).index == 0))
            {
                door_location_candidates.push({x:x, y:y});
            }
        }
    }
    let door_location = door_location_candidates[Math.floor(Math.random() * door_location_candidates.length)];

    mygroundLayer.putTileAt(TILE_MAPPING.WOODENWALL, door_location.x - 1, door_location.y);
    mygroundLayer.putTileAt(TILE_MAPPING.DOOR, door_location.x , door_location.y);
    mygroundLayer.putTileAt(TILE_MAPPING.WINDOW, door_location.x + 1, door_location.y);
    mygroundLayer.putTileAt(TILE_MAPPING.WOODENWALL, door_location.x + 2, door_location.y);

    floorLayer.putTileAt(TILE_MAPPING.WOODENFLOOR, door_location.x - 1, door_location.y + 1);
    floorLayer.putTileAt(TILE_MAPPING.WOODENFLOOR, door_location.x , door_location.y + 1);
    floorLayer.putTileAt(TILE_MAPPING.WOODENFLOOR, door_location.x + 1, door_location.y + 1);
    floorLayer.putTileAt(TILE_MAPPING.WOODENFLOOR, door_location.x + 2, door_location.y + 1);

    if(door_location.y != 0)
    {
        mygroundLayer.putTileAt(TILE_MAPPING.WALL, door_location.x - 1, door_location.y-1);
        mygroundLayer.putTileAt(TILE_MAPPING.WALL, door_location.x , door_location.y-1);
        mygroundLayer.putTileAt(TILE_MAPPING.WALL, door_location.x + 1, door_location.y-1);
        mygroundLayer.putTileAt(TILE_MAPPING.WALL, door_location.x + 2, door_location.y-1);

        if(floorLayer.getTileAt( door_location.x - 1,  door_location.y - 1) != null)
            floorLayer.removeTileAt( door_location.x - 1,  door_location.y - 1);
        if(floorLayer.getTileAt( door_location.x,  door_location.y - 1) != null)
            floorLayer.removeTileAt( door_location.x,  door_location.y - 1);
        if(floorLayer.getTileAt( door_location.x + 1,  door_location.y - 1) != null)
            floorLayer.removeTileAt( door_location.x + 1,  door_location.y - 1);
        if(floorLayer.getTileAt( door_location.x + 2,  door_location.y - 1) != null)
            floorLayer.removeTileAt( door_location.x + 2,  door_location.y - 1);
    }

    // set corner wall between grass
    let corner_array = [];
    for(let y = 0; y < height; y++)
    {
        for (let x = 0; x < width; x++)
        {
            if (mygroundLayer.getTileAt(x, y) != null && mygroundLayer.getTileAt(x, y).index == 7) // for all grass
            {
                let wall_counter = 0;

                // bot right corner
                if((x != 0 && mygroundLayer.getTileAt(x - 1,y) != null && mygroundLayer.getTileAt(x - 1,y).index == 3) &&
                    (y != 0 && mygroundLayer.getTileAt(x,y - 1) != null && mygroundLayer.getTileAt(x,y - 1).index == 3))
                    wall_counter += 1;

                // top right corner
                if((x != 0 && mygroundLayer.getTileAt(x - 1,y) != null && mygroundLayer.getTileAt(x - 1,y).index == 3) &&
                    (y != height - 1 && mygroundLayer.getTileAt(x,y + 1) != null && mygroundLayer.getTileAt(x,y + 1).index == 3))
                    wall_counter += 1;

                // bot left corner
                if((x != width - 1 && mygroundLayer.getTileAt(x + 1,y) != null && mygroundLayer.getTileAt(x + 1,y).index == 3) &&
                    (y != 0 && mygroundLayer.getTileAt(x,y - 1) != null && mygroundLayer.getTileAt(x,y - 1).index == 3))
                    wall_counter += 1;

                // top left corner
                if((x != width - 1 && mygroundLayer.getTileAt(x + 1,y) != null && mygroundLayer.getTileAt(x + 1,y).index == 3) &&
                    (y != height - 1 && mygroundLayer.getTileAt(x,y + 1) != null && mygroundLayer.getTileAt(x,y + 1).index == 3))
                    wall_counter += 1;

                if(wall_counter >= 1)
                    corner_array.push({x:x,y:y});
            }
        }
    }
    corner_array.forEach(corner => {mygroundLayer.putTileAt(TILE_MAPPING.WALL, corner.x, corner.y);})

    // in free_space could be located hostages, coins, sword
    let free_space = [];
    for(let y = 0; y < height; y++)
    {
        for (let x = 0; x < width; x++)
        {
            if (floorLayer.getTileAt(x, y) != null && floorLayer.getTileAt(x, y).index == 7)
            {
                free_space.push({x:x, y:y});
            }
        }
    }

    let sapwn_hostages_location = [];
    for(let i = 0; i < 4; i++)
    {
        let flag = true;
        while(flag)
        {
            let rand_i = Math.floor(Math.random() * free_space.length)
            if(free_space[rand_i] != {x: -1, y: -1})
            {
                sapwn_hostages_location = free_space[rand_i];
                free_space[rand_i] = {x: -1, y: -1};
                flag = false;
            }
        }
    }

    // NEED TO SPAWN HERE HOSTAGES
    // ...

    console.log("locate coins and sword ... ")
    // locate coins and sword
    let perks = [TILE_MAPPING.COIN, TILE_MAPPING.COIN, TILE_MAPPING.COIN, TILE_MAPPING.COIN, TILE_MAPPING.SWORD];
    for(let i = 0; i < perks.length; i++)
    {
        let flag = true;
        while(flag)
        {
            let rand_i = Math.floor(Math.random() * free_space.length)
            if(free_space[rand_i] != {x: -1, y: -1})
            {
                console.log("putting ", perks[i])
                floorLayer.putTileAt(perks[i], free_space[rand_i].x , free_space[rand_i].y);
                free_space[rand_i] = {x: -1, y: -1};
                flag = false;
            }
        }
    }
    console.log("done")

    // считаем положение где заспавнится игрок
    let palyerSpawnX = 0;
    let palyerSpawnY = 0;
    if (rooms.length != 0)
    {
        palyerSpawnX = rooms[0].startCenter.x * tilesize + 10;
        palyerSpawnY = rooms[0].startCenter.y * tilesize + 10;
    }
    scene.player = scene.characterFactory.buildCharacter("green", palyerSpawnX, palyerSpawnY, {player: true});
    scene.physics.add.collider(scene.player, mygroundLayer);
    scene.physics.add.collider(scene.player, OtherSubjLayer);

    // Берем рандомную комнату для добавления персонажа, его ещё найти надо будет
    /*let randdd = Math.floor(Math.random() * rooms.length) + 1
    let randomRoom = rooms[randdd == rooms.length? randdd - 1 : randdd]

    let npcX
    let npcY
    npcX = randomRoom.startCenter.x * tilesize + 10;
    npcY = randomRoom.startCenter.y * tilesize + 10;


    scene.evader = scene.characterFactory.buildCharacter('green', npcX, npcY,
    {Steering: new Evade(scene, scene.player)});
    scene.gameObjects.push(scene.evader);
    scene.physics.add.collider(scene.evader, mygroundLayer);
    scene.physics.add.collider(scene.evader, OtherSubjLayer);
    scene.physics.add.collider(scene.evader, scene.player);*/

    // Меняем настройки камеры, а так же размер карты
    const camera = scene.cameras.main;
    camera.setZoom(1.0)
    scene.physics.world.setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels, true, true, true, true);
    camera.setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels);
    camera.startFollow(scene.player);
    mygroundLayer.setCollisionBetween(1, 500);
    OtherSubjLayer.setDepth(10);

    return {"Ground" : mygroundLayer, "OtherSubj" : OtherSubjLayer}
};