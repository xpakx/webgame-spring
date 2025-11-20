import { gsap } from 'gsap';
import {
	Application, Assets, Sprite,
	TextureSource 
} from 'pixi.js';
import {
	Scene, PerspectiveCamera, WebGLRenderer, 
	BoxGeometry, MeshBasicMaterial, Mesh,
	MeshStandardMaterial, HemisphereLight,
	RepeatWrapping, MirroredRepeatWrapping
} from "three";
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { DDSLoader } from "three/examples/jsm/loaders/DDSLoader";

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
	// scene.add(cube);
	
	const object = await loadNeptune(scene)

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


async function loadTeapot(scene) {
	const loader = new OBJLoader();
	const object = await loader.loadAsync( 'assets/teapot.obj' );
	object.scale.set(0.5, 0.5, 0.5);
	object.position.set(0, 0, 0);
	object.rotation.set(0, 0, 0);
	return object;
}


async function loadNeptune(scene) {
	const ddsLoader = new DDSLoader();
	const bodyTexture = ddsLoader.load('assets/Texf_body02.dds');
	const headTexture = ddsLoader.load('assets/Tex002f_body01.dds');
	const eyeTexture = ddsLoader.load('assets/Tex001f_eye.dds');
	const mouthTexture = ddsLoader.load('assets/Texf_mouse.dds');
	for (const tex of [bodyTexture, headTexture, eyeTexture, mouthTexture]) {
		tex.wrapS = MirroredRepeatWrapping;
		tex.wrapT = MirroredRepeatWrapping;
	}

	const loader = new OBJLoader();
	const object = await loader.loadAsync( 'assets/neptune.obj' );
	object.scale.set(0.02, 0.02, 0.02);

	object.traverse((child) => {
		if ((child as Mesh).isMesh) {
			const mesh = child as Mesh;
			console.log(mesh.name)
			if (mesh.name == "Object01") {
				mesh.material = new MeshStandardMaterial({
					map: mouthTexture,
				});
			}
			if (mesh.name == "Object04") {
				mesh.material = new MeshStandardMaterial({
					map: eyeTexture,
				});
			}
			if (mesh.name == "Object03") {
				mesh.material = new MeshStandardMaterial({
					map: bodyTexture,
				});
			}
			if (mesh.name == "Object02") {
				mesh.material = new MeshStandardMaterial({
					map: headTexture,
				});
			}
		}
	});

	object.position.set(0, 0, 0);
	object.rotation.set(0, 0, 0);
	console.log(object.children.length)
	return object;
}
