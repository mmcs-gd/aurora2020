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
        this.corridor_width = params.corridor_width;
    }
    
    // возвращает маску уровня (матрицу, содержащую информацию о ячейках)
    generateMask() {
        // 1. делим пространство на подобласти
        const subSpaces = this.divideSpace();
        console.log(subSpaces);

        // 2. в каждой подобласти делаем комнату
        const rooms = subSpaces.map(s => this.generateRoom(s));

        // 3. соединяем комнаты с помощью коридоров, чтобы они были связными
        const corridors = this.connectRooms(rooms, this.corridor_width);

        // 4. переводим комнаты и коридоры в маску уровня
        const matrix = Array(this.width).fill().map(() => Array(this.height).fill(0));
        
        /*const transfer = (objects) => {
            for (let i = 0; i < objects.length; i++){
                const { x:left, y:top,w,h } = objects[i];

                for (let x = left; x < left+w; x++) {
                    for (let y = top; y < top+h; y++) {
                        matrix[x][y] = 1;
                    }
                }
            }
        }
        transfer(rooms);
        transfer(corridors);*/
        
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
        const root = new QuadTree({x: 0, y: 0, w: this.width, h: this.height});
        root._subdivide();
        //root.children[0]._subdivide();

        return root.subSpaces();
    }

    // в указанной области случайным образом создаёт комнату
    //#generateRoom({ x,y,w,h })
    generateRoom({x,y,w,h}) {
        const room_width = Phaser.Math.RND.between(this.roomWidth.min, this.roomWidth.max);
        //const room_height_max = Math.floor(this.roomMaxArea / room_width);
        const room_height = Phaser.Math.RND.between(this.roomWidth.min, this.roomWidth.max);

        const x_max = w - room_width;
        const y_max = h - room_height;
        const room_x = Phaser.Math.RND.between(x, x + x_max);
        const room_y = Phaser.Math.RND.between(y, y + y_max);
        //console.log(`${room_width} ${room_height} ${x_max} ${y_max} ${room_x} ${room_y}`);

        return new Room(room_x, room_y, room_width, room_height);
    }

    //#connectRooms()
    connectRooms(rooms, corridor_width) {
        // 02.12.2020 10:44 - на лекции алгоритм соединения (00:34:00)
        // мб представить комнаты как узлы графа

        // соединяем комнаты
        const edges = [];
        for (let i=0; i < rooms.length-1; i++){
            edges.push({ r1: rooms[i], r2: rooms[i+1] });
        }

        // провести путь между 2 комнатами. коридор входит в центр стены комнаты
        // если возможно делаем одной линией, иначе двумя
        const connect = (r1, r2) => {
            //const { x1,y1,w1,h1 } = room1;
            //const { x2,y2,w2,h2 } = room2;

            const [ x1,y1,x2,y2 ] = [ r1.x, r1.y, r1.x + r1.w, r1.y + r1.h ];
            const [ x3,y3,x4,y4 ] = [ r2.x, r2.y, r2.x + r2.w, r2.y + r2.h ];

            // границы области пересечения комнат
            const left = max(x1, x3) // левая
            const bottom = max(y1, y3) // нижняя
            const right = min(x2, x4) // правая
            const top = min(y2, y4) // верхняя

            const width = right - left; // ширина пересечения
            const height = top - bottom; // высота пересечения

            let rect_dx, rect_dy;
            if (corridor_width <= width || corridor_width <= height) {
                // пересечение проекций комнат по оси x или y больше ширины коридора
                // можно соединить одной линией ширины corridor_width
                //rect_dx = corridor_width <= width ? { x: left, y: 0, w: corridor_width, h: } : undefined;
                //rect_dy = corridor_width <= height ? { x:0, y: top, } : undefined;
            } else {
                // соединяем комнаты прямоугольным коридором. концы входят в центры стен комнат
                //rect_dx = { x: 0, y: 0, w: 0, h: 0 };
                //rect_dy = { x: 0, y: 0, w: 0, h: 0 };
            }

            return new Corridor(rect_dx, rect_dy, r1, r2);
        }

        return [];
        return edges.map(e => connect(e.r1, e.r2));
    }
}


class QuadTree {
    constructor(boundary) {
        if (!boundary) {
            throw TypeError('boundary is null or undefined')
        }

        this.boundary = boundary;
        this.hasChildren = false;
        this.children = [];

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

    // возвращает все подобласти (листья дерева)
    subSpaces(found = []) {
        if (this.hasChildren) {
            this.children.forEach(ch => ch.subSpaces(found));
        } else {
            found.push(this.boundary);
        }
        return found;
    }

    _subdivide() {
        // случайная точка для деления на подобласти
        //const p = { x: this.boundary.x + this.boundary.w / 2, y: this.boundary.y + this.boundary.h / 2};
        //const w = this.boundary.w / 2;
        //const h = this.boundary.h / 2;
        
        const {x, y, w, h} = this.boundary;
        const w_half = Math.floor(w/2);
        const h_half = Math.floor(h/2);

        const quadCoords = [ {x:x, y:y}, {x: x+w_half, y:y}, { x:x, y: y+h_half }, { x: x+w_half, y: y+h_half} ];
        
        this.hasChildren = true;
        this.children = quadCoords
        .map(({x, y}) => { return { x:x, y:y, w:w_half, h:h_half }; } )
        .map(rect => new QuadTree(rect));
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
    // point1 (room1)  <--->  point2  <--->  point3 (room2)
    constructor(rect_dx, rect_dy, room1, room2) {
        this.rect_dx = rect_dx;
        this.rect_dy = rect_dy;
        this.room1 = room1;
        this.room2 = room2;
    }
}