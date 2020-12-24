import tilemapPng from '../assets/tileset/Rudnev_Tileset.png'
import auroraSpriteSheet from '../assets/sprites/characters/aurora.png'
import punkSpriteSheet from '../assets/sprites/characters/punk.png'
import blueSpriteSheet from '../assets/sprites/characters/blue.png'
import yellowSpriteSheet from '../assets/sprites/characters/yellow.png'
import greenSpriteSheet from '../assets/sprites/characters/green.png'
import slimeSpriteSheet from '../assets/sprites/characters/slime.png'
import CharacterFactory from "../src/characters/character_factory";

import Scene from "../src/utils/scenes-maker.js"
import Player from "../src/characters/player";
import Slime from "../src/characters/slime";
import Hostage from "../src/characters/hostage";

import Evade from "../src/ai/steerings/evade";
import Pursuit from "../src/ai/steerings/pursuit";
import Wandering from "../src/ai/steerings/wandering";

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
const tilesize = 32;
let floorLayer = null;
let rudnev_scene = null;

let settings = {
    takingHostageDist: 50,
    hostageRunAwayDist: 150,
    slimeMaxDistFromDoor: 500,
    slimeFindingDist: 200,
    killDist: 23,
    distToDoorForWining: 100,
}
let gs_door = {x: -1, y: -1};

function isTileIndex(layer, x, y, tileIndex)
{
    return (layer.getTileAt(x,y) != null && layer.getTileAt(x,y).index == tileIndex)
};

// get random free tile
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

function build_Rudnev_Level(width, height, maxRooms, scene)
{
    let level = new Scene(width, height, maxRooms);
    const rooms = level.generateScene();
    const levelMatrix = level.SceneMatrix;


    scene.map = scene.make.tilemap({tileWidth: tilesize, tileHeight: tilesize, width: width, height: height});

    const tileset = scene.map.addTilesetImage("Rudnev_Tileset", null, tilesize, tilesize);
    floorLayer = scene.map.createBlankDynamicLayer("Floor", tileset);
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
    gs_door.x = door.x * tilesize;
    gs_door.y = door.y * tilesize;

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

        let curentHostage = scene.characterFactory.buildCharacter(hostages_colors[i], hostageSpawnPosition.x, hostageSpawnPosition.y, {isHostage: true});
        scene.physics.add.collider(curentHostage, mygroundLayer);
        scene.physics.add.collider(curentHostage, OtherSubjLayer);
        scene.physics.add.collider(curentHostage, scene.player);
        scene.hostages.push(curentHostage);
    }

    // spawn slimes
    for(let i = 0; i < 4; i++)
    {
        let slime = scene.characterFactory.buildSlime((door.x - 1 + i) * tilesize + Math.floor(tilesize / 2), (door.y + 1) * tilesize + Math.floor(tilesize / 2), {slimeType: i});

        scene.physics.add.collider(slime, mygroundLayer);
        scene.physics.add.collider(slime, OtherSubjLayer);
        slime.steering = new Wandering(slime, door, 1, 40, 100);
        scene.slimes.push(slime);

    }

    // Меняем настройки камеры, а так же размер карты
    const camera = scene.cameras.main;
    camera.setZoom(1.0)
    scene.physics.world.setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels, true, true, true, true);
    camera.setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels);
    camera.startFollow(scene.player);
    mygroundLayer.setCollisionBetween(1, 500);
    OtherSubjLayer.setDepth(10);

    alert("In this game you have to find 4 coins, n\n" +
        "pay them for hostages and save them.\n" +
        "They will not follow you until you'll not payed them.\n" +
        "Slimes want kill everyone. Be careful!\n" +
        "If hostage will scare and run away - take him once\n" +
        "If you find a sword you could kill them.\n" +
        "Came to door with all hostages for win.")

    return {"Ground" : mygroundLayer, "OtherSubj" : OtherSubjLayer}
};

function distance(obj1, obj2)
{
    return Math.sqrt((obj2.x - obj1.x) * (obj2.x - obj1.x) + (obj2.y - obj1.y) * (obj2.y - obj1.y))
}

