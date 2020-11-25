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

    buildNpcCharacter(animation,spriteSheetName, x, y,params){
        let character = new npc(this.scene,x,y,spriteSheetName,2,params.Steering)
        character.animationSets = this.animationLibrary.get(animation);
        return character;
    }
    buildPlayerCharacter(spriteSheetName, x, y) {
        let character = new Player(this.scene, x, y, spriteSheetName,2);
        character.maxSpeed = 100;
        character.setCollideWorldBounds(true);
        character.cursors = this.scene.input.keyboard.createCursorKeys();
        character.animationSets = this.animationLibrary.get('aurora');
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
					return new Wandering(owner, params.target);
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