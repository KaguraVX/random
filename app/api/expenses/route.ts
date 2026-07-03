import { NextRequest, NextResponse } from 'next/server';
import { ensureDatabase, query } from '@/lib/db';

export async function GET() {
  await ensureDatabase();

  const result = await query('SELECT id, description, amount::float AS amount, category, date FROM expenses ORDER BY created_at DESC');
  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  await ensureDatabase();

  const body = await request.json();
  const { description, amount, category, date } = body;

  if (!description || !amount || !category || !date) {
    return NextResponse.json({ error: 'Missing expense fields.' }, { status: 400 });
  }

  const id = crypto.randomUUID();
  await query(
    'INSERT INTO expenses (id, description, amount, category, date) VALUES ($1, $2, $3, $4, $5)',
    [id, description, amount, category, date],
  );

  return NextResponse.json({ id, description, amount, category, date }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  await ensureDatabase();

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: 'Missing id field.' }, { status: 400 });
  }

  await query('DELETE FROM expenses WHERE id = $1', [id]);
  return NextResponse.json({ success: true });
}
