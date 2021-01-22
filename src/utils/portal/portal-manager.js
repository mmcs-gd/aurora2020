import Portal from './portal'

export default class PortalManager{
    constructor(portals, keySetPortal, player, effectName, KOSTYL, widthTile, heightTile, effectsFactory) {
        this.portals = portals;
        this.keySetPortal = keySetPortal; 
        this.player = player; 
        this.effectName = effectName; 
        this.KOSTYL = KOSTYL; 
        this.widthTile = widthTile; 
        this.heightTile = heightTile;
        this.effectsFactory = effectsFactory;
    }
    updatePortal() {
        if (this.portals.length >= 2 && this.portals[0].x == this.portals[1].x && this.portals[0].y == this.portals[1].y) {
            for (let i = 0; i < this.portals.length; i++) { 
                this.portals[i].effect.destroy();
            }
            this.portals = [];
        }
        if (this.keySetPortal.isDown && this.KOSTYL) {
            if (this.portals.length == 2) {
                for (let i = 0; i < this.portals.length; i++) {
                    this.portals[i].effect.destroy();
                }
                this.portals = [];
            }
            this.KOSTYL = false;
    
            let x = this.player.body.x;
            let y = this.player.body.y;
    
            let tileX = Math.floor((x + (this.player.body.gameObject.width / 2)) / this.widthTile);
            let tileY = Math.floor((y + (this.player.body.gameObject.height / 2)) / this.heightTile);
            
            if (this.player.faceDirection == 0) tileX -= 1;
            if (this.player.faceDirection == 1) tileX += 2;
            if (this.player.faceDirection == 2) tileY -= 1;
            if (this.player.faceDirection == 3) tileY += 2;
            
            x = tileX * this.widthTile;
            y = tileY * this.heightTile;
            
            if (this.portals.length < 2) {
                let effect = this.effectsFactory.buildEffect(this.effectName, x, y)
                let portal = new Portal(x, y, effect);
                this.portals.push(portal);
            }
            return this.portals;
        }
        this.KOSTYL = this.keySetPortal.isUp;
        return this.portals;
    }
}