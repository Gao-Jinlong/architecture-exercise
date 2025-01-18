import { mockResources, mockUsers, mockWhiteList } from "@/database/mockData";
import type { Environment, Resource, User } from "@/types/abac";
import { NextResponse } from "next/server";

type PromiseOrSync<T> = T | Promise<T>;
export interface ResourceAttributes extends Resource {
	whiteList: string[];
}

export interface PolicyResult {
	name: string;
	allowed: boolean;
	message: string;
}
export type Policy = (
	user: User,
	resource: ResourceAttributes,
	env: Environment,
) => PromiseOrSync<PolicyResult>;

function accessAuthPolicy(
	user: User,
	resource: ResourceAttributes,
	env: Environment,
) {
	const result = whiteListPolicy(user, resource, env);
	if (result.allowed) {
		return result;
	}
	return evaluatePolicy(
		[departmentAccessPolicy, securityLevelPolicy],
		user,
		resource,
		env,
	);
}
function departmentAccessPolicy(
	user: User,
	resource: ResourceAttributes,
	env: Environment,
) {
	const isAllowed =
		user.department === resource.ownerDepartment || user.clearanceLevel >= 3;
	return {
		name: "部门内访问策略",
		allowed: isAllowed,
		message: isAllowed ? "部门资源" : "没有资源所在部门的访问权限",
	};
}
function securityLevelPolicy(
	user: User,
	resource: ResourceAttributes,
	env: Environment,
) {
	const isAllowed = user.clearanceLevel >= resource.securityLevel;
	return {
		name: "安全等级策略",
		allowed: isAllowed,
		message: isAllowed
			? `资源等级${resource.securityLevel}`
			: `资源需要${resource.securityLevel}级权限`,
	};
}
function whiteListPolicy(
	user: User,
	resource: ResourceAttributes,
	env: Environment,
) {
	const whiteList = resource.whiteList;
	const isAllowed = !!whiteList?.includes(user.id);
	return {
		name: "资源白名单策略",
		allowed: isAllowed,
		message: isAllowed ? "访问白名单" : "不在白名单",
	};
}
function expiredDatePolicy(
	user: User,
	resource: ResourceAttributes,
	env: Environment,
) {
	const isAllowed =
		resource.publishDate <= env.time && resource.expiredDate >= env.time;
	return {
		name: "有效期策略",
		allowed: isAllowed,
		message: isAllowed ? "在有效期内" : "不在有效期内",
	};
}

const policies: Policy[] = [expiredDatePolicy, accessAuthPolicy];

async function evaluatePolicy(
	policies: Policy[],
	user: User,
	resource: ResourceAttributes,
	env: Environment,
): Promise<PolicyResult> {
	let result: PolicyResult = {
		name: "允许访问",
		allowed: true,
		message: "允许访问",
	};
	for (const policy of policies) {
		result = await policy(user, resource, env);
		if (!result.allowed) {
			return result;
		}
	}

	return result;
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { userId, resourceId, environment: clientEnvironment } = body;

		const user = mockUsers.find((u) => u.id === userId);
		const resource = mockResources.find((r) => r.id === resourceId);

		if (!user || !resource) {
			return NextResponse.json({ error: "用户或资源不存在" }, { status: 404 });
		}

		const whiteList = mockWhiteList.find(
			(item) => item.resourceId === resourceId,
		);
		const environment: Environment = {
			...clientEnvironment,
			time: new Date("2025-01-17 10:00:00").getTime(),
		};
		const resourceAttributes: ResourceAttributes = {
			...resource,
			whiteList: whiteList?.allowAccessWhiteList || [],
		};

		const evaluatePolicyResult = await evaluatePolicy(
			policies,
			user,
			resourceAttributes,
			environment,
		);

		return NextResponse.json({
			user,
			resource,
			accessResult: evaluatePolicyResult,
		});
	} catch (error) {
		console.error(error);
		return NextResponse.json({ error: "服务器错误" }, { status: 500 });
	}
}
