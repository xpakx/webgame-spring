import { gsap } from 'gsap';
import {
	Scene, PerspectiveCamera,
	BoxGeometry, MeshBasicMaterial, Mesh,
	HemisphereLight,
} from "three";
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { Renderer } from './renderer';
import { Game } from './game';
import { UIManager } from './ui';
import { AssetManager } from './asset-manager';

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

	const scene = new Scene();
	const camera = new PerspectiveCamera(
		75,
		800 / 600,
		0.1,
		1000
	);
	camera.position.z = 5;

	const geometry = new BoxGeometry();
	const material = new MeshBasicMaterial({ color: 0x00ff00 });
	const cube = new Mesh(geometry, material);
	// scene.add(cube);
	
	const object = await assets.loadObj('assets/teapot.obj');
	scene.add(object);

	scene.add(new HemisphereLight(0xffffff, 0x444444, 2));


	gsap.to(cube.rotation, {
		x: Math.PI * 2,
		y: Math.PI * 2,
		duration: 5,
		repeat: -1,
		ease: "none",
	});

	gsap.to(object.rotation, {
		y: Math.PI * 2,
		duration: 5,
		repeat: -1,
		ease: "none",
	});

	const render = (t: number) => {
		game.tick()
		gsap.updateRoot(t / 1000);
		ui.update(t);
		r.render(scene, camera)

		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);
})();
