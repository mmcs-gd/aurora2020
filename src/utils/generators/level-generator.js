import CellularAutomata from './cellular-automata'
import RandomWalk from './random-walk'

const TILE_MAPPING = {
    BLANK: 17,
    WALL: {
        TOP_LEFT: 3,
        TOP_RIGHT: 5,
        BOTTOM_RIGHT: 53,
        BOTTOM_LEFT: 51,
        TOP: 14,
        LEFT: 18,
        RIGHT: 16,
        BOTTOM: 52
    },
    FLOOR: 95,
};

export default class GeneratorLevel {
    constructor(width, height, config, scene) {
        this.width = width;
        this.height = height;
        this.autoC = config.cellularAutomata;
        this.walkC = config.randomWalk;
        this.scene = scene;
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

    generateLevel() {
        const map = this.createMap();
        const tilesize = 32;
        this.scene.map = this.scene.make.tilemap({
            tileWidth: tilesize,
            tileHeight: tilesize,
            width: this.width,
            height: this.height
        });

        const tileset = this.scene.map.addTilesetImage("tiles", null, tilesize, tilesize);
        const floorLayer = this.scene.map.createBlankDynamicLayer("Floor", tileset);
        const groundLayer = this.scene.map.createBlankDynamicLayer("Ground", tileset);
        const otherLayer = this.scene.map.createBlankDynamicLayer("Other", tileset);

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (map[y][x] === 0)
                    groundLayer.putTileAt(TILE_MAPPING.BLANK, x, y); // BLANK
                else
                    floorLayer.putTileAt(TILE_MAPPING.FLOOR, x, y); // floor
            }
        }

        // randomize player position
        let playerX = 10, playerY = 10;

        while (map[playerY][playerX] === 0) {
            playerX = Math.floor(Math.random() * map.length);
            playerY = Math.floor(Math.random() * map[0].length);            
        }
        
        this.scene.player = this.scene.characterFactory.buildCharacter('punk', playerX*tilesize, playerY*tilesize, { player: true });
        this.scene.physics.add.collider(this.scene.player, groundLayer);
        this.scene.physics.add.collider(this.scene.player, otherLayer);

        const camera = this.scene.cameras.main;
        camera.setZoom(1.0);
        this.scene.physics.world.setBounds(0, 0, this.scene.map.widthInPixels, this.scene.map.heightInPixels, true);
        camera.setBounds(0, 0, this.scene.map.widthInPixels, this.scene.map.heightInPixels);
        camera.startFollow(this.scene.player);

        groundLayer.setCollisionBetween(1, 500);
        otherLayer.setDepth(10);

        return { Ground: groundLayer, Other: otherLayer };
    }

}