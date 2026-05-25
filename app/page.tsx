'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { formatMoney, mesNombre, getMesActual, periodoAnterior, periodoSiguiente } from '@/lib/utils';
import type { Gasto, Ingreso } from '@/lib/types';

export default function Dashboard() {
  const [periodo, setPeriodo] = useState(getMesActual());
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [ingreso, setIngreso] = useState<Ingreso | null>(null);
  const [editIngreso, setEditIngreso] = useState(false);
  const [montoIngreso, setMontoIngreso] = useState('');
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    try {
      const [g, i] = await Promise.all([
        fetch(`/api/gastos?mes=${periodo.mes}&anio=${periodo.anio}&vista=impacto`).then(r => r.json()),
        fetch(`/api/ingresos?mes=${periodo.mes}&anio=${periodo.anio}`).then(r => r.json()),
      ]);
      setGastos(Array.isArray(g) ? g : []);
      setIngreso(i);
      setMontoIngreso(i?.monto?.toString() || '');
    } finally {
      setLoading(false);
    }
  }, [periodo]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const guardarIngreso = async () => {
    setLoading(true);
    await fetch('/api/ingresos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monto: parseFloat(montoIngreso) || 0, descripcion: 'Ingreso mensual', mes: periodo.mes, anio: periodo.anio }),
    });
    setEditIngreso(false);
    void cargar();
  };

  const totalGastos = gastos.reduce((a, g) => a + Number(g.monto), 0);
  const gastosFijos = gastos.filter(g => g.categoria_tipo === 'fijo').reduce((a, g) => a + Number(g.monto), 0);
  const gastosVariables = gastos.filter(g => g.categoria_tipo === 'variable').reduce((a, g) => a + Number(g.monto), 0);
  const montoI = ingreso?.monto ? Number(ingreso.monto) : 0;
  const balance = montoI - totalGastos;
  const pctGastado = montoI > 0 ? Math.min((totalGastos / montoI) * 100, 100) : 0;

  // Agrupar por categoría
  const porCategoria: Record<string, { nombre: string; tipo: string; color: string; total: number }> = {};
  gastos.forEach(g => {
    if (!porCategoria[g.categoria_id]) {
      porCategoria[g.categoria_id] = { nombre: g.categoria_nombre || '', tipo: g.categoria_tipo || '', color: g.categoria_color || '#ccc', total: 0 };
    }
    porCategoria[g.categoria_id].total += Number(g.monto);
  });
  const cats = Object.values(porCategoria).sort((a, b) => b.total - a.total);

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Top Header with Month Selector */}
        <header className="flex justify-between items-center w-full mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setLoading(true);
                setPeriodo(periodoAnterior(periodo.mes, periodo.anio));
              }}
              className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-secondary hover:bg-surface-container-low hover:text-primary transition-colors active:scale-95 duration-150"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <h2 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight capitalize">
              {mesNombre(periodo.mes)} {periodo.anio}
            </h2>
            <button
              onClick={() => {
                setLoading(true);
                setPeriodo(periodoSiguiente(periodo.mes, periodo.anio));
              }}
              className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-secondary hover:bg-surface-container-low hover:text-primary transition-colors active:scale-95 duration-150"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
          <Link
            href="/gastos?nuevo=1"
            className="bg-primary text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-on-primary-fixed-variant transition-colors active:scale-95 shadow-level-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="hidden sm:inline">Añadir gasto</span>
          </Link>
        </header>

        {loading ? (
          <div className="flex justify-center py-20 text-secondary font-medium">Cargando datos...</div>
        ) : (
          <>
            {/* Main Header */}
            <div>
              <h2 className="text-3xl font-bold text-on-surface">
                Resumen de {mesNombre(periodo.mes)}
              </h2>
              <p className="text-base text-secondary">
                Tu estado financiero actual.
              </p>
            </div>

            {/* Top Row: Income & Balance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Income Card */}
              <div className="bg-surface-container-low p-6 rounded-xl shadow-level-2 hover:shadow-level-3 transition-shadow duration-300 relative group border-l-4 border-primary">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-semibold text-secondary tracking-widest uppercase">INGRESO DEL MES</span>
                  <button
                    onClick={() => setEditIngreso(!editIngreso)}
                    className="text-primary hover:text-on-primary-fixed flex items-center gap-1 transition-colors text-sm font-medium opacity-0 group-hover:opacity-100"
                  >
                    <span className="material-symbols-outlined text-[18px]">{editIngreso ? 'close' : 'edit'}</span>
                    {editIngreso ? 'Cancelar' : 'Editar'}
                  </button>
                </div>
                {editIngreso ? (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="number"
                      value={montoIngreso}
                      onChange={e => setMontoIngreso(e.target.value)}
                      className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 outline-none focus:border-primary transition-colors font-bold text-primary text-xl"
                      autoFocus
                    />
                    <button
                      onClick={guardarIngreso}
                      className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-on-primary-fixed-variant transition-colors"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <div className="text-4xl md:text-5xl font-extrabold text-primary">
                    {formatMoney(montoI)}
                  </div>
                )}
              </div>

              {/* Balance Card */}
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-level-2 border-2 border-primary-fixed hover:shadow-level-3 transition-shadow duration-300 relative overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-fixed/30 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <span className="text-xs font-semibold text-secondary tracking-widest uppercase">BALANCE</span>
                  <span className={`material-symbols-outlined ${balance >= 0 ? 'text-primary' : 'text-error'}`}>
                    {balance >= 0 ? 'trending_up' : 'trending_down'}
                  </span>
                </div>
                <div className={`text-4xl md:text-5xl font-extrabold relative z-10 mb-2 ${balance >= 0 ? 'text-on-surface' : 'text-error'}`}>
                  {formatMoney(Math.abs(balance))}
                </div>
                <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold tracking-wide uppercase relative z-10 ${balance >= 0 ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-error-container text-on-error-container'}`}>
                  {balance >= 0 ? 'de superávit' : 'de déficit'}
                </div>
              </div>
            </div>

            {/* Middle Row: Expenses vs Income Progress */}
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-level-2 hover:shadow-level-3 transition-shadow duration-300 border border-surface-container">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-semibold text-secondary tracking-widest uppercase">GASTOS VS INGRESO</span>
                <span className="text-lg font-bold text-on-surface">{pctGastado.toFixed(0)}%</span>
              </div>
              <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden mb-4">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${pctGastado}%`,
                    backgroundColor: pctGastado > 90 ? '#ba1a1a' : '#ff5f1f'
                  }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary font-medium">
                  Gastado: <span className="text-on-surface font-semibold">{formatMoney(totalGastos)}</span>
                </span>
                <span className="text-secondary font-medium">
                  Disponible: <span className="text-primary font-semibold">{formatMoney(Math.max(montoI - totalGastos, 0))}</span>
                </span>
              </div>
            </div>

            {/* Bottom Row: Fixed vs Variable */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-level-2 hover:shadow-level-3 transition-shadow duration-300 border-l-2 border-outline-variant">
                <span className="text-xs font-semibold text-secondary tracking-widest uppercase mb-4 block">GASTOS FIJOS</span>
                <div className="text-3xl font-bold text-on-surface mb-1">{formatMoney(gastosFijos)}</div>
                <div className="text-sm font-medium text-tertiary">
                  {totalGastos > 0 ? ((gastosFijos / totalGastos) * 100).toFixed(0) : 0}% del total
                </div>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-level-2 hover:shadow-level-3 transition-shadow duration-300 border-l-2 border-outline-variant">
                <span className="text-xs font-semibold text-secondary tracking-widest uppercase mb-4 block">GASTOS VARIABLES</span>
                <div className="text-3xl font-bold text-on-surface mb-1">{formatMoney(gastosVariables)}</div>
                <div className="text-sm font-medium text-tertiary">
                  {totalGastos > 0 ? ((gastosVariables / totalGastos) * 100).toFixed(0) : 0}% del total
                </div>
              </div>
            </div>

            {/* Por categoría (matching the new style) */}
            {cats.length > 0 && (
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-level-2 border border-surface-container">
                <span className="text-xs font-semibold text-secondary tracking-widest uppercase mb-6 block">POR CATEGORÍA</span>
                <div className="flex flex-col gap-4">
                  {cats.map((c, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-surface-container-high last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }}></div>
                        <div>
                          <span className="text-sm font-bold text-on-surface">{c.nombre}</span>
                          <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${c.tipo === 'fijo' ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-secondary-container text-on-secondary-container'}`}>
                            {c.tipo}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-on-surface">{formatMoney(c.total)}</div>
                        <div className="text-[10px] font-medium text-secondary">
                          {totalGastos > 0 ? ((c.total / totalGastos) * 100).toFixed(0) : 0}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State & Action */}
            {gastos.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 mt-4">
                <p className="text-base text-secondary mb-6 text-center">
                  No hay gastos registrados en {mesNombre(periodo.mes)}.
                </p>
                <a
                  href="/gastos"
                  className="bg-primary-container text-white hover:bg-primary transition-all active:scale-95 duration-200 py-3 px-8 rounded-full font-bold text-lg flex items-center gap-2 shadow-level-2 hover:shadow-level-3 no-underline"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  Agregar gasto
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
