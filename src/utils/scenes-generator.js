import Vector2 from 'phaser/src/math/Vector2'

export default class Scene{
    constructor(width, height, roomsCount, minRoomWidth = 5, maxRoomWidth = 10, 
        minRoomHeight = 5, maxRoomHeight = 10){
        this.width = width,
        this.height = height,
        this.roomsCount = roomsCount,
        this.minRoomWidth = minRoomWidth,
        this.maxRoomWidth = maxRoomWidth,
        this.minRoomHeight = minRoomHeight,
        this.maxRoomHeight = maxRoomHeight
    }

    ////
    //// Общая схема работы как квантование по яркости в opencv,
    //// так же показываем сколько комнат нам надо, а далее мы только 
    //// не находим а самы выставляем на холсте (она же матрица) 
    //// наши комнаты которые != 0 цисла, а потом соединяем те межджу
    //// которыми менее двух тайлов переходами они же == -1
    ////
    
    generateScene(){

        //// создать пустую сцену
        this.SceneMatrix = [];
        const empty = [];
        for(let y = 0; y < this.height; y++){
            let col = [];
            for (let x = 0; x < this.width; x++)
                col.push(0);
                empty.push(col);
        }
        this.SceneMatrix = empty;
        ////


        const startCenters = []; 
        //с помощью квадродерева накидать заданное число точек - центров комнат - на плоскость
        this.scatterPointsQT(startCenters, this.roomsCount, 0, this.width-1, 0, this.height-1);

        // создать дескрипторы для каждой из комнат
        let rooms = [];
        startCenters.forEach(c => {
            rooms.push({
                startCenter: c,
                left: c.x,
                right: c.x,
                top: c.y,
                down: c.y,
                id: this.SceneMatrix[c.y][c.x],
                square: 1,
                neighs: [],
                width : function() {
                    return this.right - this.left + 1
                },
                height : function() {
                    return this.down - this.top + 1
                }
            })
            this.SceneMatrix[c.y][c.x] = 0;
        })

        // проверить минимальные расстояния и размеры комнат
        this.AddRooms(rooms);
        rooms = rooms.filter(r => r.square > 1);
        // расширять территории, пока не заполнится % от всей площади
        this.Transition(rooms);
        return rooms;
    }

    AddRooms(rooms){

         // дескриптор комнаты - номер, действующий центр
        // возможно ли расширяться вверх, вниз, вправо, влево
        // максимальные значения координат слева, справа, снизу, сверху
        // закончена ли генерация комнаты
        // комнаты, с которыми есть или может быть соединение - вычисляется после генерации всех комнат
        for(let i = 0; i < rooms.length; i++)
        {
            const room = rooms[i];
            let width = Phaser.Math.RND.integerInRange(this.minRoomWidth, this.maxRoomWidth);
            let height = Phaser.Math.RND.integerInRange(this.minRoomHeight, this.maxRoomHeight);
            width += width%2 === 0? 1 : 0;
            height += height%2 === 0? 1 : 0;

            // Проверить, не попала ли комната на границы карты - затем перемещает центр комнаты
            let dx = room.startCenter - Math.floor(width/2); 
            if(dx < 0)
            {
                room.startCenter.subtract(new Vector2(dx, 0));
            }
            else 
            {
                dx = room.startCenter + Math.floor(width/2)
            }

            if(dx > 0)
            {
                room.startCenter.subtract(new Vector2(dx, 0));
            }    
            

            let dy = room.startCenter - Math.floor(height/2); 
            if(dy < 0)
            {    
                room.startCenter.subtract(new Vector2(0, dy));
            }
            else
            {
                 dy = room.startCenter + Math.floor(height/2)
            }

            if(dy > 0)
            {
                room.startCenter.subtract(new Vector2(0, dy))
            }

            room.left = room.startCenter.x - Math.floor(width/2);
            room.right = room.startCenter.x + Math.floor(width/2);
            room.top = room.startCenter.y - Math.floor(height/2);
            room.down = room.startCenter.y + Math.floor(height/2);
            
            // Проверить, есть ли место для комнаты
            let sum = 0;
            if(room.top > 0 && room.left > 0 && room.down < this.height && room.right < this.width)
            {   
                for(let y = room.top; y <= room.down; y++)
                {    
                    for(let x = room.left; x <= room.right; x++)
                     {   
                         if(this.SceneMatrix[y][x] === 0)
                        {    
                            sum++;
                        }
                    }
                }
            }


            if(sum === width * height)
            { 
                for(let y = room.top; y <= room.down; y++)
                {   
                    for(let x = room.left; x <= room.right; x++)
                    {
                        this.SceneMatrix[y][x] = room.id;
                    }
                }
            
                room.square = sum;
            }
        }
    }

