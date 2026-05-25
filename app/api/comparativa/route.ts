import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(req.url);
    const meses = parseInt(searchParams.get('meses') || '3');

    // Períodos basados en mes_impacto (lo que realmente impacta en el bolsillo)
    const periodos = await sql`
      SELECT DISTINCT mes_impacto as mes, anio_impacto as anio
      FROM gastos
      ORDER BY anio_impacto DESC, mes_impacto DESC
      LIMIT ${meses}
    `;

    if (periodos.length === 0) return NextResponse.json({ periodos: [], categorias: [], totales: [], ingresos: [] });

    const categorias = await sql`SELECT * FROM categorias ORDER BY tipo, nombre`;

    // Totales por categoría usando mes_impacto
    const totales = await sql`
      SELECT
        g.categoria_id,
        g.mes_impacto as mes,
        g.anio_impacto as anio,
        SUM(g.monto) as total
      FROM gastos g
      WHERE (g.anio_impacto, g.mes_impacto) IN (
        SELECT anio_impacto, mes_impacto
        FROM gastos
        GROUP BY anio_impacto, mes_impacto
        ORDER BY anio_impacto DESC, mes_impacto DESC
        LIMIT ${meses}
      )
      GROUP BY g.categoria_id, g.mes_impacto, g.anio_impacto
    `;

    // Ingresos para esos períodos
    const ingresos = await sql`
      SELECT * FROM ingresos
      WHERE (anio, mes) IN (
        SELECT anio_impacto, mes_impacto
        FROM gastos
        GROUP BY anio_impacto, mes_impacto
        ORDER BY anio_impacto DESC, mes_impacto DESC
        LIMIT ${meses}
      )
    `;

    return NextResponse.json({ periodos, categorias, totales, ingresos });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
