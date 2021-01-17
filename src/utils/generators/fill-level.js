import { config } from './map-config';
import SlimeStates from '../../ai/behaviour/slime_states';
import NpcStates from '../../ai/behaviour/npc_states';

import { StateTable, StateTableRow } from '../../ai/behaviour/state';
import Pursuit from '../../ai/steerings/pursuit';
import Ranaway from '../../ai/steerings/ranaway';
import Wander from '../../ai/steerings/wander';
import Attack from '../../ai/steerings/attack';
import Flee from '../../ai/steerings/flee';
import Chase from '../../ai/steerings/chase';
import RanawayFromObjects from '../../ai/steerings/ranaway_from_objects';
import ChaseClosest from '../../ai/steerings/chaseClosest';

export default class FillLevel {
    constructor(tilemapper, groundLayer, collideLayer) {
        this.tilemapper = tilemapper;
        this.groundLayer = groundLayer;
        this.collideLayer = collideLayer;
        this.scene = tilemapper.scene;
        this.map = tilemapper.map;
    }

    tileAt(x, y) {
        if (x > 0 && x < this.map.length && y > 0 && y < this.map[0].length) {
            return this.map[x][y];
        }
        return null;
    }

    calcDistance(obj1, obj2) {
        return Math.sqrt((obj1.x - obj2.x) * (obj1.x - obj2.x) + (obj1.y - obj2.y) * (obj1.y - obj2.y));
    }

    checkFreeSpace(x, y) {
        return this.tileAt(x, y) === config.FLOOR
            && this.collideLayer.getTileAt(x, y) === null     // tile itself 
            && (this.tileAt(x - 1, y) === null
                || this.tileAt(x - 1, y) === config.FLOOR)  // left tile
            && (this.tileAt(x + 1, y) === null
                || this.tileAt(x + 1, y) === config.FLOOR)  // right tile
            && ((this.tileAt(x, y - 1) === null
                || this.tileAt(x, y - 1) === config.FLOOR)  // upper tile
                || (this.tileAt(x, y + 1) === null
                    || this.tileAt(x, y + 1) === config.FLOOR)); // lower tile
    }

    checkFreeSpaceForMobs(x, y, mobs) {
        if (x < 0 || y < 0 || x > this.map.length || x > this.map[0].length) {
            return false;
        }
        if (!this.checkFreeSpace(x, y)) {
            return false;
        }
        if (this.calcDistance({ x, y }, this.scene.player.body) < 5) {
            return false;
        }

        for (const m of mobs) {
            if (this.calcDistance({ x, y }, m) < 10) {
                return false;
            }
        }
        return true;
    }

    setPlayer() {
        // randomize player position
        let playerX = 10, playerY = 10;

        while (!this.checkFreeSpace(playerX, playerY)) {
            playerX = Phaser.Math.RND.between(0, this.map.length);
            playerY = Phaser.Math.RND.between(0, this.map[0].length);
        }

        this.scene.player = this.scene.characterFactory.buildCharacter('aurora', playerX * this.tilemapper.tilesize, playerY * this.tilemapper.tilesize, { player: true, withGun: true });
        this.scene.gameObjects.push(this.scene.player);
        this.scene.physics.add.collider(this.scene.player, this.groundLayer);
        this.scene.physics.add.collider(this.scene.player, this.collideLayer);
        this.setupText();
    }

    setupText() {
        this.scoreInfo = this.scene.add.text(0, 0, 'Score: 0 (your) - 0 (opponent)', { font: '32px Arial', fill: '#ff0000' });
				this.scoreInfo.setDepth(11);
        this.score = 0;
				this.scoreNPC = 0;
        this.hpInfo = this.scene.add.text(0, 25, 'HP: 100', { font: '32px Arial', fill: '#ff0000' });
        this.scene.events.on('addScore', () => {
            this.score += 10;
            this.scoreInfo.setText('Score: ' + this.score + ' (your) - ' + this.scoreNPC + ' (opponent)');
        }, this.scene);
				
				this.scene.events.on('addScoreNPC', () => {
					this.scoreNPC += 10;
  				this.scoreInfo.setText('Score: ' + this.score + ' (your) - ' + this.scoreNPC + ' (opponent)');
				}, this.scene);
				
        this.scene.events.on('changeHP', () => {
            this.hpInfo.setText('HP: ' + this.scene.player.hp);
        }, this.scene);
				
				this.scene.events.on('moveCamera', (x,y) => {
					this.scoreInfo.setX(x);
					this.scoreInfo.setY(y);
					this.hpInfo.setX(x);
					this.hpInfo.setY(y + 30);
				}, this.scene);
    }

