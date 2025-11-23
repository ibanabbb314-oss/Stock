import { NextResponse } from 'next/server';
import db, { initDatabase } from '@/lib/db';

export async function POST(request: Request) {
  try {
    initDatabase();
    
    const body = await request.json();
    const { type, title, content, email } = body;
    
    if (!type || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const stmt = db.prepare(`
      INSERT INTO feedback (type, title, content, email)
      VALUES (?, ?, ?, ?)
    `);
    
    stmt.run(type, title, content, email || null);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}

