import type { IResource, IUser } from "@/app/services/interfaces";

export const mockUsers: IUser[] = [
	{
		id: "user1",
		role: "普通员工 1",
		department: "研发部",
		clearanceLevel: 1,
		name: "张三",
		email: "zhangsan@example.com",
	},
	{
		id: "user2",
		role: "普通员工 2",
		department: "研发部",
		clearanceLevel: 1,
		name: "李四",
		email: "lisi@example.com",
	},
	{
		id: "user10",
		role: "部门经理",
		department: "研发部",
		clearanceLevel: 3,
		name: "王五",
		email: "wangwu@example.com",
	},
	{
		id: "user100",
		role: "财务主管",
		department: "财务部",
		clearanceLevel: 4,
		name: "赵六",
		email: "zhaoliu@example.com",
	},
];

export const mockResources: IResource[] = [
	{
		id: "doc1",
		type: "技术文档",
		classification: "内部",
		ownerDepartment: "研发部",
		securityLevel: 1,
		publishDate: new Date("2025-01-17 10:00:00").getTime(),
		expiredDate: Number.POSITIVE_INFINITY,
	},
	{
		id: "doc2",
		type: "项目代码",
		classification: "机密",
		ownerDepartment: "研发部",
		securityLevel: 2,
		publishDate: new Date("2024-11-01 10:00:00").getTime(),
		expiredDate: new Date("2025-03-17 10:00:00").getTime(),
	},
	{
		id: "doc3",
		type: "财务报表",
		classification: "绝密",
		ownerDepartment: "财务部",
		securityLevel: 4,
		publishDate: new Date("2024-12-01 10:00:00").getTime(),
		expiredDate: new Date("2025-01-17 10:00:00").getTime(),
	},
];
export const mockWhiteList = [
	{
		resourceId: "doc2",
		allowAccessWhiteList: ["user1"],
	},
];
