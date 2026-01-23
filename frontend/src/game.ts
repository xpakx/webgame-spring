import { GameLogic } from "logic/logic";
import { GameWorld } from "./game-world";

export class Game {
	player: Player;
	world: GameWorld;
	logic: GameLogic;
	enemies: Enemy[] = [];
	gameTime: number = 0;

	constructor(world: GameWorld, logic: GameLogic) {
		this.player = new Player();
		this.world = world;
		this.logic = logic;
	}

	tick(dt: number) {
		this.gameTime += this.world.getWorldClockDelta();
		while (this.logic.hasEnemyToSpawn()) {
			const enemy = this.logic.spawnEnemy();
			// TODO: Add to gameworld
			const enemyData = this.world.createEnemy(enemy, 1);
			if (enemyData) this.enemies.push(enemyData)
		
		}
		this.updateEnemies();
		
	}


	updateEnemies() {
		this.enemies.forEach(enemy => {
			const currentSpeed = enemy.isSlowed ? 0.2 : 1.0;

			const bounceSpeed = 5;
			const bounceHeight = 0.25;
			const enemyMesh = this.world.getEnemyById(enemy.id);
			if (!enemyMesh) return;
			const direction = this.world.getDirectionToPlayer(enemyMesh);
			enemyMesh.position.y = enemy.baseHeight + Math.sin(this.gameTime * bounceSpeed + enemy.bounceOffset) * bounceHeight;
			const speed = 0.05;
			enemyMesh.position.add(direction.normalize().multiplyScalar(speed * currentSpeed));
		});
	}


	reset() {
		this.player = new Player();
	}
}

export class Player {
	hp: number;
	maxHp: number;
	mp: number;
	maxMp: number;

	constructor() {
		this.maxHp = 100;
		this.hp = this.maxHp;
		this.maxMp = 100;
		this.mp = this.maxMp;
	}

	hit(damagePoints: number) {
		this.hp -= damagePoints;
		if (this.hp < 0) this.hp = 0;
	}

	getHpPercent(): number {
		return this.hp/this.maxHp;
	}

	getMpPercent(): number {
		return this.mp/this.maxMp;
	}
}

export interface Enemy {
	id: number;
	hp: number;
	maxHp: number;
	enemyType: string;
	lastShotTime: number;
	bounceOffset: number;
	baseHeight: number;
	isSlowed: boolean;
	slowTimer: number;
}
