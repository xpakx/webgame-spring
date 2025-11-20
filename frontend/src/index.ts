import { gsap } from 'gsap';
import {
	Application, Assets, Sprite,
	TextureSource 
} from 'pixi.js';
import {
	Scene, PerspectiveCamera, WebGLRenderer, 
	BoxGeometry, MeshBasicMaterial, Mesh
} from "three";

(async () => {
	const app = new Application();
	await app.init({
		width: 800,
		height: 600,
		clearBeforeRender: false,
		backgroundAlpha: 0,
		autoStart: false,
		antialias: true,
	});
	document.body.appendChild(app.canvas);

	TextureSource.defaultOptions.scaleMode = 'nearest';
	const texture = await Assets.load('https://pixijs.com/assets/bunny.png');

	const logo = new Sprite({
		texture,
		anchor: 0.5,
		x: app.screen.width / 2,
		y: app.screen.height / 2,
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

	app.stage.addChild(logo);

	const renderer = new WebGLRenderer({ 
		context: app.renderer.gl,
		alpha: true
	});
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
	scene.add(cube);

	gsap.to(cube.rotation, {
		x: Math.PI * 2,
		y: Math.PI * 2,
		duration: 5,
		repeat: -1,
		ease: "none",
	});


	let pt = performance.now();
	const render = (t: number) => {
		// const d = (t - pt) / (1000/60);
		pt = t;

		renderer.resetState();
		renderer.render(scene, camera);

		app.renderer.resetState();
		app.renderer.render(app.stage);

		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);
})();

