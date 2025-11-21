import { Application, WebGLRenderer as PixiRenderer } from 'pixi.js';
import { WebGLRenderer as ThreeRenderer, Scene, Camera } from 'three';

export class Renderer {
    public app: Application;
    public threeRenderer?: ThreeRenderer;
    public pixiRenderer?: PixiRenderer;
    public canvas?: HTMLCanvasElement;

    constructor() {
	this.app = new Application();
    }

    async init(width = 800, height = 600) {
	await this.app.init({
		width,
		height,
		clearBeforeRender: false,
		backgroundAlpha: 0,
		autoStart: false,
		antialias: true,
	});
        this.canvas = this.app.canvas;
	document.body.appendChild(this.app.canvas);
	this.pixiRenderer = this.app.renderer as PixiRenderer;

	this.threeRenderer = new ThreeRenderer({ 
		context: this.pixiRenderer.gl,
		alpha: true,
		antialias: true,
	});
        
        this.threeRenderer.setSize(width, height);
        this.threeRenderer.setPixelRatio(window.devicePixelRatio);
    }

    render(threeScene: Scene, threeCamera: Camera) {
    }
}
