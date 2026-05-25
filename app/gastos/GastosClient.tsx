'use client';
import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import { formatMoney, mesNombre, getMesActual, periodoAnterior, periodoSiguiente } from '@/lib/utils';
import type { Gasto, Categoria, MedioPago } from '@/lib/types';
import { CreditCard, Banknote, Wallet, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, CalendarDays, ReceiptText } from 'lucide-react';

const MEDIOS: { value: MedioPago; label: string; icon: React.ReactNode }[] = [
  { value: 'efectivo', label: 'Efectivo', icon: <Banknote size={18} /> },
  { value: 'debito',   label: 'Débito',   icon: <Wallet size={18} /> },
  { value: 'credito',  label: 'Crédito',  icon: <CreditCard size={18} /> },
];

const CUOTAS_OPCIONES = ['1', '2', '3', '6', '9', '12', '18', '24'];

export default function GastosClient({ openNuevoFromUrl }: { openNuevoFromUrl: boolean }) {
  const [periodo, setPeriodo] = useState(getMesActual());
  const [vista, setVista] = useState<'ocurrencia' | 'impacto'>('impacto');
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [filtro, setFiltro] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(openNuevoFromUrl);
  const [editando, setEditando] = useState<Gasto | null>(null);
  const [form, setForm] = useState({
    categoria_id: '',
    descripcion: '',
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    medio_pago: 'efectivo' as MedioPago,
    cuotas: '1'
  });
  const [confirmGasto, setConfirmGasto] = useState<Gasto | null>(null);

  const cargar = useCallback(async () => {
    try {
      const [g, c] = await Promise.all([
        fetch(`/api/gastos?mes=${periodo.mes}&anio=${periodo.anio}&vista=${vista}`).then(r => r.json()),
        fetch('/api/categorias').then(r => r.json()),
      ]);
      setGastos(Array.isArray(g) ? g : []);
      setCategorias(Array.isArray(c) ? c : []);
    } finally {
      setLoading(false);
    }
  }, [periodo, vista]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const abrirNuevo = () => {
    setEditando(null);
    setForm({
      categoria_id: categorias[0]?.id?.toString() || '',
      descripcion: '',
      monto: '',
      fecha: new Date().toISOString().split('T')[0],
      medio_pago: 'efectivo',
      cuotas: '1'
    });
    setModal(true);
  };

  const abrirEditar = (g: Gasto) => {
    setEditando(g);
    setForm({
      categoria_id: g.categoria_id.toString(),
      descripcion: g.descripcion,
      monto: g.monto.toString(),
      fecha: g.fecha.toString().split('T')[0],
      medio_pago: g.medio_pago || 'efectivo',
      cuotas: g.cuota_total?.toString() || '1'
    });
    setModal(true);
  };

  const guardar = async () => {
    const categoriaId = form.categoria_id || categorias[0]?.id?.toString();
    if (!form.monto || !categoriaId) return;

    setLoading(true);
    const d = new Date(form.fecha + 'T12:00:00');
    const payload = {
      categoria_id: parseInt(categoriaId),
      descripcion: form.descripcion,
      monto: parseFloat(form.monto),
      fecha: form.fecha,
      mes: d.getMonth() + 1,
      anio: d.getFullYear(),
      medio_pago: form.medio_pago,
      cuotas: form.medio_pago === 'credito' ? parseInt(form.cuotas) || 1 : 1
    };

    if (editando) {
      await fetch(`/api/gastos/${editando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch('/api/gastos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    setModal(false);
    void cargar();
  };

  const confirmarEliminar = (g: Gasto) => {
    setConfirmGasto(g);
  };

  const ejecutarEliminar = async (todo = false) => {
    if (!confirmGasto) return;
    setLoading(true);
    await fetch(`/api/gastos/${confirmGasto.id}?todo=${todo}`, { method: 'DELETE' });
    setConfirmGasto(null);
    void cargar();
  };

  const gastosFiltrados = filtro ? gastos.filter(g => g.categoria_id === filtro) : gastos;
  const total = gastosFiltrados.reduce((a, g) => a + Number(g.monto), 0);

  const medioIcon = (medio: MedioPago) => {
    if (medio === 'credito') return '💳';
    if (medio === 'debito') return '🏦';
    return '💵';
  };

  const medioColor = (medio: MedioPago) => {
    if (medio === 'credito') return 'bg-tertiary-fixed text-on-tertiary-fixed-variant';
    if (medio === 'debito') return 'bg-secondary-container text-on-secondary-container';
    return 'bg-surface-container-high text-on-surface-variant';
  };

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Header con Navegación de Período */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setLoading(true);
                setPeriodo(periodoAnterior(periodo.mes, periodo.anio));
              }}
              className="p-2 rounded-full border border-outline hover:bg-surface-variant transition-colors flex items-center justify-center text-on-surface active:scale-95"
            >
              <ChevronLeft size={20} />
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
              <ChevronRight size={20} />
            </button>
          </div>
          <button
            onClick={abrirNuevo}
            className="w-full sm:w-auto bg-on-background hover:bg-inverse-surface text-white px-6 py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-level-2 active:scale-95"
          >
            <Plus size={20} />
            Agregar Gasto
          </button>
        </div>

        {/* Selector de Vista */}
        <div className="flex flex-col gap-2">
          <div className="bg-surface-container-low p-1 rounded-2xl flex border border-outline-variant/30">
            <button
              onClick={() => setVista('impacto')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
                vista === 'impacto'
                  ? 'bg-on-background text-white shadow-sm'
                  : 'text-secondary hover:bg-surface-container-high'
              }`}
            >
              <ReceiptText size={16} />
              Impacto en Bolsillo
            </button>
            <button
              onClick={() => setVista('ocurrencia')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${
                vista === 'ocurrencia'
                  ? 'bg-on-background text-white shadow-sm'
                  : 'text-secondary hover:bg-surface-container-high'
              }`}
            >
              <CalendarDays size={16} />
              Fecha de Compra
            </button>
          </div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-outline px-2">
            {vista === 'impacto' 
              ? `Gastos que pagás en ${mesNombre(periodo.mes)} (incluye cuotas)` 
              : `Gastos realizados en ${mesNombre(periodo.mes)} (el crédito impacta luego)`}
          </p>
        </div>

        {/* Filtros de Categoría */}
        {categorias.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
            <button
              onClick={() => setFiltro(null)}
              className={`px-5 py-2.5 rounded-full font-bold text-xs whitespace-nowrap transition-all border ${
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
                className={`px-5 py-2.5 rounded-full font-bold text-xs whitespace-nowrap transition-all border ${
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

        {/* Total */}
        <div className="flex justify-between items-end border-b-2 border-surface-variant pb-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-outline uppercase tracking-[0.2em]">
              TOTAL {filtro ? categorias.find(c => c.id === filtro)?.nombre : 'DEL MES'}
            </span>
            <span className="text-3xl font-black text-on-background tracking-tighter">
              {formatMoney(total)}
            </span>
          </div>
        </div>

        {/* Lista de Gastos */}
        {loading ? (
          <div className="flex justify-center py-20 text-secondary font-medium">Cargando gastos...</div>
        ) : (
          <div className="flex flex-col gap-3">
            {gastosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-outline bg-surface-container-lowest rounded-3xl border-2 border-dashed border-outline-variant/50">
                <ReceiptText size={40} className="mb-4 opacity-20" />
                <p className="font-bold">No hay gastos registrados</p>
              </div>
            ) : (
              gastosFiltrados.map(g => (
                <div
                  key={g.id}
                  className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-variant hover:border-primary-fixed-dim transition-all group flex justify-between items-center"
                >
                  <div className="flex items-center gap-4 min-width-0">
                    <div className="w-2.5 h-10 rounded-full shrink-0" style={{ backgroundColor: g.categoria_color || '#ccc' }}></div>
                    <div className="flex flex-col min-width-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-extrabold text-on-background">{g.categoria_nombre}</span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${medioColor(g.medio_pago)}`}>
                          {medioIcon(g.medio_pago)} {g.medio_pago}
                          {g.cuota_total && ` ${g.cuota_actual}/${g.cuota_total}`}
                        </span>
                      </div>
                      {g.descripcion && (
                        <span className="text-sm font-medium text-on-surface-variant line-clamp-1 truncate max-w-[180px] sm:max-w-xs">{g.descripcion}</span>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-outline">
                          {new Date(g.fecha.toString().split('T')[0] + 'T12:00:00').toLocaleDateString('es-AR', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                        {g.medio_pago === 'credito' && g.mes_impacto !== periodo.mes && (
                          <span className="text-[9px] font-black bg-primary-fixed text-on-primary-fixed-variant px-1.5 rounded uppercase">
                            Impacta {mesNombre(g.mes_impacto).slice(0,3)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-lg font-black text-on-background">{formatMoney(Number(g.monto))}</span>
                    <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => abrirEditar(g)}
                        className="p-1.5 text-secondary hover:text-primary hover:bg-surface-container-low rounded-full transition-all"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => confirmarEliminar(g)}
                        className="p-1.5 text-secondary hover:text-error hover:bg-error-container rounded-full transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Modal Nuevo/Editar */}
        <Modal isOpen={modal} onClose={() => setModal(false)} title={editando ? 'Editar gasto' : 'Nuevo gasto'}>
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-outline uppercase tracking-widest mb-1.5 block px-1">Categoría</label>
                <select
                  value={form.categoria_id || categorias[0]?.id?.toString() || ''}
                  onChange={e => setForm(f => ({ ...f, categoria_id: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-outline-variant bg-surface-container-low outline-none focus:border-primary transition-colors font-bold text-sm appearance-none"
                >
                  {categorias.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.icono} {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-outline uppercase tracking-widest mb-1.5 block px-1">Fecha</label>
                <input
                  type="date"
                  value={form.fecha}
                  onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-outline-variant bg-surface-container-low outline-none focus:border-primary transition-colors font-bold text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-outline uppercase tracking-widest mb-1.5 block px-1">Medio de Pago</label>
              <div className="bg-surface-container-low p-1 rounded-2xl flex border border-outline-variant/30">
                {MEDIOS.map(m => (
                  <button
                    key={m.value}
                    onClick={() => setForm(f => ({ ...f, medio_pago: m.value, cuotas: '1' }))}
                    className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl font-bold text-[10px] transition-all ${
                      form.medio_pago === m.value
                        ? 'bg-on-background text-white shadow-sm'
                        : 'text-secondary hover:bg-surface-container-high'
                    }`}
                  >
                    {m.icon}
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {form.medio_pago === 'credito' && !editando && (
              <div>
                <label className="text-[10px] font-black text-outline uppercase tracking-widest mb-2 block px-1">Plan de Cuotas</label>
                <div className="flex flex-wrap gap-2">
                  {CUOTAS_OPCIONES.map(n => (
                    <button
                      key={n}
                      onClick={() => setForm(f => ({ ...f, cuotas: n }))}
                      className={`px-4 py-2 rounded-xl font-black text-xs border transition-all ${
                        form.cuotas === n
                          ? 'bg-primary-container text-white border-primary-container'
                          : 'bg-surface-container-low text-secondary border-outline-variant hover:border-outline'
                      }`}
                    >
                      {n === '1' ? '1 cuota' : `${n}x`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] font-black text-outline uppercase tracking-widest mb-1.5 block px-1">Descripción</label>
              <input
                type="text"
                value={form.descripcion}
                onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                placeholder="Ej: Supermercado Coto"
                className="w-full px-4 py-3 rounded-2xl border border-outline-variant bg-surface-container-low outline-none focus:border-primary transition-colors font-bold text-sm"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-outline uppercase tracking-widest mb-1.5 block px-1">
                Monto Total
                {form.medio_pago === 'credito' && parseInt(form.cuotas) > 1 && (
                  <span className="text-primary normal-case tracking-normal ml-2">
                    → {formatMoney(parseFloat(form.monto || '0') / parseInt(form.cuotas))} / cuota
                  </span>
                )}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-outline">$</span>
                <input
                  type="number"
                  value={form.monto}
                  onChange={e => setForm(f => ({ ...f, monto: e.target.value }))}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-4 rounded-2xl border-2 border-outline-variant bg-surface-container-low outline-none focus:border-primary transition-colors font-black text-2xl"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={() => setModal(false)}
              className="flex-1 py-4 text-sm font-bold text-secondary bg-surface-container-high hover:bg-surface-dim rounded-full transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={guardar}
              className="flex-1 py-4 text-sm font-bold text-white bg-on-background hover:bg-inverse-surface rounded-full transition-all shadow-level-2 active:scale-95"
            >
              Guardar Gasto
            </button>
          </div>
        </Modal>

        {/* Modal Confirmar Eliminar */}
        <Modal isOpen={confirmGasto !== null} onClose={() => setConfirmGasto(null)} title="¿Eliminar gasto?">
          <div className="flex flex-col gap-4">
            <p className="text-on-surface-variant font-medium leading-relaxed">
              ¿Estás seguro de que deseas eliminar este registro?
              {confirmGasto?.cuota_total && confirmGasto.cuota_total > 1 && (
                <span className="block mt-2 bg-primary-container/10 p-3 rounded-xl text-primary text-xs font-bold">
                  ⚠️ Este gasto es parte de un plan de {confirmGasto.cuota_total} cuotas.
                </span>
              )}
            </p>
            <div className="flex flex-col gap-3 mt-4">
              {confirmGasto?.cuota_total && confirmGasto.cuota_total > 1 && (
                <button
                  onClick={() => ejecutarEliminar(true)}
                  className="w-full py-4 text-sm font-bold text-white bg-on-background hover:bg-inverse-surface rounded-full transition-all shadow-level-2 active:scale-95"
                >
                  Eliminar TODAS las cuotas
                </button>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmGasto(null)}
                  className="flex-1 py-4 text-sm font-bold text-secondary bg-surface-container-high hover:bg-surface-dim rounded-full transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => ejecutarEliminar(false)}
                  className={`flex-1 py-4 text-sm font-bold text-white rounded-full transition-all shadow-level-2 active:scale-95 ${
                    confirmGasto?.cuota_total && confirmGasto.cuota_total > 1 ? 'bg-secondary' : 'bg-error hover:bg-on-error-container'
                  }`}
                >
                  {confirmGasto?.cuota_total && confirmGasto.cuota_total > 1 ? 'Solo esta cuota' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
