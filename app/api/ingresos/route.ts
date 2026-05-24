import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(req.url);
    const mes = searchParams.get('mes');
    const anio = searchParams.get('anio');
    if (mes && anio) {
      const rows = await sql`SELECT * FROM ingresos WHERE mes=${mes} AND anio=${anio} LIMIT 1`;
      return NextResponse.json(rows[0] || null);
    }
    const rows = await sql`SELECT * FROM ingresos ORDER BY anio DESC, mes DESC`;
    return NextResponse.json(rows);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sql = getDb();
    const { monto, descripcion, mes, anio } = await req.json();
    // Upsert
    const rows = await sql`
      INSERT INTO ingresos (monto, descripcion, mes, anio)
      VALUES (${monto}, ${descripcion}, ${mes}, ${anio})
      ON CONFLICT (mes, anio) DO UPDATE SET monto=${monto}, descripcion=${descripcion}
      RETURNING *
    `;
    return NextResponse.json(rows[0]);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
