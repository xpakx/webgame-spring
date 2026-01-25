import { GameLogic } from "logic/logic";
import { GameWorld } from "./game-world";

export class Game {
	player: Player;
	world: GameWorld;
	logic: GameLogic;
	enemies: Enemy[] = [];
	lastTime: number = 0;
	gameTime: number = 0;
	private nextEnemyId: number = 1;

	constructor(world: GameWorld, logic: GameLogic) {
		this.player = new Player();
		this.world = world;
		this.logic = logic;
	}

	getTimeDelta(): number {
		return this.gameTime - this.lastTime;
	}

	createEnemy(enemyType: string) {
		const level = 1;
		let enemy;
		const id = this.nextEnemyId;
		this.nextEnemyId += 1;
		switch (enemyType) { 
			case 'shooter':
				enemy = new Shooter(id);
				break;
			case 'boss':
				enemy = new Boss(id, level);
				break;
			default:
				enemy = new Grunt(id);
		}
		this.world.createEnemy(enemyType, id);
		this.enemies.push(enemy)
	}

	updateTime(time: number) {
		const timeInSeconds = time / 1000;
		this.lastTime = this.gameTime;
		this.gameTime = timeInSeconds;
		this.logic.updateTime(time, this.getTimeDelta()*1000);
	}

	tick() {
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

type EnemyType = 'grunt' | 'shooter' | 'boss';

export interface Enemy {
	id: number;
	hp: number;
	maxHp: number;
	enemyType: EnemyType;
	lastShotTime: number;
	bounceOffset: number;
	baseHeight: number;
	isSlowed: boolean;
	slowTimer: number;
}

export class Grunt implements Enemy {
	enemyType: EnemyType = 'grunt';
	id: number;
	hp: number;
	maxHp: number;
	lastShotTime: number;
	bounceOffset: number;
	baseHeight: number;
	isSlowed: boolean;
	slowTimer: number;
	scale: number = 1;
	baseHp: number = 1;

	constructor(id: number) {
		this.id = id;
		this.hp = this.baseHp;
		this.maxHp = this.hp;
		this.lastShotTime = 0;
		this.bounceOffset = Math.random() * Math.PI * 2;
		this.baseHeight = this.scale / 2;
		this.isSlowed = false;
		this.slowTimer = 0;
	}
}

export class Shooter extends Grunt {
	baseHp: number = 2;
	enemyType: EnemyType = 'shooter';
	
	constructor(id: number) {
		super(id);
	}
}

export class Boss extends Grunt {
	baseHp: number = 2;
	scale: number = 4;
	enemyType: EnemyType = 'boss';
	
	constructor(id: number, level: number) {
		super(id);
		this.baseHp = 50 * level;
		this.hp = this.baseHp;
		this.maxHp = this.hp;
	}
}
