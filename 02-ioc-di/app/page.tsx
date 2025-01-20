"use client";

import "reflect-metadata";
import { useEffect, useState } from "react";
import { UserService } from "./services/UserService";
import { Container } from "./services/decorators";
import type { IUser } from "./services/interfaces";

// 确保装饰器被执行
import "./services/UserRepository";
import "./services/UserService";
import "./services/AuthService";

export default function Home() {
	const [users, setUsers] = useState<IUser[]>([]);
	const [users2, setUsers2] = useState<IUser[]>([]);

	useEffect(() => {
		// 直接从容器获取服务
		const userService =
			Container.getInstance().resolve<UserService>(UserService);
		const userService2 =
			Container.getInstance().resolve<UserService>(UserService);

		// userService 和 userService2 将是同一个实例
		setUsers(userService.getAllUsers());
		setUsers2(userService2.getAllUsers());
	}, []);

	return (
		<main className="p-8">
			<h1 className="text-2xl font-bold mb-4">用户列表</h1>
			<ul>
				{users.map((user) => (
					<li key={user.id} className="mb-2">
						{user.name} - {user.email}
					</li>
				))}
			</ul>
			<ul>
				{users2.map((user) => (
					<li key={user.id} className="mb-2">
						{user.name} - {user.email}
					</li>
				))}
			</ul>
		</main>
	);
}
