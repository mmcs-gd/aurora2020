import { config } from './map-config';
import SlimeStates from '../../ai/behaviour/slime_states';
import NpcStates from '../../ai/behaviour/npc_states';

import { StateTable, StateTableRow } from '../../ai/behaviour/state';
import Wander from '../../ai/steerings/wander';
import Attack from '../../ai/steerings/attack';
import Chase from '../../ai/steerings/chase';
import RanawayFromObjects from '../../ai/steerings/ranaway_from_objects';
import ChaseClosest from '../../ai/steerings/chaseClosest';
import { Gold, Potion, Scroll } from '../../characters/interactive_objects';

export default class FillLevel {
    constructor(tilemapper, groundLayer, collideLayer, upperLayer) {
        this.tilemapper = tilemapper;
        this.groundLayer = groundLayer;
        this.collideLayer = collideLayer;
        this.upperLayer = upperLayer;
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
        if (this.tileAt(x, y) !== config.FLOOR || this.collideLayer.getTileAt(x, y) !== null
            || this.groundLayer.getTileAt(x, y) !== null) {
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

    checkFreeSpaceForObjects(x, y, objects, tries) {
        if (this.tileAt(x, y) !== config.FLOOR
            || this.collideLayer.getTileAt(x, y) !== null
            || this.upperLayer.getTileAt(x, y) !== null) {
            return false;
        }

        const characters = [this.scene.player, this.scene.npc];
        for (const c of characters) {
            if (this.calcDistance({ x, y }, c.body) < 20) {
                return false;
            }
        }
        for (const o of objects) {
            if (tries < 10 && this.calcDistance({ x, y }, o) < 20) {
                return false;
            }
        }
        return true;
    }

    setPlayer() {
        // randomize player position
        let playerX = 10, playerY = 10;

        while (!this.checkFreeSpace(playerX, playerY)) {
            playerX = Phaser.Math.RND.between(0, this.map.length - 1);
            playerY = Phaser.Math.RND.between(0, this.map[0].length - 1);
        }

        this.scene.player = this.scene.characterFactory.buildCharacter('aurora', playerX * this.tilemapper.tilesize, playerY * this.tilemapper.tilesize, { player: true, withGun: true });
        this.scene.gameObjects.push(this.scene.player);
        this.scene.physics.add.collider(this.scene.player, this.groundLayer);
        this.scene.physics.add.collider(this.scene.player, this.collideLayer);
        this.setupText();
    }

    setupText() {
        const style = {
            fontFamily: 'cursive',
            fontSize: '28px',
            fill: '#ffffff',
            backgroundColor: '#00000080'
        };
        this.scoreInfo = this.scene.add.text(0, 0, 'Счёт: 0 (вы) - 0 (соперник)', style);
        this.scoreInfo.setDepth(11);
        this.slimesInfo = this.scene.add.text(0, this.scoreInfo.height, 'Осталось желе: 100', style);
        this.slimesInfo.setDepth(11);
        this.hpInfo = this.scene.add.text(0, this.scoreInfo.height + this.slimesInfo.height, 'HP: 100', style);
        this.hpInfo.setDepth(11);

        this.scene.events.on('addScore', () => {
            const playerScore = this.scene.player.score;
            const npcScore = this.scene.npc.score;
            const slimesAmount = this.scene.slimes.children.entries.length;

            this.scoreInfo.setText('Счёт: ' + playerScore + ' (вы) - ' + npcScore + ' (соперник)');
            this.slimesInfo.setText('Осталось желе: ' + slimesAmount);
            if (slimesAmount === 0) {
                if (playerScore > npcScore) {
                    this.scene.showText(`\nВсе желе-мутанты истреблены!\nВы — самый кровожадный истребитель желе,\nпримите поздравления!\n\nВаш счёт: ${playerScore}, счёт противника: ${npcScore}\n`, 150);
                } else {
                    this.scene.showText(`\nВсе желе-мутанты истреблены!\nВам не удалось опередить соперника...\nМожет, в следующий раз?\n\nВаш счёт: ${playerScore}, счёт противника: ${npcScore}\n`, 150);
                }
            }
        }, this.scene);

        this.scene.events.on('changeHP', () => {
            this.hpInfo.setText('HP: ' + this.scene.player.hp);
        }, this.scene);

        this.scene.events.on('moveCamera', (x, y) => {
            this.scoreInfo.setX(x);
            this.scoreInfo.setY(y);
            this.slimesInfo.setX(x);
            this.slimesInfo.setY(y + this.scoreInfo.height);
            this.hpInfo.setX(x);
            this.hpInfo.setY(y + this.scoreInfo.height + this.slimesInfo.height);
        }, this.scene);
    }

    initGroups() {
        this.scene.slimes = this.scene.physics.add.group();
        this.scene.potions = this.scene.physics.add.group();
        this.scene.gold = this.scene.physics.add.group();
        this.scene.scrolls = this.scene.physics.add.group();
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
            let x = Phaser.Math.RND.between(0, this.map.length - 1);
            let y = Phaser.Math.RND.between(0, this.map[0].length - 1);

            while (!this.checkFreeSpaceForMobs(x, y, slimes.children.entries)) {
                x = Phaser.Math.RND.between(0, this.map.length - 1);
                y = Phaser.Math.RND.between(0, this.map[0].length - 1);
            }

            x *= this.tilemapper.tilesize;
            y *= this.tilemapper.tilesize;

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
                    if (slime.isDead) {
                        bullet.character.addScore(10);
                    }
                    bullet.setActive(false);
                    bullet.setVisible(false);
                }
            })
        }
    }

    addSlimesConditions() {
        const that = this;
        return function (slime) {
            slime.isEnemyFiring = function () {
                const enemies = [that.scene.player, that.scene.npc];

                for (const enemy of enemies) {
                    const d = Math.sqrt((slime.x - enemy.x) * (slime.x - enemy.x) + (slime.y - enemy.y) * (slime.y - enemy.y));
                    if (d < 70 && enemy.isFiring) {
                        slime.steerings[SlimeStates.Running].objects = [
                            { ...enemy, dangerZone: 40 }
                        ];
                        return true;
                    }
                }
                return false;
            }

            slime.isEnemyClose = function () {
                const enemies = [that.scene.player, that.scene.npc];

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
                const enemies = [that.scene.player, that.scene.npc];

                for (const enemy of enemies) {
                    const d = Math.sqrt((slime.x - enemy.x) * (slime.x - enemy.x) + (slime.y - enemy.y) * (slime.y - enemy.y));
                    if (d < 300) {
                        slime.steerings[SlimeStates.Pursuing].objects = [enemy];
                        return true;
                    }
                }

                return false;
            }
            slime.canWander = function () {
                const canWander = !slime.isAttacked && !slime.isEnemyAround() && !slime.isEnemyFiring();
                return canWander;
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
            slime.stateTable.addState(new StateTableRow(SlimeStates.Running, () => slime.isDead, SlimeStates.Dead));


            slime.stateTable.addState(new StateTableRow(SlimeStates.Searching, slime.isEnemyFiring, SlimeStates.Running));
            slime.stateTable.addState(new StateTableRow(SlimeStates.Attacking, slime.isEnemyFiring, SlimeStates.Running));
            slime.stateTable.addState(new StateTableRow(SlimeStates.Pursuing, slime.isEnemyFiring, SlimeStates.Running));

            slime.stateTable.addState(new StateTableRow(SlimeStates.Searching, slime.isEnemyAround, SlimeStates.Pursuing));

            slime.stateTable.addState(new StateTableRow(SlimeStates.Pursuing, slime.isEnemyClose, SlimeStates.Attacking));

            slime.stateTable.addState(new StateTableRow(SlimeStates.Running, slime.canWander, SlimeStates.Searching));
            slime.stateTable.addState(new StateTableRow(SlimeStates.Running, slime.isEnemyAround, SlimeStates.Pursuing));

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
                [SlimeStates.Pursuing]: new Chase(slime, [], 300),
                [SlimeStates.Running]: new RanawayFromObjects(slime, [that.scene.player]),
                [SlimeStates.Attacking]: new Attack(slime, []),

            };
            slime.steerings = steerings;
        }
    }

    spawnNpc() {
        const params = {
            useStates: true,
            createStateTable: this.createNpcTable(),
            initSteerings: this.initNpcSteerings(),
            addConditions: this.addNpcConditions()
        }

        let x = this.scene.player.x;
        let y = this.scene.player.y;


        const npc = this.scene.characterFactory.buildNPCCharacter('punk', x, y, params);
        this.scene.gameObjects.push(npc);
        this.scene.npc = npc;

        this.scene.physics.add.collider(this.scene.npc, this.groundLayer);
        this.scene.physics.add.collider(this.scene.npc, this.collideLayer);

        this.scene.physics.add.collider(this.scene.player, this.scene.npc);
        this.scene.physics.add.collider(this.scene.slimes, this.scene.npc);

    }

    createNpcTable() {
        const that = this;
        return function (npc) {
            npc.stateTable = new StateTable(that.scene);

            npc.stateTable.addState(new StateTableRow(NpcStates.ChasingSlime, npc.canAttackSlime, NpcStates.Attacking));
            npc.stateTable.addState(new StateTableRow(NpcStates.Attacking, () => !npc.canAttackSlime() && npc.slimeIsCloser(), NpcStates.ChasingSlime));
            npc.stateTable.addState(new StateTableRow(NpcStates.ChasingSlime, npc.slimeIsCloser, NpcStates.ChasingSlime));
            npc.stateTable.addState(new StateTableRow(NpcStates.ChasingSlime, npc.goldIsCloser, NpcStates.ChasingObject));

            npc.stateTable.addState(new StateTableRow(NpcStates.Attacking, () => !npc.canAttackSlime() && npc.goldIsCloser(), NpcStates.ChasingObject));
            npc.stateTable.addState(new StateTableRow(NpcStates.ChasingSlime, npc.needToHeal, NpcStates.ChasingObject));
            npc.stateTable.addState(new StateTableRow(NpcStates.Attacking, npc.needToHeal, NpcStates.ChasingObject));
            npc.stateTable.addState(new StateTableRow(NpcStates.ChasingObject, () => !npc.needToHeal() && npc.goldIsCloser(), NpcStates.ChasingObject));
            npc.stateTable.addState(new StateTableRow(NpcStates.ChasingObject, () => !npc.needToHeal() && npc.slimeIsCloser(), NpcStates.ChasingSlime));

            npc.stateTable.addState(new StateTableRow(NpcStates.ChasingSlime, () => npc.isDead, NpcStates.Dead));
            npc.stateTable.addState(new StateTableRow(NpcStates.Attacking, () => npc.isDead, NpcStates.Dead));
            npc.stateTable.addState(new StateTableRow(NpcStates.ChasingObject, () => npc.isDead, NpcStates.Dead));
        }
    }

    initNpcSteerings() {
        const that = this;
        return function (npc) {
            let steerings = {
                [NpcStates.ChasingSlime]: new ChaseClosest(that.scene.finder, npc, that.scene.slimes.children.entries, 80),
                [NpcStates.Attacking]: new Attack(npc, []),
                [NpcStates.ChasingObject]: new ChaseClosest(that.scene.finder, npc, []),
            };
            npc.steerings = steerings;
        }
    }

    addNpcConditions() {
        const that = this;
        return function (npc) {
            npc.slimeIsCloser = function () {
                const slime = ChaseClosest.findNearObject(npc, that.scene.slimes.children.entries);
                const objects = [...that.scene.gold.children.entries, ...that.scene.scrolls.children.entries];
                const object = ChaseClosest.findNearObject(npc, objects);

                if (!slime) {
                    npc.target = null;
                    return false;
                }

                if (!object) {
                    npc.target = slime;
                    return true;
                }

                const d1 = ChaseClosest.calculateDistance(npc, slime);
                const d2 = ChaseClosest.calculateDistance(npc, object);
                if (d1 <= d2) {
                    npc.target = slime;
                    return true;
                }
                return false;
            };

            npc.goldIsCloser = function () {
                const slime = ChaseClosest.findNearObject(npc, that.scene.slimes.children.entries);
                const objects = [...that.scene.gold.children.entries, ...that.scene.scrolls.children.entries];
                const object = ChaseClosest.findNearObject(npc, objects);

                if (!object) {
                    npc.target = null;
                    return false;
                }

                if (!slime) {
                    npc.steerings[NpcStates.ChasingObject].objects = objects;
                    npc.target = object;

                    return true;
                }

                const d1 = ChaseClosest.calculateDistance(npc, object);
                const d2 = ChaseClosest.calculateDistance(npc, slime);
                if (d1 <= d2) {
                    npc.steerings[NpcStates.ChasingObject].objects = objects;
                    npc.target = object;
                    return true;
                }
                return false;
            };

            npc.canAttackSlime = function () {
                const canAttack = npc.target !== null && ChaseClosest.calculateDistance(npc, npc.target) <= 80;
                if (canAttack) {
                    npc.steerings[NpcStates.Attacking].objects = [npc.target];
                }
                return canAttack;
            };

            npc.needToHeal = function () {
                const needToHeal = npc.hp < 70;
                if (needToHeal) {
                    npc.target = null;
                    npc.steerings[NpcStates.ChasingObject].objects = that.scene.potions.children.entries;
                }
                return needToHeal;
            }
        }
    }

    getAllObjects() {
        const gold = this.scene.gold;
        const potions = this.scene.potions;
        const scrolls = this.scene.scrolls;
        return [...gold.children.entries, ...potions.children.entries, ...scrolls.children.entries];
    }

    countFloors(x, y) {
        let neigbors = [this.tileAt(x - 1, y), this.tileAt(x, y - 1), this.tileAt(x + 1, y), this.tileAt(x, y + 1)].filter(o => o === config.FLOOR);
        return neigbors.length;
    }

    isConfigHor(x, y) {
        /* configurations
        0000
        0110
        *11*
        &
        *11*
        0110
        0000			
        */
        return this.tileAt(x, y) === config.FLOOR && (
            this.tileAt(x - 2, y - 1) !== config.FLOOR && this.tileAt(x - 1, y - 1) !== config.FLOOR
            && this.tileAt(x, y - 1) !== config.FLOOR && this.tileAt(x + 1, y - 1) !== config.FLOOR
            && this.tileAt(x - 2, y) !== config.FLOOR && this.tileAt(x - 1, y) === config.FLOOR
            && this.tileAt(x + 1, y) !== config.FLOOR
            && this.tileAt(x - 1, y + 1) === config.FLOOR && this.tileAt(x, y + 1) === config.FLOOR

            ||

            this.tileAt(x - 1, y - 1) === config.FLOOR && this.tileAt(x, y - 1) === config.FLOOR
            && this.tileAt(x - 2, y) !== config.FLOOR && this.tileAt(x - 1, y) === config.FLOOR
            && this.tileAt(x + 1, y) !== config.FLOOR
            && this.tileAt(x - 2, y + 1) !== config.FLOOR && this.tileAt(x - 1, y + 1) !== config.FLOOR
            && this.tileAt(x, y + 1) !== config.FLOOR && this.tileAt(x + 1, y + 1) !== config.FLOOR
        );
    }

    isConfigVert(x, y) {
        /* configurations
        00*
        011
        011
        00*
        &
        *00
        110
        110
        *00
        */
        return this.tileAt(x, y) === config.FLOOR && (
            this.tileAt(x - 1, y - 2) !== config.FLOOR && this.tileAt(x, y - 2) !== config.FLOOR
            && this.tileAt(x - 1, y - 1) !== config.FLOOR && this.tileAt(x, y - 1) === config.FLOOR
            && this.tileAt(x + 1, y - 1) === config.FLOOR
            && this.tileAt(x - 1, y) !== config.FLOOR
            && this.tileAt(x + 1, y) === config.FLOOR
            && this.tileAt(x - 1, y + 1) !== config.FLOOR && this.tileAt(x, y + 1) !== config.FLOOR

            ||

            this.tileAt(x, y - 2) !== config.FLOOR && this.tileAt(x + 1, y - 2) !== config.FLOOR
            && this.tileAt(x - 1, y - 1) === config.FLOOR && this.tileAt(x, y - 1) === config.FLOOR
            && this.tileAt(x + 1, y - 1) !== config.FLOOR
            && this.tileAt(x - 1, y) === config.FLOOR
            && this.tileAt(x + 1, y) !== config.FLOOR
            && this.tileAt(x, y + 1) !== config.FLOOR && this.tileAt(x + 1, y + 1) !== config.FLOOR
        );
    }

    addObjects() {
        const gold = this.scene.gold;
        const potions = this.scene.potions;
        const scrolls = this.scene.scrolls;
        let x = 0; let y = 0;
        for (let i = 0; i < this.map.length; ++i) {
            for (let j = 0; j < this.map[0].length; ++j) {
                x = i * this.tilemapper.tilesize;
                y = j * this.tilemapper.tilesize;
                if (this.map[i][j] === config.FLOOR &&
                    (this.countFloors(i, j) === 1)) {
                    const g = new Gold(this.scene, x, y);
                    gold.add(g);
                } else if (this.isConfigHor(i, j)) {
                    gold.add(new Gold(this.scene, x, y));
                    gold.add(new Gold(this.scene, x - this.tilemapper.tilesize, y));
                } else if (this.isConfigVert(i, j)) {
                    gold.add(new Gold(this.scene, x, y));
                    gold.add(new Gold(this.scene, x, y - this.tilemapper.tilesize));
                }
                else if (this.map[i][j] === config.FLOOR && this.collideLayer.getTileAt(i, j - 1) !== null
                    && this.collideLayer.getTileAt(i - 1, j - 1) !== null && this.upperLayer.getTileAt(i, j - 2) !== null
                    && this.upperLayer.getTileAt(i - 1, j - 2) !== null) {
                    scrolls.add(new Scroll(this.scene, x, y));
                    scrolls.add(new Scroll(this.scene, x - this.tilemapper.tilesize, y));
                }
            }
        }
        this.scene.physics.add.collider(this.scene.player, gold, (player, g) => {
            g.interact(player);
        });
        this.scene.physics.add.collider(this.scene.npc, gold, (npc, g) => {
            g.interact(npc);
        });
        this.scene.physics.add.collider(this.scene.player, scrolls, (player, scroll) => {
            scroll.interact(player);
        });
        this.scene.physics.add.collider(this.scene.npc, scrolls, (npc, scroll) => {
            scroll.interact(npc);
        });

        //--- POTIONS ---
        const potionAmount = 10;
        for (let i = 0; i < potionAmount; i++) {
            let tries = 0;
            x = Phaser.Math.RND.between(0, this.map.length - 1);
            y = Phaser.Math.RND.between(0, this.map[0].length - 1);

            while (tries < 20 && !this.checkFreeSpaceForObjects(x, y, this.getAllObjects(), tries)) {
                if (this.tileAt(x, y) === config.FLOOR)
                    tries += 1;
                x = Phaser.Math.RND.between(0, this.map.length - 1);
                y = Phaser.Math.RND.between(0, this.map[0].length - 1);
            }

            x *= this.tilemapper.tilesize;
            y *= this.tilemapper.tilesize;

            const p = new Potion(this.scene, x, y);
            potions.add(p);
        }
        this.scene.physics.add.collider(this.scene.player, potions, (player, potion) => {
            potion.interact(player);
        });
        this.scene.physics.add.collider(this.scene.npc, potions, (npc, potion) => {
            potion.interact(npc);
        });
    }
}