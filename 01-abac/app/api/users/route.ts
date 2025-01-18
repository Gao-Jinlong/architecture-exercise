import { mockUsers } from "@/database/mockData";
import { NextResponse } from "next/server";

export async function GET() {
	return NextResponse.json(mockUsers);
}
