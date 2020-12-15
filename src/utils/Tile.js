
const TILE_MAPPING = {
    BLANK: 17,
    WALL: {
      TOP_LEFT: 3,
      TOP_RIGHT: 5,
      BOTTOM_RIGHT: 53,
      BOTTOM_LEFT: 51,
      TOP: 14,
      LEFT: 18,
      RIGHT: 16,
      BOTTOM: 52
    },
    FLOOR:{
       USUALY: 95,
       BROKEN: 248,
       BLACK: 151,
    },
    TOWER: {
      HEAD: 208,
      TAIL: 224,
    },
    TRASH: 86,
    CHEST: 260,
    STAIRS: 211,
  };
  
  export default TILE_MAPPING;