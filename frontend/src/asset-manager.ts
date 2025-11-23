import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

interface SavedAsset {
	asset: any;
	firstUsed: boolean;
}

export class AssetManager {
	public objLoader: OBJLoader;
	private library: {[key: string]: SavedAsset} = {};

	constructor() {
		this.objLoader = new OBJLoader();
	}

	async loadObj(file: string) {
		const object = await this.objLoader.loadAsync(file);
		object.scale.set(0.5, 0.5, 0.5);
		object.position.set(0, 0, 0);
		object.rotation.set(0, 0, 0);
		return object;
	}

	async loadAsset(key: string, file: string) {
		let asset;
		if (file.endsWith(".obj")) {
			asset = await this.loadObj(file);
		} else {
			throw new Error("Unsupported asset filetype");
		}

		if (asset) {
			this.library[key] = {
				asset, firstUsed: false
			};
		}
	}

	getAsset(key: string): any | null {
		if (!(key in this.library)) return;
		const asset = this.library[key];
		if (!asset.firstUsed) {
			asset.firstUsed = true;
			return asset.asset;
		}
		return asset.asset.clone();
	}
}
