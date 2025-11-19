import { gsap } from 'gsap';
import { Application, Assets, Sprite, TextureSource } from 'pixi.js';

(async () => {
	const app = new Application();
	await app.init({
		width: 800,
		height: 600,
		background: '#1099bb'
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
})();