    initGroups() {
        this.scene.slimes = this.scene.physics.add.group();
        this.scene.npcs = this.scene.physics.add.group();
        this.scene.potions = this.scene.physics.add.group();
        this.scene.gold = this.scene.physics.add.group();

    }

    spawnMobs() {
        const slimes = this.scene.slimes;

        const params = {
            useStates: true,
            createStateTable: this.createSlimesTable(),
            initSteerings: this.initSlimeSteerings(),
            addSlimesConditions: this.addSlimesConditions()
        };

        const slimesAmount = 50;
        for (let i = 0; i < slimesAmount; i++) {
            let x = Phaser.Math.RND.between(0, this.map.length);
            let y = Phaser.Math.RND.between(0, this.map[0].length);

            while (!this.checkFreeSpaceForMobs(x, y, slimes.children.entries)) {
                x = Phaser.Math.RND.between(0, this.map.length);
                y = Phaser.Math.RND.between(0, this.map[0].length);
            }

            x *= this.tilemapper.tilesize;
            y *= this.tilemapper.tilesize;

            // let x = this.scene.player.x + 10;
            // let y = this.scene.player.y + 10;


            params.slimeType = Phaser.Math.RND.between(0, 4);
            const slime = this.scene.characterFactory.buildSlime(x, y, params);
            this.scene.gameObjects.push(slime);

            this.scene.physics.add.collider(slime, this.groundLayer);
            this.scene.physics.add.collider(slime, this.collideLayer);

            slimes.add(slime);
        }
        this.scene.physics.add.collider(this.scene.player, slimes);

        if (this.scene.bullets) {
            this.scene.physics.add.collider(this.scene.bullets, this.collideLayer, (bullet) => {
                if (bullet.active) {
                    bullet.setActive(false);
                    bullet.setVisible(false);
                }
            });
            this.scene.physics.add.collider(this.scene.bullets, slimes, (bullet, slime) => {
                if (bullet.active) {
                    slime.damage(this.scene);
                    bullet.setActive(false);
                    bullet.setVisible(false);
                }
            })
        }
    }

    addSlimesConditions() {
        const that = this;
        const npcs = this.scene.npcs.children.entries;
        return function (slime) {
            slime.isEnemyFiring = function () {
                const enemies = [that.scene.player];
                // add other if needed

                // TODO: Something is broken here, need to fix
                // need to debug
                // slimes are disappearing into the unknown and never come back
                // when the player is shooting

                // for (const enemy of enemies) {
                //     const d = Math.sqrt((slime.x - enemy.x)*(slime.x - enemy.x) + (slime.y - enemy.y)*(slime.y - enemy.y));
                //     if (d < 70 && enemy.isFiring) {
                //         slime.steerings[SlimeStates.Running].objects = [
                //             {...enemy, dangerZone: 40 }
                //         ];
                //         return true;
                //     }
                // }
                return false;
            }

            slime.isEnemyClose = function () {
                const enemies = [that.scene.player,
                    // ...npcs
                ];
                // add other if needed

                for (const enemy of enemies) {
                    const d = Math.sqrt((slime.x - enemy.x) * (slime.x - enemy.x) + (slime.y - enemy.y) * (slime.y - enemy.y));
                    if (d < 45) {
                        slime.steerings[SlimeStates.Attacking].objects = [enemy];
                        return true;
                    }
                }
                return false;
            };
            slime.isEnemyAround = function () {
                const enemies = [that.scene.player,
                    // ...npcs
                ];
                // add other if needed

                for (const enemy of enemies) {
                    const d = Math.sqrt((slime.x - enemy.x) * (slime.x - enemy.x) + (slime.y - enemy.y) * (slime.y - enemy.y));
                    if (d < 100) {
                        slime.steerings[SlimeStates.Pursuing].objects = [enemy];
                        return true;
                    }
                }

                return false;
            }
            slime.canWander = function () {
                return !slime.isAttacked && !slime.isEnemyAround() && !slime.isEnemyFiring();
            }
        }
    }

