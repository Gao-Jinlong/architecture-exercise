import { NextResponse } from 'next/server';
import { mockUsers } from '@/database/mockData';

export async function GET() {
  return NextResponse.json(mockUsers);
} 