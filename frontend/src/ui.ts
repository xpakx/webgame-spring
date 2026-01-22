import { 
	Assets, Sprite, Container, Graphics,
	Texture, FederatedPointerEvent,
	NineSliceSprite,
} from 'pixi.js';
import { Player } from './game';


const HUD_CONFIG = {
    x: 20,
    y: 20,
    portrait: {x: 56, y: 46, radius: 42},
    hp: {x: 110, y: 20, width: 257, height: 12},
    mp: {x: 110, y: 42, width: 140, height: 11}
};

const SKILLS_CONFIG = {
    marginBottom: 5,
    skills: 4,
    gap: 10,
};


export class UIManager {
	public stage: Container;
	public width: number;
	public height: number;

	private hudContainer: Container;
	private hpBar: Sprite | null = null;
	private mpBar: Sprite | null = null;
	private skillContainer: Container;
	private skillFrameTextureWidth: number = 0;
	private windows: Map<string, UIWindow> = new Map();

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

	update(dt: number, player: Player) {
		if (this.hpBar && this.mpBar) {
			// Test 
			this.hpBar.width = HUD_CONFIG.hp.width * player.getHpPercent();
			this.mpBar.width = HUD_CONFIG.mp.width * player.getMpPercent();
		}
	}
	
	public addUIWindow(id: string, uiWin: UIWindow) {
		if (this.windows.has(id)) {
			this.windows.get(id)?.unregister(this.stage);
		}

		this.windows.set(id, uiWin);
		uiWin.register(this.stage);
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
	    const skillFrameTexture = await Assets.load('assets/skill-frame.png'); 
	    this.skillFrameTextureWidth = hudTexture.width;
	    this.skillContainer.position.set(
		    this.width/2 - hudTexture.width/2,
		    this.height - SKILLS_CONFIG.marginBottom - hudTexture.height,
	    );
	    this.stage.addChild(this.skillContainer);

	    const hudFrame = new Sprite(hudTexture);
	    this.skillContainer.addChild(hudFrame);
	    const totalFramesWidth = SKILLS_CONFIG.skills * skillFrameTexture.width + (SKILLS_CONFIG.skills - 1) * SKILLS_CONFIG.gap;
	    const startX = (hudTexture.width - totalFramesWidth) / 2;

	    for (let i = 0; i < SKILLS_CONFIG.skills; i++) {
		    const skillFrame = new Sprite(skillFrameTexture);
		    skillFrame.position.set(
			    startX + i * (skillFrameTexture.width + SKILLS_CONFIG.gap),
			    (hudTexture.height - skillFrameTexture.height) / 2 + 10
		    );
		    this.skillContainer.addChild(skillFrame);
	    }
    }

   public resize(width: number, height: number) {
        this.width = width;
        this.height = height;

        if (this.skillFrameTextureWidth > 0) {
            this.skillContainer.position.set(
                this.width / 2 - this.skillFrameTextureWidth / 2,
                this.height - SKILLS_CONFIG.marginBottom - this.skillContainer.height,
            );
        }
    }

    public setupInteractions() {
	window.addEventListener('pointerup', () => {
		for (let win of this.windows.values()) {
			win.pointerUpEvent()
		}
	});

	window.addEventListener('pointermove', (e: PointerEvent) => {
		for (let win of this.windows.values()) {
			if (win.isDragging()) {
				win.dragEvent(e);
			}
		}
	});
    }
}



export class UIWindow {
	windowContainer: Container;
	dragOffset = { x: 0, y: 0 };
	dragging: boolean = false;
	draggable: boolean = false;

	constructor() {
		this.windowContainer = new Container();
	}

	public register(stage: Container) {
		stage.addChild(this.windowContainer);
	}

	public unregister(stage: Container) {
		stage.removeChild(this.windowContainer);
	}

	public moveToFront() {
		const parent = this.windowContainer.parent;
		if (!parent) return;
		parent.setChildIndex(
			this.windowContainer,
			parent.children.length - 1
		);
	}

	public isDraggable(): boolean {
		return this.draggable;
	}

	public isDragging(): boolean {
		return this.dragging;
	}

	public dragEvent(e: PointerEvent) {
		if (!this.isDragging()) return;
		this.windowContainer.x = e.clientX - this.dragOffset.x;
		this.windowContainer.y = e.clientY - this.dragOffset.y;
	}

	public startDragEvent(e: FederatedPointerEvent) {
		this.dragging = true;
		const localPos = this.windowContainer.toLocal(e.global);
		this.dragOffset.x = localPos.x;
		this.dragOffset.y = localPos.y;
	}

	public pointerUpEvent() {
		this.dragging = false;
	}

}


export class BasicWindow extends UIWindow {
	// TODO: drag only on topbar of window
	// TODO: actions
	private background: Graphics;
	private borderColor: number | undefined = 0xffffff;

	constructor(x: number, y: number, w: number, h: number,
		   draggable: boolean = true) {
		super();
		this.draggable = draggable;
		this.windowContainer.x = x;
		this.windowContainer.y = y;
		this.background = new Graphics();
		this.draw(w, h);

		this.background.eventMode = 'static';
		this.background.cursor = 'pointer';

		this.setupInteractions();

		this.windowContainer.addChild(this.background);
	}

	setBorder(color: number | undefined) {
		this.borderColor = color;
		this.draw(this.background.width, this.background.height);
	}

	private draw(w: number, h: number) {
		this.background.clear();
		this.background.rect(0, 0, w, h);
		this.background.fill(0x333333);
		if (this.borderColor) {
			this.background.rect(0, 0, w, h);
			this.background.stroke({width: 2, color: this.borderColor});
		}
	}

	private setupInteractions() {
		this.background.on('pointerdown', (e: FederatedPointerEvent) => {
			if (this.isDraggable()) this.startDragEvent(e)
			this.moveToFront();
		});

	}
}


export class NineSliceWindow extends UIWindow {
	private background?: NineSliceSprite;

	private width: number;
	private height: number;

	constructor(x: number, y: number, w: number, h: number,
		    draggable: boolean = true) {
		super();
		this.windowContainer.x = x;
		this.windowContainer.y = y;
		this.width = w;
		this.height = h;
		this.draggable = draggable;
	}

	async setTexture(texture: Texture) {

		this.background = new NineSliceSprite({
			texture: texture,
			leftWidth: 10,
			rightWidth: 10,
			topHeight: 10,
			bottomHeight: 10,
			width: this.width,
			height: this.height,
		})

		this.background.eventMode = 'static';
		this.background.cursor = 'pointer';

		this.setupInteractions();

		this.windowContainer.addChild(this.background);

	}

	private setupInteractions() {
		this.background!.on('pointerdown', (e: FederatedPointerEvent) => {
			if (this.isDraggable()) this.startDragEvent(e)
			this.moveToFront();
		});

		window.addEventListener('pointerup', () => {
			this.pointerUpEvent();
		});

		window.addEventListener('pointermove', (e: PointerEvent) => {
			this.dragEvent(e);
		});
	}

	public dragEvent(e: PointerEvent): void {
		if (this.dragging) {
			this.windowContainer.x = e.clientX - this.dragOffset.x;
			this.windowContainer.y = e.clientY - this.dragOffset.y;
		}
	    
	}
}