    createSlimesTable() {
        const that = this;
        return function (slime) {
            slime.stateTable = new StateTable(that.scene);

            slime.stateTable.addState(new StateTableRow(SlimeStates.Searching, () => slime.isDead, SlimeStates.Dead));
            slime.stateTable.addState(new StateTableRow(SlimeStates.Pursuing, () => slime.isDead, SlimeStates.Dead));
            slime.stateTable.addState(new StateTableRow(SlimeStates.Attacking, () => slime.isDead, SlimeStates.Dead));

            slime.stateTable.addState(new StateTableRow(SlimeStates.Searching, slime.isEnemyFiring, SlimeStates.Running));
            slime.stateTable.addState(new StateTableRow(SlimeStates.Jumping, slime.isEnemyFiring, SlimeStates.Running));
            slime.stateTable.addState(new StateTableRow(SlimeStates.Attacking, slime.isEnemyFiring, SlimeStates.Running));
            slime.stateTable.addState(new StateTableRow(SlimeStates.Pursuing, slime.isEnemyFiring, SlimeStates.Running));

            slime.stateTable.addState(new StateTableRow(SlimeStates.Searching, slime.isEnemyAround, SlimeStates.Pursuing));
            slime.stateTable.addState(new StateTableRow(SlimeStates.Jumping, slime.isEnemyAround, SlimeStates.Pursuing));

            slime.stateTable.addState(new StateTableRow(SlimeStates.Pursuing, slime.isEnemyClose, SlimeStates.Attacking));

            slime.stateTable.addState(new StateTableRow(SlimeStates.Pursuing, slime.canWander, SlimeStates.Searching));
						slime.stateTable.addState(new StateTableRow(SlimeStates.Searching, () => slime.canChangeDirect, SlimeStates.Searching));

            slime.stateTable.addState(new StateTableRow(SlimeStates.Attacking, () => !slime.isEnemyClose(), SlimeStates.Pursuing));
            slime.stateTable.addState(new StateTableRow(SlimeStates.Pursuing, () => !slime.isEnemyAround(), SlimeStates.Searching));
        }
    }

    initSlimeSteerings() {
        const that = this;
        return function (slime) {
            let steerings = {
                [SlimeStates.Searching]: new Wander(slime),
                [SlimeStates.Pursuing]: new Chase(slime, []),
                [SlimeStates.Running]: new RanawayFromObjects(slime, [that.scene.player]),
                [SlimeStates.Attacking]: new Attack(slime, []),

            };
            slime.steerings = steerings;
        }
    }

    spawnNpc() {
        const npcs = this.scene.npcs;

        const params = {
            useStates: true,
            createStateTable: this.createNpcTable(),
            initSteerings: this.initNpcSteerings(),
            addConditions: this.addNpcConditions()
        }

        const npcAmount = 1;
        for (let i = 0; i < npcAmount; i++) {
            // let x = Phaser.Math.RND.between(0, this.map.length);
            // let y = Phaser.Math.RND.between(0, this.map[0].length);

            // while (!this.checkFreeSpaceForMobs(x, y, npcs.children.entries)) {
            //     x = Phaser.Math.RND.between(0, this.map.length);
            //     y = Phaser.Math.RND.between(0, this.map[0].length);
            // }

            // x *= this.tilemapper.tilesize;
            // y *= this.tilemapper.tilesize;

            let x = this.scene.player.x + 10;
            let y = this.scene.player.y + 10;


            const npc = this.scene.characterFactory.buildNPCCharacter('punk', x, y, params);
            this.scene.gameObjects.push(npc);

            this.scene.physics.add.collider(npc, this.groundLayer);
            this.scene.physics.add.collider(npc, this.collideLayer);

            npcs.add(npc);
        }
        this.scene.physics.add.collider(this.scene.player, npcs);
        this.scene.physics.add.collider(this.scene.slimes, npcs);
        
    }

