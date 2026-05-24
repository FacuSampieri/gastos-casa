import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb();
    const { id } = await params;
    const { categoria_id, descripcion, monto, fecha, mes, anio } = await req.json();
    const rows = await sql`
      UPDATE gastos SET categoria_id=${categoria_id}, descripcion=${descripcion}, monto=${monto}, fecha=${fecha}, mes=${mes}, anio=${anio}
      WHERE id=${id} RETURNING *
    `;
    return NextResponse.json(rows[0]);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb();
    const { id } = await params;
    await sql`DELETE FROM gastos WHERE id=${id}`;
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
