import { NextResponse } from 'next/server';
import db, { initDatabase, seedDatabase } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    initDatabase();
    seedDatabase();
    
    const { id } = await params;
    const term = db.prepare('SELECT * FROM terms WHERE id = ?').get(Number(id));
    
    if (!term) {
      return NextResponse.json({ error: 'Term not found' }, { status: 404 });
    }
    
    return NextResponse.json(term);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch term' }, { status: 500 });
  }
}

