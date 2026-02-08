import { AssetManager } from "./asset-manager";
import {
	Scene, PerspectiveCamera,
	BoxGeometry, MeshBasicMaterial, Mesh,
	PCFSoftShadowMap, PlaneGeometry,
	MeshToonMaterial, ConeGeometry,
	Vector3, CylinderGeometry,
	Box3, SphereGeometry,
	OctahedronGeometry,
	Clock,
} from "three";
import { gsap } from 'gsap';
import { mapSize } from "pixi.js";

export class GameWorld {
	private assets: AssetManager;
	private scene: Scene;
	private player?: Mesh;

	private obstacles: Mesh[] = [];
	private enemies: Map<number, Mesh> = new Map();
	private projectiles: Map<number, Mesh> = new Map();
	private enemyProjectiles: Map<number, Mesh> = new Map();
	private tempPlayerBox = new Box3();
	private tempObstacleBox = new Box3();
	private clock: Clock = new Clock();

	constructor(assets: AssetManager) {
		this.assets = assets;
		this.scene = new Scene();
	}

	getWorldClockDelta(): number {
		return this.clock.getDelta();
	}

	getPlayerPos(): Vector3 {
		if (this.player) return this.player.position;
		return new Vector3(0, 0, 0);
	}

	getPlayer(): Mesh | undefined {
		return this.player;
	}

	getScene(): Scene {
		return this.scene;
	}

	initMap() {
		const groundGeometry = new PlaneGeometry(500, 500);
		const groundMaterial = new MeshToonMaterial({color: 0x280028});
		const ground = new Mesh(groundGeometry, groundMaterial);
		ground.rotation.x = -Math.PI / 2;
		ground.receiveShadow = true;
		this.scene.add(ground);
		const playerGeometry = new ConeGeometry(0.5, 1.5, 4);
		const playerMaterial = new MeshToonMaterial({color: 0xff00ff});
		const player = new Mesh(playerGeometry, playerMaterial);
		player.position.y = 0.75;
		player.castShadow = true;
		this.scene.add(player);
		this.player = player;


		const teapot = this.assets.getAsset('teapot');
		teapot.position.x = 10;
		this.scene.add(teapot);
		const teapot2 = this.assets.getAsset("teapot");
		teapot2.position.x = -10;
		this.scene.add(teapot2);

		gsap.to(teapot.rotation, {
			y: Math.PI * 2,
			duration: 5,
			repeat: -1,
			ease: "none",
		});
		this.createScenery();
	}

	createScenery() {
		const areaSize = 200;
		for (let i = 0; i < 300; i++) {
			const x = (Math.random() - 0.5) * areaSize;
			const z = (Math.random() - 0.5) * areaSize;
			if (Math.abs(x) < 10 && Math.abs(z) < 10) continue;
			const type = Math.random();
			if (type < 0.3) this.createTree(x, z);
			else if (type < 0.8) this.createMushroom(x, z);
			else this.createCrystal(x, z);
		}
	}

	createTree(x: number, z: number) {
		const treeTrunkMaterial = new MeshToonMaterial({color: 0x8B4513});
		const treeLeavesMaterial = new MeshToonMaterial({color: 0x006400});

		const treeHeight = Math.random()*3+2;
		const tree = new Mesh(
			new CylinderGeometry(.2, .3, treeHeight, 8),
			treeTrunkMaterial
		);
		const leavesHeight = Math.random()*2+2
		const leaves = new Mesh(
			new ConeGeometry(1.5, leavesHeight, 8),
			treeLeavesMaterial 
		);
		tree.position.set(x, treeHeight/2, z);
		tree.castShadow = true;
		leaves.position.set(x, treeHeight+leavesHeight/2-0.5, z)
		leaves.castShadow = true
		this.scene.add(tree, leaves)
		this.obstacles.push(tree);
	}

