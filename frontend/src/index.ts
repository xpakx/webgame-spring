import { gsap } from 'gsap';
import {
	Assets, Sprite,
	TextureSource 
} from 'pixi.js';
import {
	Scene, PerspectiveCamera,
	BoxGeometry, MeshBasicMaterial, Mesh,
	HemisphereLight,
} from "three";
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { Renderer } from './renderer';
import { Game } from './game';

(async () => {
	const r = new Renderer();
	await r.init()
	const game = new Game()

	gsap.ticker.remove(gsap.updateRoot);

	TextureSource.defaultOptions.scaleMode = 'nearest';
	const texture = await Assets.load('https://pixijs.com/assets/bunny.png');

	const logo = new Sprite({
		texture,
		anchor: 0.5,
		x: r.app.screen.width / 2,
		y: r.app.screen.height / 2,
	});

	logo.width = 100;
	logo.scale.y = logo.scale.x;
	logo.eventMode = 'static';

	const xTo = gsap.quickTo(logo, 'x', { duration: 0.6, ease: 'power3' });
	const yTo = gsap.quickTo(logo, 'y', { duration: 0.6, ease: 'power3' });

	logo.on('globalpointermove', (event) => {
		xTo(event.global.x);
		yTo(event.global.y);
	});

	r.app.stage.addChild(logo);

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
	
	const object = await loadTeapot()
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
		r.render(scene, camera)

		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);
})();


async function loadTeapot() {
	const loader = new OBJLoader();
	const object = await loader.loadAsync( 'assets/teapot.obj' );
	object.scale.set(0.5, 0.5, 0.5);
	object.position.set(0, 0, 0);
	object.rotation.set(0, 0, 0);
	return object;
}
