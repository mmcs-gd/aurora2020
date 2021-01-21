// сцена под сетевую игру
// карта генерится при запуске сервера
// взаимодействие без проверок и защиты
// https://youtu.be/x-bbflZvuXE
let SceneNetwork = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize: function StartingScene() {
        Phaser.Scene.call(this, {key: 'SceneNetwork'});
    },

    preload: function () {
        // https://learn.javascript.ru/websockets
        // получить инфу о игровой карте
        this.ws = new WebSocket('ws://localhost:3000');

        // Есть 4 события: onopen, onclose, onerror, onmessage
        // Один при получении данных и три – при изменениях в состоянии соединения
        // Для посылки данных используется метод socket.send(data)

        // callback на событие: соединение установлено
        this.ws.onopen = () => {
            console.log('Соединение установлено');
        }

        // закрытие соединения
        this.ws.onclose = (event) => {
            if (event.wasClean) {
                console.log('Соединение закрыто чисто');
            } else {
                console.log('Обрыв соединения'); // например, "убит" процесс сервера
            }
            console.log(`Код: ${event.code} причина: ${event.reason}`);
        };

        // пришло сообщение
        // инфа о других игроках
        this.ws.onmessage = (event) => {
            //const map = JSON.parse(event.data);

            console.log("Получены данные");
            //console.log(map);
        };

        //
        this.ws.onerror = (error) => {
            console.log("Ошибка " + error.message);
        };
    },

    create: function () {
        this.id = Math.random();

        // ожидаем получения карты от сервера и создаём её
    },

    update: function () {        
        // отправить инфу о себе
        // обновить инфу о других

        if (this.ws.readyState === WebSocket.OPEN){
            console.log('Отправляем данные');
            this.ws.send("hello, server" + this.id);
        }
    },
});

export default SceneNetwork