function interaction(obj)
{
    if(obj instanceof Player)
    {
        let tileIndex = {x: Math.floor(obj.x / tilesize), y: Math.floor(obj.y / tilesize)}
        let curTile = floorLayer.getTileAt(tileIndex.x ,tileIndex.y )
        if(curTile != null && curTile.index != 0)
        {
            if(curTile.index == 2)
            {
                rudnev_scene.gs.coins += 1;
                curTile.index = 0;
                console.log("Founded a coin!")
            }
            else if(curTile.index == 4)
            {
                rudnev_scene.gs.sword = true;
                curTile.index = 0;
                console.log("Founded a sword!")
            }
        }

        for(let i = 0; i < 4; i++)
        {
            rudnev_scene.gameObjects.forEach( function(element) {
                if(element instanceof Slime && obj.isAlive && element.isAlive) {
                    if (distance(obj, element) < settings.killDist && obj.isAlive) {
                        // kill slime or player
                        if (rudnev_scene.gs.sword)
                        {
                            console.log("slime killed")
                            element.isAlive = false;
                            element.destroy()
                        } else {
                            alert("Вы умерли. В следующий раз найдите сначала меч.")
                            obj.isAlive = false
                        }
                    }
                }
            });
        }
    }

    if(obj instanceof Hostage)
    {
        rudnev_scene.gameObjects.forEach( function(element)
        {
            if(element instanceof Player || (!(element instanceof Player) && element.isAlive))
            {

                if(element instanceof Player)
                {
                    if(distance(obj, element) < settings.takingHostageDist)
                    {
                        if(rudnev_scene.gs.coins > 0 && !obj.isPayed)
                        {
                            console.log("hostage taked.")
                            rudnev_scene.gs.coins -= 1;
                            obj.steering = new Pursuit(obj, element, 1, 80, 100, 50);
                            obj.isPayed = true;
                        }
                        if(obj.isPayed && !(obj.steering instanceof Pursuit))
                        {
                            console.log("hostage retaked.")
                            if((obj.steering instanceof Evade) && distance(obj, obj.steering.target) > settings.hostageRunAwayDist)
                                obj.steering = new Pursuit(obj, element, 1, 80, 100, 50);
                        }
                    }
                }

                if(element instanceof Slime)
                {
                    if(distance(obj, element) < settings.hostageRunAwayDist && !(obj.steering instanceof Evade))
                    {
                        console.log("hostage scared!")
                        obj.steering = new Evade(obj, element, 1, 100, 1e5)
                    }
                }
            }
        });
    }

    if(obj instanceof Slime)
    {
        if(obj.isAlive)
        {
            if (distance(obj, gs_door) > settings.slimeMaxDistFromDoor && !(obj.steering instanceof Wandering))
            {
                obj.steering = new Wandering(obj, gs_door, 1, 40, 100);
            }
            else
            {
                rudnev_scene.gameObjects.forEach(function (element)
                {
                    if(element instanceof Player || (!(element instanceof Player) && element.isAlive))
                    {
                        if (element instanceof Player || element instanceof Hostage)
                        {
                            if((element instanceof Hostage) && distance(obj,element) < settings.killDist)
                            {
                                rudnev_scene.gameObjects.forEach(function (el)
                                {
                                    if(el instanceof Slime)
                                        obj.steering = new Wandering(obj, gs_door, 1, 40, 100);
                                });
                                console.log("hostage killed")
                                element.isAlive = false;
                                //element.destroy()
                            }

                            if((element instanceof Player) && distance(obj,element) < settings.killDist && obj.isAlive)
                            {
                                if (rudnev_scene.gs.sword)
                                {
                                    console.log("slime killed")
                                    element.isAlive = false;
                                    element.destroy()
                                } else {
                                    alert("You are died. Try to find a sword next time.")
                                    obj.isAlive = false
                                }
                            }

                            if(element.isAlive && distance(obj,element) < settings.slimeFindingDist)
                            {
                                console.log("slime found target.")
                                obj.steering = new Pursuit(obj, element);
                            }
                        }
                    }
                });
            }
        }
    }
};

