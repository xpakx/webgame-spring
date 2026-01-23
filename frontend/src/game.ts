import { GameLogic } from "logic/logic";
import { GameWorld } from "./game-world";

export class Game {
	player: Player;
	world: GameWorld;
	logic: GameLogic;
	enemies: Enemy[] = [];

	constructor(world: GameWorld, logic: GameLogic) {
		this.player = new Player();
		this.world = world;
		this.logic = logic;
	}

	tick() {
		while (this.logic.hasEnemyToSpawn()) {
			const enemy = this.logic.spawnEnemy();
			// TODO: Add to gameworld
			const enemyData = this.world.createEnemy(enemy, 1);
			if (enemyData) this.enemies.push(enemyData)
		
		}
		
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
