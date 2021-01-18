const TILES = {
    BLANK:167,
    WALL:
        {
            TOP: 33,
            TOP_LEFT: 3,
            TOP_RIGHT: 5,
            BOTTOM: 52,
            BOTTOM_LEFT: 51,
            BOTTOM_RIGHT: 53,
            LEFT: 18,
            RIGHT: 16
        },
    FLOOR:
        [{index: 90, weight: 4}, {index: [92,93, 105, 104], weight: 6}],
    GROUND:[{index: 222, weight: 4}, {index: [140,157, 173, 187], weight: 6}],
    TRASH:[{index: [240,242,241], weight: 4}, {index: [70,85, 86, 102], weight: 6}],
    COORIDOR:91
}

export default {TILES}