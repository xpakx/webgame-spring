import { GameLogic } from "./logic";

// Logic for game without server 
export class LocalLogic implements GameLogic {
	level: number = 4;
	toSpawn: string[] = [];
	time: number = 0;
	deltaTime: number = 0;
	spawnTimer: number = 0;
	
	connect(): undefined {

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

	updateTime(time: number, dt: number) {
		this.time = time;
		this.deltaTime = dt;
		this.checkSpawnTimer();
	}

	checkSpawnTimer() {
		this.spawnTimer += this.deltaTime;
		console.log(this.spawnTimer);
		if (this.spawnTimer < 3500 / this.level) return;
		this.spawnTimer = 0;
		const enemyType = Math.random() < 0.3 ? 'shooter' : 'grunt';
		this.createEnemy(enemyType); 
	}
}
