import "reflect-metadata";

type Constructor<T = unknown> = new (...args: unknown[]) => T;

const INJECTIONS_METADATA_KEY = "ioc:injections";

// 用于存储依赖关系的容器
export class Container {
	private static instance: Container = new Container();
	private dependencies = new Map<Constructor, Constructor>();
	private instances = new Map<Constructor, unknown>();

	static getInstance(): Container {
		return Container.instance;
	}

	register(token: Constructor, dependency: Constructor): void {
		this.dependencies.set(token, dependency);
	}

	resolve<T>(token: Constructor): T {
		// 如果已经有实例，直接返回
		if (this.instances.has(token)) {
			return this.instances.get(token) as T;
		}

		const Dependency = this.dependencies.get(token);
		if (!Dependency) {
			throw new Error(`依赖 ${token} 未注册`);
		}

		// 创建新实例
		const instance = new Dependency();

		// 获取该类需要注入的所有依赖
		const injections: Array<{ propertyKey: string; injectable: Constructor }> =
			Reflect.getMetadata(
				INJECTIONS_METADATA_KEY,
				instance.constructor.prototype,
			) || [];

		// 为每个标记了 @Inject 的属性注入依赖
		for (const { propertyKey, injectable } of injections) {
			Object.defineProperty(instance, propertyKey, {
				value: this.resolve(injectable),
				writable: false,
				enumerable: true,
				configurable: true,
			});
		}

		// 保存实例到缓存中
		this.instances.set(token, instance);

		return instance as T;
	}

	// 可选：清除所有实例缓存
	clearInstances(): void {
		this.instances.clear();
	}
}

// Service 装饰器
export function Service() {
	// biome-ignore lint/complexity/useArrowFunction: <explanation>
	return function (target: Constructor) {
		Container.getInstance().register(target, target);
	};
}

// Inject 装饰器
export function Inject(injectable: Constructor) {
	// biome-ignore lint/complexity/useArrowFunction: <explanation>
	return function (target: object, propertyKey: string) {
		// 获取现有的注入信息
		const existingInjections: Array<{
			propertyKey: string;
			injectable: Constructor;
		}> = Reflect.getMetadata(INJECTIONS_METADATA_KEY, target) || [];

		// 添加新的注入信息
		const injections = [...existingInjections, { propertyKey, injectable }];

		// 保存注入信息到元数据
		Reflect.defineMetadata(INJECTIONS_METADATA_KEY, injections, target);
	};
}
