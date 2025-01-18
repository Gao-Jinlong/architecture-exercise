"use client";

import type { PolicyResult } from "@/app/api/auth/check/route";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ClientEnvironment, Resource, User } from "../types/abac";

export function AbacDemo() {
	const [users, setUsers] = useState<User[]>([]);
	const [resources, setResources] = useState<Resource[]>([]);
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [selectedResource, setSelectedResource] = useState<Resource | null>(
		null,
	);
	const [authResult, setAuthResult] = useState<{
		user: User;
		resource: Resource;
		accessResult: PolicyResult;
	} | null>(null);
	const [loading, setLoading] = useState(false);

	const environment: ClientEnvironment = useMemo(
		() => ({
			location: "办公室",
		}),
		[],
	);

	useEffect(() => {
		// 加载用户和资源数据
		Promise.all([
			fetch("/api/users").then((res) => res.json()),
			fetch("/api/resources").then((res) => res.json()),
		]).then(([usersData, resourcesData]) => {
			setUsers(usersData);
			setResources(resourcesData);
			if (usersData.length > 0) setSelectedUser(usersData[0]);
			if (resourcesData.length > 0) setSelectedResource(resourcesData[0]);
		});
	}, []);

	const checkAccess = useCallback(async () => {
		if (!selectedUser || !selectedResource) return;

		setLoading(true);
		try {
			const response = await fetch("/api/auth/check", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: selectedUser.id,
					resourceId: selectedResource.id,
					environment,
				}),
			});
			const result = await response.json();
			setAuthResult(result);
		} catch (error) {
			console.error("访问检查失败:", error);
		} finally {
			setLoading(false);
		}
	}, [environment, selectedResource, selectedUser]);

	useEffect(() => {
		if (selectedUser && selectedResource) {
			checkAccess();
		}
	}, [selectedUser, selectedResource, checkAccess]);

	return (
		<div className="w-full max-w-2xl space-y-8">
			<div className="bg-gray-50 p-6 rounded-lg">
				<h2 className="text-xl font-bold mb-4">选择用户</h2>
				<select
					className="w-full p-2 border rounded"
					onChange={(e) =>
						setSelectedUser(users[Number.parseInt(e.target.value)])
					}
				>
					{users.map((user, index) => (
						<option key={user.id} value={index}>
							{user.role} - {user.department} (安全等级: {user.clearanceLevel})
						</option>
					))}
				</select>
			</div>

			<div className="bg-gray-50 p-6 rounded-lg">
				<h2 className="text-xl font-bold mb-4">选择资源</h2>
				<select
					className="w-full p-2 border rounded"
					onChange={(e) =>
						setSelectedResource(resources[Number.parseInt(e.target.value)])
					}
				>
					{resources.map((resource, index) => (
						<option key={resource.id} value={index}>
							{resource.type} - {resource.classification} (
							{resource.ownerDepartment})
						</option>
					))}
				</select>
			</div>

			{loading ? (
				<div className="bg-gray-50 p-6 rounded-lg">
					<div className="text-center">检查访问权限中...</div>
				</div>
			) : (
				authResult && (
					<div className="bg-gray-50 p-6 rounded-lg">
						<h2 className="text-xl font-bold mb-4">访问控制结果</h2>
						<div
							className={`mb-4 p-3 rounded ${authResult.accessResult.allowed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
						>
							{authResult.accessResult.allowed ? "允许访问" : "拒绝访问"}
						</div>
						<div className="text-sm text-gray-500">
							{authResult.accessResult.message}
						</div>
					</div>
				)
			)}
		</div>
	);
}
