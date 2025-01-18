"use client";

import { AbacDemo } from "../components/AbacDemo";

export default function Home() {
	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<h1 className="text-2xl font-bold">ABAC 访问控制演示</h1>
			<AbacDemo />
		</div>
	);
}