    Transition(rooms){
        // сделать генерацию комнат с помощью рандома прямоугольников
        // двигать получившийся прямоугольник от границ карты, чтобы он на нее поместился
        for(let i = 0; i < rooms.length - 1; i++)
        {
            for(let j = i+1; j < rooms.length; j++)
            {
                rooms[i].neighs.push({
                    idx: j,
                    id:rooms[j].id, 
                    dist : rooms[i].startCenter.distance(rooms[j].startCenter)})
            }

            // переходы между комнатами - минимальное остовное дерево
            // ширина перехода - 2 тайла
            rooms[i].neighs = rooms[i].neighs.sort(
                (neigh1, neigh2) => 
                    {
                        const d1 = neigh1.dist;
                        const d2 = neigh2.dist;
                        if(d1 > d2) return 1
                        if(d2 > d1) return -1
                        return 0
                    });

            for(let n = 0; n < Phaser.Math.RND.integerInRange(1, Math.min(rooms[i].neighs.length, 2)); n++)
            {
                let center1 = rooms[i].startCenter;
                let center2 = rooms[rooms[i].neighs[n].idx].startCenter;
                let y, y1, x, x1, 
                dx = center1.x >= center2.x? 1 : -1, 
                dy = center1.y >= center2.y? 1 : -1;
                if(Math.round() < 0.5) 
                {
                    y = center1.y;
                    y1 = center2.y;
                    x = center1.x;
                    x1 = center2.x;
                }
                else 
                {
                    y1= center1.y;
                    y = center2.y;
                    x1 = center1.x;
                    x = center2.x;
                }

                while (x != x1)
                {
                    if(this.SceneMatrix[y][x] === 0)
                    {
                        if(y-1 >= 0)
                        {
                            this.SceneMatrix[y-1][x] = -1;
                        }

                        this.SceneMatrix[y][x] = -1;

                        if(y+1 < this.height)
                        {
                            this.SceneMatrix[y+1][x] = -1;
                        } 
                    }
                    x+= dx;
                }

                while(y != y1)
                {
                    if(this.SceneMatrix[y][x1] === 0){
                        if(x1-1 >= 0)
                        {  
                            this.SceneMatrix[y][x1-1] = -1;
                        }

                        this.SceneMatrix[y][x1] = -1;

                        if(x1+1 < this.width)
                        {
                            this.SceneMatrix[y][x1+1] = -1;
                        } 
                    }
                    y += dy;
                }
            }
        }
    }
    
    getQuadrantsNums(totalNum, left, right, top, down, xCenter, yCenter){
        // делим количество точек примерно на одинакове количество по областям
        const quadrantsMax = [(xCenter-left+1) * (yCenter-top+1), (right-xCenter) * (yCenter-top+1),
                                (xCenter-left+1) * (down-yCenter), (right-xCenter) * (down-yCenter)];
        
        if(totalNum > (right-left+1) * (down-top+1) )
        {
            return quadrantsMax;
        }
        
        const quarter = Math.floor(totalNum / 4);
        const quadrants = [];
        for(let i = 0; i < 4; i++)
        {  
            quadrants.push(quarter);
        }

        let rest = totalNum - quarter * 4;

        let startQuadrant = Phaser.Math.RND.integerInRange(0, 4);

        while(rest > 0)
        {
            quadrants[(startQuadrant + rest)%4] ++;
            rest--;
        }
        return quadrants;
    }

    scatterPointsQT(points, number, left, right, top, down){
        // формирует распределение точек по площади


        if(number === 0) // обход квадродерева с помощью рекурсии
        {
            return;
        }

        if (number === 1)
        {
            let x = 0, y = 0;
            let notAdded = true;
            while(notAdded)
            {
                x = Phaser.Math.RND.integerInRange(left, right);
                y = Phaser.Math.RND.integerInRange(top, down);
                if(this.SceneMatrix[y][x] < 1)
                {    
                    notAdded = false;
                }
            }
            points.push(new Vector2(x, y));
            this.SceneMatrix[y][x] = points.length;
        } 
        else 
        {
            const xCenter = Math.floor((right + left) / 2);
            const yCenter = Math.floor((down + top) / 2);
            const quadrants = this.getQuadrantsNums(number, left, right, top, down, xCenter, yCenter);
            this.scatterPointsQT(points, quadrants[0], left, xCenter, top, yCenter);
            this.scatterPointsQT(points, quadrants[1], xCenter+1, right, top, yCenter);
            this.scatterPointsQT(points, quadrants[2], left, xCenter, yCenter+1, down);
            this.scatterPointsQT(points, quadrants[3], xCenter+1, right, yCenter+1, down);
        }
    }
}