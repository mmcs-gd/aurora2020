import {StateTableRow, StateTable} from '../ai/behaviour/state';
import Slime from "./slime";
import Player from "./player";

import NPC from "../characters/npc";
import cyberpunkConfigJson from "../../assets/animations/cyberpunk.json";
import slimeConfigJson from "../../assets/animations/slime.json";
import AnimationLoader from "../utils/animation-loader";
import npc from "./npc";
import Wandering from "../ai/steerings/wandering";
import Arrival from "../ai/steerings/arrival";
import {Bullets} from '../stuff/bullets';
import { PlayerWithGun} from './player_with_gun';
import UserControlled from '../ai/behaviour/user_controlled';

export default class CharacterFactory {
    constructor(scene) {
        this.scene = scene;
        this.cyberSpritesheets =  ['aurora', 'blue', 'yellow', 'green', 'punk'];
        this.slimeSpriteSheet = 'slime';
        const slimeStateTable = new StateTable(this);
        slimeStateTable.addState(new StateTableRow('searching', this.foundTarget, 'jumping'));
        slimeStateTable.addState(new StateTableRow('jumping', this.lostTarget, 'searching'));
        let animationLibrary =  new Map();
        this.cyberSpritesheets.forEach(
            function (element) {
                animationLibrary.set(element, new AnimationLoader(scene,
                    element,
                    cyberpunkConfigJson,
                    element).createAnimations());
            }
        );
        animationLibrary.set(this.slimeSpriteSheet,
                new AnimationLoader(scene, this.slimeSpriteSheet, slimeConfigJson, this.slimeSpriteSheet).createAnimations());
        this.animationLibrary = animationLibrary;
    }

    buildCharacter(spriteSheetName, x, y, params = {}) {
        switch (spriteSheetName) {
            case 'green':
            case 'punk':
            case 'aurora':
            case 'blue':
            case 'punk':
                if (params.player)
                    return this.buildPlayerCharacter(spriteSheetName,x,y);

            case 'yellow':
            case 'green':
              if (params.player)
                return this.buildPlayerCharacter(spriteSheetName, x, y);
              else{
                return this.buildNPCCharacter(spriteSheetName, x, y, params);
              }

            case "slime":
              return this.buildSlime(x, y, params);
        }
    }
	
		buildNPCCharacter(spriteSheetName, x, y, params) {
        let character = new NPC(this.scene, x, y, spriteSheetName, 2);
				if(params.steering){
					character.steering = this.getSteerings(params, character, []);
				}
        character.animationSets = this.animationLibrary.get(spriteSheetName);
        return character;
    }

    buildNpcCharacter(spriteSheetName, x, y,params){
        let character = new npc(this.scene,x,y,spriteSheetName,2,params.Steering)
        character.animationSets = this.animationLibrary.get(spriteSheetName);
        return character;
    }



    buildPlayerCharacter(spriteSheetName, x, y, params = {}) {
        const maxSpeed = 1000;
        let character;
        if (params.withGun) {
            character = new PlayerWithGun(this.scene, x, y, spriteSheetName, 'gun');
            const wasdCursorKeys = this.scene.input.keyboard.addKeys({
                up:Phaser.Input.Keyboard.KeyCodes.W,
                down:Phaser.Input.Keyboard.KeyCodes.S,
                left:Phaser.Input.Keyboard.KeyCodes.A,
                right:Phaser.Input.Keyboard.KeyCodes.D
            });
            character.addBehaviour(new UserControlled(25, wasdCursorKeys));
            this.addBulletsBehaviour(character, Bullets);
        } else if (params.withMagic) {
            character = new PlayerWithMagic(this.scene, x, y, spriteSheetName);
            const wasdCursorKeys = this.scene.input.keyboard.addKeys({
                up:Phaser.Input.Keyboard.KeyCodes.W,
                down:Phaser.Input.Keyboard.KeyCodes.S,
                left:Phaser.Input.Keyboard.KeyCodes.A,
                right:Phaser.Input.Keyboard.KeyCodes.D
            });
            character.addBehaviour(new UserControlled(150, wasdCursorKeys));
            this.addBulletsBehaviour(character, Spells);
        } else {
            character = new Player(this.scene, x, y, spriteSheetName, 2, params);
            character.setCollideWorldBounds(true);
            character.cursors = this.scene.input.keyboard.createCursorKeys();
        }
        character.maxSpeed = maxSpeed;

        character.animationSets = this.animationLibrary.get(spriteSheetName);
        //todo: not here
        character.footstepsMusic = this.scene.sound.add('footsteps', {
            mute: false,
            volume: 1,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: true,
            delay: 0
        });
        //todo uncomment at your won risk - these footsteps will get you insane
        // character.footstepsMusic.play();


        return character;

    }



