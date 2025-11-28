import { gsap } from 'gsap';
import {
	PerspectiveCamera, PCFSoftShadowMap,
	MeshToonMaterial, Vector3,
} from "three";
import { Renderer } from './renderer';
import { Game } from './game';
import { UIManager } from './ui';
import { AssetManager } from './asset-manager';
import { GameWorld } from './game-world';
import { Client } from './client';

(async () => {
	const r = new Renderer();
	await r.init()
	const game = new Game()
	const ui = new UIManager(
		r.app.stage,
		r.app.screen.width,
		r.app.screen.height,
	);
	ui.loadAssets();
	gsap.ticker.remove(gsap.updateRoot);
	const assets = new AssetManager();
	const world = new GameWorld(assets);

	
	r.threeRenderer!.setClearColor(0x111111);
	r.threeRenderer!.autoClear = true;
	r.threeRenderer!.shadowMap.enabled = true;
	r.threeRenderer!.shadowMap.type = PCFSoftShadowMap;
	const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);


	await assets.loadAsset(
		'teapot', 'assets/teapot.obj'
	);
	const teapotMaterial = new MeshToonMaterial({color: 0xff1155});
	assets.setAssetMaterial('teapot', teapotMaterial)

	world.initMap();

	r.addDefaultLights(world.getScene());

	camera.position.set(0, 15, 12);
	camera.lookAt(world.getPlayerPos());


	let keys: {[key: string]: boolean} = {};
	window.addEventListener('keydown', (e) => keys[e.code] = true);
	window.addEventListener('keyup', (e) => keys[e.code] = false);

	// r.enablePostprocessing(world.getScene(), camera);
	
	let zoomLevel = 1;
	const minZoom = 0.3;
	const maxZoom = 3.0;
	const zoomSensitivity = 0.001;

	window.addEventListener('wheel', (e) => {
		zoomLevel += e.deltaY * zoomSensitivity;
		zoomLevel = Math.max(minZoom, Math.min(maxZoom, zoomLevel));
		camera.position.y = 15 * zoomLevel; 
		camera.position.z = world.getPlayerPos().z + 12 * zoomLevel;
		camera.position.x = world.getPlayerPos().x;
	});

	window.addEventListener('resize', (e) =>{
		const newWidth = window.innerWidth;
		const newHeight = window.innerHeight;

		r.pixiRenderer!.resize(newWidth, newHeight);
		r.threeRenderer!.setSize(newWidth, newHeight);
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		ui.resize(newWidth, newHeight);
	});
	
	const playerSpeed = 0.2;
	function handleInput() {
		let moveDirection = new Vector3(0, 0, 0);
		if (keys['KeyW'] || keys['ArrowUp']) moveDirection.z -= 1;
		if (keys['KeyS'] || keys['ArrowDown']) moveDirection.z += 1;
		if (keys['KeyA'] || keys['ArrowLeft']) moveDirection.x -= 1;
		if (keys['KeyD'] || keys['ArrowRight']) moveDirection.x += 1;

		const player = world.getPlayer()!;
		if(moveDirection.lengthSq() > 0) {
			moveDirection.normalize();
			player.position.add(moveDirection.multiplyScalar(playerSpeed));
			const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
			player.rotation.y = targetRotation;
		}
		camera.position.x = player.position.x;
		camera.position.z = player.position.z + 12 * zoomLevel;
	}

	const client = new Client(
		"http://localhost:8000",
		"http://localhost:8000",
	);
	// client.rtcConnect();



	let isPaused = false
	const render = (t: number) => {
		requestAnimationFrame(render);
		if (isPaused) return;
		handleInput();
		game.tick()
		gsap.updateRoot(t / 1000);
		ui.update(t, game.player);
		r.render(world.getScene(), camera)

	}
	requestAnimationFrame(render);
})();
