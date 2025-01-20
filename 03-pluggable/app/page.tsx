"use client";

import { useEffect, useState } from "react";
import {
	type IFormatterPlugin,
	type IPlugin,
	type ITransformerPlugin,
	type IValidatorPlugin,
	pluginManager,
} from "./core/interfaces";
import "./plugins/dataProcessing";

export default function Home() {
	const [input, setInput] = useState<string>("");
	const [output, setOutput] = useState<string>("");
	const [plugins, setPlugins] = useState<IPlugin[]>([]);
	const [activePlugins, setActivePlugins] = useState<Set<string>>(new Set());
	const [errors, setErrors] = useState<string[]>([]);

	// 加载插件列表
	useEffect(() => {
		const loadPlugins = async () => {
			const allPlugins = await pluginManager.getAllPlugins();
			setPlugins(allPlugins);

			// 初始化激活的插件
			const initialActivePlugins = new Set<string>();
			for (const plugin of allPlugins) {
				if (plugin.status === "active") {
					initialActivePlugins.add(plugin.id);
				}
			}
			setActivePlugins(initialActivePlugins);
		};

		loadPlugins();
	}, []);

	// 处理插件激活/停用
	const togglePlugin = async (plugin: IPlugin) => {
		try {
			if (activePlugins.has(plugin.id)) {
				await pluginManager.deactivatePlugin(plugin.id);
				setActivePlugins((prev) => {
					const next = new Set(prev);
					next.delete(plugin.id);
					return next;
				});
			} else {
				await pluginManager.activatePlugin(plugin.id);
				setActivePlugins((prev) => new Set([...prev, plugin.id]));
			}

			// 刷新插件列表以获取最新状态
			const updatedPlugins = await pluginManager.getAllPlugins();
			setPlugins(updatedPlugins);
		} catch (error) {
			if (error instanceof Error) {
				setErrors((prev) => [...prev, error.message]);
			}
		}
	};

	// 处理数据处理
	const processData = async () => {
		try {
			setErrors([]);
			let processedData: unknown = input;

			// 1. 运行转换插件
			const transformers =
				await pluginManager.getPluginsByType<ITransformerPlugin>("transformer");
			for (const transformer of transformers) {
				if (activePlugins.has(transformer.id)) {
					processedData = await transformer.transform(processedData);
				}
			}

			// 2. 运行验证插件
			const validators =
				await pluginManager.getPluginsByType<IValidatorPlugin>("validator");
			for (const validator of validators) {
				if (activePlugins.has(validator.id)) {
					const result = await validator.validate(processedData);
					if (!result.isValid) {
						setErrors((prev) => [...prev, ...(result.errors || [])]);
						return;
					}
				}
			}

			// 3. 运行格式化插件
			const formatters =
				await pluginManager.getPluginsByType<IFormatterPlugin>("formatter");
			for (const formatter of formatters) {
				if (activePlugins.has(formatter.id)) {
					processedData = await formatter.format(processedData);
				}
			}

			setOutput(processedData as string);
		} catch (error) {
			if (error instanceof Error) {
				setErrors((prev) => [...prev, error.message]);
			}
		}
	};

	const renderOutput = () => {
		if (!output) return null;
		return (
			<div className="w-full h-48 p-4 border rounded-lg bg-gray-50 overflow-auto">
				{output.startsWith("<") ? (
					<div dangerouslySetInnerHTML={{ __html: output }} />
				) : (
					<pre>{output}</pre>
				)}
			</div>
		);
	};

	return (
		<main className="min-h-screen p-8">
			<h1 className="text-2xl font-bold mb-6">插件式数据处理系统</h1>

			{/* 插件控制面板 */}
			<div className="mb-8">
				<h2 className="text-xl font-semibold mb-4">可用插件</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{plugins.map((plugin) => (
						<div
							key={plugin.id}
							className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
						>
							<div className="flex justify-between items-start mb-2">
								<h3 className="font-medium">{plugin.name}</h3>
								<span
									className={`px-2 py-1 text-sm rounded ${
										plugin.status === "active"
											? "bg-green-100 text-green-800"
											: plugin.status === "error"
												? "bg-red-100 text-red-800"
												: "bg-gray-100 text-gray-800"
									}`}
								>
									{plugin.status}
								</span>
							</div>
							<p className="text-sm text-gray-600 mb-2">{plugin.description}</p>
							<div className="flex justify-between items-center">
								<span className="text-sm text-gray-500">v{plugin.version}</span>
								<button
									type="button"
									onClick={() => togglePlugin(plugin)}
									className={`px-3 py-1 rounded text-sm ${
										activePlugins.has(plugin.id)
											? "bg-red-500 text-white hover:bg-red-600"
											: "bg-blue-500 text-white hover:bg-blue-600"
									}`}
								>
									{activePlugins.has(plugin.id) ? "停用" : "启用"}
								</button>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* 数据处理区域 */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<div>
					<h2 className="text-xl font-semibold mb-4">输入数据</h2>
					<textarea
						value={input}
						onChange={(e) => setInput(e.target.value)}
						className="w-full h-48 p-4 border rounded-lg"
						placeholder="请输入要处理的数据..."
					/>
				</div>

				<div>
					<h2 className="text-xl font-semibold mb-4">处理结果</h2>
					{renderOutput()}
				</div>
			</div>

			{/* 错误信息 */}
			{errors.length > 0 && (
				<div className="mt-8">
					<h2 className="text-xl font-semibold mb-4 text-red-600">错误信息</h2>
					<ul className="list-disc list-inside">
						{errors.map((error, errorId) => (
							<li key={`error-${errorId}`} className="text-red-600">
								{error}
							</li>
						))}
					</ul>
				</div>
			)}

			{/* 处理按钮 */}
			<div className="mt-8">
				<button
					type="button"
					onClick={processData}
					className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
				>
					处理数据
				</button>
			</div>
		</main>
	);
}
