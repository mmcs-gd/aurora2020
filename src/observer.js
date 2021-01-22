import {Pursuit} from './ai/steerings/pursuit'
export default class Observer {
    constructor(roomsWithExam, player, groundLayer, stuffLayer, outsideLayer) {
        this.roomsWithExam = roomsWithExam;
        this.player = player;
        this.isActivated = false;
        this.groundLayer = groundLayer;
        this.stuffLayer = stuffLayer;
        this.outsideLayer = outsideLayer;
        this.isBegin = false;
    }

    playerInRoomWithExam(scene, setSlimes) {
        this.scene = scene;
        let playerX = Math.floor(this.player.body.x / 32);
        let playerY = Math.floor(this.player.body.y / 32);
        if (!this.isActivated){
            for (let i = 0; i < this.roomsWithExam.length; i++) {
            let room = this.roomsWithExam[i];
            if (playerX - 1 > room.x 
                && playerY - 1 > room.y 
                && playerX + 2 < room.x + room.width 
                && playerY + 2 < room.y + room.height) { 
                    for (let j = 0; j < room.slimes.length; j++) {
                        room.slimes[j].setVisible(true);
                        room.slimes[j].active = true;
                        let steering = new Pursuit(room.slimes[j], [this.player], 1, 12, 0.5);
                        room.slimes[j].setSteering(steering)
                        this.scene.physics.add.collider(room.slimes[j], this.player);
                        this.currentRoom = this.roomsWithExam[i];
                        this.isActivated = true;
                        this.isBegin = true;
                    }
                }
            }   
        } else {
            if (!this.isBegin) return false;
            if (playerX <= this.currentRoom.x 
                || playerY >= this.currentRoom.y + this.currentRoom.height 
                || playerX >= this.currentRoom.x + this.currentRoom.width 
                || playerY <= this.currentRoom.y ) {
                    let slimes = this.currentRoom.slimes;
                    for (let i = 0; i < slimes.length;i++) {
                        slimes[i].body.enable = false;
                        slimes[i].setSteering(undefined);
                        slimes[i].setVisible(false);
                        slimes[i].active = false;
                    }
                    for(let i = 0; i < slimes.length; i++) {
                        const indx = setSlimes.findIndex(s => s === slimes[i])
                        setSlimes[indx].destroy();
                        setSlimes.splice(indx, 1);
                        slimes[i].destroy();
                        this.currentRoom.slimes.splice(i, 1);
                    }
                this.isActivated = false;
            }
            else {
                for (let j = 0; j < this.currentRoom.slimes.length; j++) {
                    let slime = this.currentRoom.slimes[j];
                    if (!(slime.body.x + slime.body.gameObject.width < this.player.body.x 
                        || slime.body.x > this.player.body.x + this.player.body.gameObject.width
                        || slime.body.y + slime.body.gameObject.height < this.player.body.y
                        || slime.body.y > this.player.body.y + this.player.body.height)) {
                            this.player.body.x = 0;
                            this.player.body.y = 0;
                            this.player.health--;
                            return true;
                        }
                }
            }
        }
        return false;
    }
}