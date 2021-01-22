
// --------------- вставить выше код из файла quad-space-partitioning.js ------------------------------
//var game = require("./server2");
//import QuadSpacePartitioning from "./server2";

// импорт модуля в node.js
const WebSocket = require('ws');

// создание сервера
const server = new WebSocket.Server({ port: 3000 });


// игровая хрень

const LEVEL_SETTINGS = {
  // The dungeon's grid size
  //width: 30,
  //height: 30,
  corridor_width: 2,
  rooms: {
    // Random range for the width of a room (grid units)
    width: {
      min: 5,
      max: 8
    },
    // Random range for the height of a room (grid units)
    height: {
      min: 5,
      max: 8
    },
    // Cap the area of a room - e.g. this will prevent large rooms like 10 x 20
    //maxArea: 20,
    // Max rooms to place
    maxRooms: 13,
    // Min rooms to place
    minRooms: 9,
  }
}

// игровая карта генерируется при запуске сервера
const [ width, height ] = [ 50, 50 ];
const levelGenerator = new QuadSpacePartitioning(width, height, LEVEL_SETTINGS);
const { rooms, corridors, mask } = levelGenerator.generateMask();

const maskJSON = JSON.stringify({ name: 'mask', data: mask });
const roomsJSON = JSON.stringify({ name: 'rooms', data: rooms});
const corridorsJSON = JSON.stringify({ name: 'corridors', data:corridors});

// игроки на карте
const players = {}; // new Map()
let playerID = 0;


// работа по сети
// подписаться на событие "подключение к серверу"
server.on('connection', ws => {
  console.log('Соединение установлено');

  // добавить в список игроков
  players[playerID++] = {
    x: 100,
    y: 100,
    health: 100,
  };

  // отправить карту подземелья
  ws.send(maskJSON);
  ws.send(roomsJSON);
  ws.send(corridorsJSON);

  // вешает на вебсокет нового подключения callback вызываемый при получении от него сообщения
  ws.on('message', message => {
    console.log(`received: ${message}}`);

    server.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) client.send(message);
    });
  });

});

server.on('close', ws => {
  // удалить игрока из списка игроков
});