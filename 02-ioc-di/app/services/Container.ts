export class Container {
	private static instance: Container;
	private dependencies: Map<string, unknown> = new Map();

	private constructor() {}

	static getInstance(): Container {
		if (!Container.instance) {
			Container.instance = new Container();
		}
		return Container.instance;
	}

	register<T>(key: string, dependency: T): void {
		this.dependencies.set(key, dependency);
	}

	resolve<T>(key: string): T {
		const dependency = this.dependencies.get(key);
		if (!dependency) {
			throw new Error(`依赖 ${key} 未注册`);
		}
		return dependency as T;
	}
}
