'use client';
import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import { formatMoney, mesNombre, getMesActual, periodoAnterior, periodoSiguiente } from '@/lib/utils';
import type { Gasto, Categoria } from '@/lib/types';

export default function GastosPage() {
  const [periodo, setPeriodo] = useState(getMesActual());
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [filtro, setFiltro] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Gasto | null>(null);
  const [form, setForm] = useState({ categoria_id: '', descripcion: '', monto: '', fecha: new Date().toISOString().split('T')[0] });
  
  // Custom confirm state
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    try {
      const [g, c] = await Promise.all([
        fetch(`/api/gastos?mes=${periodo.mes}&anio=${periodo.anio}`).then(r => r.json()),
        fetch('/api/categorias').then(r => r.json()),
      ]);
      setGastos(Array.isArray(g) ? g : []);
      setCategorias(Array.isArray(c) ? c : []);
    } finally {
      setLoading(false);
    }
  }, [periodo]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const abrirNuevo = () => {
    setEditando(null);
    setForm({ categoria_id: categorias[0]?.id?.toString() || '', descripcion: '', monto: '', fecha: new Date().toISOString().split('T')[0] });
    setModal(true);
  };

  const abrirEditar = (g: Gasto) => {
    setEditando(g);
    setForm({ categoria_id: g.categoria_id.toString(), descripcion: g.descripcion, monto: g.monto.toString(), fecha: g.fecha.toString().split('T')[0] });
    setModal(true);
  };

  const guardar = async () => {
    if (!form.monto || !form.categoria_id) return;
    setLoading(true);
    const d = new Date(form.fecha + 'T12:00:00');
    const payload = {
      categoria_id: parseInt(form.categoria_id),
      descripcion: form.descripcion,
      monto: parseFloat(form.monto),
      fecha: form.fecha,
      mes: d.getMonth() + 1,
      anio: d.getFullYear(),
    };
    if (editando) {
      await fetch(`/api/gastos/${editando.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    } else {
      await fetch('/api/gastos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    }
    setModal(false);
    void cargar();
  };

  const confirmarEliminar = (id: number) => {
    setConfirmId(id);
  };

  const ejecutarEliminar = async () => {
    if (confirmId === null) return;
    setLoading(true);
    await fetch(`/api/gastos/${confirmId}`, { method: 'DELETE' });
    setConfirmId(null);
    void cargar();
  };

  const gastosFiltrados = filtro ? gastos.filter(g => g.categoria_id === filtro) : gastos;
  const total = gastosFiltrados.reduce((a, g) => a + Number(g.monto), 0);

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setLoading(true);
                setPeriodo(periodoAnterior(periodo.mes, periodo.anio));
              }}
              className="p-2 rounded-full border border-outline hover:bg-surface-variant transition-colors flex items-center justify-center text-on-surface active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <h2 className="text-2xl md:text-3xl font-extrabold text-on-background tracking-tight capitalize">
              {mesNombre(periodo.mes)} {periodo.anio}
            </h2>
            <button
              onClick={() => {
                setLoading(true);
                setPeriodo(periodoSiguiente(periodo.mes, periodo.anio));
              }}
              className="p-2 rounded-full border border-outline hover:bg-surface-variant transition-colors flex items-center justify-center text-on-surface active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
          <button
            onClick={abrirNuevo}
            className="bg-on-background hover:bg-inverse-surface text-white px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition-all shadow-level-2 active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Agregar
          </button>
        </div>

        {/* Filters Section */}
        {categorias.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
            <button
              onClick={() => setFiltro(null)}
              className={`px-5 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all border ${
                !filtro
                  ? 'bg-primary-container text-white border-primary-container shadow-sm'
                  : 'bg-surface-container-lowest text-secondary border-outline-variant hover:bg-surface-container-low'
              }`}
            >
              Todas
            </button>
            {categorias.map(c => (
              <button
                key={c.id}
                onClick={() => setFiltro(filtro === c.id ? null : c.id)}
                className={`px-5 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all border ${
                  filtro === c.id
                    ? 'bg-primary-container text-white border-primary-container shadow-sm'
                    : 'bg-surface-container-lowest text-secondary border-outline-variant hover:bg-surface-container-low'
                }`}
                style={filtro === c.id ? { backgroundColor: c.color, borderColor: c.color } : {}}
              >
                {c.nombre}
              </button>
            ))}
          </div>
        )}

        {/* Summary Section */}
        <div className="flex justify-between items-end border-b border-surface-variant pb-4">
          <span className="text-xs font-bold text-secondary uppercase tracking-widest">
            TOTAL {filtro ? categorias.find(c => c.id === filtro)?.nombre : 'DEL MES'}
          </span>
          <span className="text-2xl font-extrabold text-on-background">{formatMoney(total)}</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-secondary font-medium">Cargando gastos...</div>
        ) : (
          <div className="flex flex-col gap-4">
            {gastosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-secondary">
                <p>No hay gastos registrados para este periodo.</p>
              </div>
            ) : (
              gastosFiltrados.map(g => (
                <div
                  key={g.id}
                  className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-surface-variant hover:border-primary-fixed-dim transition-colors group relative flex justify-between items-start"
                >
                  <div className="flex items-start gap-4">
                    {/* Category Indicator Dot */}
                    <div
                      className="mt-1.5 w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: g.categoria_color || '#ccc' }}
                    ></div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-on-background mb-0.5">{g.categoria_nombre}</span>
                      {g.descripcion && (
                        <span className="text-sm font-medium text-on-surface-variant line-clamp-1">{g.descripcion}</span>
                      )}
                      <span className="text-xs font-medium text-secondary mt-1">
                        {new Date(g.fecha.toString().split('T')[0] + 'T12:00:00').toLocaleDateString('es-AR', {
                          day: 'numeric',
                          month: 'long',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-lg font-extrabold text-on-background">{formatMoney(Number(g.monto))}</span>
                    <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => abrirEditar(g)}
                        className="p-1.5 text-secondary hover:text-primary hover:bg-surface-container-low rounded-full transition-all active:scale-90"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => confirmarEliminar(g.id)}
                        className="p-1.5 text-secondary hover:text-error hover:bg-error-container rounded-full transition-all active:scale-90"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Form Modal */}
        <Modal 
          isOpen={modal} 
          onClose={() => setModal(false)} 
          title={editando ? 'Editar gasto' : 'Nuevo gasto'}
        >
          <div className="flex flex-col gap-5">
            <div>
              <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-1.5 block">Categoría</label>
              <select
                value={form.categoria_id}
                onChange={e => setForm(f => ({ ...f, categoria_id: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary transition-colors font-semibold appearance-none"
              >
                {categorias.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({c.tipo})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-1.5 block">Descripción</label>
              <input
                type="text"
                value={form.descripcion}
                onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                placeholder="Ej: Pago de luz"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary transition-colors font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-1.5 block">Monto</label>
              <input
                type="number"
                value={form.monto}
                onChange={e => setForm(f => ({ ...f, monto: e.target.value }))}
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary transition-colors font-bold text-xl"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-1.5 block">Fecha</label>
              <input
                type="date"
                value={form.fecha}
                onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary transition-colors font-semibold"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={() => setModal(false)}
              className="flex-1 py-3 text-sm font-bold text-secondary bg-surface-container-low hover:bg-surface-container-high rounded-full transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={guardar}
              className="flex-1 py-3 text-sm font-bold text-white bg-on-background hover:bg-inverse-surface rounded-full transition-colors shadow-level-2"
            >
              Guardar
            </button>
          </div>
        </Modal>

        {/* Confirmation Dialog */}
        <Modal 
          isOpen={confirmId !== null} 
          onClose={() => setConfirmId(null)} 
          title="¿Eliminar gasto?"
        >
          <div className="flex flex-col gap-4">
            <p className="text-on-surface-variant font-medium">
              ¿Estás seguro de que deseas eliminar este gasto? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 py-3 text-sm font-bold text-secondary bg-surface-container-low hover:bg-surface-container-high rounded-full transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarEliminar}
                className="flex-1 py-3 text-sm font-bold text-white bg-error hover:bg-on-error-container rounded-full transition-colors shadow-level-2"
              >
                Eliminar
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
