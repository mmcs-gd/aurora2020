export default class LevelMetrics {

	constructor(level) {
		this.level = level;
    }
    
    // % заполнения
    fillPercent() {
        return 50.0;
    }

    // проверить связность
    connectivity() {
        return true;
    }
}