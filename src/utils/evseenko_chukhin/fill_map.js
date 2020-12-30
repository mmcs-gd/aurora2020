export function fillMap(rectangleArray, width, height)
{
    let mapArray = new Array();
    for (let w = 0; w < width; w++)
    {
        mapArray[w] = new Array();
        for (let h = 0; h < height; h++)
        {
            mapArray[w][h] = 0;
        }
    }

    for (let currentRectangle of rectangleArray)
    {
        //console.log(currentRectangle);
        let secondCornerX = currentRectangle.corner_x + currentRectangle.size_x;
        let secondCornerY = currentRectangle.corner_y + currentRectangle.size_y;
        for (let w = currentRectangle.corner_x; w < secondCornerX; w++)
        {
            //console.log("w = " + w);
            for (let h = currentRectangle.corner_y; h < secondCornerY; h++)
            {
                //console.log("h = " + h);
                //console.log("mapArray[" + (w - 1) + "][" + (h - 1)  + "]" + mapArray[w - 1][h - 1]);
                // mapArray[w][h - 1] = 1; // original
                mapArray[w][h] = 1;
            }
        }
    }
    return mapArray;
}