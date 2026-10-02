import React from 'react';
import { BeakerIcon, DocumentDuplicateIcon, CalculatorIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-black font-sans text-slate-100 selection:bg-red-500 selection:text-white">
      {/* Navbar */}
      <nav className="glass sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b border-red-500/20">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-600 shadow-lg shadow-red-500/30">
            <DocumentTextIcon className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Imprenta <span className="text-red-400">UAGRM</span></span>
        </div>
        <div className="hidden md:flex gap-6 text-sm font-medium text-red-100">
          <button className="hover:text-white transition-colors">Servicios</button>
          <button className="hover:text-white transition-colors">Proformas</button>
          <button className="hover:text-white transition-colors">Nosotros</button>
        </div>
        <button className="px-5 py-2 text-sm font-semibold text-red-900 transition-all bg-white rounded-full hover:bg-red-50 shadow-md hover:shadow-lg hover:-translate-y-0.5">
          Iniciar Sesión
        </button>
      </nav>

      {/* Hero */}
      <main className="relative flex flex-col items-center px-4 pt-24 pb-32 text-center sm:pt-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-red-600/20 blur-[120px]"></div>
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-orange-600/10 blur-[100px]"></div>
        </div>

        <h1 className="relative z-10 max-w-4xl text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-red-200 sm:text-7xl">
          Sistema de Gestión y <br/> Predicción de Insumos
        </h1>
        <p className="relative z-10 max-w-2xl mt-6 text-lg text-red-200/80 sm:text-xl">
          Optimiza la producción de la Imprenta Universitaria con inteligencia artificial. Administra órdenes, presupuestos y predice la demanda de materiales con precisión.
        </p>

        <div className="relative z-10 flex gap-4 mt-10">
          <button className="px-8 py-3.5 text-base font-semibold text-white transition-all bg-red-600 rounded-full shadow-lg shadow-red-600/40 hover:bg-red-500 hover:-translate-y-0.5">
            Crear Proforma
          </button>
          <button className="px-8 py-3.5 text-base font-semibold text-white transition-all border border-red-500/50 rounded-full hover:bg-red-800/50 hover:border-red-400">
            Revisar Inventario
          </button>
        </div>
      </main>

      {/* Módulos */}
      <section className="px-8 py-20 bg-black/20 border-t border-red-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-center text-white">Módulos Principales</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            
            <div className="p-8 transition-transform border rounded-2xl bg-gradient-to-b from-red-900/40 to-transparent border-red-800/50 hover:-translate-y-1 hover:border-red-500/50">
              <div className="flex items-center justify-center w-12 h-12 mb-6 rounded-xl bg-red-500/20 text-red-400">
                <CalculatorIcon className="w-6 h-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-white">Proformas Rápidas</h3>
              <p className="text-red-200/70 text-sm leading-relaxed">
                Genera cotizaciones precisas y detalladas para libros, revistas o afiches de forma automatizada y centralizada.
              </p>
            </div>

            <div className="p-8 transition-transform border rounded-2xl bg-gradient-to-b from-red-900/40 to-transparent border-red-800/50 hover:-translate-y-1 hover:border-red-500/50">
              <div className="flex items-center justify-center w-12 h-12 mb-6 rounded-xl bg-orange-500/20 text-orange-400">
                <DocumentDuplicateIcon className="w-6 h-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-white">Órdenes de Trabajo</h3>
              <p className="text-red-200/70 text-sm leading-relaxed">
                Haz un seguimiento del ciclo de vida completo de cada proyecto de impresión, desde la aprobación hasta la entrega final.
              </p>
            </div>

            <div className="p-8 transition-transform border rounded-2xl bg-gradient-to-b from-red-900/40 to-transparent border-red-800/50 hover:-translate-y-1 hover:border-red-500/50">
              <div className="flex items-center justify-center w-12 h-12 mb-6 rounded-xl bg-rose-500/20 text-rose-400">
                <BeakerIcon className="w-6 h-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-white">Predicciones (AI)</h3>
              <p className="text-red-200/70 text-sm leading-relaxed">
                Anticípate al desabastecimiento de papel y tinta mediante modelos predictivos basados en Machine Learning.
              </p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

export default App;