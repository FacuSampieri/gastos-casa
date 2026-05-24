import { Suspense } from 'react';
import GastosClient from './GastosClient';

export default function GastosPage({
  searchParams,
}: {
  searchParams?: { nuevo?: string };
}) {
  const openNuevoFromUrl = searchParams?.nuevo === '1';

  return (
    <Suspense fallback={<div className="flex justify-center py-20 text-secondary font-medium">Cargando gastos...</div>}>
      <GastosClient openNuevoFromUrl={openNuevoFromUrl} />
    </Suspense>
  );
}