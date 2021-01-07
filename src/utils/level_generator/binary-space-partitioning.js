export default class BinarySpacePartitioning {

    // 1. делим пространство на подобласти
    // 2. в каждой подобласти делаем комнату
    // 3. соединить комнаты, чтобы они были связными
    
    // случайным образом положение и размеры комнаты в подобласти
    // делить подобласть дальше или нет решается случайным образом

	constructor(settings) {
		this.height = settings.height;
        this.width = settings.width;
    }
    
    // возвращает маску уровня (матрицу, содержащую информацию о ячейках)
    generateMask() {
        //const randInt = () => Math.round(Math.random());
        const matrix = Array(this.width).fill().map(() => Array(this.height).fill(1));
        const rooms = [ new Room(0,0,this.width, this.height) ];
        return { rooms: rooms, mask:matrix };
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