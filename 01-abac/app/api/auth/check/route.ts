import { NextResponse } from 'next/server';
import { mockUsers, mockResources } from '@/database/mockData';
import type { User, Resource, Environment } from '@/types/abac';

const policies = [
  {
    name: "部门内访问策略",
    evaluate: (user: User, resource: Resource, env: Environment) => {
      // 同部门可访问，或者用户安全等级 >= 3 可以跨部门访问
      return user.department === resource.ownerDepartment || user.clearanceLevel >= 3;
    }
  },
  {
    name: "安全等级策略",
    evaluate: (user: User, resource: Resource) => {
      return user.clearanceLevel >= resource.securityLevel;
    }
  },
  {
    name: "工作时间策略",
    evaluate: (_user: User, _resource: Resource, env: Environment) => {
      const hour = new Date(env.time).getHours();
      const day = new Date(env.time).getDay();
      return true|| hour >= 9 && hour <= 18 && day >= 1 && day <= 5;
    }
  }
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, resourceId, environment:clientEnvironment } = body;

    const environment: Environment = {
      ...clientEnvironment,
      time: new Date()
    };


    const user = mockUsers.find(u => u.id === userId);
    const resource = mockResources.find(r => r.id === resourceId);

    if (!user || !resource) {
      return NextResponse.json(
        { error: "用户或资源不存在" },
        { status: 404 }
      );
    }

    const policyResults = policies.map(policy => ({
      name: policy.name,
      allowed: policy.evaluate(user, resource, environment)
    }));

    const isAllowed = policyResults.every(result => result.allowed);

    return NextResponse.json({
      allowed: isAllowed,
      user,
      resource,
      policyResults
    });
  } catch (error) {
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
} 