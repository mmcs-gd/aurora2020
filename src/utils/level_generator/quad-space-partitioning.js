export default class QuadSpacePartitioning {

	constructor(width, height, params) {
        // проверить корректность параметров уровня
        if (!params) {
            throw TypeError('params is null or undefined')
        }

        this.width = width;
		this.height = height;
        this.roomWidth = params.rooms.width;   // min, max
        this.roomHeight = params.rooms.height; // min, max
        //this.roomMaxArea = params.rooms.maxArea;
        this.roomCount = Phaser.Math.RND.between(params.rooms.minRooms, params.rooms.maxRooms);
        this.corridor_width = params.corridor_width;
    }
    
    // возвращает маску уровня (матрицу, содержащую информацию о ячейках)
    // 0-black, 1-ground, 2-wall_left, 3-wall_right, 4-wall_top, 5-wall_bottom
    // 6-corner_top_left, 7-corner_top_right, 8-corner_bottom_left, 9-corner_bottom_right
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
        // берём комнаты и корридоры и смотрим чтобы с внешней стороны был 0, тогда этот элемент матрицы будет стеной
        // другой способ: обход четырёхсвязной области для внешнего контура, а затем тоже самое для возможных внутренних пустот
        /*const makeWall = ({ x,y,w,h }) => {
            for (let i = x; i < x+w; i++) { // верхняя стена
                if (0 < y && matrix[i][y-1] === 0) matrix[i][y-1] = 4;
            }
            for (let i = x; i < x+w; i++) { // нижняя стена
                if (y+h < this.height-1 && matrix[i][y+h] === 0) matrix[i][y+h] = 5;
            }
            for (let i = y; i < y+h; i++) { // левая стена
                if (0 < x && matrix[x-1][i] === 0) matrix[x-1][i] = 2;
            }
            for (let i = y; i < y+h; i++) { // правая стена
                if (x+w < this.width-1 && matrix[x+w][i] === 0) matrix[x+w][i] = 3;
            }

            if (0 < x && 0 < y && matrix[x-1][y-1] === 0) matrix[x-1][y-1] = 6; // верхний левый угол
            if (x+w < this.width-1 && 0 < y && matrix[x+w][y-1] === 0) matrix[x+w][y-1] = 7; // верхний правый угол
            if (0 < x && y+h < this.height-1 && matrix[x-1][y+h] === 0) matrix[x-1][y+h] = 8; // нижний левый угол
            if (x+w < this.width-1 && y+h < this.height-1 && matrix[x+w][y+h] === 0) matrix[x+w][y+h] = 9; // нижний правый угол
        }
        rooms.forEach(r => makeWall(r));
        corridors.forEach( ({ rect_dx, rect_dy }) => {
            if (rect_dx) makeWall(rect_dx);
            if (rect_dy) makeWall(rect_dy);
        });*/

        return { rooms: rooms, corridors:corridors, mask:matrix };
    }

    //#divideSpace()
    divideSpace() {
        // 1. подобласть не может быть меньше минимального размера комнаты
        // 2. в каждом узле дерева комната
        // 3. делить подобласть дальше или нет решается случайным образом (с учётом нужного кол-ва комнат)
        const root = new QuadTree({x: 0, y: 0, w: this.width, h: this.height});

        // делим подобласти пока делятся
        root._subdivide();
        root.children[0]._subdivide();
        root.children[1]._subdivide();
        root.children[2]._subdivide();
        root.children[3]._subdivide();

        // подобласти для комнат
        const subSpaces = root.subSpaces();
        console.log("subSpaces");
        console.log(subSpaces);
        console.log("roomCount");
        console.log(this.roomCount);

        const randomSpaces = Array(subSpaces.length).fill().map( (_,i) => i);
        Phaser.Math.RND.shuffle(randomSpaces);
        console.log("randomSpaces");
        console.log(randomSpaces);

        return Array(this.roomCount).fill().map( (_,i) => subSpaces[randomSpaces[i]] );
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
        const roomEdges = [];

        // 1. соединяем с ближайшей комнатой (расстояния между центрами комнат)
        const calcDist = (r1, r2) => Math.abs(r1.x-r2.x) + Math.abs(r1.y-r2.y);
        const graphEdges = Array(rooms.length).fill().map(_ => Array(rooms.length).fill(0)); // для остовного дерева
        
        for (let i = 0; i < rooms.length-1; i++){
            let minDist = Number.MAX_SAFE_INTEGER;
            let indexRoom;

            for (let j = i+1; j < rooms.length; j++){
                const dist = calcDist(rooms[i], rooms[j]);
                if (dist < minDist){
                    indexRoom = j;
                    minDist = dist;
                }
                graphEdges[i][j] = graphEdges[j][i] = dist;
            }
            roomEdges.push({ r1: rooms[i], r2: rooms[indexRoom], dist: minDist, i1: i, i2: indexRoom });
        }

        console.log("roomEdges");
        console.log(roomEdges);
        // 2. если нет связности, то перезапуск или строим миним. остовное дерево и добавляем его в дуги
        // Алгоритм Краскала
        // https://neerc.ifmo.ru/wiki/index.php?title=Алгоритм_Краскала
        // https://evileg.com/ru/post/523/

        // в линейный массив и отсортировать дуги по весам
        const roomEdges2 = []; // дуги остовного дерева
        const sortGraphEdges = [];
        for (let i = 0; i < graphEdges.length-1; i++){
            for (let j = i+1; j < graphEdges[i].length; j++){
                sortGraphEdges.push({ dist: graphEdges[i][j], r1: rooms[i], r2: rooms[j] });
            }
        }
        console.log('graphEdges');
        console.log(graphEdges);
        console.log('sortGraphEdges');
        console.log(sortGraphEdges);
        sortGraphEdges.forEach(e => console.log(e));
        sortGraphEdges.sort( (r1, r2) => r2.dist - r1.dist);
        console.log('sortGraphEdges');
        console.log(sortGraphEdges);
        sortGraphEdges.forEach(e => console.log(e));

        // изначально все узлы в своих компонентах
        // берём дугу с минимальным весом и если его концы из разных компонент, то добавляем эту дугу в ответ. сами компоненты сливаем в одну
        const components = new Map(); // ключ-комната, значение-компонента этой комнаты
        let components_count = rooms.length; // кол-во компонент
        rooms.forEach( (r,i) => components.set(r, i));
        console.log("components");
        console.log(components);

        // граф связный
        while (1 < components_count) {
            const edge = sortGraphEdges.pop();
            console.log(edge);
            const { dist,r1,r2 } = edge;
            const component1 = components.get(r1);
            const component2 = components.get(r2);

            if (component1 !== component2) {
                roomEdges2.push(edge);

                // объединяем в одну компоненту
                rooms.forEach(r => { if (components.get(r) === component2) components.set(r, component1); });
                --components_count;
            }
        }
        console.log("roomEdges2");
        console.log(roomEdges2);
        // объединяем множества дуг с этапов 1 и 2
        const roomEdgesUnion = [];
        roomEdgesUnion.push(...roomEdges);
        for (let i = 0; i < roomEdges2.length; i++){
            const r = roomEdges2[i];
            if (!roomEdgesUnion.find( ({r1,r2}) => r1===r.r1 && r2===r.r2 || r1===r.r2 && r2===r.r1)) {
                roomEdgesUnion.push(r);
            }
        }
        console.log("roomEdgesUnion");
        console.log(roomEdgesUnion);
        // 3. если путь от одной комнаты до другой сильно больше их расположения на карте, то добавить дугу между ними
        // находим все пути от одной вершины до всех остальных
        // после добавления дуги нужно считать по новой
        // https://habr.com/ru/post/119158/
        // https://ru.wikipedia.org/wiki/Алгоритм_Флойда_—_Уоршелла
        // Алгоритм Флойда-Уоршелла O(n^3)

        /*const d = Array(rooms.length).fill().map(_ => Array(rooms.length).fill(Number.MAX_SAFE_INTEGER));

        for (let i = 0; i < roomEdges.length; i++){
            const {r1, r2, dist, i1, i2} = roomEdges[i];
            d[i1][i2] = d[i2][i1] = dist;
            //console.log(`${r1} ${r2} ${i1} ${i2} ${dist}`);
        }
        
        const FloydWarshall = (d) => {
            const n = d.length;

            for (let i = 1; i < n + 1; i++)
                for (let j = 0; j < n - 1; j++)
                    for (let k = 0; k < n - 1; k++)
                        if (d[j][k] > d[j][i - 1] + d[i - 1][k]) {
                            d[j][k] = d[j][i - 1] + d[i - 1][k];
                        }
            return d;
        }
        FloydWarshall(d);*/

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

        return roomEdgesUnion.map(e => connect(e.r1, e.r2));
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
        const {x, y, w, h} = this.boundary;

        // случайная точка (в допустимых пределах) для деления на подобласти
        const dx = Phaser.Math.RND.between(-w/10, w/10);
        const dy = Phaser.Math.RND.between(-h/10, h/10);
        const p = { x: x + w/2 + dx, y: y + h/2 + dy};
        p.x = Math.floor(p.x);
        p.y = Math.floor(p.y);

        const [w_first, w_last] = [p.x - x, x + w - p.x];
        const [h_first, h_last] = [p.y - y, y + h - p.y];

        const quadCoords = [
            { x:x, y:y, w: w_first, h: h_first },
            {x: p.x, y:y, w: w_last, h: h_first },
            { x:x, y: p.y, w: w_first, h: h_last },
            { x: p.x, y: p.y, w: w_last, h: h_last }
        ];
        
        //console.log("quadCoords");
        //console.log(quadCoords);
        this.hasChildren = true;
        this.children = quadCoords.map(rect => new QuadTree(rect));
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