import tilemapPng from "../assets/tileset/Dungeon_Tileset.png";
import auroraSpriteSheet from "../assets/sprites/characters/aurora.png";
import blueSpriteSheet from "../assets/sprites/characters/blue.png";
import greenSpriteSheet from "../assets/sprites/characters/green.png";
import yellowSpriteSheet from "../assets/sprites/characters/yellow.png";
import punkSpriteSheet from "../assets/sprites/characters/punk.png";
import slimeSpriteSheet from "../assets/sprites/characters/slime.png";
import Footsteps from "../assets/audio/footstep_ice_crunchy_run_01.wav";
import EasyStar from "easystarjs";
import CharacterFactory from "../src/characters/character_factory";
import {config} from '../src/index'
import generator from "../roomGenerator/generator";
import gold from "../assets/sprites/stuff/gold.png";


let generateLevelScene = new Phaser.Class({
        Extends: Phaser.scene,
        initialize:
            function generateLevelScene () {
                Phaser.Scene.call(this,{key:'generateLevelScene'})
            },
        characterFrameConfig: {frameWidth: 31, frameHeight: 31},
        slimeFrameConfig: {frameWidth: 32, frameHeight: 32},
        preload:function (){
            //loading map tiles and json with positions
            this.load.image("tiles", tilemapPng);

            //loading spitesheets
            this.load.spritesheet('aurora', auroraSpriteSheet, this.characterFrameConfig);
            this.load.spritesheet('blue', blueSpriteSheet, this.characterFrameConfig);
            this.load.spritesheet('green', greenSpriteSheet, this.characterFrameConfig);
            this.load.spritesheet('yellow', yellowSpriteSheet, this.characterFrameConfig);
            this.load.spritesheet('punk', punkSpriteSheet, this.characterFrameConfig);
            this.load.spritesheet('slime', slimeSpriteSheet, this.slimeFrameConfig);
            this.load.audio('footsteps', Footsteps);
        },
        create:function (){

            this.gameObject = [];
            const  map = this.make.tilemap({
                tileWidth :32,
                tileHeight:32,
                width:config.width,
                height:config.height,
            });
            const tileset = map.addTilesetImage("tiles",null,32,32);

            const TILES = {
                BLANK:167,
                WALL:
                    {
                        TOP: 33,
                        TOP_LEFT: 3,
                        TOP_RIGHT: 5,
                        BOTTOM: 52,
                        BOTTOM_LEFT: 51,
                        BOTTOM_RIGHT: 53,
                        LEFT: 18,
                        RIGHT: 16
                    },
                COORIDOR:92,
                FLOOR:
                    [{index: 90, weight: 4}, {index: [92,93, 105, 104], weight: 6}],
                GROUND:[{index: 222, weight: 4}, {index: [140,157, 173, 187], weight: 6}],
                TRASH:[{index: [70,85,86,102,84,100,70,248,240,242,241], weight: 2},{index:[105,90,104],weight: 6}],
                TRAP:[245,244,243],
                KUSH :272
            }

            const blankLayer = map.createBlankDynamicLayer('BLANK',tileset);
            const floorLayer = map.createBlankDynamicLayer('FLOOR',tileset);
            const TrashLayer = map.createBlankDynamicLayer('TRASH',tileset);
            const StuffLayer = map.createBlankDynamicLayer('Stuff',tileset);

            blankLayer.fill(TILES.BLANK);

            const gen = new generator(map.height,map.width,map.tileHeight,map.tileWidth);
            let rooms = gen.generateRoom();
            this.characterFactory = new CharacterFactory(this);
            this.player = this.characterFactory.buildPlayerCharacter('green',
                            (rooms[0].x + rooms[0].width/2) * map.tileWidth,(rooms[0].y + rooms[0].height/2) *map.tileHeight)
            this.gameObject.push(this.player)



            rooms.forEach(room =>{
                const {x,y,width,height} = room
                floorLayer.weightedRandomize(x,y,width,height,TILES.FLOOR)
                TrashLayer.weightedRandomize(x,y,width,height,TILES.TRASH)

                for (let i = 0 ;i<width/2-1;i++){

                    const npc = this.characterFactory.buildNPCCharacter(
                        "punk",getRandomIntInclusive((room.x * map.tileWidth) + 25,(room.x + room.width) * map.tileWidth),
                        getRandomIntInclusive((room.y* map.tileWidth)+25,(room.y + room.height)* map.tileWidth),{ steering: "wandering",boundary:room}
                    );
                    this.gameObject.push(npc);
                    this.physics.add.collider(npc, floorLayer);
                    this.physics.add.collider(npc, this.player);
                    this.physics.add.overlap(this.player,npc,overlap,null,this)
                    this.physics.add.overlap(npc,this.player,overlap2,null,this)
                    StuffLayer.putTileAt(TILES.TRAP[0],getRandomIntInclusive(room.x,room.x + room.width)
                        ,getRandomIntInclusive(room.y,room.y + room.height))
                }
                //в этим рамках душно го со мной наружу
                /*
                floorLayer.putTileAt(TILES.WALL.TOP_LEFT,x,y);
                floorLayer.fill(TILES.WALL.TOP,x+1,y,width-2,1);
                floorLayer.fill(TILES.WALL.LEFT,x,y+1,1,height-1);
                floorLayer.fill(TILES.WALL.RIGHT,x+width-1,y+1,1,height-1);
                floorLayer.fill(TILES.WALL.BOTTOM,x,y+height,width-1,1);
                floorLayer.putTileAt(TILES.WALL.TOP_RIGHT,x+width-1,y);
                floorLayer.putTileAt(TILES.WALL.BOTTOM_LEFT,x,y + height);
                floorLayer.putTileAt(TILES.WALL.BOTTOM_RIGHT,x+width-1,y + height);
                 */
            })
            rooms.sort((a,b)=>{
                return a.width-b.width;
            })

            for (let i =0;i<3;i++){
                StuffLayer.putTileAt(TILES.KUSH,getRandomIntInclusive(rooms[i].x,rooms[i].x + rooms[i].width-2)
                    ,getRandomIntInclusive(rooms[i].y,rooms[i].y + rooms[i].height-2))
            }

            rooms.sort((a,b)=>{
                return a.y-b.y;
            })
            StuffLayer.putTileAt(TILES.KUSH,getRandomIntInclusive(rooms[0].x,rooms[0].x + rooms[0].width-2)
                ,getRandomIntInclusive(rooms[0].y,rooms[0].y + rooms[0].height-2))
            StuffLayer.putTileAt(TILES.KUSH,getRandomIntInclusive(rooms[rooms.length-1].x,rooms[rooms.length-1].x + rooms[rooms.length-1].width-2)
                ,getRandomIntInclusive(rooms[rooms.length-1].y,rooms[rooms.length-1].y + rooms[rooms.length-1].height-2))

            let coridors = gen.generateСorridors()
            coridors.forEach(cor=>{
                for (let i = 0;i<cor.tilesX.length;i++){
                        let cooridor = [92,93, 105, 104]
                        floorLayer.putTileAt(cooridor[getRandomIntInclusive(0,3)],cor.tilesX[i],cor.tilesY[i]);
                }
            })
            this.physics.add.collider(this.player, StuffLayer);

            StuffLayer.setTileIndexCallback(TILES.TRAP[0],()=>{
                console.log(this.player.HP)
                StuffLayer.culledTiles.forEach(x=>{
                    if((Math.abs(x.x- Math.round(this.player.x/32))<=1) && (Math.abs(x.y- Math.round(this.player.y/32))<=1)){
                        StuffLayer.putTileAt(TILES.TRAP[2], x.x, x.y)
                        this.player.HP --;
                        return
                    }
                })
            })

            StuffLayer.setTileIndexCallback(TILES.KUSH,()=>{
                StuffLayer.culledTiles.forEach(x=>{
                    if((Math.abs(x.x- Math.round(this.player.x/32))<=1) && (Math.abs(x.y- Math.round(this.player.y/32))<=1)){
                        StuffLayer.putTileAt(105, x.x, x.y)
                        this.player.kushCount --;
                        return
                    }
                })
            })


            this.player.setBounceY(0.8)
            this.finder = new EasyStar.js();
            let grid = [];

            for(let y = 0; y < floorLayer.tilemap.height; y++){
                let col = [];
                for(let x = 0; x < floorLayer.tilemap.width; x++) {
                    const tile = floorLayer.tilemap.getTileAt(x, y);
                    col.push(tile ? tile.index : 0);
                }
                grid.push(col);
            }

            this.finder.setGrid(grid);
            this.finder.setAcceptableTiles([0]);
            floorLayer.setCollisionByExclusion([92,93, 105, 104,90])


            this.physics.world.bounds.width = map.widthInPixels;
            this.physics.world.bounds.height = map.heightInPixels;
            this.physics.add.collider(this.player, floorLayer);


            this.cameras.main.setBounds(0,0,this.physics.world.bounds.width,this.physics.world.bounds.height);
            this.cameras.main.startFollow(this.player);
            this.cameras.main.setZoom(4)
            this.cameras.main.shake(1);

            this.input.keyboard.once("keydown_D", event => {
                // Turn on physics debugging to show player's hitbox
                this.physics.world.createDebugGraphic();

                const graphics = this.add
                    .graphics()
                    .setAlpha(0.75)
                    .setDepth(20);
            });
        },
        update:function () {
            if (this.gameObject) {
                this.gameObject.forEach(function (element) {
                    element.update();
                });
            }
        },

        tilesToPixels(tileX, tileY)
        {
            return [tileX*this.tileSize, tileY*this.tileSize];
        }
}
)

function overlap (player, npc)
{
    console.log('му тут')
    npc.disableBody(true, true);
}
function overlap2 (npc,player)
{
    console.log('k')
    npc.disableBody(true, true);
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.round(Math.random() * (max - min ) + min);
}
export default generateLevelScene