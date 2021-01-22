export default class ExaminationManager {
    constructor(rooms, characterFactory, scene, player) {
        this.rooms = rooms; 
        this.scene = scene;
        this.player = player;
        this.roomsWithExam = [];
        this.characterFactory = characterFactory;
        this.slimes = [];
        this.countExaminations = this._getRandom(10, this.rooms.length);
        this.isGenerate = false;
        let count = 0;
        this.numbersRooms = [];
        
        for (let i = 0; i < this.rooms.length; i++) {
            let rand = this._getRandom(0, 1);
            if (i != 0 && count < this.countExaminations && rand == 1) {
                let room = this.rooms[i];
                room.isExamination = true;
                this.roomsWithExam.push(room);
                this.numbersRooms.push(i);
                count++
            }
        }
        
    }

    get getNumbersRoomsWithExam() { return this.numbersRooms; }

    get getRoomsWithExam() { return this.roomsWithExam; }

    get getSlimes() { return this.slimes; }

    generateChunkInRoom() {     
        for (let i = 0; i < this.roomsWithExam.length; i++) {
            let room = this.roomsWithExam[i];
            for (let y = room.y; y < room.y + room.height; y++) {
                for (let x = room.x; x < room.x + room.width; x++) {
                    let rand = this._getRandom(0, 1)
                    if ((x == room.x 
                        || y == room.y 
                        || x == room.x + room.width - 1 
                        || y == room.y + room.height - 1)
                        && rand == 1) {
                        let slime = this._generateSlime(x * 32 , y * 32); 
                        this.slimes.push(slime);
                        this.roomsWithExam[i].slimes.push(slime);
                    }
                }
            }
        }
        this.isGenerate = true;

    }
    _generateSlime(x, y) {
        let params = {};
        params.slimeType = this._getRandom(0, 3);
        const slime = this.characterFactory.buildSlime(x + 16, y + 16, params);
        slime.setVisible(false);
        slime.active = false;
        return slime;
    }
    _getRandom(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
}