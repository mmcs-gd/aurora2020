export default class BinarySpacePartitioning {

	constructor(params) {
        // проверить корректность параметров уровня
        if (!params) {
            throw TypeError('params is null or undefined')
        }

		this.height = params.height;
        this.width = params.width;
        this.roomCount = Phaser.Math.RND.between(params.rooms.minRooms, params.rooms.maxRooms);
        this.roomMaxArea = params.rooms.maxArea;
        this.roomWidth = params.rooms.width; // min, max
        this.roomHeight = params.rooms.height; // min, max
    }
    
    // возвращает маску уровня (матрицу, содержащую информацию о ячейках)
    generateMask() {

        // 1. делим пространство на подобласти
        // 2. в каждой подобласти делаем комнату
        const rooms = [ this.generateRoom(0,0,this.width,this.height) ];

        // 3. соединяем комнаты с помощью коридоров, чтобы они были связными
        const corridors = undefined; //this.connectRooms(rooms);

        // 4. переводим комнаты и коридоры в матрицу
        const matrix = Array(this.width).fill().map(() => Array(this.height).fill(0));
        for (let i = 0; i < rooms.length; i++){
            const { x:left, y:top,w,h } = rooms[i];

            for (let x = left; x < left+w; x++) {
                for (let y = top; y < top+h; y++) {
                    matrix[x][y] = 1;
                }
            }
        }
        // переводим коридоры в матрицу
        for (let i = 0; i < corridors.length; i++){
            const { x:left, y:top,w,h } = corridors[i];

            for (let x = left; x < left+w; x++) {
                for (let y = top; y < top+h; y++) {
                    matrix[x][y] = 1;
                }
            }
        }

        return { rooms: rooms, corridors:corridors, mask:matrix };
    }

    //#divideSpace()
    divideSpace() {
        // 1. подобласть не может быть меньше минимального размера комнаты
        // 2. в каждом узле дерева комната
        // 3. делить подобласть дальше или нет решается случайным образом (с учётом нужного кол-ва комнат)

    }

    // в указанной области случайным образом делает комнату
    //#generateRoom({ x,y,w,h })
    generateRoom(x,y,w,h) {

        const width = Phaser.Math.RND.between(this.roomWidth.min, this.roomWidth.max);
        const height_max = Math.floor(this.roomMaxArea / width);
        const height = Phaser.Math.RND.between(this.roomWidth.min, height_max);

        //const x = undefined;
        //const y = undefined;

        return new Room(x, y, width, height);
    }

    //#connectRooms()
    connectRooms(rooms) {
        // 02.12.2020 10:44 - на лекции алгоритм соединения (00:34:00)
        // мб представить комнаты как узлы графа

        return [new Corridor(0,0,10,2, rooms[0], rooms[1])];
    }
}


class QuadTree {
    constructor(boundary) {
        if (!boundary) {
            throw TypeError('boundary is null or undefined')
        }

        this.shapes = []
        this.boundary = boundary
        this.hasChildren = false
        this.children = []

        //  N=north, S=south, E=east, W=west
        //  NW -> NE -> SW -> SE
        //
        //  ┼──────────○───────────○──
        //  │          │           |
        //  │   NW     │     NE    |
        //  │          │           |
        //  ┼──────────┼───────────┼
        //  │          │           |
        //  │   SW     │     SE    |
        //  |          │           |
        //  ┼──────────┼───────────○
        //  |
    }

    get length() {
        let count = this.shapes.length;
        if (this.hasChildren) {
            // .reduce((sum, quadTree) => sum + quadTree.length, 0);
            count += this.children[0].length;
            count += this.children[1].length;
            count += this.children[2].length;
            count += this.children[3].length;
        }
        return count;
    }

    // возвращает все подобласти
    subSpaces() {
        return [];
    }

    _subdivide() {
        
    }
}

class Room {
    constructor(x, y, w, h) {
		this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}

class Corridor {
    constructor(x, y, w, h, room1, room2) {
		this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.room1 = room1;
        this.room2 = room2;
    }
}