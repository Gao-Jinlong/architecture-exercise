import { type IPlugin, pluginManager } from "../core/interfaces";

const additionPlugin: IPlugin = {
	name: "addition",
	description: "加法运算",
	type: "operation",
	execute: (a: number, b: number) => a + b,
};

const subtractionPlugin: IPlugin = {
	name: "subtraction",
	description: "减法运算",
	type: "operation",
	execute: (a: number, b: number) => a - b,
};

const multiplicationPlugin: IPlugin = {
	name: "multiplication",
	description: "乘法运算",
	type: "operation",
	execute: (a: number, b: number) => a * b,
};

const divisionPlugin: IPlugin = {
	name: "division",
	description: "除法运算",
	type: "operation",
	execute: (a: number, b: number) => (b !== 0 ? a / b : NaN),
};

// 注册所有基本运算插件
for (const plugin of [
	additionPlugin,
	subtractionPlugin,
	multiplicationPlugin,
	divisionPlugin,
]) {
	pluginManager.registerPlugin(plugin);
}
