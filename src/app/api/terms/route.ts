import { NextResponse } from 'next/server';
import db, { initDatabase, seedDatabase } from '@/lib/db';

export async function GET() {
  try {
    initDatabase();
    seedDatabase();
    
    const terms = db.prepare('SELECT * FROM terms ORDER BY category, term').all();
    
    // 빈 배열이어도 정상 응답으로 반환
    return NextResponse.json(terms || []);
  } catch (error: any) {
    console.error('Database error:', error);
    // 에러가 발생해도 빈 배열을 반환하여 클라이언트에서 처리 가능하도록
    return NextResponse.json([], { status: 200 });
  }
}

