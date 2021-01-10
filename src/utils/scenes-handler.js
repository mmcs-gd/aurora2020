import Scene from "./scenes-generator.js"

import Evade from '../ai/steerings/evade'
import TILE_MAPPING from './Tile.js'
import Aggressive from '../ai/aggressive' 
import UserControlled from '../ai/behaviour/user_controlled'
import Vector2 from 'phaser/src/math/Vector2'


class PlayerWithGun extends Phaser.GameObjects.Container {
  constructor(scene, x, y, characterSpriteName, gunSpriteName, countBullet = 10) {
      super(scene, x, y)
      this.setSize(31, 31);
      scene.physics.world.enable(this);
      this.body.setCollideWorldBounds(true);
      scene.add.existing(this);

      this.character = scene.characterFactory.buildCharacter('aurora', 0, 0, {player: true});
      this.gun = new Phaser.GameObjects.Sprite(scene, 2, 8, gunSpriteName);

      this.add(this.character)
      this.add(this.gun)

      this.setViewDirectionAngle(0)

      this.behaviuors = [];
      this.steerings = [];
      this.hp = 100;
      this.radius = 100;
      this.groupId = 0;

      scene.input.on('pointermove', pointer => this._onPointerMove(pointer));

      this.countBullet = countBullet;
  }

  _onPointerMove(pointer) {
      this.setViewDirectionAngle(
          Phaser.Math.Angle.Between(
              this.x + this.gun.x,
              this.y + this.gun.y,
              pointer.x,
              pointer.y
          )
      )
  }

  addBehaviour(behaviour) {
      behaviour.character = this;
      this.behaviuors.push(behaviour);
  }

  update() {
      this.behaviuors.forEach(x => x.update());
      this.updateAnimation();
  };

  get bulletStartingPoint() {
      const angle = this.viewDirectionAngle
      const approxGunWidth = this.gun.width - 2
      const x = this.gun.x + (approxGunWidth * Math.cos(angle));
      const y = this.gun.y + (approxGunWidth * Math.sin(angle));
      return new Vector2(this.x + x, this.y + y)
  }

  setViewDirectionAngle(newAngle) {
      this.viewDirectionAngle = newAngle

      if(newAngle > 1.56 || newAngle < -1.56) {
          this.gun.setFlip(false, true)
          this.gun.setOrigin(0.4, 0.6)
          this.gun.x = -6
      } else {
          this.gun.setFlip(false, false)
          this.gun.setOrigin(0.4, 0.4)
          this.gun.x = 6
      }
      this.gun.setRotation(newAngle)
  }

  updateAnimation() {
      try {
          const animations = this.animationSets.get('WalkWithGun');
          const animsController = this.character.anims;
          const angle = this.viewDirectionAngle

          if (angle < 0.78 && angle > -0.78) {
              this.gun.y = 8
              this.bringToTop(this.gun)
              animsController.play(animations[1], true);
          } else if (angle < 2.35 && angle > 0.78) {
              this.gun.y = 8
              this.bringToTop(this.gun)
              animsController.play(animations[3], true);
          } else if (angle < -2.35 || angle > 2.35) {
              this.gun.y = 8
              this.bringToTop(this.gun)
              animsController.play(animations[0], true);
          } else if (angle > -2.35 && angle < -0.78) {
              this.gun.y = -4
              this.bringToTop(this.character)
              animsController.play(animations[2], true);
          } else {
              const currentAnimation = animsController.currentAnim;
              if (currentAnimation) {
                  const frame = currentAnimation.getLastFrame();
                  this.character.setTexture(frame.textureKey, frame.textureFrame);
              }
          }
      } catch (e) {
          //console.error('[PlayerWithGun] updateAnimation failed')
      }
  }
}

class Bullet extends Phaser.Physics.Arcade.Sprite
{
  constructor (scene, x, y)
  {
      super(scene, x, y, 'bullet');
  }

  fire (x, y, vx, vy)
  {
      this.body.reset(x, y);
      this.body.mass = 3;

      this.setActive(true);
      this.setVisible(true);

      this.setVelocityX(vx);
      this.setVelocityY(vy);
  }

  preUpdate (time, delta)
  {
      super.preUpdate(time, delta);
  }
}

class Bullets extends Phaser.Physics.Arcade.Group
{
  constructor (scene)
  {
      super(scene.physics.world, scene);

      this.createMultiple({
          frameQuantity: 20,
          key: 'bullet',
          active: false,
          visible: false,
          classType: Bullet
      });
  }

  fireBullet(x, y, vx, vy)
  {
      let bullet = this.getFirstDead(false);

      if (bullet)
      {
          bullet.fire(x, y, vx, vy);
      }
  }
}

class Hint extends Phaser.Scene {
    constructor(x = 0, y = 0, text = '', time = 2000) {
        super();
        this.pos = {x, y};
        this.text = text;
        this.ttl = time;

        this._index = Phaser.Math.RND.integer();
    }

