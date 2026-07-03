import { NextRequest, NextResponse } from 'next/server';
import { ensureDatabase, query } from '@/lib/db';
import { verifyIdToken } from '@/lib/firebaseAdmin';

async function getUserId(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    throw new Error('Missing Authorization Bearer token.');
  }

  const decodedToken = await verifyIdToken(token);
  if (!decodedToken?.uid) {
    throw new Error('Invalid authentication token.');
  }

  return decodedToken.uid;
}

export async function GET(request: NextRequest) {
  await ensureDatabase();

  try {
    const userId = await getUserId(request);
    const result = await query(
      'SELECT id, description, amount::float AS amount, category, date FROM expenses WHERE user_id = $1 ORDER BY created_at DESC',
      [userId],
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  await ensureDatabase();

  try {
    const userId = await getUserId(request);
    const body = await request.json();
    const { description, amount, category, date } = body;

    if (!description || !amount || !category || !date) {
      return NextResponse.json({ error: 'Missing expense fields.' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    await query(
      'INSERT INTO expenses (id, user_id, description, amount, category, date) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, userId, description, amount, category, date],
    );

    return NextResponse.json({ id, description, amount, category, date }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 401 });
  }
}

export async function DELETE(request: NextRequest) {
  await ensureDatabase();

  try {
    const userId = await getUserId(request);
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing id field.' }, { status: 400 });
    }

    await query('DELETE FROM expenses WHERE id = $1 AND user_id = $2', [id, userId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 401 });
  }
}
