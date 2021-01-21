// импорт модуля в node.js
const WebSocket = require('ws');

// создание сервера
const server = new WebSocket.Server({ port: 3000 });


// игровая хрень

// игровая карта генерируется при запуске сервера
const mapMatrix = Array(50).fill().map(() => Array(50).fill(0));
const mapMatrixJSON = JSON.stringify(mapMatrix);

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
  ws.send(mapMatrixJSON);

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