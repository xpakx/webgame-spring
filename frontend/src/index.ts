import { gsap } from 'gsap';
import {
	Scene, PerspectiveCamera,
	BoxGeometry, MeshBasicMaterial, Mesh,
	HemisphereLight,
	PCFSoftShadowMap, PlaneGeometry,
	MeshToonMaterial, ConeGeometry,
	AmbientLight,
	DirectionalLight, Vector3,
} from "three";
import { Renderer } from './renderer';
import { Game } from './game';
import { UIManager } from './ui';
import { AssetManager } from './asset-manager';

(async () => {
	const r = new Renderer();
	await r.init(800, 600)
	const game = new Game()
	const ui = new UIManager(
		r.app.stage,
		r.app.screen.width,
		r.app.screen.height,
	);
	ui.loadAssets();
	gsap.ticker.remove(gsap.updateRoot);
	const assets = new AssetManager();

	const scene = new Scene();

	
	r.threeRenderer!.setClearColor(0x111111);
	r.threeRenderer!.autoClear = true;
	r.threeRenderer!.shadowMap.enabled = true;
	r.threeRenderer!.shadowMap.type = PCFSoftShadowMap;
	const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);


	const groundGeometry = new PlaneGeometry(500, 500);
	const groundMaterial = new MeshToonMaterial({color: 0x280028});
	const ground = new Mesh(groundGeometry, groundMaterial);
	ground.rotation.x = -Math.PI / 2;
	ground.receiveShadow = true;
	scene.add(ground);
	const playerGeometry = new ConeGeometry(0.5, 1.5, 4);
	const playerMaterial = new MeshToonMaterial({color: 0xff00ff});
	const player = new Mesh(playerGeometry, playerMaterial);
	player.position.y = 0.75;
	player.castShadow = true;
	scene.add(player);

	await assets.loadAsset(
		'teapot', 'assets/teapot.obj'
	);
	const teapotMaterial = new MeshToonMaterial({color: 0xff1155});
	assets.setAssetMaterial('teapot', teapotMaterial)

	const teapot = assets.getAsset('teapot');
	teapot.position.x = 10;
	scene.add(teapot);
	const teapot2 = assets.getAsset("teapot");
	teapot2.position.x = -10;
	scene.add(teapot2);

	const ambientLight = new AmbientLight(0xffffff, 0.5);
	scene.add(ambientLight);
	const directionalLight = new DirectionalLight(0xffffff, 0.7);
	directionalLight.position.set(20, 30, 20);
	directionalLight.castShadow = true;
	directionalLight.shadow.mapSize.width = 2048;
	directionalLight.shadow.mapSize.height = 2048;
	directionalLight.shadow.camera.left = -50;
	directionalLight.shadow.camera.right = 50;
	directionalLight.shadow.camera.top = 50;
	directionalLight.shadow.camera.bottom = -50;
	scene.add(directionalLight);
	scene.add(new HemisphereLight(0xffffff, 0x444444, 2));

	camera.position.set(0, 15, 12);
	camera.lookAt(player.position);

	gsap.to(teapot.rotation, {
		y: Math.PI * 2,
		duration: 5,
		repeat: -1,
		ease: "none",
	});

	let keys: {[key: string]: boolean} = {};
	window.addEventListener('keydown', (e) => keys[e.code] = true);
	window.addEventListener('keyup', (e) => keys[e.code] = false);

	// r.enablePostprocessing(scene, camera);
	
	const playerSpeed = 0.2;
	function handleInput() {
		let moveDirection = new Vector3(0, 0, 0);
		if (keys['KeyW'] || keys['ArrowUp']) moveDirection.z -= 1;
		if (keys['KeyS'] || keys['ArrowDown']) moveDirection.z += 1;
		if (keys['KeyA'] || keys['ArrowLeft']) moveDirection.x -= 1;
		if (keys['KeyD'] || keys['ArrowRight']) moveDirection.x += 1;
		if(moveDirection.lengthSq() > 0) {
			moveDirection.normalize();
			player.position.add(moveDirection.multiplyScalar(playerSpeed));
			const targetRotation = Math.atan2(moveDirection.x, moveDirection.z);
			player.rotation.y = targetRotation;
		}
		camera.position.x = player.position.x;
		camera.position.z = player.position.z + 12;
	}



	const render = (t: number) => {
		handleInput();
		game.tick()
		gsap.updateRoot(t / 1000);
		ui.update(t);
		r.render(scene, camera)

		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);
})();