    get index() {
        return this._index;
    }

    preload() {
        this._startTime = this.time.now;
    }

    create() {
        const pos = this.pos;
        this._drawingText = this.add.text(
            pos.x, pos.y,
            this.text,
            {
                fill: '#fff',
                backgroundColor: '#333',
                padding: {
                    x : 8,
                    y : 8
                },
                alpha : 0
            }
        );

        this.tweens.add({
            targets: this._drawingText,
            alpha: {from : 0, to : 1},
            y: '+=4',
            ease: 'Linear',
            duration: 200,
            repeat: 0
        });

        this.tweens.add({
            targets: this._drawingText,
            alpha: {from : 1, to : 0},
            ease: 'Linear',
            y: '+=4',
            delay: this.ttl - 400,
            duration: 200,
            repeat: 0
        });
    }

    update(time) {
        if (time > this._startTime + this.ttl) {
            this.scene.remove(this);
        }
    }
}

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
            {
              if (Math.random() > 0.98)
                floorLayer.putTileAt(TILE_MAPPING.FLOOR.BROKEN, x, y); // floor
              else
                floorLayer.putTileAt(TILE_MAPPING.FLOOR.USUALY, x, y); // floor
            }

    
    let flag = true;
    let ammoPlace = {x: -1, y: -1};
    //console.log(level)
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

        //добавим рандомные объекты
        if (Math.random() >= 0.7)
        {
          let rand_X = x + Math.floor(Math.random() * 3) + 1;
          let rand_Y = y + Math.floor(Math.random() * 3) + 1;
          
          groundLayer.putTileAt(TILE_MAPPING.TOWER.TAIL,
            (rand_X < w ? rand_X: rand_X - 1),
            (rand_Y < h ? rand_Y: rand_Y - 1));

            groundLayer.putTileAt(TILE_MAPPING.TOWER.HEAD,
              (rand_X < w ? rand_X: rand_X - 1),
              (rand_Y -1  < h ? rand_Y -1: rand_Y -1 - 1));

        }

        if (Math.random() >= 0.6)
        {

          let rand_X = x + Math.floor(Math.random() * 3) + 1;
          let rand_Y = y + Math.floor(Math.random() * 3) + 1;

          ammoPlace = {x: rand_X * 32, y: rand_Y * 32};
          groundLayer.putTileAt(TILE_MAPPING.AMMO,
            (rand_X < w ? rand_X: rand_X - 1),
            (rand_Y < h ? rand_Y: rand_Y - 1));
        }

        if (Math.random() >= 0.5)
        {

          let rand_X = x + Math.floor(Math.random() * 3) + 1;
          let rand_Y = y + Math.floor(Math.random() * 3) + 1;

          groundLayer.putTileAt(TILE_MAPPING.TRASH,
            (rand_X < w ? rand_X: rand_X - 1),
            (rand_Y < h ? rand_Y: rand_Y - 1));
        }
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

        scene.player = new PlayerWithGun(scene, palyerSpawnX, palyerSpawnY, 'aurora', 'gun')
        scene.player.animationSets = scene.characterFactory.animationLibrary.get('aurora');

        const wasdCursorKeys = scene.input.keyboard.addKeys({
          up:Phaser.Input.Keyboard.KeyCodes.W,
          down:Phaser.Input.Keyboard.KeyCodes.S,
          left:Phaser.Input.Keyboard.KeyCodes.A,
          right:Phaser.Input.Keyboard.KeyCodes.D
      });

        scene.player.addBehaviour(new UserControlled(150, wasdCursorKeys));

        //scene.player = scene.characterFactory.buildCharacter("aurora", palyerSpawnX, palyerSpawnY, {player: true});
       // scene.gameObjects.push(scene.player);
        scene.physics.add.collider(scene.player, groundLayer);
        scene.physics.add.collider(scene.player, OtherSubjLayer);


        // Bullets handling
        scene.bullets = new Bullets(scene);
        scene.physics.add.collider(scene.bullets, groundLayer, (bullet) => {
            bullet.setVisible(false);
            bullet.setActive(false);
        });

        scene.physics.add.collider(scene.bullets, OtherSubjLayer, (bullet) => {
          bullet.setVisible(false);
          bullet.setActive(false);
      });

        scene.input.on('pointerdown', (pointer) => {
            if (scene.player.countBullet > 0)
            {
                const {x, y} = scene.player.bulletStartingPoint

                const vx = pointer.x - x
                const vy = pointer.y - y

                const BULLET_SPEED = 400
                const mult = BULLET_SPEED / Math.sqrt(vx*vx + vy*vy)

                scene.bullets.fireBullet(x, y, vx * mult, vy * mult);
                
                scene.player.countBullet--;
                const hint = new Hint(80, 32, 'Count ammo ' + scene.player.countBullet, 300);
                try {
                    scene.scene.add('HintScene_' + hint.index, hint, true);
                } catch (error) { /* Error: Cannot add a Scene with duplicate key */ }
            }
            else
            {
                const hint = new Hint(80, 32, 'No ammo', 2000);
                try {
                    scene.scene.add('HintScene_' + hint.index, hint, true);
                } catch (error) { /* Error: Cannot add a Scene with duplicate key */ }
            }
        });


        //// Добавим что-нибудь

        // Берем рандомную комнату для добавления персонажа, его ещё найти надо будет
        let randdd = Math.floor(Math.random() * rooms.length) + 1
        //console.log(rooms.length, randdd)
        let randomRoom = rooms[randdd == rooms.length? randdd - 1 : randdd]

        let npcX
        let npcY
        npcX = randomRoom.startCenter.x * 32 + 10;
        npcY = randomRoom.startCenter.y * 32 + 10;


        scene.evader = scene.characterFactory.buildCharacter('green', npcX, npcY);
        scene.evader.setAI(new Aggressive(scene.evader, [scene.player]), 'idle');
        scene.gameObjects.push(scene.evader);
        scene.physics.add.collider(scene.evader, groundLayer);
        scene.physics.add.collider(scene.evader, OtherSubjLayer);
        scene.physics.add.collider(scene.evader, scene.player, scene.onNpcPlayerCollide.bind(scene));

        scene.evader1 = scene.characterFactory.buildCharacter('green', npcX + 12, npcY + 12);
        scene.evader1.setAI(new Aggressive(scene.evader1, [scene.player]), 'idle');
        scene.gameObjects.push(scene.evader1);
        scene.physics.add.collider(scene.evader1, groundLayer);
        scene.physics.add.collider(scene.evader1, OtherSubjLayer);
        scene.physics.add.collider(scene.evader1, scene.player, scene.onNpcPlayerCollide.bind(scene));

        scene.evader2 = scene.characterFactory.buildCharacter('green', npcX + 15, npcY + 22);
        scene.evader2.setAI(new Aggressive(scene.evader2, [scene.player]), 'idle');
        scene.gameObjects.push(scene.evader2);
        scene.physics.add.collider(scene.evader2, groundLayer);
        scene.physics.add.collider(scene.evader2, OtherSubjLayer);
        scene.physics.add.collider(scene.evader2, scene.player, scene.onNpcPlayerCollide.bind(scene));

        //Можно накидать всё что в голову придёт, но в tileset мало интересного
        ////


        // добавим цель
        let win = {x: -1, y: -1};
        if (Math.random() > 0.84)
        {
            let winRoom = rooms[rooms.length - 2];

            groundLayer.putTileAt(TILE_MAPPING.CHEST, winRoom.startCenter.x, winRoom.startCenter.y);


            floorLayer.putTileAt(TILE_MAPPING.FLOOR.BLACK, winRoom.startCenter.x, winRoom.startCenter.y)

            floorLayer.putTileAt(TILE_MAPPING.FLOOR.BLACK, winRoom.startCenter.x, winRoom.startCenter.y + 1)
            floorLayer.putTileAt(TILE_MAPPING.FLOOR.BLACK, winRoom.startCenter.x, winRoom.startCenter.y - 1)

            floorLayer.putTileAt(TILE_MAPPING.FLOOR.BLACK, winRoom.startCenter.x + 1, winRoom.startCenter.y)
            floorLayer.putTileAt(TILE_MAPPING.FLOOR.BLACK, winRoom.startCenter.x - 1, winRoom.startCenter.y)


            win = {x: winRoom.startCenter.x * 32 + 10,
                   y: winRoom.startCenter.y * 32 + 10};
         }
        
        let endRoom = rooms[rooms.length - 1];
        groundLayer.putTileAt(TILE_MAPPING.STAIRS, endRoom.startCenter.x, endRoom.startCenter.y);
        //floorLayer.putTileAt(TILE_MAPPING.BLANK, endRoom.startCenter.x, endRoom.startCenter.y);
        let goal = {x: endRoom.startCenter.x  * 32 + 10, y: endRoom.startCenter.y * 32 + 10 }
        //

        // Меняем настройки камеры, а так же размер карты
        const camera = scene.cameras.main;
        camera.setZoom(1.0)
        scene.physics.world.setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels, true, true, true, true);
        camera.setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels);
        camera.startFollow(scene.player);
        // 
        
        groundLayer.setCollisionBetween(1, 500);
        OtherSubjLayer.setDepth(10);


        //console.log(scene.gameObjects)
        // Slime damage
        scene.physics.add.collider(scene.bullets, scene.gameObjects, (npc, bullet) => {
          if (bullet.active) 
          { 
              //console.log(bullet, npc)
              npc.damage()
              bullet.setActive(false)
              bullet.setVisible(false)
          }
      });
      return {"Ground" : groundLayer, "OtherSubj" : OtherSubjLayer, "Floor" : floorLayer, "Goal": goal, "Win": win, "Ammo": ammoPlace}
};