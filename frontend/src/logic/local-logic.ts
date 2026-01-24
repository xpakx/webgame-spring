import { GameLogic } from "./logic";

// Logic for game without server 
export class LocalLogic implements GameLogic {
	level: number = 0;
	toSpawn: string[] = [];
	
	connect(): undefined {
		setInterval(
			() => {
				const enemyType = Math.random() < 0.3 ? 'shooter' : 'grunt';
				this.createEnemy(enemyType); 
			}, 3500 / this.level); 

	}

	createEnemy(enemyType: string) {
		this.toSpawn.push(enemyType);
	}

	hasEnemyToSpawn(): boolean {
		return this.toSpawn.length > 0;
	}

	spawnEnemy() {
		return this.toSpawn.pop();
	}


}
