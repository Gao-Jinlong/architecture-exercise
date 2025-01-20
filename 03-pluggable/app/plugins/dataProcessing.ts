import {
	type IFormatterPlugin,
	type ITransformerPlugin,
	type IValidatorPlugin,
	pluginManager,
} from "../core/interfaces";

// 数据转换插件：将字符串转换为大写
const upperCaseTransformer: ITransformerPlugin = {
	id: "uppercase-transformer",
	name: "Uppercase Transformer",
	version: "1.0.0",
	description: "将文本转换为大写",
	type: "transformer",
	status: "registered",
	config: {
		enabled: true,
		priority: 1,
	},
	async transform(data: unknown) {
		if (typeof data === "string") {
			return data.toUpperCase();
		}
		return data;
	},
};

// 数据验证插件：验证字符串长度
const stringLengthValidator: IValidatorPlugin = {
	id: "string-length-validator",
	name: "String Length Validator",
	version: "1.0.0",
	description: "验证字符串长度是否在指定范围内",
	type: "validator",
	status: "registered",
	config: {
		enabled: true,
		priority: 2,
		options: {
			minLength: 3,
			maxLength: 50,
		},
	},
	async validate(data: unknown) {
		if (typeof data !== "string") {
			return {
				isValid: false,
				errors: ["Input must be a string"],
			};
		}

		const { minLength, maxLength } = this.config.options as {
			minLength: number;
			maxLength: number;
		};

		if (data.length < minLength || data.length > maxLength) {
			return {
				isValid: false,
				errors: [
					`String length must be between ${minLength} and ${maxLength} characters`,
				],
			};
		}

		return { isValid: true };
	},
};

// 数据格式化插件：JSON格式化
const jsonFormatter: IFormatterPlugin = {
	id: "json-formatter",
	name: "JSON Formatter",
	version: "1.0.0",
	description: "将数据格式化为JSON字符串",
	type: "formatter",
	status: "registered",
	config: {
		enabled: true,
		priority: 3,
		options: {
			indent: 2,
		},
	},
	async format(data: unknown) {
		return JSON.stringify(data, null, this.config.options?.indent as number);
	},
};

// 数据格式化插件：HTML格式化
const htmlFormatter: IFormatterPlugin = {
	id: "html-formatter",
	name: "HTML Formatter",
	version: "1.0.0",
	description: "将数据格式化为HTML标签",
	type: "formatter",
	status: "registered",
	dependencies: ["json-formatter"], // 依赖JSON格式化插件
	config: {
		enabled: true,
		priority: 4,
	},
	async format(data: unknown) {
		const jsonFormatter =
			await pluginManager.getPlugin<IFormatterPlugin>("json-formatter");
		if (!jsonFormatter) {
			throw new Error("JSON Formatter plugin is required but not available");
		}

		const jsonString = await jsonFormatter.format(data);
		return `<pre class="code">${jsonString}</pre>`;
	},
	async onInit(context) {
		console.log(
			`[${this.name}] Initializing in ${context.environment} environment`,
		);
	},
	async onActivate() {
		console.log(`[${this.name}] Plugin activated`);
	},
	async onDeactivate() {
		console.log(`[${this.name}] Plugin deactivated`);
	},
	async onError(error: Error) {
		console.error(`[${this.name}] Error: ${error.message}`);
	},
};

// 注册所有插件
const plugins = [
	upperCaseTransformer,
	stringLengthValidator,
	jsonFormatter,
	htmlFormatter,
];

for (const plugin of plugins) {
	pluginManager.registerPlugin(plugin).catch(console.error);
}
