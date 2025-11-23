import { NextResponse } from 'next/server';
import db, { initDatabase, seedDatabase } from '@/lib/db';

export async function GET() {
  try {
    initDatabase();
    seedDatabase();
    
    const terms = db.prepare('SELECT * FROM terms ORDER BY category, term').all();
    return NextResponse.json(terms);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch terms' }, { status: 500 });
  }
}

