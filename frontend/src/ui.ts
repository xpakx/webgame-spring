import { gsap } from 'gsap';
import { Assets, Sprite, TextureSource, Container } from 'pixi.js';

export class UIManager {
	public stage: Container;
	public width: number;
	public height: number;

	private logo: Sprite | null = null;

	constructor(stage: Container, width: number, height: number) {
		this.stage = stage;
		this.width = width;
		this.height = height;
	}

	async loadAssets() {
		TextureSource.defaultOptions.scaleMode = 'nearest';
		const texture = await Assets.load('https://pixijs.com/assets/bunny.png');

		this.logo = new Sprite({
			texture,
			anchor: 0.5,
			x: this.width/2,
			y: this.height/2,
		});
		this.logo.width = 100;
		this.logo.scale.y = this.logo.scale.x;
		this.logo.eventMode = 'static';

		const xTo = gsap.quickTo(this.logo, 'x', { duration: 0.6, ease: 'power3' });
		const yTo = gsap.quickTo(this.logo, 'y', { duration: 0.6, ease: 'power3' });
		this.logo.on('globalpointermove', (event) => {
			xTo(event.global.x);
			yTo(event.global.y);
		});

		this.stage.addChild(this.logo);
	}

	update(dt: number) {
	}
}
