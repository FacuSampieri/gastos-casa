import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT clave, valor FROM config`;
    const config: Record<string, string> = {};
    rows.forEach((r) => {
      config[r.clave] = r.valor;
    });
    return NextResponse.json(config);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sql = getDb();
    const body = await req.json();
    // body es { clave: valor, clave2: valor2, ... }
    for (const [clave, valor] of Object.entries(body)) {
      await sql`
        INSERT INTO config (clave, valor)
        VALUES (${clave}, ${String(valor)})
        ON CONFLICT (clave) DO UPDATE SET valor = ${String(valor)}
      `;
    }
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