    createNpcTable() {
        const that = this;
        return function (npc) {
            npc.stateTable = new StateTable(that.scene);

            npc.stateTable.addState(new StateTableRow(NpcStates.ChasingSlime, npc.canAttackSlime, NpcStates.Attacking));
            npc.stateTable.addState(new StateTableRow(NpcStates.Attacking, () => !npc.canAttackSlime() && npc.slimeIsCloser(), NpcStates.ChasingSlime));
            npc.stateTable.addState(new StateTableRow(NpcStates.ChasingSlime, npc.slimeIsCloser, NpcStates.ChasingSlime));
            
            // npc.stateTable.addState(new StateTableRow(NpcStates.ChasingSlime, npc.goldIsCloser, NpcStates.ChasingObject));
            
            // npc.stateTable.addState(new StateTableRow(NpcStates.Attacking, !npc.canAttackSlime() && npc.goldIsCloser(), NpcStates.ChasingObject));

            // npc.stateTable.addState(new StateTableRow(NpcStates.ChasingSlime, npc.needToHeal, NpcStates.ChasingObject));
            // npc.stateTable.addState(new StateTableRow(NpcStates.Attacking, npc.needToHeal, NpcStates.ChasingObject));

            // npc.stateTable.addState(new StateTableRow(NpcStates.ChasingObject, npc.achievedObject, NpcStates.UseObject));
            // npc.stateTable.addState(new StateTableRow(NpcStates.UseObject, npc.needToHeal, NpcStates.ChasingObject));
            // npc.stateTable.addState(new StateTableRow(NpcStates.UseObject, () => !npc.needToHeal() && npc.slimeIsCloser(), NpcStates.ChasingSlime));
            // npc.stateTable.addState(new StateTableRow(NpcStates.UseObject, () => !npc.needToHeal() && npc.goldIsCloser(), NpcStates.ChasingObject));


            npc.stateTable.addState(new StateTableRow(NpcStates.ChasingSlime, () => npc.isDead, NpcStates.Dead));
            npc.stateTable.addState(new StateTableRow(NpcStates.Attacking, () => npc.isDead, NpcStates.Dead));
            npc.stateTable.addState(new StateTableRow(NpcStates.ChasingObject, () => npc.isDead, NpcStates.Dead));

        }
    }

    initNpcSteerings() {
        const that = this;
        return function (npc) {
            console.log(that)
            let steerings = {
                [NpcStates.ChasingSlime]: new ChaseClosest(npc, that.scene.slimes.children.entries, 80),
                [NpcStates.Attacking]: new Attack(npc, []),
                [NpcStates.ChasingObject]: new ChaseClosest(npc, []) // there will be a group of potions or gold
            };
            npc.steerings = steerings;
        }
    }

    addNpcConditions() {
        const that = this;
        return function (npc) {
            /*
            
            slimeIsCloser:
                find nearest gold
                find nearest slime

                choose what is closer
                if slime => return true, set chasing target to slime 
                set state to chasing slime

            goldIsCloser:
                find nearest gold
                find nearest slime

                choose what is closer
                if gold => return true, set chasing target to gold
                set state to chasing object

            
            */
            npc.slimeIsCloser = function () {
                const slime = ChaseClosest.findNearObject(npc, that.scene.slimes.children.entries);
                const gold = ChaseClosest.findNearObject(npc, that.scene.gold.children.entries);

                if (!slime) {
                    return false;
                }

                if (!gold) {
                    // it should be set already
                    // npc.steerings[NpcStates.ChasingSlime].objects = [slime];
                    npc.target = slime;
                    return true;
                }

                const d1 = ChaseClosest.calculateDistance(npc, slime);
                const d2 = ChaseClosest.calculateDistance(npc, gold);
                if (d1 <= d2) {
                    // npc.steerings[NpcStates.ChasingSlime].objects = [slime];
                    return true;
                }
                return false;
            };

            npc.goldIsCloser = function () {
                const slime = ChaseClosest.findNearObject(npc, that.scene.slimes.children.entries);
                const gold = ChaseClosest.findNearObject(npc, that.scene.gold.children.entries);

                if (!gold) {
                    return false;
                }

                if (!slime) {
                    // i can set the whole array of golds, but do i have to?
                    // npc.steerings[NpcStates.ChasingObject].objects = [gold];
                    npc.steerings[NpcStates.ChasingObject].objects = that.scene.gold.children.entries;
                    npc.target = gold;

                    return true;
                }

                const d1 = ChaseClosest.calculateDistance(npc, gold);
                const d2 = ChaseClosest.calculateDistance(npc, slime);
                if (d1 <= d2) {
                    // npc.steerings[NpcStates.ChasingObject].objects = [gold];
                    npc.steerings[NpcStates.ChasingObject].objects = that.scene.gold.children.entries;
                    npc.target = gold;
                    return true;
                }
                return false;
            };

            npc.canAttackSlime = function () {
                const canAttack = npc.target !== null && ChaseClosest.calculateDistance(npc, npc.target) <= 80;
                // if (npc.target) {
                //     const d = ChaseClosest.calculateDistance(npc, npc.target)
                // }
                if (canAttack) {
                    npc.steerings[NpcStates.Attacking].objects = [npc.target];
                }
                return canAttack;
            };

            npc.needToHeal = function () {
                const needToHeal = npc.hp < 20;
                if (needToHeal) {
                    npc.target = null;
                    npc.steerings[NpcStates.ChasingObject].objects = that.scene.potions.children.entries;
                }
                return needToHeal;
            }
        }
    }
}