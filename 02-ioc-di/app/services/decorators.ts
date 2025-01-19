import "reflect-metadata";

type Constructor<T = unknown> = new (...args: unknown[]) => T;

const INJECTIONS_METADATA_KEY = "ioc:injections";

// 用于存储依赖关系的容器
export class Container {
	private static instance: Container = new Container();
	private dependencies = new Map<string, Constructor>();

	static getInstance(): Container {
		return Container.instance;
	}

	register(token: string, dependency: Constructor): void {
		this.dependencies.set(token, dependency);
	}

	resolve<T>(token: string): T {
		const Dependency = this.dependencies.get(token);
		if (!Dependency) {
			throw new Error(`依赖 ${token} 未注册`);
		}

		// 创建新实例
		const instance = new Dependency();

		// 获取该类需要注入的所有依赖
		const injections: Array<{ propertyKey: string; token: string }> =
			Reflect.getMetadata(
				INJECTIONS_METADATA_KEY,
				instance.constructor.prototype,
			) || [];

		// 为每个标记了 @Inject 的属性注入依赖
		for (const { propertyKey, token: injectionToken } of injections) {
			Object.defineProperty(instance, propertyKey, {
				value: this.resolve(injectionToken),
				writable: false,
				enumerable: true,
				configurable: true,
			});
		}

		return instance as T;
	}
}

// Service 装饰器
export function Service(token: string) {
	// biome-ignore lint/complexity/useArrowFunction: <explanation>
	return function (target: Constructor) {
		Container.getInstance().register(token, target);
	};
}

// Inject 装饰器
export function Inject(token: string) {
	// biome-ignore lint/complexity/useArrowFunction: <explanation>
	return function (target: object, propertyKey: string) {
		// 获取现有的注入信息
		const existingInjections: Array<{ propertyKey: string; token: string }> =
			Reflect.getMetadata(INJECTIONS_METADATA_KEY, target) || [];

		// 添加新的注入信息
		const injections = [...existingInjections, { propertyKey, token }];

		// 保存注入信息到元数据
		Reflect.defineMetadata(INJECTIONS_METADATA_KEY, injections, target);
	};
}