    addBulletsBehaviour(character, BulletsClass) {
        this.scene.bullets = new BulletsClass(this.scene);
        if (this.scene.groundLayer) {
            this.scene.physics.add.collider(this.scene.bullets, this.scene.groundLayer, (bullet) => {
                bullet.setVisible(false);
                bullet.setActive(false);
            });
        }
        if (this.scene.otherLayer) {
            this.scene.physics.add.collider(this.scene.bullets, this.scene.otherLayer, (bullet) => {
                bullet.setVisible(false);
                bullet.setActive(false);
            });
        }
        const context = this;
        this.scene.input.on('pointerdown', (pointer) => {
            const {x, y} = character.bulletStartingPoint

            character.lastTimeFired = (new Date()).getTime();

            const vx = pointer.x + context.scene.cameras.main.scrollX - x
            const vy = pointer.y + context.scene.cameras.main.scrollY - y

            const BULLET_SPEED = 400
            const mult = BULLET_SPEED / Math.sqrt(vx*vx + vy*vy)
            this.scene.bullets.fireBullet(x, y, vx * mult, vy * mult);
        });
    }

    /*
    buildPlayerCharacter(spriteSheetName, x, y) {
        let character = new Player(this.scene, x, y, spriteSheetName,2);
        character.maxSpeed = 100;
        character.setCollideWorldBounds(true);
        character.cursors = this.scene.input.keyboard.createCursorKeys();
        character.animationSets = this.animationLibrary.get(spriteSheetName);
        //todo: not here
      character.footstepsMusic = this.scene.sound.add('footsteps', {
          mute: false,
          volume: 1,
          rate: 1,
          detune: 0,
          seek: 0,
          loop: true,
          delay: 0
      });
      //todo uncomment at your won risk - these footsteps will get you insane
      //character.footstepsMusic.play();
        return character;

    }

    buildCyberpunkCharacter(spriteSheetName, x, y, params) {
        return this.scene.physics.add.sprite(x, y, spriteSheetName, 2);

        //todo: add mixin
    }
*/



    buildSlime(x, y, params) {
        const slimeType = params.slimeType || 1;
				let slime = new Slime(this.scene, x, y, this.slimeSpriteSheet, 9 * slimeType);
				if(params.steering)
					slime.steering = this.getSteerings(params, slime);
        slime.animations = this.animationLibrary.get(this.slimeSpriteSheet).get(this.slimeNumberToName(slimeType));
        slime.setCollideWorldBounds(true);
        slime.speed = 40;
        return slime;
    }
		
		getSteerings(params, owner){
			switch(params.steering){
				case "wandering": 
					return new Wandering(owner, params.target,1,10,70,params.boundary);
				case "arrival":
					return new Arrival(owner, params.target);
				default:
					return null;
			}
		}
		
    slimeNumberToName(n){
      switch (n) {
        case 0: return 'Blue';
        case 1: return 'Green';
        case 2: return 'Orange';
        case 3: return 'Pink';
        case 4: return 'Violet';
      }
    }
}