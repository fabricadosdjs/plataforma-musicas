import { NextRequest, NextResponse } from 'next/server';
import { testContaboConnection } from '../test-connection';

export async function GET(req: NextRequest) {
  const result = await testContaboConnection();
  return NextResponse.json(result);
}
