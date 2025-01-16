import { NextResponse } from 'next/server';
import { mockResources } from '@/database/mockData';

export async function GET() {
  return NextResponse.json(mockResources);
} 