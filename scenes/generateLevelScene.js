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

import gunPng from '../assets/sprites/stuff/gun.png'
import bulletPng from '../assets/sprites/stuff/bullet.png'
import cursorCur from '../assets/sprites/stuff/cursor.cur'
import UserControlled from "../src/ai/behaviour/user_controlled";
import {PlayerWithGun} from "../src/characters/player_with_gun";
import {Bullet} from "../src/stuff/bullet";
import {Bullets} from "../src/stuff/Bullets";

import wandering from "../src/ai/steerings/wandering";

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

            this.load.image("gun", gunPng);
            this.load.image("bullet", bulletPng);

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
            this.input.setDefaultCursor(`url(${cursorCur}), pointer`);
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
            const groundLayer = map.createBlankDynamicLayer('GROUND',tileset);
            const TrashLayer = map.createBlankDynamicLayer('TRASH',tileset);
            const StuffLayer = map.createBlankDynamicLayer('Stuff',tileset);

            blankLayer.fill(TILES.BLANK);

            const gen = new generator(map.height,map.width,map.tileHeight,map.tileWidth);
            let enemies = []
            let rooms = gen.generateRoom();
            this.characterFactory = new CharacterFactory(this);

            const playerX = (rooms[0].x + rooms[0].width/2) * map.tileWidth
            const playerY = (rooms[0].y + rooms[0].height/2) * map.tileHeight
            this.playerWithGun = new PlayerWithGun(this, playerX, playerY, 'aurora', 'gun')
            this.playerWithGun.animationSets = this.characterFactory.animationLibrary.get('aurora');

            rooms.forEach(room =>{
                const {x,y,width,height} = room
                groundLayer.weightedRandomize(x,y,width,height,TILES.FLOOR)
                TrashLayer.weightedRandomize(x,y,width,height,TILES.TRASH)

                for (let i = 0 ;i<width/2-1;i++){

                    const npc = this.characterFactory.buildCharacter(
                        "punk",getRandomIntInclusive((room.x * map.tileWidth) + 25,(room.x + room.width) * map.tileWidth),
                        getRandomIntInclusive((room.y* map.tileWidth)+25,(room.y + room.height)* map.tileWidth),{withGun:true,boundary:room});
                    enemies.push(npc)
                    this.gameObject.push(npc);
                    this.physics.add.collider(npc, groundLayer);
                    StuffLayer.putTileAt(TILES.TRAP[0],getRandomIntInclusive(room.x,room.x + room.width)
                        ,getRandomIntInclusive(room.y,room.y + room.height))
                }
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
                    groundLayer.putTileAt(cooridor[getRandomIntInclusive(0,3)],cor.tilesX[i],cor.tilesY[i]);
                }
            })


            StuffLayer.setTileIndexCallback(TILES.TRAP[0],(obj,tile)=>{
                StuffLayer.putTileAt(TILES.TRAP[2], tile.x, tile.y)
                this.playerWithGun.HP = this.playerWithGun.HP-10;
            })

            StuffLayer.setTileIndexCallback(TILES.KUSH,(obj,tile)=>{
                StuffLayer.putTileAt(105, tile.x, tile.y)
                this.playerWithGun.kushCount ++;
            })

            this.finder = new EasyStar.js();
            let grid = [];

            for(let y = 0; y < groundLayer.tilemap.height; y++){
                let col = [];
                for(let x = 0; x < groundLayer.tilemap.width; x++) {
                    const tile = groundLayer.tilemap.getTileAt(x, y);
                    col.push(tile ? tile.index : 0);
                }
                grid.push(col);
            }

            this.finder.setGrid(grid);
            this.finder.setAcceptableTiles([0]);
            groundLayer.setCollisionByExclusion([92,93, 105, 104,90])


            this.physics.world.bounds.width = map.widthInPixels;
            this.physics.world.bounds.height = map.heightInPixels;



            // Player


            const wasdCursorKeys = this.input.keyboard.addKeys({
                up:Phaser.Input.Keyboard.KeyCodes.W,
                down:Phaser.Input.Keyboard.KeyCodes.S,
                left:Phaser.Input.Keyboard.KeyCodes.A,
                right:Phaser.Input.Keyboard.KeyCodes.D
            });

            this.playerWithGun.addBehaviour(new UserControlled(150, wasdCursorKeys));
            this.gameObject.push(this.playerWithGun);
            this.physics.add.collider(this.playerWithGun, groundLayer);
            this.physics.add.collider(this.playerWithGun, StuffLayer);

            // Bullets handling
            this.bullets = new Bullets(this);
            this.physics.add.collider(this.bullets, groundLayer, (bullet) => {
                bullet.setVisible(false);
                bullet.setActive(false);
            });
            this.physics.add.collider(this.bullets, enemies, (bullet, n) => {
                if (n.active) {
                    bullet.damage(this.scene);
                    n.setActive(false);
                    n.setVisible(false);
                }
            })
            this.physics.add.collider(this.bullets, this.playerWithGun, ( player,bullet) => {
                if (bullet.active) {
                    player.damage();
                    bullet.setActive(false);
                    bullet.setVisible(false);
                }
            })



            this.input.on('pointerdown', (pointer) => {
                const {x, y} = this.playerWithGun.bulletStartingPoint
                const vx = pointer.x - x
                const vy = pointer.y - y
                const BULLET_SPEED = 200
                const mult = BULLET_SPEED / Math.sqrt(vx*vx + vy*vy)
                this.bullets.fireBullet(x, y, vx * mult, vy * mult);
            });



            //this.cameras.main.setBounds(0,0,this.physics.world.bounds.width,this.physics.world.bounds.height);
            //this.cameras.main.setZoom(2)
            //this.cameras.main.startFollow(this.playerWithGun);

            /*
            this.input.keyboard.once("keydown_D", event => {
                // Turn on physics debugging to show player's hitbox
                this.physics.world.createDebugGraphic();

                const graphics = this.add
                    .graphics()
                    .setAlpha(0.75)
                    .setDepth(20);
            });*/
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


function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.round(Math.random() * (max - min ) + min);
}
export default generateLevelScene