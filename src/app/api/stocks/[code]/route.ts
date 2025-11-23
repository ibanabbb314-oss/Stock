import { NextResponse } from 'next/server';
import db, { initDatabase, seedDatabase } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    initDatabase();
    seedDatabase();
    
    const { code } = await params;
    const stock = db.prepare('SELECT * FROM stocks WHERE code = ?').get(code);
    
    if (!stock) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
    }
    
    return NextResponse.json(stock);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch stock' }, { status: 500 });
  }
}

