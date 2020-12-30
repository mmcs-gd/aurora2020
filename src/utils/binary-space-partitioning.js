export default class BSP {

	generate(width, height, roomsCount) {
		let res = this.makePartition(width, height, roomsCount);
		let root = res[0], leaves = res[1];
		let rooms = this.createRooms(leaves);
		let obstacles = this.createObstacles(rooms);
		let halls = this.createHalls(root);
		let mask = this.createMask(width, height, rooms, halls, obstacles);
		return [ mask, rooms, obstacles ];
	}

	makePartition(width, height, roomsCount) {
		let root = new TreeNode(0, 0, width, height, null, null);
		let leaves = [ root ];
		
		for (let i = 1; i < roomsCount; ++i) {
			let index = Math.floor(Math.random() * leaves.length)
			let leaf = leaves[index];

			let x1, y1, w1, h1, x2, y2, w2, h2;
			let part = 0.3 + Math.random() * 0.4;
			if (leaf.width > leaf.height) {
				let w = Math.floor(leaf.width * part);
				x1 = leaf.top;
				y1 = leaf.left;
				w1 = w;
				h1 = leaf.height;

				x2 = leaf.top;
				y2 = leaf.left + w;
				w2 = leaf.width - w;
				h2 = leaf.height;
			} else {
				let h = Math.floor(leaf.height * part);
				x1 = leaf.top;
				y1 = leaf.left;
				w1 = leaf.width;
				h1 = h;

				x2 = leaf.top + h;
				y2 = leaf.left;
				w2 = leaf.width;
				h2 = leaf.height - h;
			}
			
			let leaf1 = new TreeNode(x1, y1, w1, h1, null, null);
			let leaf2 = new TreeNode(x2, y2, w2, h2, null, null);
			leaf.leftChild = leaf1;
			leaf.rightChild = leaf2;
			leaves.splice(index, 1);
			leaves.push(leaf1);
			leaves.push(leaf2);
		}

		return [ root, leaves ];
	}

	createRooms(leaves) {
		return leaves.map(function(leaf) {
			let w = Math.floor(0.5 * leaf.width + Math.random() * leaf.width * 0.5);
			let h = Math.floor(0.5 * leaf.height + Math.random() * leaf.height * 0.5);
			let x = leaf.top + Math.floor(Math.random() * (leaf.height - h));
			let y = leaf.left + Math.floor(Math.random() * (leaf.width - w));
			let room = new Room(x, y, w, h);
			leaf.room = room;
			return room;
		})
	}

	createObstacles(rooms) {
		let obstacles = [];
		for (let room of rooms) {
			let cnt = 1 + Math.floor(Math.random() * 3);
			for (let i = 0; i < cnt; ++i) {
				let x = room.top + 1 + Math.floor(Math.random() * (room.height - 1));
				let y = room.left + 1 + Math.floor(Math.random() * (room.width - 1));
				obstacles.push(new Obstacle(x, y));
			}
		}
		return obstacles;
	}

	getRoom(leaf) {
		if (leaf.leftChild === null && leaf.rightChild === null) {
			return leaf.room;
		}
		if (leaf.leftChild === null) {
			return this.getRoom(leaf.rightChild);
		}
		if (leaf.rightChild === null) {
			return this.getRoom(leaf.leftChild);
		}
		if (Math.random() < 0.5) {
			return this.getRoom(leaf.leftChild);
		} else {
			return this.getRoom(leaf.rightChild);
		}
	}

	createHalls(node) {
		if (node.leftChild === null || node.rightChild === null) {
			return [];
		}

		let room1 = this.getRoom(node.leftChild), room2 = this.getRoom(node.rightChild);

		let halls = this.createHalls(node.leftChild);
		halls = halls.concat(this.createHalls(node.rightChild));

		let p1 = 
		{ 
			x: room1.top + Math.floor(Math.random() * room1.height),
			y: room1.left + Math.floor(Math.random() * room1.width)
		};
		let p2 = 
		{ 
			x: room2.top + Math.floor(Math.random() * room2.height),
			y: room2.left + Math.floor(Math.random() * room2.width)
		};

		let w = p2.y - p1.y, h = p2.x - p1.x;
		let hallWidth = 3;
		let rand = Math.random();
		if (w < 0) {
			if (h < 0) {
				if (rand < 0.5) {
					halls.push(new Room(p2.x, p2.y, Math.abs(w), hallWidth));
					halls.push(new Room(p2.x, p1.y, hallWidth, Math.abs(h)));
				} else {
					halls.push(new Room(p1.x, p2.y, Math.abs(w), hallWidth));
					halls.push(new Room(p2.x, p2.y, hallWidth, Math.abs(h)));
				}
			} else if (h > 0) {
				if (rand < 0.5)
				{
					halls.push(new Room(p1.x, p2.y, Math.abs(w), hallWidth));
					halls.push(new Room(p1.x, p2.y, hallWidth, Math.abs(h)));
				} else {
					halls.push(new Room(p2.x, p2.y, Math.abs(w), hallWidth));
					halls.push(new Room(p1.x, p1.y, hallWidth, Math.abs(h)));
				}
			} else {
				halls.push(new Room(p2.x, p2.y, Math.abs(w), hallWidth));
			}
		} else if (w > 0) {
			if (h < 0) {
				if (rand < 0.5) {
					halls.push(new Room(p2.x, p1.y, Math.abs(w), hallWidth));
					halls.push(new Room(p2.x, p1.y, hallWidth, Math.abs(h)));
				} else {
					halls.push(new Room(p1.x, p1.y, Math.abs(w), hallWidth));
					halls.push(new Room(p2.x, p2.y, hallWidth, Math.abs(h)));
				}
			} else if (h > 0) {
				if (rand < 0.5) {
					halls.push(new Room(p1.x, p1.y, Math.abs(w), hallWidth));
					halls.push(new Room(p1.x, p2.y, hallWidth, Math.abs(h)));
				} else {
					halls.push(new Room(p2.x, p1.y, Math.abs(w), hallWidth));
					halls.push(new Room(p1.x, p1.y, hallWidth, Math.abs(h)));
				}
			} else {
				halls.push(new Room(p1.x, p1.y, Math.abs(w), hallWidth));
			}
		} else {
			if (h < 0) {
				halls.push(new Room(p2.x, p2.y, hallWidth, Math.abs(h)));
			} else if (h > 0) {
				halls.push(new Room(p1.x, p1.y, hallWidth, Math.abs(h)));
			}
		}

		return halls;
	}

	createMask(width, height, rooms, halls, obstacles) {
		let mask = [];
		for (let i = 0; i < height; ++i) {
			mask.push(new Array(width).fill(0)); // nothing
		}

		for (let rect of rooms) {
			for (let i = rect.top; i < rect.top + rect.height; ++i) {
				for (let j = rect.left; j < rect.left + rect.width; ++j) {
					mask[i][j] = 1; // floor
				}
			}
		}

		for (let rect of halls) {
			for (let i = rect.top; i < rect.top + rect.height; ++i) {
				for (let j = rect.left; j < rect.left + rect.width; ++j) {	
					if (i >= height || j >= width) continue;
					mask[i][j] = 1; // floor
				}
			}
		}

		for (let ob of obstacles) {
			mask[ob.x][ob.y] = 2; // obstacle
		}

		for (let i = 0; i < height; ++i) {
			for (let j = 0; j < width; ++j) {
				if (i == 0 || i == height - 1 || j == 0 || j == width - 1)
					mask[i][j] = 0; // nothing
			}
		}

		return mask;
	}
}

class TreeNode {
	constructor(x, y, w, h, l, r) {
		this.top = x;
		this.left = y;
		this.width = w;
		this.height = h;
		this.leftChild = l;
		this.rightChild = r;
	}
}

class Room {
	constructor(x, y, w, h) {
		this.top = x;
		this.left = y;
		this.width = w;
		this.height = h;
	}
}

class Obstacle {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}