export default class LevelMetrics {

	constructor(width, height, rooms, corridors) {        
        this.width = width;
        this.height = height;
        this.rooms = rooms;
        this.corridors = corridors;
    }
    
    // % заполнения
    fillPercent() {
        // посчитать кол-во нулей и единиц в маске уровня
        // комнаты и корридоры не пересекаются ?
        const levelArea = this.width * this.height;
        const corridorsArea = this.corridors.reduce((s, corridor) => s + corridor.w * corridor.h, 0);
        const roomsArea = this.rooms.reduce((s, room) => s + room.w * room.h, 0);

        return (corridorsArea + roomsArea) / levelArea;
    }

    // проверить связность комнат
    connectivity() {

        // список смежности. представляем комнаты и коридоры в виде неориентированного графа
        const adjacencyList = {};
        this.rooms.forEach(room => adjacencyList[room] = []); // new Set()
        this.corridors.forEach(corridor => { 
            adjacencyList[corridor.room1].add(corridor.room2);
            adjacencyList[corridor.room2].add(corridor.room1);
        });

        // проверить что в графе одна компонента связности с помощью поиска в ширину
        const visited = {}
        const opened = [rooms[0]];
        this.rooms.forEach(room => visited[room] = false);
        while (0 < opened.length) {
            let room = opened.shift();
            
        }

        return true;
    }
}