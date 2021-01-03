import { config } from './map-config';
import SlimeStates from '../../ai/behaviour/slime_states';
import { StateTable, StateTableRow } from '../../ai/behaviour/state';
import Pursuit from '../../ai/steerings/pursuit';
import Ranaway from '../../ai/steerings/ranaway';
import Wander from '../../ai/steerings/wander';
import Attack from '../../ai/steerings/attack';
import Flee from '../../ai/steerings/flee';
import Chase from '../../ai/steerings/chase';

export default class FillLevel {
    constructor(tilemapper, groundLayer, otherLayer) {
        this.tilemapper = tilemapper;
        this.groundLayer = groundLayer;
        this.otherLayer = otherLayer;
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
            && (this.tileAt(x - 1, y) === null
                || this.tileAt(x - 1, y) === config.FLOOR)
            && (this.tileAt(x + 1, y) === null
                || this.tileAt(x + 1, y) === config.FLOOR)
            && (this.tileAt(x, y - 1) === null
                || this.tileAt(x, y - 1) === config.FLOOR)
            && (this.tileAt(x, y + 1) === null
                || this.tileAt(x, y + 1) === config.FLOOR);
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

        // for (const m of mobs) {
        //     if (this.calcDistance({x,y}, m) < 2) {
        //         return false;
        //     }
        // }
        return true;
    }

    setPlayer() {
        // randomize player position
        let playerX = 10, playerY = 10;

        while (!this.checkFreeSpace(playerX, playerY)) {
            playerX = Phaser.Math.RND.between(0, this.map.length);
            playerY = Phaser.Math.RND.between(0, this.map[0].length);
        }

        this.scene.player = this.scene.characterFactory.buildCharacter('aurora', playerX * this.tilemapper.tilesize, playerY * this.tilemapper.tilesize, { player: true });
        this.scene.gameObjects.push(this.scene.player);
        this.scene.physics.add.collider(this.scene.player, this.groundLayer);
        this.scene.physics.add.collider(this.scene.player, this.otherLayer);
    }

    spaunMobs() {
        const slimes = this.scene.physics.add.group();

        const params = {
            useStates: true,
            createStateTable: this.createSlimesTable(),
            initSteerings: this.initSlimeSteerings(),
            addSlimesConditions: this.addSlimesConditions()
        };

        const slimesAmount = 1;
        for (let i = 0; i < slimesAmount; i++) {
            let x = Phaser.Math.RND.between(0, this.map.length);
            let y = Phaser.Math.RND.between(0, this.map[0].length);

            // while (!this.checkFreeSpaceForMobs(x, y, slimes)) {
            //     x = Phaser.Math.RND.between(0, this.map.length);
            //     y = Phaser.Math.RND.between(0, this.map[0].length);
            // }
            x = this.scene.player.x + 10;
            y = this.scene.player.y + 10;

            if (x < 0 || y < 0) {
                console.log({ x, y })

            }
            params.slimeType = Phaser.Math.RND.between(0, 4);
            const slime = this.scene.characterFactory.buildSlime(x, y, params);
            this.scene.gameObjects.push(slime);

            this.scene.physics.add.collider(slime, this.groundLayer);
            this.scene.physics.add.collider(slime, this.otherLayer);
            slimes.add(slime);
        }
        console.log(slimes)
        this.scene.physics.add.collider(this.scene.player, slimes);
    }

    addSlimesConditions() {
        const that = this;
        return function(slime) {
            slime.isAttacked = false;
            slime.isEnemyClose = function() {
                const enemies = [that.scene.player];
                // add other if needed

                debugger

                for (const enemy of enemies) {
                    const d = Math.sqrt((slime.x - enemy.x)*(slime.x - enemy.x) + (slime.y - enemy.y)*(slime.y - enemy.y));
                    if (d < 35) {
                        slime.steerings[SlimeStates.Attacking].objects = [enemy];
                        return true;
                    }
                }
                return false;
            };
            slime.isEnemyAround = function() {
                const enemies = [that.scene.player];
                // add other if needed

                for (const enemy of enemies) {
                    const d = Math.sqrt((slime.x - enemy.x)*(slime.x - enemy.x) + (slime.y - enemy.y)*(slime.y - enemy.y));
                    if (d < 100) {
                        slime.steerings[SlimeStates.Pursuing].objects = [enemy];
                        return true;
                    }
                }

                return false;
            }
            slime.canWander = function() {
                return !slime.isAttacked && !slime.isEnemyAround();
            }
        }
    }

    createSlimesTable() {
        const that = this;
        return function (slime) {
            slime.stateTable = new StateTable(that.scene);
            slime.stateTable.addState(new StateTableRow(SlimeStates.Searching, () => slime.isAttacked, SlimeStates.Running));
            slime.stateTable.addState(new StateTableRow(SlimeStates.Jumping, () => slime.isAttacked, SlimeStates.Running));
            slime.stateTable.addState(new StateTableRow(SlimeStates.Attacking, () => slime.isAttacked, SlimeStates.Running));
            slime.stateTable.addState(new StateTableRow(SlimeStates.Pursuing, () => slime.isAttacked, SlimeStates.Running));

            slime.stateTable.addState(new StateTableRow(SlimeStates.Searching, slime.isEnemyAround, SlimeStates.Pursuing));
            slime.stateTable.addState(new StateTableRow(SlimeStates.Jumping, slime.isEnemyAround, SlimeStates.Pursuing));

            slime.stateTable.addState(new StateTableRow(SlimeStates.Pursuing, slime.isEnemyClose, SlimeStates.Attacking));

            slime.stateTable.addState(new StateTableRow(SlimeStates.Pursuing, slime.canWander, SlimeStates.Searching));

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
                [SlimeStates.Running]: new Ranaway(slime, [that.scene.player]),
                [SlimeStates.Attacking]: new Attack(slime, []),
            
            };
            slime.steerings = steerings;
        }
    }

}