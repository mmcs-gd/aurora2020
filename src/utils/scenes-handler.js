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

function isTileIndex(layer, x, y, tileIndex)
{
    return (layer.getTileAt(x,y) != null && layer.getTileAt(x,y).index == tileIndex)
};

function get_free_rand(arr)
{
    let flag = true;
    let empty_marker = {x: -1, y: -1};
    let ret_val = {x: -1, y: -1};
    while(flag)
    {
        let rand_i = Math.floor(Math.random() * arr.length)
        if(arr[rand_i] != empty_marker)
        {
            ret_val = arr[rand_i];
            arr[rand_i] = empty_marker;
            flag = false;
        }
    }
    return ret_val
}

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
            //if(mygroundLayer.getTileAt(x,y) != null && mygroundLayer.getTileAt(x,y).index == 7) // for all grass
            if(isTileIndex(mygroundLayer,x,y,7))
            {
                if(x != 0 && isTileIndex(floorLayer,x - 1,y,0))// if left dirt
                //if(x != 0 && floorLayer.getTileAt(x - 1,y) != null && floorLayer.getTileAt(x - 1,y).index == 0) // if left dirt
                    mygroundLayer.putTileAt(TILE_MAPPING.WALL, x, y);
                else if(x != width - 1 && isTileIndex(floorLayer,x + 1,y,0))// if right dirt
                //else if(x != width - 1 && floorLayer.getTileAt(x + 1,y) != null && floorLayer.getTileAt(x + 1,y).index == 0) // if right dirt
                    mygroundLayer.putTileAt(TILE_MAPPING.WALL, x, y);
                else if(y != 0 && isTileIndex(floorLayer,x,y - 1,0))// if top dirt
                //else if(y != 0 && floorLayer.getTileAt(x,y - 1) != null && floorLayer.getTileAt(x,y - 1).index == 0) // if top dirt
                    mygroundLayer.putTileAt(TILE_MAPPING.WALL, x, y);
                else if(y != height - 1 && isTileIndex(floorLayer,x,y + 1,0))// if top dirt
                //else if(y != height - 1 && floorLayer.getTileAt(x,y + 1) != null && floorLayer.getTileAt(x,y + 1).index == 0) // if bottom dirt
                    mygroundLayer.putTileAt(TILE_MAPPING.WALL, x, y);
            }
        }
    }

    // locate doors
    let door_candidates = [];
    for(let y = 0; y < height-1; y++)
    {
        for (let x = 0+1; x < width-2; x++)
        {
            if( isTileIndex(mygroundLayer,x - 1,y,3) &&
                isTileIndex(mygroundLayer,x,y,3) &&
                isTileIndex(mygroundLayer,x + 1,y,3) &&
                isTileIndex(mygroundLayer,x + 2,y,3) &&
                isTileIndex(floorLayer,x - 1,y + 1,0) &&
                isTileIndex(floorLayer,x,y + 1,0) &&
                isTileIndex(floorLayer,x + 1,y + 1,0) &&
                isTileIndex(floorLayer,x + 2,y + 1,0))
            {
                door_candidates.push({x:x, y:y});
            }
        }
    }
    let door = door_candidates[Math.floor(Math.random() * door_candidates.length)];

    mygroundLayer.putTileAt(TILE_MAPPING.WOODENWALL, door.x - 1, door.y);
    mygroundLayer.putTileAt(TILE_MAPPING.DOOR, door.x , door.y);
    mygroundLayer.putTileAt(TILE_MAPPING.WINDOW, door.x + 1, door.y);
    mygroundLayer.putTileAt(TILE_MAPPING.WOODENWALL, door.x + 2, door.y);

    floorLayer.putTileAt(TILE_MAPPING.WOODENFLOOR, door.x - 1, door.y + 1);
    floorLayer.putTileAt(TILE_MAPPING.WOODENFLOOR, door.x , door.y + 1);
    floorLayer.putTileAt(TILE_MAPPING.WOODENFLOOR, door.x + 1, door.y + 1);
    floorLayer.putTileAt(TILE_MAPPING.WOODENFLOOR, door.x + 2, door.y + 1);

    if(door.y != 0)
    {
        mygroundLayer.putTileAt(TILE_MAPPING.WALL, door.x - 1, door.y-1);
        mygroundLayer.putTileAt(TILE_MAPPING.WALL, door.x , door.y-1);
        mygroundLayer.putTileAt(TILE_MAPPING.WALL, door.x + 1, door.y-1);
        mygroundLayer.putTileAt(TILE_MAPPING.WALL, door.x + 2, door.y-1);

        if(floorLayer.getTileAt( door.x - 1,  door.y - 1) != null)
            floorLayer.removeTileAt( door.x - 1,  door.y - 1);
        if(floorLayer.getTileAt( door.x,  door.y - 1) != null)
            floorLayer.removeTileAt( door.x,  door.y - 1);
        if(floorLayer.getTileAt( door.x + 1,  door.y - 1) != null)
            floorLayer.removeTileAt( door.x + 1,  door.y - 1);
        if(floorLayer.getTileAt( door.x + 2,  door.y - 1) != null)
            floorLayer.removeTileAt( door.x + 2,  door.y - 1);
    }

    if(door.x > 1 && !isTileIndex(mygroundLayer,door.x - 2,door.y,3))
    {
        mygroundLayer.putTileAt(TILE_MAPPING.WALL, door.x - 2, door.y);
        if(floorLayer.getTileAt( door.x - 2,  door.y) != null)
            floorLayer.removeTileAt( door.x - 2,  door.y);
    }

    if(door.x < width-3 && !isTileIndex(mygroundLayer,door.x + 3,door.y,3))
    {
        mygroundLayer.putTileAt(TILE_MAPPING.WALL, door.x + 3, door.y);
        if(floorLayer.getTileAt( door.x + 3,  door.y) != null)
            floorLayer.removeTileAt( door.x + 3,  door.y);
    }

    // set corner wall between grass
    let corner_array = [];
    for(let y = 0; y < height; y++)
    {
        for (let x = 0; x < width; x++)
        {
            if(isTileIndex(mygroundLayer,x,y,7))// for all grass
            //if (mygroundLayer.getTileAt(x, y) != null && mygroundLayer.getTileAt(x, y).index == 7) // for all grass
            {
                let wall_counter = 0;

                // bot right corner
                if(x != 0 && isTileIndex(mygroundLayer,x - 1,y,3) && y != 0 && isTileIndex(mygroundLayer,x,y - 1,3))
                //if((x != 0 && mygroundLayer.getTileAt(x - 1,y) != null && mygroundLayer.getTileAt(x - 1,y).index == 3) &&
                //    (y != 0 && mygroundLayer.getTileAt(x,y - 1) != null && mygroundLayer.getTileAt(x,y - 1).index == 3))
                    wall_counter += 1;

                // top right corner
                if(x != 0 && isTileIndex(mygroundLayer,x - 1,y,3) && y != height - 1 && isTileIndex(mygroundLayer,x,y + 1,3))
                //if((x != 0 && mygroundLayer.getTileAt(x - 1,y) != null && mygroundLayer.getTileAt(x - 1,y).index == 3) &&
                //    (y != height - 1 && mygroundLayer.getTileAt(x,y + 1) != null && mygroundLayer.getTileAt(x,y + 1).index == 3))
                    wall_counter += 1;

                // bot left corner
                if(x != width - 1 && isTileIndex(mygroundLayer,x + 1,y,3) && y != 0 && isTileIndex(mygroundLayer,x,y - 1,3))
                //if((x != width - 1 && mygroundLayer.getTileAt(x + 1,y) != null && mygroundLayer.getTileAt(x + 1,y).index == 3) &&
                //    (y != 0 && mygroundLayer.getTileAt(x,y - 1) != null && mygroundLayer.getTileAt(x,y - 1).index == 3))
                    wall_counter += 1;

                // top left corner
                if(x != width - 1 && isTileIndex(mygroundLayer,x + 1,y,3) && y != height - 1 && isTileIndex(mygroundLayer,x,y + 1,3))
                //if((x != width - 1 && mygroundLayer.getTileAt(x + 1,y) != null && mygroundLayer.getTileAt(x + 1,y).index == 3) &&
                //  (y != height - 1 && mygroundLayer.getTileAt(x,y + 1) != null && mygroundLayer.getTileAt(x,y + 1).index == 3))
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
            if(isTileIndex(floorLayer,x,y,0))
            //if (floorLayer.getTileAt(x, y) != null && floorLayer.getTileAt(x, y).index == 7)
            {
                free_space.push({x:x, y:y});
            }
        }
    }

    // locate coins and sword
    let perks = [TILE_MAPPING.COIN, TILE_MAPPING.COIN, TILE_MAPPING.COIN, TILE_MAPPING.COIN, TILE_MAPPING.SWORD];
    for(let i = 0; i < perks.length; i++)
    {
        let coords = get_free_rand(free_space)
        floorLayer.putTileAt(perks[i], coords.x , coords.y);
    }

    // spawn player
    let palyerSpawnPosition = get_free_rand(free_space);
    palyerSpawnPosition.x = palyerSpawnPosition.x * tilesize + Math.floor(tilesize / 2)
    palyerSpawnPosition.y = palyerSpawnPosition.y * tilesize + Math.floor(tilesize / 2)
    scene.player = scene.characterFactory.buildCharacter("green", palyerSpawnPosition.x , palyerSpawnPosition.y , {player: true});
    scene.physics.add.collider(scene.player, mygroundLayer);
    scene.physics.add.collider(scene.player, OtherSubjLayer);

    // spawn hostages
    let hostages_colors = ["aurora","blue","yellow","punk"]
    for(let i = 0; i < 4; i++)
    {
        let hostageSpawnPosition = get_free_rand(free_space)
        hostageSpawnPosition.x = hostageSpawnPosition.x * tilesize + Math.floor(tilesize / 2)
        hostageSpawnPosition.y = hostageSpawnPosition.y * tilesize + Math.floor(tilesize / 2)

        scene.curentHostage = scene.characterFactory.buildCharacter(hostages_colors[i], hostageSpawnPosition.x, hostageSpawnPosition.y, {isHostage: true});
        scene.physics.add.collider(scene.curentHostage, mygroundLayer);
        scene.physics.add.collider(scene.curentHostage, OtherSubjLayer);
        scene.physics.add.collider(scene.curentHostage, scene.player);
        scene.hostages.push(scene.curentHostage);
    }

    // spawn slimes
    for(let i = 0; i < 4; i++)
    {
        let slime = scene.characterFactory.buildSlime((door.x - 1 + i) * tilesize + Math.floor(tilesize / 2), (door.y + 1) * tilesize + Math.floor(tilesize / 2), {slimeType: i});

        scene.physics.add.collider(scene.curentHostage, mygroundLayer);
        scene.physics.add.collider(scene.curentHostage, OtherSubjLayer);
        scene.physics.add.collider(scene.curentHostage, scene.player);
        for(let j = 0; j < 4; j++)
            scene.physics.add.collider(scene.curentHostage, scene.hostages[j]);
        scene.slimes.push(slime);
        //scene.gameObjects.push(slime);
        /*this.player = this.characterFactory.buildCharacter('punk', 100, 100, {player: true});
        this.gameObjects.push(this.player);
        this.physics.add.collider(this.player, worldLayer);
        this.slimes =  this.physics.add.group();
        let params = {};

        for(let i = 0; i < 50; i++) {

            const x = Phaser.Math.RND.between(50, this.physics.world.bounds.width - 50 );
            const y = Phaser.Math.RND.between(50, this.physics.world.bounds.height -50 );
            params.slimeType = Phaser.Math.RND.between(0, 4);
            const slime = this.characterFactory.buildSlime(x, y, params);
            this.slimes.add(slime);
            this.physics.add.collider(slime, worldLayer);
            this.gameObjects.push(slime);
        }
        this.physics.add.collider(this.player, this.slimes);*/

        /*let hostageSpawnPosition = get_free_rand(free_space)
        hostageSpawnPosition.x = hostageSpawnPosition.x * tilesize + Math.floor(tilesize / 2)
        hostageSpawnPosition.y = hostageSpawnPosition.y * tilesize + Math.floor(tilesize / 2)

        scene.curentHostage = scene.characterFactory.buildCharacter(hostages_colors[i], hostageSpawnPosition.x, hostageSpawnPosition.y, {isHostage: true});
        scene.physics.add.collider(scene.curentHostage, mygroundLayer);
        scene.physics.add.collider(scene.curentHostage, OtherSubjLayer);
        scene.physics.add.collider(scene.curentHostage, scene.player);
        scene.hostages.push(scene.curentHostage);*/
    }
/*
    scene.physics.add.collider(scene.player, scene.slimes);
    for(let i = 0; i < 4; i++)
        scene.physics.add.collider(scene.hostages[i], scene.slimes);
*/


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