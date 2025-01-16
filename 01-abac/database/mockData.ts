import { User, Resource, Environment, Policy } from '../types/abac';

export const mockUsers: User[] = [
  {
    id: "user1",
    role: "普通员工",
    department: "研发部",
    clearanceLevel: 2
  },
  {
    id: "user2",
    role: "部门经理",
    department: "研发部",
    clearanceLevel: 3
  },
  {
    id: "user3",
    role: "财务主管",
    department: "财务部",
    clearanceLevel: 4
  }
];

export const mockResources: Resource[] = [
  {
    id: "doc1",
    type: "技术文档",
    classification: "内部",
    ownerDepartment: "研发部",
    securityLevel: 1
  },
  {
    id: "doc2",
    type: "项目代码",
    classification: "机密",
    ownerDepartment: "研发部",
    securityLevel: 2
  },
  {
    id: "doc3",
    type: "财务报表",
    classification: "绝密",
    ownerDepartment: "财务部",
    securityLevel: 4
  }
]; 