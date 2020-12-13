export const config = {
    BLANK: 0,
    WALL: {
        TOP: 2,
        LEFT: 3,
        RIGHT: 4,
        BOTTOM: 5,

        TOP_LEFT: 6,
        TOP_RIGHT: 7,
        BOTTOM_RIGHT: 8,
        BOTTOM_LEFT: 9,
        
        INNER_TOP_LEFT: 10,
        INNER_TOP_RIGHT: 11,
        INNER_BOTTOM_LEFT: 12,
        INNER_BOTTOM_RIGHT: 13
    },
    FLOOR: 1
}

export const digitToType = {
    0: 'BLANK',
    1: 'FLOOR',
    2: 'TOP',
    3: 'LEFT',
    4: 'RIGHT',
    5: 'BOTTOM',
    6: 'TOP_LEFT',
    7: 'TOP_RIGHT',
    8: 'BOTTOM_RIGHT',
    9: 'BOTTOM_LEFT',
    10: 'INNER_TOP_LEFT',
    11: 'INNER_TOP_RIGHT',
    12: 'INNER_BOTTOM_LEFT',
    13: 'INNER_BOTTOM_RIGHT'
}