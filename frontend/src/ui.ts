import { 
	Assets, Sprite, TextureSource, Container, Graphics,
	Texture, 
} from 'pixi.js';


const HUD_CONFIG = {
    x: 20,
    y: 20,
    portrait: {x: 56, y: 46, radius: 42},
    hp: {x: 110, y: 20, width: 257, height: 12},
    mp: {x: 110, y: 42, width: 140, height: 11}
};

const SKILLS_CONFIG = {
    marginBottom: 5,
};


export class UIManager {
	public stage: Container;
	public width: number;
	public height: number;

	private hudContainer: Container;
	private hpBar: Sprite | null = null;
	private mpBar: Sprite | null = null;
	private skillContainer: Container;

	constructor(stage: Container, width: number, height: number) {
		this.stage = stage;
		this.width = width;
		this.height = height;

		this.hudContainer = new Container();
		this.skillContainer = new Container();
	}

	async loadAssets() {
		//TextureSource.defaultOptions.scaleMode = 'nearest';
		await this.createMainHud();
		await this.createSkillHud();
	}

	update(dt: number) {
		if (this.hpBar && this.mpBar) {
			// Test 
			this.hpBar.width = HUD_CONFIG.hp.width * (0.5 + 0.5 * Math.sin(dt / 1000));
			this.mpBar.width = HUD_CONFIG.mp.width * (0.5 + 0.5 * Math.cos(dt / 1000));
		}
	}

	private async createMainHud() {
		const hudTexture = await Assets.load('assets/hud.png'); 
		const heroTexture = await Assets.load('assets/hero.png');
		this.hudContainer.position.set(HUD_CONFIG.x, HUD_CONFIG.y);
		this.stage.addChild(this.hudContainer);
		this.createBarBackground(HUD_CONFIG.hp, 0x330000);
		this.createBarBackground(HUD_CONFIG.mp, 0x003300);

		const hpTexture = this.createGradientTexture(HUD_CONFIG.hp.width, HUD_CONFIG.hp.height, '#550000', '#ff0000');
		this.hpBar = new Sprite(hpTexture);
		this.hpBar.position.set(HUD_CONFIG.hp.x, HUD_CONFIG.hp.y);
		this.hudContainer.addChild(this.hpBar);

		const mpTexture = this.createGradientTexture(HUD_CONFIG.mp.width, HUD_CONFIG.mp.height, '#005500', '#00ff00');
		this.mpBar = new Sprite(mpTexture);
		this.mpBar.position.set(HUD_CONFIG.mp.x, HUD_CONFIG.mp.y);
		this.hudContainer.addChild(this.mpBar);

		const heroContainer = new Container();
		heroContainer.position.set(HUD_CONFIG.portrait.x, HUD_CONFIG.portrait.y);
		const heroSprite = new Sprite(heroTexture);
		heroSprite.anchor.set(0.5);
		const scale = (HUD_CONFIG.portrait.radius * 2) / Math.max(heroTexture.width, heroTexture.height);
		heroSprite.scale.set(scale);

		const mask = new Graphics();
		mask.circle(0, 0, HUD_CONFIG.portrait.radius);
		mask.fill({ color: 0xffffff });
		heroSprite.mask = mask;

		heroContainer.addChild(mask);
		heroContainer.addChild(heroSprite);
		this.hudContainer.addChild(heroContainer);

		const hudFrame = new Sprite(hudTexture);
		this.hudContainer.addChild(hudFrame);
	}

	private createGradientTexture(w: number, h: number, colorStart: string, colorEnd: string): Texture {
		const canvas = new OffscreenCanvas(w, h);
		const ctx = canvas.getContext('2d');

		if (ctx) {
			const grd = ctx.createLinearGradient(0, 0, w, 0);
			grd.addColorStop(0, colorStart);
			grd.addColorStop(1, colorEnd);

			ctx.fillStyle = grd;
			ctx.fillRect(0, 0, w, h);
		}

		return Texture.from(canvas);
    }

    private createBarBackground(config: {x:number, y:number, width:number, height:number}, color: number) {
	    const bg = new Graphics()
		    .rect(0, 0, config.width, config.height)
		    .fill({ color: color, alpha: 0.9 });
	    bg.position.set(config.x, config.y);
	    this.hudContainer.addChild(bg);
    }

    private async createSkillHud() {
	    const hudTexture = await Assets.load('assets/skills.png'); 
	    this.skillContainer.position.set(
		    this.width/2 - hudTexture.width/2,
		    this.height - SKILLS_CONFIG.marginBottom - hudTexture.height,
	    );
	    this.stage.addChild(this.skillContainer);

	    const hudFrame = new Sprite(hudTexture);
	    this.skillContainer.addChild(hudFrame);
    }

}
