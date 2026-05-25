'use client';
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Check, Settings, CreditCard } from 'lucide-react';

export default function ConfiguracionPage() {
  const [diaCierre, setDiaCierre] = useState('22');
  const [guardado, setGuardado] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(d => {
        if (d.dia_cierre_tarjeta) setDiaCierre(d.dia_cierre_tarjeta);
        setLoading(false);
      });
  }, []);

  const guardar = async () => {
    await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dia_cierre_tarjeta: diaCierre }),
    });
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  };

  const dia = parseInt(diaCierre) || 22;
  const ejemploAntes = dia - 3 > 0 ? dia - 3 : 1;
  const ejemploDespues = dia + 3 <= 31 ? dia + 3 : 31;

  return (
    <Layout>
      <div className="max-w-xl mx-auto flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary-container rounded-2xl text-white shadow-level-2">
            <Settings size={24} />
          </div>
          <h1 className="text-3xl font-extrabold text-on-background tracking-tight">Configuración</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-secondary font-medium">Cargando configuración...</div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="bg-surface-container-lowest border border-surface-variant rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-secondary-container text-secondary rounded-lg">
                  <CreditCard size={20} />
                </div>
                <h2 className="text-xl font-bold text-on-background">Tarjeta de Crédito</h2>
              </div>
              
              <p className="text-on-surface-variant font-medium mb-8 leading-relaxed">
                El día de cierre determina cuándo impactan tus compras con crédito en el balance mensual.
              </p>

              <div className="flex flex-col gap-2 mb-8">
                <label className="text-xs font-bold text-secondary uppercase tracking-widest px-1">Día de cierre</label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={diaCierre}
                    onChange={e => setDiaCierre(e.target.value)}
                    className="w-24 px-4 py-3 rounded-2xl border border-outline-variant bg-surface-container-low outline-none focus:border-primary transition-colors text-center text-xl font-extrabold text-on-background"
                  />
                  <span className="text-on-surface-variant font-bold">de cada mes</span>
                </div>
              </div>

              <div className="bg-surface-container rounded-2xl p-5 mb-8 border border-outline-variant/30">
                <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-4">Ejemplo con día {dia}</h3>
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
                    <p className="text-sm font-medium text-on-surface-variant">
                      Comprás el <strong className="text-on-background">día {ejemploAntes}</strong> → entra en el resumen de este mes → <strong className="text-primary">impacta el 1 del mes siguiente</strong>
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-outline shrink-0" />
                    <p className="text-sm font-medium text-on-surface-variant">
                      Comprás el <strong className="text-on-background">día {ejemploDespues}</strong> → entra en el resumen del mes siguiente → <strong className="text-secondary">impacta el 1 del mes subsiguiente</strong>
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={guardar}
                className={`w-full md:w-auto px-8 py-4 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-level-2 active:scale-95 ${
                  guardado 
                    ? 'bg-primary-container text-white' 
                    : 'bg-on-background hover:bg-inverse-surface text-white'
                }`}
              >
                {guardado ? (
                  <>
                    <Check size={18} />
                    ¡Guardado!
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
