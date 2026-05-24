import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(req.url);
    const meses = parseInt(searchParams.get('meses') || '3');
    
    // Get last N months
    const periodos = await sql`
      SELECT DISTINCT mes, anio FROM gastos
      ORDER BY anio DESC, mes DESC
      LIMIT ${meses}
    `;
    
    if (periodos.length === 0) return NextResponse.json({ periodos: [], categorias: [], data: {} });
    
    // Get all categories
    const categorias = await sql`SELECT * FROM categorias ORDER BY tipo, nombre`;
    
    // Get totals per category per month
    const totales = await sql`
      SELECT g.categoria_id, g.mes, g.anio, SUM(g.monto) as total
      FROM gastos g
      WHERE (g.anio, g.mes) IN (SELECT anio, mes FROM gastos ORDER BY anio DESC, mes DESC LIMIT ${meses})
      GROUP BY g.categoria_id, g.mes, g.anio
    `;

    // Get ingresos for those periods
    const ingresos = await sql`
      SELECT * FROM ingresos
      WHERE (anio, mes) IN (SELECT anio, mes FROM gastos ORDER BY anio DESC, mes DESC LIMIT ${meses})
    `;
    
    return NextResponse.json({ periodos, categorias, totales, ingresos });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
