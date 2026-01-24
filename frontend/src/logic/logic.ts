export interface GameLogic {
	// TODO
	connect(): undefined;
	hasEnemyToSpawn(): boolean;
	spawnEnemy(): any;
	updateTime(t: number, dt: number): void;
}
