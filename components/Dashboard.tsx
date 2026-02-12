
import React from 'react';
import { 
  FileText, Hammer, Clock, Plus, 
  TrendingUp, Activity, HardHat, Package, CheckCircle2, ChevronRight, ArrowUpRight,
  Compass
} from 'lucide-react';
import { Product, Budget, BusinessSettings, BudgetStatus } from '../types';

interface DashboardProps {
  products: Product[];
  budgets: Budget[];
  settings: BusinessSettings;
  onNavigate: (tab: any) => void;
  onUpdateStatus: (id: string, status: BudgetStatus) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ products, budgets, settings, onNavigate, onUpdateStatus }) => {
  const totalRevenue = budgets.filter(b => b.status === 'aceptado').reduce((acc, curr) => acc + curr.total, 0);
  const pendingBudgets = budgets.filter(b => b.status === 'pendiente');
  const recentBudgets = budgets.slice(0, 3);

  return (
    <div className="space-y-12 animate-scale">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tighter leading-none mb-4">
            Hola, {settings.ownerName.split(' ')[0]}
          </h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Resumen Técnico de Actividad</p>
        </div>
        <button 
          onClick={() => onNavigate('generator')}
          className="btn-elite bg-orange-500 text-white px-10 py-5 rounded-2xl font-bold uppercase tracking-tight flex items-center gap-3 hover:bg-orange-600 transition-all text-sm"
        >
          <Plus size={20} />
          Nuevo Proyecto
        </button>
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Aprobado" value={`${settings.currency}${totalRevenue.toLocaleString()}`} icon={<ArrowUpRight size={20}/>} trend="+12%" color="bg-emerald-50 text-emerald-600" />
        <StatCard label="Pendientes" value={pendingBudgets.length} icon={<Clock size={20}/>} trend="Atención" color="bg-orange-50 text-orange-600" />
        <StatCard label="Proyectos" value={budgets.length} icon={<FileText size={20}/>} trend="Historial" color="bg-slate-50 text-slate-600" />
        <StatCard label="Catálogo" value={products.length} icon={<Package size={20}/>} trend="Insumos" color="bg-slate-50 text-slate-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-4">
        {/* Recientes */}
        <section className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
             <h3 className="font-extrabold text-xl tracking-tight">Últimos Expedientes</h3>
             <button onClick={() => onNavigate('history')} className="text-orange-500 text-xs font-bold uppercase tracking-widest hover:underline">Ver todo</button>
           </div>
           
           <div className="space-y-4">
             {recentBudgets.map((b) => (
               <div key={b.id} className="bg-white p-6 rounded-3xl border border-slate-50 soft-shadow flex items-center justify-between hover:scale-[1.01] transition-transform">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center font-extrabold text-lg text-slate-900">
                      {b.client.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm uppercase leading-none mb-2">{b.client.name}</h4>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{b.id}</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          b.status === 'aceptado' ? 'bg-emerald-100 text-emerald-600' : 
                          b.status === 'rechazado' ? 'bg-rose-100 text-rose-600' : 'bg-orange-100 text-orange-600'
                        }`}>{b.status}</span>
                      </div>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-lg font-extrabold font-mono tracking-tighter">{settings.currency}{b.total.toLocaleString()}</p>
                 </div>
               </div>
             ))}
             {recentBudgets.length === 0 && (
               <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Sin actividad reciente</p>
               </div>
             )}
           </div>
        </section>

        {/* Sidebar Cards */}
        <div className="space-y-6">
           <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <Compass size={140} className="absolute -top-10 -right-10 opacity-5 group-hover:rotate-45 transition-transform duration-700" />
              <h4 className="text-orange-500 font-extrabold uppercase tracking-widest text-[10px] mb-6">Guía Técnica</h4>
              <p className="text-sm font-medium leading-relaxed text-slate-400">
                Asegúrese de validar los precios de mano de obra según la inflación actual para no perder margen de ganancia en el cierre.
              </p>
           </div>
           
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 soft-shadow">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-6">Accesos Rápidos</h4>
              <div className="space-y-3">
                 <button onClick={() => onNavigate('products')} className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors group">
                   <span className="text-xs font-bold uppercase tracking-tight">Catalogo</span>
                   <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                 </button>
                 <button onClick={() => onNavigate('settings')} className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors group">
                   <span className="text-xs font-bold uppercase tracking-tight">Mi Empresa</span>
                   <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, trend, color }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 soft-shadow flex flex-col justify-between h-44 group hover:border-orange-200 transition-all">
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-2xl ${color}`}>{icon}</div>
      <span className="text-[10px] font-extrabold text-slate-300 uppercase">{trend}</span>
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">{label}</p>
      <h4 className="text-2xl font-extrabold font-mono tracking-tighter truncate leading-none">{value}</h4>
    </div>
  </div>
);

export default Dashboard;
