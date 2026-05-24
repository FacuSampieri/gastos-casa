'use client';
import { useState, useEffect, useCallback } from 'react';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import { COLORES, ICONOS } from '@/lib/utils';
import type { Categoria } from '@/lib/types';

const defaultForm = { nombre: '', tipo: 'variable' as 'fijo' | 'variable', color: COLORES[0], icono: ICONOS[0] };

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [form, setForm] = useState(defaultForm);
  
  // Custom confirm state
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    try {
      const data = await fetch('/api/categorias').then(r => r.json());
      setCategorias(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const abrirNuevo = () => {
    setEditando(null);
    setForm(defaultForm);
    setModal(true);
  };

  const abrirEditar = (c: Categoria) => {
    setEditando(c);
    setForm({ nombre: c.nombre, tipo: c.tipo, color: c.color, icono: c.icono });
    setModal(true);
  };

  const guardar = async () => {
    if (!form.nombre.trim()) return;
    setLoading(true);
    if (editando) {
      await fetch(`/api/categorias/${editando.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    } else {
      await fetch('/api/categorias', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
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
    await fetch(`/api/categorias/${confirmId}`, { method: 'DELETE' });
    setConfirmId(null);
    void cargar();
  };

  const fijas = categorias.filter(c => c.tipo === 'fijo');
  const variables = categorias.filter(c => c.tipo === 'variable');

  return (
    <Layout>
      <div className="flex flex-col gap-8">
        {/* Page Header */}
        <header className="flex justify-between items-center w-full">
          <h2 className="text-3xl font-extrabold text-on-background tracking-tight">
            Categorías
          </h2>
          <button
            onClick={abrirNuevo}
            className="bg-on-background hover:bg-inverse-surface text-white px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all shadow-level-2 active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Nueva
          </button>
        </header>

        {loading ? (
          <div className="flex justify-center py-20 text-secondary font-medium">Cargando categorías...</div>
        ) : (
          <div className="flex flex-col gap-10">
            {/* Section: GASTOS FIJOS */}
            {fijas.length > 0 && (
              <section>
                <h3 className="text-xs font-bold text-outline uppercase tracking-wider mb-4">
                  GASTOS FIJOS
                </h3>
                <div className="flex flex-col gap-3">
                  {fijas.map(c => (
                    <CatItem key={c.id} c={c} onEdit={abrirEditar} onDelete={confirmarEliminar} />
                  ))}
                </div>
              </section>
            )}

            {/* Section: GASTOS VARIABLES */}
            {variables.length > 0 && (
              <section>
                <h3 className="text-xs font-bold text-outline uppercase tracking-wider mb-4">
                  GASTOS VARIABLES
                </h3>
                <div className="flex flex-col gap-3">
                  {variables.map(c => (
                    <CatItem key={c.id} c={c} onEdit={abrirEditar} onDelete={confirmarEliminar} />
                  ))}
                </div>
              </section>
            )}

            {categorias.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-secondary">
                <p>No hay categorías creadas aún.</p>
              </div>
            )}
          </div>
        )}

        {/* Form Modal */}
        <Modal 
          isOpen={modal} 
          onClose={() => setModal(false)} 
          title={editando ? 'Editar categoría' : 'Nueva categoría'}
        >
          <div className="flex flex-col gap-5">
            <div>
              <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-1.5 block">Nombre</label>
              <input
                type="text"
                value={form.nombre}
                onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                placeholder="Ej: Supermercado"
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary transition-colors font-semibold"
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-1.5 block">Tipo</label>
              <div className="flex bg-surface-container-low p-1 rounded-xl gap-1">
                <button
                  onClick={() => setForm(f => ({ ...f, tipo: 'fijo' }))}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${form.tipo === 'fijo' ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:text-on-surface'}`}
                >
                  Fijo
                </button>
                <button
                  onClick={() => setForm(f => ({ ...f, tipo: 'variable' }))}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${form.tipo === 'variable' ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:text-on-surface'}`}
                >
                  Variable
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-2 block">Ícono</label>
              <div className="flex flex-wrap gap-2">
                {ICONOS.map(i => (
                  <button
                    key={i}
                    onClick={() => setForm(f => ({ ...f, icono: i }))}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all border ${form.icono === i ? 'border-primary bg-primary-fixed-dim text-2xl' : 'border-outline-variant bg-surface-container-low hover:bg-surface-container-high text-xl'}`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-2 block">Color</label>
              <div className="flex flex-wrap gap-3">
                {COLORES.map(c => (
                  <button
                    key={c}
                    onClick={() => setForm(f => ({ ...f, color: c }))}
                    className={`w-8 h-8 rounded-full transition-all ${form.color === c ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
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
          title="¿Eliminar categoría?"
        >
          <div className="flex flex-col gap-4">
            <p className="text-on-surface-variant font-medium">
              Esta acción eliminará la categoría y todos los gastos asociados a ella. Esta acción no se puede deshacer.
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

function CatItem({ c, onEdit, onDelete }: { c: Categoria; onEdit: (c: Categoria) => void; onDelete: (id: number) => void }) {
  const isFijo = c.tipo === 'fijo';
  return (
    <div className={`${isFijo ? 'bg-[#fff0e9]' : 'bg-surface-container-lowest'} border border-outline-variant/50 rounded-xl p-4 flex items-center justify-between hover:border-primary-container/30 transition-colors shadow-sm`}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-2xl shadow-inner border border-surface-container-high">
          {c.icono}
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold text-on-surface">{c.nombre}</span>
          <span className={`text-[10px] font-extrabold tracking-wide uppercase ${isFijo ? 'text-primary-container' : 'text-outline'}`}>
            {c.tipo}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 text-secondary">
        <button
          onClick={() => onEdit(c)}
          className="p-2 hover:bg-surface-variant rounded-full transition-colors active:scale-90"
        >
          <span className="material-symbols-outlined text-[20px]">edit</span>
        </button>
        <button
          onClick={() => onDelete(c.id)}
          className="p-2 hover:bg-error-container hover:text-error rounded-full transition-colors active:scale-90"
        >
          <span className="material-symbols-outlined text-[20px]">delete</span>
        </button>
      </div>
    </div>
  );
}