	createMushroom(x: number, z: number) {
		const mushroomStemMaterial = new MeshToonMaterial({color: 0xFFF8DC});
		const mushroomCapMaterial = new MeshToonMaterial({color: 0xDC143C});

		const stemHeight = Math.random()*.5+.3;
		const stem = new Mesh(
			new CylinderGeometry(.1, .1, stemHeight, 8),
			mushroomStemMaterial
		);
		stem.position.set(x, stemHeight/2, z);
		stem.castShadow = true;
		const cap = new Mesh(
			new SphereGeometry(
				Math.random()*.5+.3,
				16, 8, 0, 
				2*Math.PI,0,Math.PI/2
			),
			mushroomCapMaterial
		);
		cap.position.set(x, stemHeight, z);
		cap.castShadow = true;
		this.scene.add(stem, cap)
		this.obstacles.push(cap);
	}

	createCrystal(x: number, z: number) {
		const crystalMaterial = new MeshToonMaterial({
			color: 0xADD8E6,
			transparent: true,
			opacity: 0.5
		});

		const height = Math.random()*2+1;
		const crystal = new Mesh(
			new CylinderGeometry(
				0, 
				Math.random()*.5+.2,
				height, 6
			),
			crystalMaterial
		);
		crystal.position.set(x, height/2, z);
		crystal.rotation.y = Math.random()*Math.PI;
		crystal.castShadow = true;
		this.scene.add(crystal)
		this.obstacles.push(crystal);
	}

	checkCollision(): boolean {
		// TODO: perhaps split in sectors?
		if (!this.player) return false;

		this.tempPlayerBox.setFromObject(this.player);
		this.tempPlayerBox.expandByScalar(-0.1); 

		for (const obstacle of this.obstacles) {
			this.tempObstacleBox.setFromObject(obstacle);
			if (this.tempPlayerBox.intersectsBox(this.tempObstacleBox)) {
				return true;
			}
		}

		return false;
	}

	reset() {
		this.scene = new Scene();
		this.initMap();
	}

	getEnemyById(id: number): Mesh | undefined {
		return this.enemies.get(id);
	}

	getDirectionToPlayer(mesh: Mesh): Vector3 {
		return new Vector3()
		.subVectors(this.player!.position, mesh.position);
	}

	getDistanceToPlayer(mesh: Mesh): number {
		const direction = this.getDirectionToPlayer(mesh);
		return direction.length();
	}

	createEnemy(enemyType: string, id: number) {
		if (!this.player) return;
		let geometry, material, scale;
		const angle = Math.random() * Math.PI * 2;
		const spawnDist = 40;
		const x = this.player.position.x + Math.sin(angle) * spawnDist;
		const z = this.player.position.z + Math.cos(angle) * spawnDist;
		switch (enemyType) { 
			case 'shooter': geometry = new OctahedronGeometry(0.7);

				material = new MeshToonMaterial({color: 0x9400D3});
				scale = 1;
				break;
			case 'boss': geometry = new BoxGeometry(4, 4, 4);
				material = new MeshToonMaterial({color: 0x8B0000});
				scale = 4;
				break;
			default: geometry = new BoxGeometry(1, 1, 1);
				material = new MeshToonMaterial({color: 0x00FF00});
				scale = 1;
		}
		const mesh = new Mesh(geometry, material);
		mesh.position.set(x, scale / 2, z);
		mesh.castShadow = true;
		this.enemies.set(id, mesh);
		this.scene.add(mesh);
	}

	createEnemyProjectile(enemyId: number, id: number) {
		const enemyMesh =  this.getEnemyById(enemyId);
		if (!enemyMesh) return;
		const projGeo = new SphereGeometry(0.3, 8, 8);
		const material = new MeshToonMaterial({color: 0x8B0000});
		const projectile = new Mesh(projGeo, material);
		projectile.position.copy(enemyMesh.position);
		this.enemyProjectiles.set(id, projectile);
		this.scene.add(projectile); 
	}

	getProjectileById(id: number): Mesh | undefined {
		return this.projectiles.get(id);
	}

	removeProjectile(id: number): boolean {
		return this.projectiles.delete(id);
	}
}
