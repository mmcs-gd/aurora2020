export default class TeleportManager {
    constructor(player) {
        this.player = player;
    }

    updateTeleport(portals) {
        this.portals = portals;
        if (this.portals.length >= 2) {
            let playerX = this.player.body.x;
            let playerY = this.player.body.y;
            let playerEndX = this.player.body.x + this.player.body.gameObject.width; 
            let playerEndY = this.player.body.y + this.player.body.gameObject.height; 

            let inputShiftX = 2
            let inputShiftY = 2

            for (let i = 0; i < this.portals.length; i++) { 
                if (playerX > this.portals[i].x - this.portals[i].width / 2 + inputShiftX
                    && playerY > this.portals[i].y - this.portals[i].height / 2 + inputShiftY 
                    && playerEndX < this.portals[i].x + this.portals[i].width / 2 - inputShiftX 
                    && playerEndY < this.portals[i].y + this.portals[i].height / 2 - inputShiftY)
                    {
                        let numberAnotherPortal = i == 0 ? 1 : 0;
                        if (this.player.faceDirection == 0) {
                            this.player.body.x = this.portals[numberAnotherPortal].x - this.portals[numberAnotherPortal].width / 2
                            this.player.body.y = this.portals[numberAnotherPortal].y 
                                            - this.player.body.gameObject.height / 2;
                        }
                        if (this.player.faceDirection == 1) {
                            this.player.body.x = this.portals[numberAnotherPortal].x + this.portals[numberAnotherPortal].width / 2;
                            this.player.body.y = this.portals[numberAnotherPortal].y 
                                            - this.player.body.gameObject.height / 2;
                        }
                        if (this.player.faceDirection == 2) {
                            this.player.body.x = this.portals[numberAnotherPortal].x - this.player.body.gameObject.width / 2;
                            this.player.body.y = this.portals[numberAnotherPortal].y - this.portals[numberAnotherPortal].height / 2;
                        }
                        if (this.player.faceDirection == 3) {
                            this.player.body.x = this.portals[numberAnotherPortal].x - this.player.body.gameObject.width / 2;
                            this.player.body.y = this.portals[numberAnotherPortal].y + this.portals[numberAnotherPortal].height / 2;
                        }
                    }
                }
            }
    }
}