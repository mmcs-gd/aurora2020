import {StateTable, StateTableRow} from '../behaviour/state'
import Chase from "../steerings/chase";
import Exploring from "../steerings/exploring";

const tints =
{
 0: 0xffffff,
 1: 0xff9999,
 2: 0xff4c4c,
 3: 0xcc0000,
 4: 0x4c0000,
}

function randomInt(min, max)
{
    return (Math.random() * (max - min + 1)) | 0 + min
}

export default class Merger{
    constructor(owner, player, powerLevell) {
        const powerLevel = powerLevell || randomInt(0, 2);
        if (powerLevel > 4)
        {
            powerLevel = 4
        }
        //console.log(powerLevel)
        owner.maxSpeed = ((powerLevel * 0.12) + 0.3) * player.maxSpeed;
        owner.tint = 0xbfff00
        this.table = new StateTable({
            me: owner,
            npcs: [],
            player: player,
            selectedEnemy: null,
            distance: 200,
            timer: 0,
            powerLevel: powerLevel,
            realTint: tints[powerLevel],
        });
        owner.isFriendly = true;
        
        /*this.table.addState(new StateTableRow('idle',
            this.playerNear,
            'follow',
            this.onStartFollowingPlayer));
        
        
        this.table.addState(new StateTableRow('idle',
            this.npcNear,
            'merge',
            this.onStartMerge));*/
        
        this.table.addState(new StateTableRow('idle',
            this.waitedEnough,
            'research',
            this.onStartResearch));
        
        this.table.addState(new StateTableRow('research',
            this.playerNear,
            'follow',
            this.onStartFollowingPlayer));
        
        this.table.addState(new StateTableRow('research',
            this.npcNear,
            'merge',
            this.onStartMerge));
        
        this.table.addState(new StateTableRow('follow',
            this.playerFar,
            'idle',
            this.onStopFollowingPlayer));
        
        this.table.addState(new StateTableRow('follow',
            this.npcNear,
            'merge',
            this.onStartMerge));
        
        this.table.addState(new StateTableRow('merge',
            this.npcFar,
            'idle',
            this.onStopMerge));
        
        this.table.addState(new StateTableRow('merge',
            this.waitedEnough,
            'rage',
            this.onStartRage));
        
        this.table.addState(new StateTableRow('rage',
            this.waitedEnough,
            'idle',
            this.onStopRage));
    }
    
    addNpcs(newNpcs)
    {
        for (let newNpc of newNpcs)
        {
            this.table.context.npcs.push(newNpc)
        }
    }
    
    deleteNpc(npc)
    {
        this.table.context.npcs.splice(this.table.context.npcs.indexOf(npc), 1)
    }
    
    update(state){
        const context = this.table.context;
        context.timer += 1;
        return this.table.getNextState(state);
    }

    playerNear() {
        const context = this;
        return context.player.body.position.distance(context.me.body.position) <= context.distance;
    }

    playerFar() {
        const context = this;
        return context.player.body.position.distance(context.me.body.position) > context.distance;
    }
    
    npcNear() {
        const context = this;
        //console.log(context.npcs)
        return context.npcs.some(n => n.body.position.distance(context.me.body.position) <= context.distance)
    }

    npcFar() {
        const context = this;
        return context.npcs.every(n => n.body.position.distance(context.me.body.position) > context.distance)
    }

    onStartFollowingPlayer() {
        const context = this;
        context.me.isFriendly = false;
        context.me.tint = context.realTint
        context.me.steering = new Chase(context.me, [context.player], 1, context.distance);
        this.timer = 0;
    }

    onStopFollowingPlayer() {
        const context = this;
        context.me.isFriendly = true;
        context.me.tint = 0xbfff00
        context.me.steering = null
        context.timer = -80;
    }
    
    onStartMerge() {
        const context = this;
        context.me.isFriendly = true;
        context.me.tint = 0xbfff00
        const targets = context.npcs.filter(x =>
            x.body.position.distance(context.me.body.position) <= context.distance)
        const target = targets.reduce(function(previousValue, currentValue, index, array) {
            return currentValue.body.position.distance(context.me.body.position) < previousValue.body.position.distance(context.me.body.position) ? currentValue : previousValue;
        });
        context.me.steering = new Chase(context.me, [target], 1, context.distance);
        this.timer = -160;
    }

    onStopMerge() {
        const context = this;
        context.me.isFriendly = true;
        context.me.steering = null
        context.timer = 0;
    }

    waitedEnough() {
        const context = this;
        return context.timer > 80;
    }

    onStartResearch() {
        const context = this;
        context.me.tint = context.realTint
        context.me.isFriendly = false;
        context.me.steering = new Exploring(context.me, 1, 20);
        context.timer = 0;
    }
    
    onStartRage() {
        const context = this;
        context.me.tint = 0x000000
        context.me.isFriendly = false;
        context.me.maxSpeed = context.me.maxSpeed * 1.5
        context.me.steering = new Chase(context.me, [context.player], 1, context.distance * 8);
        context.timer = 0;
    }
    
    onStopRage() {
        const context = this;
        context.me.tint = 0xbfff00
        context.me.isFriendly = true;
        context.me.maxSpeed = context.me.maxSpeed / 1.5
        context.me.steering = null
        context.timer = -100;
    }
}
