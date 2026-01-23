import { GameLogic } from "logic/logic";
import { GameWorld } from "./game-world";

export class Game {
	player: Player;
	world: GameWorld;
	logic: GameLogic;

	constructor(world: GameWorld, logic: GameLogic) {
		this.player = new Player();
		this.world = world;
		this.logic = logic;
	}

	tick() {
		if (this.logic.hasEnemyToSpawn()) {
			const enemy = logic.spawnEnemy();
			// TODO: Add to gameworld
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
