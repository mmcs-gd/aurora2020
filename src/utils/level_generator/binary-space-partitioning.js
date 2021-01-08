export default class BinarySpacePartitioning {

	constructor(params) {
        // проверить корректность параметров уровня
        if (!params) {
            throw TypeError('params is null or undefined')
        }

		this.height = params.height;
        this.width = params.width;
        this.roomWidth = params.rooms.width;   // min, max
        this.roomHeight = params.rooms.height; // min, max
        //this.roomMaxArea = params.rooms.maxArea;
        this.roomCount = Phaser.Math.RND.between(params.rooms.minRooms, params.rooms.maxRooms);
        this.corridor_width = params.corridor_width;
    }
    
    // возвращает маску уровня (матрицу, содержащую информацию о ячейках)
    generateMask() {
        // 1. делим пространство на подобласти
        const subSpaces = this.divideSpace();
        //console.log(subSpaces);

        // 2. в каждой подобласти делаем комнату
        const rooms = subSpaces.map(s => this.generateRoom(s));

        // 3. соединяем комнаты с помощью коридоров, чтобы они были связными
        const corridors = this.connectRooms(rooms, this.corridor_width);

        // 4. переводим комнаты и коридоры в маску уровня (матрицу из 0 и 1)
        const matrix = Array(this.width).fill().map(() => Array(this.height).fill(0));
 
        const rectToMask = ({ x, y, w, h }) => {
            for (let i = x; i < x + w; i++)
                for (let j = y; j < y + h; j++)
                    matrix[i][j] = 1;
        }

        rooms.forEach(r => rectToMask(r));
        corridors.forEach( ({ rect_dx, rect_dy }) => { 
            if (rect_dx) rectToMask(rect_dx); 
            if (rect_dy) rectToMask(rect_dy);
        });

        // 5. находим стены

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

        // соединяем комнаты следующим образом:
        // 1. каждый узел дерева - компонента связности
        // 2. объединяем компоненты связности:
        //    2.1. начиная с нижнего уровня дерева объединяем компоненты связности которые лежат в одной подобласти
        //         объединяются ближайшие узлы из двух объединяемых компонент
        //    2.2. поднимаемся на 1 уровень дерева выше и повторяем 2.1 пока не доберёмся к корню
        //    2.3. объединяем полученные компоненты связности в одну компоненту
        const edges = [];
        for (let i=0; i < rooms.length-1; i++){
            edges.push({ r1: rooms[i], r2: rooms[i+1] });
        }

        // провести путь между 2 комнатами. во входных параметрах комнаты не пересекаются
        // если возможно делаем одной линией, иначе двумя
        const connect = (r1, r2) => {
            // представление комнат в виде верхнего-левого и нижнего-правого угла
            const [ x1,y1,x2,y2 ] = [ r1.x, r1.y, r1.x + r1.w, r1.y + r1.h ];
            const [ x3,y3,x4,y4 ] = [ r2.x, r2.y, r2.x + r2.w, r2.y + r2.h ];

            // находим границы области пересечения комнат
            const left = Math.max(x1, x3);   // левая
            const bottom = Math.max(y1, y3); // нижняя
            const right = Math.min(x2, x4);  // правая
            const top = Math.min(y2, y4);    // верхняя - название top некорректное?

            const width = right - left;  // ширина пересечения
            const height = top - bottom; // высота пересечения

            // определяем: какая комната выше; какая комната левее
            const [ room_top, room_bottom ] = r1.y < r2.y ? [r1, r2] : [r2, r1];
            const [ room_left, room_right ] = r1.x < r2.x ? [r1, r2] : [r2, r1];

            let rect_dx, rect_dy;
            if (corridor_width <= width) {
                // пересечение проекций комнат по оси x больше ширины коридора
                // можно соединить комнаты одним отрезком ширины corridor_width
                // коридор из нижней стороны верхней комнаты в верхнюю сторону нижней комнаты
                const y = room_top.y + room_top.h;
                rect_dx = { x: left, y: y, w: corridor_width, h: room_bottom.y - y };
            }
            else if (corridor_width <= height) {
                // пересечение проекций комнат по оси y больше ширины коридора
                // можно соединить комнаты одним отрезком ширины corridor_width
                // коридор из правой стороны левой комнаты в левую сторону правой комнаты
                const x = room_left.x + room_left.w;
                rect_dx = { x: x, y: bottom, w: room_right.x - x, h: corridor_width };
            } else {
                // соединяем комнаты прямоугольным коридором состоящим из двух отрезков
                // todo: концы коридора входят в центры стен комнат

                // отрезок по Y сверху вниз из нижней стороны верхней комнаты на уровень нижней комнаты
                rect_dy = { x: room_top.x, y: room_top.y + room_top.h, w: corridor_width, h: room_bottom.y - room_top.y - room_top.h + corridor_width };

                // отрезок по X слева направо
                const x = room_top === room_left ? room_left.x + corridor_width : room_left.x + room_left.w;
                const w = room_top === room_left ? room_right.x - room_left.x - corridor_width : room_right.x - room_left.x - room_left.w;
                rect_dx = { x: x, y: room_bottom.y, w: w, h: corridor_width };
            }

            return new Corridor(rect_dx, rect_dy, r1, r2);
        }

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

    // TODO
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
    constructor(rect_dx, rect_dy, room1, room2) {
        this.rect_dx = rect_dx; // отрезок по X слева направо
        this.rect_dy = rect_dy; // отрезок по Y сверху вниз
        this.room1 = room1;
        this.room2 = room2;
    }
}