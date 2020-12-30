import Leaf from "./leaf";
import {get_random_int as rand} from "./accessory_functions";
import {fillMap} from"./fill_map";
import Rectangle from "./rectangle";
const TILE_MAPPING = {
    BLANK: 17,
    FLOOR: 95
}

const LEVEL_TO_TILE ={
    0: TILE_MAPPING.BLANK,
    1: TILE_MAPPING.FLOOR
}

export function create_map(tile_size, scene) {
    const MAX_LEAF_SIZE = 20;
    let width = 200;
    let height = 200;
    let leafs = []; // new Array
//console.log(scene);
// сначала создаём лист, который будет "корнем" для всех остальных листьев.
// let root = new Leaf(0, 0, _sprMap.width, _sprMap.height);
    let root = new Leaf(0, 0, 200, 200); // пока 200 х 200
    leafs.push(root);

    let did_split = true;
// циклически снова и снова проходим по каждому листу в нашем leafs, пока больше не останется листьев, которые можно разрезать.
    while (did_split) {
        did_split = false;
        for (let current_leaf of leafs) // тут было for each
        {
            //console.log(current_leaf);
            if (current_leaf.leftChild == undefined && current_leaf.rightChild == undefined) // если лист ещё не разрезан...
            {
                // если этот лист слишком велик, или есть вероятность 75%...
                if (current_leaf.width > MAX_LEAF_SIZE || current_leaf.height > MAX_LEAF_SIZE || Math.random() > 0.25) {
                    if (current_leaf.split()) // разрезаем лист!
                    {
                        // если мы выполнили разрезание, передаём дочерние листья в Vector, чтобы в дальнейшем можно было в цикле обойти и их
                        leafs.push(current_leaf.leftChild);
                        leafs.push(current_leaf.rightChild);
                        did_split = true;
                    }
                }
            }
        }
    }
    let rectangleArray = [];
    root.createRooms(rectangleArray);
    let randomNumber = rand(0, rectangleArray.length);

    /*
    let auroraX = (rand(rectangleArray[randomNumber].corner_x,
        rectangleArray[randomNumber].corner_x + rectangleArray[randomNumber].size_x) - 1) * tile_size;
    let auroraY = (rand(rectangleArray[randomNumber].corner_y,
        rectangleArray[randomNumber].corner_y + rectangleArray[randomNumber].size_y) - 1) * tile_size;
     */

    let auroraX = (rand(rectangleArray[randomNumber].corner_x + 1,
        rectangleArray[randomNumber].corner_x - 1 + rectangleArray[randomNumber].size_x) - 0.5) * tile_size;
    let auroraY = (rand(rectangleArray[randomNumber].corner_y + 1,
        rectangleArray[randomNumber].corner_y - 1 + rectangleArray[randomNumber].size_y) - 0.5) * tile_size;

    create_halls(leafs, 1, rectangleArray);
    let map_matrix = fillMap(rectangleArray, width, height);
    scene.map = scene.make.tilemap({tileWidth: tile_size,
        tileHeight: tile_size,
        width: width,
        height: height});
    let tileSet      = scene.map.addTilesetImage("tiles", null, tile_size, tile_size)
    let outsideLayer = scene.map.createBlankDynamicLayer("Water", tileSet);
    let groundLayer  = scene.map.createBlankDynamicLayer("Ground", tileSet);
    let stuffLayer   = scene.map.createBlankDynamicLayer("Stuff", tileSet);

    for (let x = 0; x < width; x++)
    {
        for (let y = 0; y < height; y++)
        {
            if (map_matrix[x][y] == 1)
            {
                groundLayer.putTileAt((LEVEL_TO_TILE[map_matrix[x][y]]), x, y);
            }
            else
            {
                outsideLayer.putTileAt((LEVEL_TO_TILE[map_matrix[x][y]]), x, y);
            }
        }
    }

    settingWorld(scene, outsideLayer, groundLayer, stuffLayer);
    scene.player = scene.characterFactory.buildCharacter('aurora', auroraX, auroraY,{player: true});
    scene.gameObjects.push(scene.player);
    scene.physics.add.collider(scene.player, groundLayer);
    scene.physics.add.collider(scene.player, stuffLayer);
    scene.physics.add.collider(scene.player, outsideLayer);
    const camera = scene.cameras.main;
    camera.setZoom(1.0);
    camera.setBounds(0, 0, scene.map.widthInPixels, scene.map.heightInPixels);
    camera.startFollow(scene.player);
    camera.roundPixels = true;
    return {"Ground": groundLayer, "Stuff": stuffLayer, "Outside": outsideLayer};
}

function create_halls(leafs, hallSize, rectangleArray)
{
    for (let current_leaf of leafs)
    {
        if (current_leaf.leftChild != undefined && current_leaf.rightChild != undefined)
        {
            let room1 = current_leaf.leftChild.get_room();
            let room2 = current_leaf.rightChild.get_room();
            let x1 = rand(room1.corner_x + hallSize, room1.corner_x + room1.size_x - hallSize);
            let y1 = rand(room1.corner_y + hallSize, room1.corner_y + room1.size_y - hallSize);
            let x2 = rand(room2.corner_x + hallSize, room2.corner_x + room2.size_x - hallSize);
            let y2 = rand(room2.corner_y + hallSize, room2.corner_y + room2.size_y - hallSize);
            let minX = Math.min(x1, x2) - hallSize;
            let minY = Math.min(y1, y2) - hallSize;
            let maxX = Math.max(x1, x2) - hallSize;
            let maxY = Math.max(y1, y2) - hallSize;
            let width = x1 - x2;
            let height = y1 - y2;
            let mainDiag = width * height >= 0;
            let choise = Math.random() >= 0.5;
            width = Math.abs(width) + 2 * hallSize;
            height = Math.abs(height) + 2 * hallSize;
            let horX, horY, vertX, vertY;
            if (choise)
            {
                horX = minX;
                horY = minY;
            }
            else
            {
                horX = minX;
                horY = maxY;
            }
            if (choise && mainDiag || !choise && !mainDiag)
            {
                vertX = maxX;
                vertY = minY;
            }
            else
            {
                vertX = minX;
                vertY = minY;
            }
            if (height > hallSize)
            {
                let rectangle = new Rectangle(vertX, vertY, 2 * hallSize, height);
                rectangleArray.push(rectangle);
                /*if (rectangle.corner_x == 0)
                {
                    console.log(rectangle);
                }*/
                //current_leaf.halls.push(rectangle);

            }
            if (width > hallSize)
            {
                let rectangle = new Rectangle(horX, horY, width, 2 * hallSize);
                rectangleArray.push(rectangle);
                /*if (rectangle.corner_x == 0)
                {
                    console.log(rectangle);
                }*/
                //current_leaf.halls.push(rectangle);
            }
        }
    }
}

function settingWorld(scene, outsideLayer, groundLayer, stuffLayer)
{
    scene.physics.add.collider(scene, outsideLayer);
    scene.physics.add.collider(scene, groundLayer);
    scene.physics.add.collider(scene, stuffLayer);
    scene.physics.world.setBounds(0,0, scene.map.widthInPixels,
        scene.map.heightInPixels, true);
    groundLayer.setCollisionBetween(1, 500);
    stuffLayer.setDepth(10);
    outsideLayer.setDepth(9999);
    outsideLayer.setCollisionBetween(1, 500);
}
