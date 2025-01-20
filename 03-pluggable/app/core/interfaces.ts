// 插件生命周期状态
export type PluginStatus =
	| "registered"
	| "initialized"
	| "active"
	| "inactive"
	| "error";

// 插件类型
export type PluginType =
	| "transformer"
	| "validator"
	| "formatter"
	| "operation";

// 插件配置接口
export interface IPluginConfig {
	enabled: boolean;
	priority: number;
	options?: Record<string, unknown>;
}

// 插件上下文接口
export interface IPluginContext {
	timestamp: number;
	environment: "development" | "production";
	pluginManager: IPluginManager;
}

// 插件生命周期钩子
export interface IPluginLifecycle {
	onInit?: (context: IPluginContext) => Promise<void>;
	onActivate?: () => Promise<void>;
	onDeactivate?: () => Promise<void>;
	onError?: (error: Error) => Promise<void>;
	onDestroy?: () => Promise<void>;
}

// 基础插件接口
export interface IPlugin extends IPluginLifecycle {
	id: string;
	name: string;
	version: string;
	description: string;
	type: PluginType;
	dependencies?: string[];
	status: PluginStatus;
	config: IPluginConfig;
}

// 数据转换插件接口
export interface ITransformerPlugin extends IPlugin {
	type: "transformer";
	transform: (data: unknown) => Promise<unknown>;
}

// 数据验证插件接口
export interface IValidatorPlugin extends IPlugin {
	type: "validator";
	validate: (data: unknown) => Promise<{ isValid: boolean; errors?: string[] }>;
}

// 数据格式化插件接口
export interface IFormatterPlugin extends IPlugin {
	type: "formatter";
	format: (data: unknown) => Promise<string>;
}

// 运算插件接口
export interface IOperationPlugin extends IPlugin {
	type: "operation";
	execute: (...args: number[]) => Promise<number>;
}

// 插件管理器接口
export interface IPluginManager {
	registerPlugin: (plugin: IPlugin) => Promise<void>;
	unregisterPlugin: (pluginId: string) => Promise<void>;
	getPlugin: <T extends IPlugin>(pluginId: string) => Promise<T | undefined>;
	getAllPlugins: () => Promise<IPlugin[]>;
	getPluginsByType: <T extends IPlugin>(type: PluginType) => Promise<T[]>;
	activatePlugin: (pluginId: string) => Promise<void>;
	deactivatePlugin: (pluginId: string) => Promise<void>;
	getDependencies: (pluginId: string) => Promise<IPlugin[]>;
	getDependents: (pluginId: string) => Promise<IPlugin[]>;
}

// 插件管理器实现
export class PluginManager implements IPluginManager {
	private plugins: Map<string, IPlugin> = new Map();
	private context: IPluginContext;

	constructor() {
		this.context = {
			timestamp: Date.now(),
			environment:
				process.env.NODE_ENV === "production" ? "production" : "development",
			pluginManager: this,
		};
	}

	private async validateDependencies(plugin: IPlugin): Promise<boolean> {
		if (!plugin.dependencies?.length) return true;

		for (const depId of plugin.dependencies) {
			const dep = this.plugins.get(depId);
			if (!dep || dep.status !== "active") {
				return false;
			}
		}
		return true;
	}

	async registerPlugin(plugin: IPlugin): Promise<void> {
		if (this.plugins.has(plugin.id)) {
			throw new Error(`Plugin ${plugin.id} is already registered`);
		}

		try {
			plugin.status = "registered";
			this.plugins.set(plugin.id, plugin);

			// 初始化插件
			if (plugin.onInit) {
				await plugin.onInit(this.context);
				plugin.status = "initialized";
			}

			// 如果配置为启用状态，则自动激活插件
			if (plugin.config.enabled) {
				await this.activatePlugin(plugin.id);
			}
		} catch (error) {
			plugin.status = "error";
			if (plugin.onError && error instanceof Error) {
				await plugin.onError(error);
			}
			throw error;
		}
	}

	async unregisterPlugin(pluginId: string): Promise<void> {
		const plugin = this.plugins.get(pluginId);
		if (!plugin) return;

		try {
			// 检查是否有其他插件依赖于此插件
			const dependents = await this.getDependents(pluginId);
			if (dependents.length > 0) {
				throw new Error(
					`Cannot unregister plugin ${pluginId}: other plugins depend on it`,
				);
			}

			// 如果插件处于活动状态，先停用它
			if (plugin.status === "active") {
				await this.deactivatePlugin(pluginId);
			}

			// 调用销毁钩子
			if (plugin.onDestroy) {
				await plugin.onDestroy();
			}

			this.plugins.delete(pluginId);
		} catch (error) {
			plugin.status = "error";
			if (plugin.onError && error instanceof Error) {
				await plugin.onError(error);
			}
			throw error;
		}
	}

	async getPlugin<T extends IPlugin>(pluginId: string): Promise<T | undefined> {
		return this.plugins.get(pluginId) as T | undefined;
	}

	async getAllPlugins(): Promise<IPlugin[]> {
		return Array.from(this.plugins.values());
	}

	async getPluginsByType<T extends IPlugin>(type: PluginType): Promise<T[]> {
		return Array.from(this.plugins.values()).filter(
			(plugin): plugin is T => plugin.type === type,
		);
	}

	async activatePlugin(pluginId: string): Promise<void> {
		const plugin = this.plugins.get(pluginId);
		if (!plugin) throw new Error(`Plugin ${pluginId} not found`);
		if (plugin.status === "active") return;

		try {
			// 检查依赖是否满足
			const dependenciesValid = await this.validateDependencies(plugin);
			if (!dependenciesValid) {
				throw new Error(`Dependencies not satisfied for plugin ${pluginId}`);
			}

			// 调用激活钩子
			if (plugin.onActivate) {
				await plugin.onActivate();
			}

			plugin.status = "active";
		} catch (error) {
			plugin.status = "error";
			if (plugin.onError && error instanceof Error) {
				await plugin.onError(error);
			}
			throw error;
		}
	}

	async deactivatePlugin(pluginId: string): Promise<void> {
		const plugin = this.plugins.get(pluginId);
		if (!plugin) throw new Error(`Plugin ${pluginId} not found`);
		if (plugin.status !== "active") return;

		try {
			// 检查是否有依赖此插件的其他活动插件
			const dependents = await this.getDependents(pluginId);
			const activeDependent = dependents.find((dep) => dep.status === "active");
			if (activeDependent) {
				throw new Error(
					`Cannot deactivate plugin ${pluginId}: plugin ${activeDependent.id} depends on it`,
				);
			}

			// 调用停用钩子
			if (plugin.onDeactivate) {
				await plugin.onDeactivate();
			}

			plugin.status = "inactive";
		} catch (error) {
			plugin.status = "error";
			if (plugin.onError && error instanceof Error) {
				await plugin.onError(error);
			}
			throw error;
		}
	}

	async getDependencies(pluginId: string): Promise<IPlugin[]> {
		const plugin = this.plugins.get(pluginId);
		if (!plugin) return [];

		return (plugin.dependencies || [])
			.map((depId) => this.plugins.get(depId))
			.filter((dep): dep is IPlugin => dep !== undefined);
	}

	async getDependents(pluginId: string): Promise<IPlugin[]> {
		return Array.from(this.plugins.values()).filter((plugin) =>
			plugin.dependencies?.includes(pluginId),
		);
	}
}

// 创建一个全局的插件管理器实例
export const pluginManager = new PluginManager();
