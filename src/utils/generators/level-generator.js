import CellularAutomata from './cellular-automata'
import RandomWalk from './random-walk'

export default class GeneratorLevel {
    constructor(width, height, config) {
        this.width = width;
        this.height = height;
        this.autoC = config.cellularAutomata;
        this.walkC = config.randomWalk;
    }

    /***
        Два варианта работы клеточного автомата
        1. Клеточный автомат основывается на коридорах randomWalk:
        this.automata.cellmap = temp;  <- устанавливаем начальное состояние
        2. Клеточный автомат творит в начальном состоянии дичь:
        this.automata.cellmap = undefined (либо ничего не пишем, оно и так undefined инициализируется)
        ***/

    createMap() {
        let map = [];
        //1. Сначала запускаем RandomWalk
        const walker = new RandomWalk(this.width, this.height);
        let temp = walker.createMap(this.walkC.maxTunnels, this.walkC.maxLength, this.walkC.minWidth, this.walkC.maxWidth);
        // return temp;

        //2. Запускаем на основе RandomWalk клеточный автомат
        const automataOrder = new CellularAutomata(this.width, this.height, temp,
            this.autoC.chanceToStartAlive);
        map = automataOrder.createMap(3, this.autoC.deathLimit, this.autoC.birthLimit)

        //3. Соединяем маски
        map = this.OR(map, temp);
        // return map;

        //4. Генерируем дикий клеточный автомат
        const automataWild = new CellularAutomata(this.width, this.height, undefined,
            this.autoC.chanceToStartAlive);
        temp = automataWild.createMap(3, 4, 5)

        //5. Снова соединяем и смотрим на дичь
        temp = this.OR(map, temp);

        return temp;
    }

    invert(arr) {
        let map = [];
        for (let x = 0; x < arr.length; ++x) {
            map[x] = [];
            for (let y = 0; y < arr[0].length; ++y)
                map[x][y] = arr[x][y] ? 0 : 1
        }
        return map;
    }


    OR(arr1, arr2) {
        let map = [];
        for (let x = 0; x < arr1.length; ++x) {
            map[x] = [];
            for (let y = 0; y < arr1[0].length; ++y)
                map[x][y] = arr1[x][y] || arr2[x][y] ? 1 : 0
        }
        return map;
    }

    debugMap() {
        let map = [];
        for (let i = 0; i < this.width; ++i) {
            map.push([]);
            for (let j = 0; j < this.height; ++j) {
                map[i].push(0);
            }
        }

        let cw = this.width / 2;
        let ch = this.height / 2;

        // center line
        map[cw - 3][ch] = 1;
        map[cw - 2][ch] = 1;
        map[cw - 1][ch] = 1;
        map[cw][ch] = 1;
        map[cw + 1][ch] = 1;
        map[cw + 2][ch] = 1;
        map[cw + 3][ch] = 1;
        map[cw + 4][ch] = 1;

        // upper line
        map[cw - 3][ch - 1] = 1;
        map[cw - 2][ch - 1] = 1;
        map[cw - 1][ch - 1] = 1;
        map[cw][ch - 1] = 1;
        map[cw + 1][ch - 1] = 1;
        map[cw + 2][ch - 1] = 1;
        map[cw + 3][ch - 1] = 1;
        map[cw + 4][ch - 1] = 1;

        // upper x 2 line
        map[cw - 1][ch - 2] = 1;
        map[cw][ch - 2] = 1;
        map[cw + 1][ch - 2] = 1;

        // lower line
        map[cw - 3][ch + 1] = 1;
        map[cw - 2][ch + 1] = 1;
        map[cw - 1][ch + 1] = 1;
        map[cw][ch + 1] = 1;
        map[cw + 1][ch + 1] = 1;
        map[cw + 2][ch + 1] = 1;
        map[cw + 3][ch + 1] = 1;
        map[cw + 4][ch + 1] = 1;

        // lower x 2 line
        map[cw - 1][ch + 2] = 1;
        map[cw][ch + 2] = 1;
        map[cw + 1][ch + 2] = 1;
        map[cw + 2][ch + 2] = 1;

        // lower x 3 line
        map[cw - 1][ch + 3] = 1;
        map[cw][ch + 3] = 1;
        map[cw + 1][ch + 3] = 1;
        map[cw + 2][ch + 3] = 1;

        return map;

    }
}