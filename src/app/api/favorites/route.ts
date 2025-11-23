import { NextResponse } from 'next/server';
import db, { initDatabase } from '@/lib/db';

export async function GET() {
  try {
    initDatabase();
    
    const favorites = db.prepare(`
      SELECT f.code, f.name, f.created_at
      FROM favorite_stocks f
      ORDER BY f.created_at DESC
    `).all();
    
    return NextResponse.json(favorites);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    initDatabase();
    
    const body = await request.json();
    const { code, name } = body;
    
    if (!code || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: code and name' },
        { status: 400 }
      );
    }
    
    // 이미 추가된 종목인지 확인
    const existing = db.prepare('SELECT * FROM favorite_stocks WHERE code = ?').get(code);
    if (existing) {
      return NextResponse.json(
        { error: 'Stock already in favorites' },
        { status: 409 }
      );
    }
    
    const stmt = db.prepare(`
      INSERT INTO favorite_stocks (code, name)
      VALUES (?, ?)
    `);
    
    stmt.run(code, name);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Database error:', error);
    // UNIQUE constraint violation 처리
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json(
        { error: 'Stock already in favorites' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
  }
}

