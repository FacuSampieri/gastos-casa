'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const links = [
  { href: '/', label: 'Inicio', icon: 'dashboard' },
  { href: '/gastos', label: 'Gastos', icon: 'payments' },
  { href: '/categorias', label: 'Categorías', icon: 'category' },
  { href: '/comparativa', label: 'Comparativa', icon: 'query_stats' },
];

export default function Nav() {
  const path = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-secondary p-2 rounded-lg bg-surface-container-low shadow-level-2 border border-outline-variant active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined">{isOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav
        aria-label="Main Navigation"
        className={`bg-surface-container-low h-full w-64 fixed left-0 top-0 flex-col py-8 px-6 gap-8 z-40 md:flex border-r border-outline-variant transition-transform duration-300 ease-in-out ${
          isOpen ? 'flex translate-x-0' : 'hidden md:translate-x-0 -translate-x-full md:flex'
        }`}
      >
        {/* Brand Header */}
        <div className="mb-4">
          <h1 className="text-3xl font-extrabold text-primary">
            Gastos Casa
          </h1>
          <p className="text-xs font-medium text-secondary mt-1">
            Salud financiera para tu hogar
          </p>
        </div>
        {/* Navigation Links */}
        <div className="flex-1 flex flex-col gap-4">
          {links.map(({ href, label, icon }) => {
            const active = path === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-200 ease-in-out ${
                  active
                    ? 'text-primary font-bold border-r-4 border-primary bg-surface-container-high'
                    : 'text-secondary hover:text-primary hover:bg-surface-container-high'
                }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: active ? '"FILL" 1' : undefined }}
                >
                  {icon}
                </span>
                <span className="text-base font-semibold">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