function check_win()
{
    let isPlayerCloseToDoor = false;
    let amoutHostagesCloseToDoor = 0;
    rudnev_scene.gameObjects.forEach(function (element)
    {
        //if(element.isAlive) {
            if (element instanceof Player)
            {
                if (distance(element, gs_door) < settings.distToDoorForWining)
                {
                    isPlayerCloseToDoor = true;
                }
            }

            if (element instanceof Hostage)
            {
                if (distance(element, gs_door) < settings.distToDoorForWining)
                {
                    amoutHostagesCloseToDoor += 1;
                }
            }
        //}
    });

    if(isPlayerCloseToDoor && amoutHostagesCloseToDoor == 4)
        return true;
    return false;
}

function close_scene()
{
    if (rudnev_scene._runningScene !== null) {
        rudnev_scene.scene.pause(rudnev_scene._runningScene);
        rudnev_scene.scene.stop(rudnev_scene._runningScene);
        rudnev_scene._runningScene = null;
    }
    location.reload()
}

let Rudnev_lab5_scene = new Phaser.Class(
    {
        Extends: Phaser.Scene,
        initialize: function ProceduralScene() {
        Phaser.Scene.call(this, {key: 'Rudnev_lab5_scene'});
    },
    characterFrameConfig: {frameWidth: 31, frameHeight: 31},
    slimeFrameConfig: {frameWidth: 32, frameHeight: 32},
    preload: function () {
        this.load.image("Rudnev_Tileset", tilemapPng);
        this.load.spritesheet('aurora', auroraSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('blue', blueSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('green', greenSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('yellow', yellowSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('punk', punkSpriteSheet, this.characterFrameConfig);
        this.load.spritesheet('slime', slimeSpriteSheet, this.slimeFrameConfig);
    },

    create: function () {
        rudnev_scene = this;
        this.characterFactory = new CharacterFactory(this);
        this.gameObjects = [];
        this.hostages = [];
        this.slimes = [];
        this.gs = {
            coins: 0,
            sword: false,
        };

        let width = 45;//100
        let height = 45;//100
        let maxRooms = 5;//20

        const layers = build_Rudnev_Level(width, height, maxRooms, this);
        this.player.isAlive = true;
        this.gameObjects.push(this.player);
        for(let i = 0; i < 4; i++)
        {
            this.hostages[i].isAlive = true;
            this.gameObjects.push(this.hostages[i]);
            this.slimes[i].isAlive = true;
            this.gameObjects.push(this.slimes[i]);
        }

        for(let i = 0; i < this.gameObjects.length; i++)
        {
            for(let j = i + 1; j < this.gameObjects.length; j++)
            {
                this.physics.add.collider(this.gameObjects[i], this.gameObjects[j]);
            }
        }

        this.groundLayer = layers["Ground"];
        this.OtherSubjLayer = layers["OtherSubj"];
        this.input.keyboard.once("keydown_D", event => {
            // Turn on physics debugging to show player's hitbox
            this.physics.world.createDebugGraphic();

            const graphics = this.add
                .graphics()
                .setAlpha(0.75)
                .setDepth(20);
        });
    },

    update: function () {
        if (this.gameObjects) {
            let amountHostages = 0;
            this.gameObjects.forEach( function(element) {
                if(element.isAlive)
                {
                    element.update();
                    interaction(element);
                    if(element instanceof Hostage)
                        amountHostages += 1
                }
                else if(element instanceof Player)
                {
                    close_scene()
                }
                else if(element instanceof Hostage)
                {
                    element.destroy();
                }
            });

            if(amountHostages < 4)
            {
                alert("One of the hostages died.");
                close_scene()
            }

            if(check_win())
            {
                alert("Well done. You are perfect!");
                close_scene()
            }
        }
    },
    tilesToPixels(tileX, tileY) {
        return [tileX*this.tileSize, tileY*this.tileSize];
    }
});

export default Rudnev_lab5_scene