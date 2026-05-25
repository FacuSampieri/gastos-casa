import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function calcularImpacto(
  fechaStr: string,
  medioPago: string,
  diaCierre: number
): { mes_impacto: number; anio_impacto: number } {
  const fecha = new Date(fechaStr + 'T12:00:00');
  const dia = fecha.getDate();
  const mes = fecha.getMonth() + 1;
  const anio = fecha.getFullYear();

  if (medioPago !== 'credito') {
    return { mes_impacto: mes, anio_impacto: anio };
  }

  if (dia <= diaCierre) {
    if (mes === 12) return { mes_impacto: 1, anio_impacto: anio + 1 };
    return { mes_impacto: mes + 1, anio_impacto: anio };
  } else {
    if (mes === 11) return { mes_impacto: 1, anio_impacto: anio + 1 };
    if (mes === 12) return { mes_impacto: 2, anio_impacto: anio + 1 };
    return { mes_impacto: mes + 2, anio_impacto: anio };
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb();
    const { id } = await params;
    const { categoria_id, descripcion, monto, fecha, mes, anio, medio_pago = 'efectivo' } = await req.json();

    // Recalcular impacto al editar
    const configRows = await sql`SELECT valor FROM config WHERE clave = 'dia_cierre_tarjeta'`;
    const diaCierre = configRows.length > 0 ? parseInt(configRows[0].valor) : 22;
    const { mes_impacto, anio_impacto } = calcularImpacto(fecha, medio_pago, diaCierre);

    const rows = await sql`
      UPDATE gastos SET
        categoria_id = ${categoria_id},
        descripcion = ${descripcion},
        monto = ${monto},
        fecha = ${fecha},
        mes = ${mes},
        anio = ${anio},
        medio_pago = ${medio_pago},
        mes_impacto = ${mes_impacto},
        anio_impacto = ${anio_impacto}
      WHERE id = ${id}
      RETURNING *
    `;
    return NextResponse.json(rows[0]);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sql = getDb();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const todo = searchParams.get('todo') === 'true';

    if (todo) {
      // Obtener el cuota_grupo del gasto antes de borrar
      const rows = await sql`SELECT cuota_grupo FROM gastos WHERE id = ${id}`;
      if (rows.length > 0 && rows[0].cuota_grupo) {
        await sql`DELETE FROM gastos WHERE cuota_grupo = ${rows[0].cuota_grupo}`;
        return NextResponse.json({ ok: true, deletedGroup: true });
      }
    }

    await sql`DELETE FROM gastos WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
