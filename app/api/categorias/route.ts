import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM categorias ORDER BY tipo, nombre`;
    return NextResponse.json(rows);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sql = getDb();
    const { nombre, tipo, color, icono } = await req.json();
    const rows = await sql`
      INSERT INTO categorias (nombre, tipo, color, icono)
      VALUES (${nombre}, ${tipo}, ${color}, ${icono})
      RETURNING *
    `;
    return NextResponse.json(rows[0]);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
