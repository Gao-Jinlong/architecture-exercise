export class Container {
	private static instance: Container;
	private dependencies: Map<string, any> = new Map();

	private constructor() {}

	static getInstance(): Container {
		if (!Container.instance) {
			Container.instance = new Container();
		}
		return Container.instance;
	}

	register(key: string, dependency: any): void {
		this.dependencies.set(key, dependency);
	}

	resolve<T>(key: string): T {
		console.log("🚀 ~ Container ~ dependency:", key, dependency);

		const dependency = this.dependencies.get(key);
		if (!dependency) {
			throw new Error(`依赖 ${key} 未注册`);
		}
		return dependency;
	}
}
