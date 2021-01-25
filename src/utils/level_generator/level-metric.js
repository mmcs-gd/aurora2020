export default class LevelMetrics {

	constructor(width, height, rooms, corridors, mask) {        
        this.width = width;
        this.height = height;
        this.rooms = rooms;
        this.corridors = corridors;
        this.mask = mask;
    }
    
    // % заполнения
    fillPercent() {
        // посчитать кол-во нулей и единиц в маске уровня
        let ones = 0;
        for (let x = 0; x < this.width; x++){
            for (let y = 0; y < this.height; y++){
                ones += this.mask[x][y] !== 0 ? 1 : 0;
            }
        }
        return ones / (this.width * this.height);
    }

    // проверить связность комнат
    connectivity() {

        // список смежности. представляем комнаты и коридоры в виде неориентированного графа
        const adjacencyList = new Map();
        this.rooms.forEach(room => adjacencyList.set(room, new Set()));
        this.corridors.forEach(corridor => { 
            adjacencyList.get(corridor.room1).add(corridor.room2);
            adjacencyList.get(corridor.room2).add(corridor.room1);
        });

        // проверить что в графе одна компонента связности с помощью поиска в ширину
        // https://learn.javascript.ru/map-set
        const visited = new Map();
        const opened = [this.rooms[0]];
        this.rooms.forEach(room => visited.set(room, false));
        visited.set(this.rooms[0], true);

        while (0 < opened.length) {
            const room = opened.shift();
            //visited[room] = true;

            const visitRooms = Array.from(adjacencyList.get(room)).filter(r => !visited.get(r)); // попробовать убрать Array.from
            opened.push(...visitRooms);
            visitRooms.forEach(r => visited.set(r, true));
        }

        console.log(visited.values());
        return Array.from(visited.values()).every(x => x);
    }
}