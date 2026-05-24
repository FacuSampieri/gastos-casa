'use client';
import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import { formatMoney, mesCorto } from '@/lib/utils';
import type { Categoria } from '@/lib/types';

type Periodo = { mes: number; anio: number };
type Totales = { categoria_id: number; mes: number; anio: number; total: string }[];
type Ingreso = { mes: number; anio: number; monto: string };

export default function ComparativaPage() {
  const [meses, setMeses] = useState(3);
  const [data, setData] = useState<{ periodos: Periodo[]; categorias: Categoria[]; totales: Totales; ingresos: Ingreso[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    try {
      const d = await fetch(`/api/comparativa?meses=${meses}`).then(r => r.json());
      setData(d);
    } finally {
      setLoading(false);
    }
  }, [meses]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  if (loading) return <Layout><div className="flex justify-center py-20 text-secondary font-medium">Cargando comparativa...</div></Layout>;
  
  if (!data || data.periodos.length === 0) return (
    <Layout>
      <div className="flex flex-col gap-8">
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Comparativa</h2>
        <div className="flex flex-col items-center justify-center py-20 text-secondary">
          <p>No hay suficientes datos para comparar. Cargá gastos en al menos un mes.</p>
        </div>
      </div>
    </Layout>
  );

  const { periodos, categorias, totales, ingresos } = data;
  // Sort periodos oldest to newest
  const periodosOrdenados = [...periodos].sort((a, b) => a.anio !== b.anio ? a.anio - b.anio : a.mes - b.mes);

  const getTotal = (catId: number, mes: number, anio: number) => {
    const t = totales.find(t => t.categoria_id === catId && t.mes === mes && t.anio === anio);
    return t ? parseFloat(t.total) : 0;
  };

  const getTotalMes = (mes: number, anio: number) => totales.filter(t => t.mes === mes && t.anio === anio).reduce((a, t) => a + parseFloat(t.total), 0);

  const getIngreso = (mes: number, anio: number) => {
    const i = ingresos.find(i => i.mes === mes && i.anio === anio);
    return i ? parseFloat(i.monto) : 0;
  };

  const trend = (curr: number, prev: number) => {
    if (prev === 0 || curr === 0) return null;
    const pct = ((curr - prev) / prev) * 100;
    return pct;
  };

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-3xl md:text-5xl font-extrabold text-on-surface tracking-tight">
            Comparativa
          </h2>
          <div className="flex items-center bg-surface-container rounded-full p-1 border border-outline-variant">
            {[3, 6, 12].map(n => (
              <button
                key={n}
                onClick={() => {
                  setLoading(true);
                  setMeses(n);
                }}
                className={`px-4 py-1.5 rounded-full font-bold text-sm transition-all ${
                  meses === n
                    ? 'bg-on-surface text-surface'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {n}m
              </button>
            ))}
          </div>
        </header>

        {/* Main Data Table Container */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-x-auto shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant">
                <th className="px-6 py-4 text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Categoría
                </th>
                {periodosOrdenados.map((p, i) => (
                  <th key={i} className="px-6 py-4 text-right text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    {mesCorto(p.mes)}<br />{p.anio}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Section: FIJOS */}
              {categorias.filter(c => c.tipo === 'fijo').length > 0 && (
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <td colSpan={periodosOrdenados.length + 1} className="px-6 py-2 text-xs font-extrabold text-on-surface-variant uppercase tracking-widest">
                    Fijos
                  </td>
                </tr>
              )}
              {categorias.filter(c => c.tipo === 'fijo').map(cat => (
                <tr key={cat.id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></div>
                      <span className="text-sm font-bold text-on-surface flex items-center gap-2">
                        <span className="text-xl leading-none">{cat.icono}</span>
                        {cat.nombre}
                      </span>
                    </div>
                  </td>
                  {periodosOrdenados.map((p, i) => {
                    const curr = getTotal(cat.id, p.mes, p.anio);
                    const prev = i > 0 ? getTotal(cat.id, periodosOrdenados[i - 1].mes, periodosOrdenados[i - 1].anio) : null;
                    const pct = prev !== null ? trend(curr, prev) : null;
                    const isUp = pct !== null && pct > 0;
                    return (
                      <td key={i} className="px-6 py-4 text-right">
                        <div className="text-sm font-semibold text-on-surface">
                          {curr > 0 ? formatMoney(curr) : <span className="text-outline-variant">—</span>}
                        </div>
                        {pct !== null && curr > 0 && prev! > 0 && (
                          <div className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${isUp ? 'text-error' : 'text-[#10b981]'}`}>
                            <span className="material-symbols-outlined text-[12px]">
                              {isUp ? 'trending_up' : 'trending_down'}
                            </span>
                            {Math.abs(pct).toFixed(0)}%
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Section: VARIABLES */}
              {categorias.filter(c => c.tipo === 'variable').length > 0 && (
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <td colSpan={periodosOrdenados.length + 1} className="px-6 py-2 text-xs font-extrabold text-on-surface-variant uppercase tracking-widest">
                    Variables
                  </td>
                </tr>
              )}
              {categorias.filter(c => c.tipo === 'variable').map(cat => (
                <tr key={cat.id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></div>
                      <span className="text-sm font-bold text-on-surface flex items-center gap-2">
                        <span className="text-xl leading-none">{cat.icono}</span>
                        {cat.nombre}
                      </span>
                    </div>
                  </td>
                  {periodosOrdenados.map((p, i) => {
                    const curr = getTotal(cat.id, p.mes, p.anio);
                    const prev = i > 0 ? getTotal(cat.id, periodosOrdenados[i - 1].mes, periodosOrdenados[i - 1].anio) : null;
                    const pct = prev !== null ? trend(curr, prev) : null;
                    const isUp = pct !== null && pct > 0;
                    return (
                      <td key={i} className="px-6 py-4 text-right">
                        <div className="text-sm font-semibold text-on-surface">
                          {curr > 0 ? formatMoney(curr) : <span className="text-outline-variant">—</span>}
                        </div>
                        {pct !== null && curr > 0 && prev! > 0 && (
                          <div className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${isUp ? 'text-error' : 'text-[#10b981]'}`}>
                            <span className="material-symbols-outlined text-[12px]">
                              {isUp ? 'trending_up' : 'trending_down'}
                            </span>
                            {Math.abs(pct).toFixed(0)}%
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Total Row */}
              <tr className="bg-surface-container border-b border-outline-variant">
                <td className="px-6 py-4 text-sm font-bold text-on-surface">Total gastos</td>
                {periodosOrdenados.map((p, i) => {
                  const curr = getTotalMes(p.mes, p.anio);
                  const prev = i > 0 ? getTotalMes(periodosOrdenados[i - 1].mes, periodosOrdenados[i - 1].anio) : null;
                  const pct = prev !== null ? trend(curr, prev) : null;
                  const isUp = pct !== null && pct > 0;
                  return (
                    <td key={i} className="px-6 py-4 text-right">
                      <div className="text-sm font-extrabold text-on-surface">{formatMoney(curr)}</div>
                      {pct !== null && (
                        <div className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${isUp ? 'text-error' : 'text-[#10b981]'}`}>
                          <span className="material-symbols-outlined text-[12px]">
                            {isUp ? 'trending_up' : 'trending_down'}
                          </span>
                          {Math.abs(pct).toFixed(0)}%
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Ingreso Row */}
              <tr className="border-b border-outline-variant">
                <td className="px-6 py-4 text-sm font-medium text-secondary">Ingreso</td>
                {periodosOrdenados.map((p, i) => {
                  const ing = getIngreso(p.mes, p.anio);
                  return (
                    <td key={i} className="px-6 py-4 text-right text-sm font-medium text-secondary">
                      {ing > 0 ? formatMoney(ing) : <span className="text-outline-variant">—</span>}
                    </td>
                  );
                })}
              </tr>

              {/* Balance Row */}
              <tr className="bg-surface-container-highest">
                <td className="px-6 py-5 text-lg font-bold text-on-surface">Balance</td>
                {periodosOrdenados.map((p, i) => {
                  const bal = getIngreso(p.mes, p.anio) - getTotalMes(p.mes, p.anio);
                  const ing = getIngreso(p.mes, p.anio);
                  const isPos = bal >= 0;
                  return (
                    <td key={i} className="px-6 py-5 text-right">
                      {ing > 0 ? (
                        <div className={`text-lg font-extrabold flex items-center justify-end gap-2 ${isPos ? 'text-[#059669]' : 'text-error'}`}>
                          <span className="material-symbols-outlined">
                            {isPos ? 'trending_up' : 'trending_down'}
                          </span>
                          {formatMoney(Math.abs(bal))}
                        </div>
                      ) : (
                        <span className="text-outline-variant">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
