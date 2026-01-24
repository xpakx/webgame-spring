import { GameLogic } from "logic/logic";
import { GameWorld } from "./game-world";

export class Game {
	player: Player;
	world: GameWorld;
	logic: GameLogic;
	enemies: Enemy[] = [];
	gameTime: number = 0;
	private nextEnemyId: number = 1;

	constructor(world: GameWorld, logic: GameLogic) {
		this.player = new Player();
		this.world = world;
		this.logic = logic;
	}

	createEnemy(enemyType: string) {
		const level = 1;
		let hp, maxHp, scale;
		switch (enemyType) { 
			case 'shooter':
				hp = 2;
				scale = 1;
				break;
			case 'boss':
				hp = 50 * level;
				scale = 4;
				break;
			default:
				hp = 1;
				scale = 1;
		}
		maxHp = hp;
		const id = this.nextEnemyId;
		this.nextEnemyId += 1;
		let enemyObject: Enemy = {
			id,
			hp,
			maxHp,
			enemyType,
			lastShotTime: 0,
			bounceOffset: Math.random() * Math.PI * 2,
			baseHeight: scale / 2,
			isSlowed: false,
			slowTimer: 0
		};
		this.world.createEnemy(enemyType, enemyObject.id);
		this.enemies.push(enemyObject)
	}

	tick(time: number) {
		this.gameTime += this.world.getWorldClockDelta();
		while (this.logic.hasEnemyToSpawn()) {
			const enemy = this.logic.spawnEnemy();
			this.createEnemy(enemy);
		
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
