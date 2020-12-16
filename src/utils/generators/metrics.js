import { marking } from './marking'

function fillability(map){
	let cntBack = 0;
	let cntLevel = 0;
	for(let x = 0; x < map.length; ++x){
		for(let y = 0; y < map[0].length; ++y){
			if(map[x][y]) ++cntLevel;
			else ++cntBack;
		}
	}
	return cntLevel / cntBack;
}

function connectivity(map){
	//return count of fields in map
	return marking(map);
}

export { fillability, connectivity };