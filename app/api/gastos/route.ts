import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// Calcula el mes/año de impacto según medio de pago y día de cierre
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
    // Débito y efectivo impactan en el mismo mes
    return { mes_impacto: mes, anio_impacto: anio };
  }

  // Crédito: si es antes o en el día de cierre → resumen de este mes → debita el 1 del mes siguiente
  // Si es después del cierre → resumen del mes siguiente → debita el 1 del subsiguiente
  if (dia <= diaCierre) {
    // Impacta el mes siguiente
    if (mes === 12) return { mes_impacto: 1, anio_impacto: anio + 1 };
    return { mes_impacto: mes + 1, anio_impacto: anio };
  } else {
    // Impacta dos meses después
    if (mes === 11) return { mes_impacto: 1, anio_impacto: anio + 1 };
    if (mes === 12) return { mes_impacto: 2, anio_impacto: anio + 1 };
    return { mes_impacto: mes + 2, anio_impacto: anio };
  }
}

// Suma N meses a un mes/año
function sumarMeses(mes: number, anio: number, n: number) {
  const total = (anio * 12 + (mes - 1)) + n;
  return { mes: (total % 12) + 1, anio: Math.floor(total / 12) };
}

export async function GET(req: Request) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(req.url);
    const mes = searchParams.get('mes');
    const anio = searchParams.get('anio');
    const vista = searchParams.get('vista') || 'impacto'; // 'ocurrencia' | 'impacto'
    
    let rows;
    if (mes && anio) {
      if (vista === 'impacto') {
        // Gastos que impactan en este mes (lo que sale del bolsillo)
        rows = await sql`
          SELECT g.*, c.nombre as categoria_nombre, c.tipo as categoria_tipo, c.color as categoria_color
          FROM gastos g
          JOIN categorias c ON g.categoria_id = c.id
          WHERE g.mes_impacto = ${mes} AND g.anio_impacto = ${anio}
          ORDER BY g.fecha DESC, g.id DESC
        `;
      } else {
        // Gastos que ocurrieron en este mes (fecha real de compra)
        rows = await sql`
          SELECT g.*, c.nombre as categoria_nombre, c.tipo as categoria_tipo, c.color as categoria_color
          FROM gastos g
          JOIN categorias c ON g.categoria_id = c.id
          WHERE g.mes = ${mes} AND g.anio = ${anio}
          ORDER BY g.fecha DESC, g.id DESC
        `;
      }
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
    const body = await req.json();
    const {
      categoria_id,
      descripcion,
      monto,
      fecha,
      mes,
      anio,
      medio_pago = 'efectivo',
      cuotas = 1, // número de cuotas, 1 = sin cuotas
    } = body;

    // Obtener día de cierre configurado
    const configRows = await sql`SELECT valor FROM config WHERE clave = 'dia_cierre_tarjeta'`;
    const diaCierre = configRows.length > 0 ? parseInt(configRows[0].valor) : 22;

    // Calcular impacto de la primera cuota
    const impactoBase = calcularImpacto(fecha, medio_pago, diaCierre);
    const montoCuota = Math.round((parseFloat(monto) / cuotas) * 100) / 100;

    // Generar UUID de grupo para cuotas (aunque sea 1 cuota, útil para identificar)
    const cuotaGrupo = cuotas > 1 ? crypto.randomUUID() : null;

    const insertados = [];

    for (let i = 0; i < cuotas; i++) {
      // Cada cuota impacta un mes después de la anterior
      const impacto = i === 0
        ? impactoBase
        : { mes_impacto: sumarMeses(impactoBase.mes_impacto, impactoBase.anio_impacto, i).mes, anio_impacto: sumarMeses(impactoBase.mes_impacto, impactoBase.anio_impacto, i).anio };

      const rows = await sql`
        INSERT INTO gastos (
          categoria_id, descripcion, monto, fecha, mes, anio,
          medio_pago, mes_impacto, anio_impacto,
          cuota_actual, cuota_total, cuota_grupo
        )
        VALUES (
          ${categoria_id},
          ${cuotas > 1 ? `${descripcion} (${i + 1}/${cuotas})` : descripcion},
          ${montoCuota},
          ${fecha},
          ${mes},
          ${anio},
          ${medio_pago},
          ${impacto.mes_impacto},
          ${impacto.anio_impacto},
          ${cuotas > 1 ? i + 1 : null},
          ${cuotas > 1 ? cuotas : null},
          ${cuotaGrupo}
        )
        RETURNING *
      `;
      insertados.push(rows[0]);
    }

    return NextResponse.json(cuotas === 1 ? insertados[0] : insertados);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
