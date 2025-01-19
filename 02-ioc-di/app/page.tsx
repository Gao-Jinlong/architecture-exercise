"use client";

import "reflect-metadata";
import { useEffect, useState } from "react";
import { UserRepository } from "./services/UserRepository";
import type { UserService } from "./services/UserService";
import { Container } from "./services/decorators";
import type { IUser } from "./services/interfaces";

// 确保装饰器被执行
import "./services/UserRepository";
import "./services/UserService";

export default function Home() {
	const [users, setUsers] = useState<IUser[]>([]);

	useEffect(() => {
		// 直接从容器获取服务
		const userService =
			Container.getInstance().resolve<UserService>("IUserService");

		setUsers(userService.getAllUsers());
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
		</main>
	);
}
