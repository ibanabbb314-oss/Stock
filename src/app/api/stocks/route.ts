import { NextResponse } from 'next/server';
import db, { initDatabase, seedDatabase } from '@/lib/db';

export async function GET() {
  try {
    initDatabase();
    seedDatabase();
    
    const stocks = db.prepare('SELECT * FROM stocks ORDER BY name').all();
    return NextResponse.json(stocks);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch stocks' }, { status: 500 });
  }
}

