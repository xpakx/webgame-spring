import { Application, WebGLRenderer as PixiRenderer } from 'pixi.js';
import {
	WebGLRenderer as ThreeRenderer, Scene, Camera,
	RGBAFormat,
	WebGLRenderTarget,
	AmbientLight, DirectionalLight, HemisphereLight,
} from 'three';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';

export class Renderer {
    public app: Application;
    public threeRenderer?: ThreeRenderer;
    public pixiRenderer?: PixiRenderer;
    public canvas?: HTMLCanvasElement;
    private composer: EffectComposer | null = null;

    constructor() {
	this.app = new Application();
    }

    async init(
	    width: number | undefined = undefined,
	    height: number | undefined = undefined
    ) {
	await this.app.init({
		width,
		height,
		resizeTo: !width && !height ? window : undefined,
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
        
        this.threeRenderer.setSize(this.app.screen.width, this.app.screen.height);
        this.threeRenderer.setPixelRatio(window.devicePixelRatio);
    }

    enablePostprocessing(scene: Scene, camera: Camera) {
	    const width = this.app.screen.width;
	    const height = this.app.screen.height;

	    const renderTarget = new WebGLRenderTarget(width, height, {
		    format: RGBAFormat,
		    samples: 4
	    });

	    this.composer = new EffectComposer(this.threeRenderer!, renderTarget);
	    this.composer.setPixelRatio(window.devicePixelRatio);
	    this.composer.setSize(width, height);
	    const renderPass = new RenderPass(scene, camera);
	    renderPass.clear = true;
	    renderPass.clearAlpha = 0;
	    this.composer.addPass(renderPass);

	    // TODO: this is just for making sure postprocessing
	    // works correctly with our merged context.
	    const rgbShiftPass = new ShaderPass(RGBShiftShader);

	    rgbShiftPass.uniforms['amount'].value = 0.002; 
	    this.composer.addPass(rgbShiftPass);

	    const outputPass = new OutputPass();
	    this.composer.addPass(outputPass);
    }

    render(threeScene: Scene, threeCamera: Camera) {
	this.threeRenderer!.resetState();
	if (this.composer) {
            this.composer.render();
        } else {
            this.threeRenderer!.render(threeScene, threeCamera);
        }

	this.app.renderer.resetState();
	this.app.renderer.render(this.app.stage);
    }

    addDefaultLights(threeScene: Scene) {
	const ambientLight = new AmbientLight(0xffffff, 0.5);
	threeScene.add(ambientLight);
	const directionalLight = new DirectionalLight(0xffffff, 0.7);
	directionalLight.position.set(20, 30, 20);
	directionalLight.castShadow = true;
	directionalLight.shadow.mapSize.width = 2048;
	directionalLight.shadow.mapSize.height = 2048;
	directionalLight.shadow.camera.left = -50;
	directionalLight.shadow.camera.right = 50;
	directionalLight.shadow.camera.top = 50;
	directionalLight.shadow.camera.bottom = -50;
	threeScene.add(directionalLight);
	threeScene.add(new HemisphereLight(0xffffff, 0x444444, 2));
    }
}
