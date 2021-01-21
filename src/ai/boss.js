import {StateTable, StateTableRow} from './behaviour/state'
//import Pursuit from "./steerings/pursuit";
//import Chase from "./steerings/chase";
//import Exploring from "./steerings/exploring";

// модель поведения босса
export default class BossAI{
    constructor(owner, targets) {
        this.table = new StateTable({
            me: owner,
            targets: targets,
            selectedEnemy: null,
            distance: 200,
            timer: 0
        });
    }
    update(state){
      this.table.context.timer += 1;
      return this.table.getNextState(state);
    }

    // босс призывает желешки. желешек столько же сколько игроков
    // каждая желешка атакует своего игрока
}