import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

export class AssetManager {
	public objLoader: OBJLoader;

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
}
