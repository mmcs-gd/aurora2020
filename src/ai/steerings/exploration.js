import Steering from "./steering.js";
import Vector2 from 'phaser/src/math/Vector2';
import Circle from 'phaser/src/geom/circle';

const windowWidth = document.documentElement.clientWidth;


 export default class Exploration extends Steering {
     constructor(owner, objects, force = 1, isArrival = true,path = new Vector2(0.0)) {
         super(owner, objects, force);
         this.isArrival = isArrival;
         this.path = path;
     }



     calculateImpulse() {

         const owner = this.owner.gameObject[0];
         if (this.isArrival) {
             const circle = new Circle(owner.x,owner.y,50);
             Circle.CircumferencePoint(circle,getRandomIntInclusive(0, 359),this.path)
            const SceneWidth = this.owner.game.config.width;
             const SceneHieght = this.owner.game.config.height;

             if(this.path.x <=  48)
                 this.path.x = 200
             if(this.path.x >= SceneWidth)
                 this.path.x = SceneWidth - 10;
            if(this.path.y <= 80)
                this.path.y = 300
             if(this.path.y >= SceneHieght)
                 this.path.y = SceneHieght - 80;
             this.isArrival = false;

         }

         if((owner.x -this.path.x)<=1 &&  (owner.y -this.path.y)<=1){
             this.isArrival = true;
             return new Vector2(0,0)
         }
         const desiredVelocity = new Vector2(this.path.x-owner.x,this.path.y-owner.y)
         desiredVelocity.normalize().scale(25);
         return  desiredVelocity;
     }
 }

export {Exploration}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.round(Math.random() * (max - min + 1) + min);
}