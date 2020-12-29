import Level from "./level-generator";
import Exploring from "../ai/steerings/exploring";
import Merger from "../ai/npcs/merger";

const TILE_MAPPING = {
    BLANK: 17,
    FLOOR: [{name:'NORMAL', index: 95, weight: 1},
            {name:'DIRT', index: 172, weight: 1},
            {name:'BROKEN', index: 248, weight: 1},
            //{name:'BLACK', index: 151, weight: 1}
           ],
    STUFF: [{name:'TRASH', index: 86, weight: 1},
            {name:'CHEST', index: 260, weight: 1},
            {name:'TOWERHEAD', index: 208, weight: 1},
            {name:'TOWERTAIL', index: 224, weight: 1}
           ],
};

export default function buildLevel(width, height, maxRooms, maxNpcs, scene){
    let level = new Level(width, height, maxRooms); 
    const rooms = level.generateLevel();
    const levelMatrix = level.levelMatrix;
    serialize(level);
    level = unserialize(level);
    //console.log(level);
    // Creating a blank tilemap with dimensions matching the dungeon
    const tilesize = 32;
    scene.map = scene.make.tilemap({
        tileWidth: tilesize,
        tileHeight: tilesize,
        width: width,
        height: height
    });

    const tileset = scene.map.addTilesetImage("tiles", null, tilesize, tilesize);
    const outsideLayer = scene.map.createBlankDynamicLayer("Outside", tileset);
    const groundLayer = scene.map.createBlankDynamicLayer("Ground", tileset);
    const stuffLayer = scene.map.createBlankDynamicLayer("Stuff", tileset);

    // ground tiles mapping
    for(let y = 0; y < height; y++)
        for(let x = 0; x < width; x++)
            switch(levelMatrix[y][x])
            {
                case 0: outsideLayer.putTileAt(TILE_MAPPING.BLANK, x, y); break;
                case 1: groundLayer.weightedRandomize(x, y, 1, 1, TILE_MAPPING.FLOOR); break;
                case 2: 
                    groundLayer.weightedRandomize(x, y, 1, 1, TILE_MAPPING.FLOOR);
                    stuffLayer.weightedRandomize(x, y, 1, 1, TILE_MAPPING.STUFF); break;
            }   
        

    if (rooms.length >= 3)
    {
        scene.player = scene.characterFactory.buildCharacter('aurora', 
                                                             rooms[0].startCenter.x * 32 + 10, 
                                                             rooms[0].startCenter.y * 32 + 10, 
                                                             {player: true});
        scene.player.maxSpeed = 300;
        // Watch the player and tilemap layers for collisions, for the duration of the scene:
        scene.physics.add.collider(scene.player, groundLayer);
        scene.physics.add.collider(scene.player, stuffLayer);
        scene.physics.add.collider(scene.player, outsideLayer);
        scene.gameObjects.push(scene.player);
        //console.log(scene.player)
        
        let npcAmount = Math.min(maxNpcs, rooms.length - 1)
        if (npcAmount % 2 == 1)
        {
            npcAmount -= 1;
        }
        console.log(npcAmount)
        scene.npcs = []
        let notUsedRooms = rooms.map((x, index) => index).filter(x => x != 0);
        console.log(notUsedRooms)
        for (let z = 0; z < npcAmount; z++)
        {
            let roomIndex = notUsedRooms[randomInt(0, notUsedRooms.length - 1)]
            notUsedRooms = notUsedRooms.filter(x => x != roomIndex);
            let npc = scene.characterFactory.buildCharacter('green', rooms[roomIndex].startCenter.x * 32 + 10, 
                                                             rooms[roomIndex].startCenter.y * 32 + 10); 
            npc.setAI(new Merger(npc, [], scene.player), 'idle');
            scene.gameObjects.push(npc);
            scene.physics.add.collider(npc, groundLayer);
            scene.physics.add.collider(npc, stuffLayer);
            scene.physics.add.collider(npc, outsideLayer);
            scene.physics.add.collider(npc, scene.player, scene.onNpcPlayerCollide.bind(scene));
            for (let npc2 of scene.npcs)
            {
                scene.physics.add.collider(npc, npc2, scene.onNpcNpcCollide.bind(scene));
            }
            scene.npcs.push(npc);
        }
        
        for (let z = 0; z < npcAmount; z++)
        {
            scene.npcs[z].ai.addNpcs(scene.npcs.filter(x => x != scene.npcs[z]))
        }
    }


    // Phaser supports multiple cameras, but you can access the default camera like this:
    const camera = scene.cameras.main;
    camera.setZoom(1.0)
    // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
    camera.setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels);
    camera.roundPixels = true;
    camera.startFollow(scene.player);
    
    scene.physics.world.setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels, true, true, true, true);
    groundLayer.setCollisionBetween(1, 500);
    stuffLayer.setDepth(-10);
    stuffLayer.setCollisionBetween(1, 500);
    outsideLayer.setDepth(9999);
    outsideLayer.setCollisionBetween(1, 500);

    return {"Ground" : groundLayer, "Stuff" : stuffLayer, "Outside" : outsideLayer}
};

function serialize(instance) {
    var str = JSON.stringify(instance);
    sessionStorage.setItem("json", str);
}

function unserialize() {
    var instance = new Level();                  
    var serializedObject = JSON.parse(sessionStorage.getItem("json"));
    Object.assign(instance, serializedObject);
    return instance;
}

function randomInt(min, max)
{
    return (Math.random() * (max - min + 1)) | 0 + min
}
