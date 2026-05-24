import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(req.url);
    const mes = searchParams.get('mes');
    const anio = searchParams.get('anio');
    
    let rows;
    if (mes && anio) {
      rows = await sql`
        SELECT g.*, c.nombre as categoria_nombre, c.tipo as categoria_tipo, c.color as categoria_color
        FROM gastos g
        JOIN categorias c ON g.categoria_id = c.id
        WHERE g.mes = ${mes} AND g.anio = ${anio}
        ORDER BY g.fecha DESC, g.id DESC
      `;
    } else {
      rows = await sql`
        SELECT g.*, c.nombre as categoria_nombre, c.tipo as categoria_tipo, c.color as categoria_color
        FROM gastos g
        JOIN categorias c ON g.categoria_id = c.id
        ORDER BY g.fecha DESC, g.id DESC
      `;
    }
    return NextResponse.json(rows);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sql = getDb();
    const { categoria_id, descripcion, monto, fecha, mes, anio } = await req.json();
    const rows = await sql`
      INSERT INTO gastos (categoria_id, descripcion, monto, fecha, mes, anio)
      VALUES (${categoria_id}, ${descripcion}, ${monto}, ${fecha}, ${mes}, ${anio})
      RETURNING *
    `;
    return NextResponse.json(rows[0]);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
