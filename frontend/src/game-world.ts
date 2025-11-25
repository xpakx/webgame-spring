import { AssetManager } from "./asset-manager";
import {
	Scene, PerspectiveCamera,
	BoxGeometry, MeshBasicMaterial, Mesh,
	PCFSoftShadowMap, PlaneGeometry,
	MeshToonMaterial, ConeGeometry,
	Vector3,
} from "three";
import { gsap } from 'gsap';

export class GameWorld {
	private assets: AssetManager;
	private scene: Scene;
	private player?: Mesh;

	constructor(assets: AssetManager) {
		this.assets = assets;
		this.scene = new Scene();
	}

	getPlayerPos(): Vector3 {
		if (this.player) return this.player.position;
		return new Vector3(0, 0, 0);
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
	}
}
