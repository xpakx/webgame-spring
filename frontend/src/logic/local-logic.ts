import { GameLogic } from "./logic";

// Logic for game without server 
export class LocalLogic implements GameLogic {
	
	connect(): undefined {
	}

	hasEnemyToSpawn(): boolean {
		throw new Error("Method not implemented.");
	}
	spawnEnemy() {
		throw new Error("Method not implemented.");
	}


}
