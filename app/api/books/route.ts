import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

    // simulate save (replace with real DB call)
    const book = { id: Date.now(), ...body };

    return NextResponse.json({ ok: true, book }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
