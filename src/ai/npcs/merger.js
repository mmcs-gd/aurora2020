import {StateTable, StateTableRow} from '../behaviour/state'
import Chase from "../steerings/chase";
import Exploring from "../steerings/exploring";

export default class Merger{
    constructor(owner, npcs, player) {
        this.table = new StateTable({
            me: owner,
            npcs: npcs,
            player: player,
            selectedEnemy: null,
            distance: 200,
            timer: 0
        });

        this.table.addState(new StateTableRow('idle',
            this.playerNear,
            'follow',
            this.onStartFollowingPlayer));
        
        this.table.addState(new StateTableRow('idle',
            this.npcNear,
            'merge',
            this.onStartMerge));
        
        this.table.addState(new StateTableRow('idle',
            this.waitedEnough,
            'research',
            this.onStartResearch));
        
        this.table.addState(new StateTableRow('research',
            this.playerNear,
            'follow',
            this.onStartFollowingPlayer));
        
        this.table.addState(new StateTableRow('research',
            this.playerNear,
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
        return context.npcs.some(n => n.body.position.distance(context.me.body.position) <= context.distance)
    }

    npcFar() {
        const context = this;
        return context.npcs.every(n => n.body.position.distance(context.me.body.position) > context.distance)
    }

    onStartFollowingPlayer() {
        const context = this;
        context.me.maxSpeed = 100;
        context.me.steering = new Chase(context.me, [context.player], 1, context.distance);
        this.timer = 0;
    }

    onStopFollowingPlayer() {
        const context = this;
        context.me.steering = null
        context.timer = 0;
    }
    
    onStartMerge() {
        const context = this;
        const targets = context.npcs.filter(x =>
            x.body.position.distance(context.me.body.position) <= context.distance)
        const target = targets.reduce(function(previousValue, currentValue, index, array) {
            return currentValue.body.position.distance(context.me.body.position) < previousValue.body.position.distance(context.me.body.position) ? currentValue : previousValue;
        });
        context.me.maxSpeed = 100;
        context.me.steering = new Chase(context.me, [target], 1, context.distance);
        this.timer = 0;
    }

    onStopMerge() {
        const context = this;
        context.me.steering = null
        context.timer = 0;
    }

    waitedEnough() {
        const context = this;
        return context.timer > 120;
    }

    onStartResearch() {
        const context = this;
        context.me.steering = new Exploring(context.me, 1, 20);
        context.timer = 0;
    }
}
