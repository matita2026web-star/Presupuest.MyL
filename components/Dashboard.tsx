
import React from 'react';
import { 
  FileText, Package, CheckCircle, TrendingUp, 
  ArrowUpRight, Users, Calendar, Plus, HardHat, Hammer,
  XCircle, CheckSquare, Clock
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
  const recentBudgets = budgets.slice(0, 4);
  
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
  const data = [65, 45, 75, 55, 85, 95];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
            {settings.name || 'CONSTRUCTORA'} <span className="text-orange-500">DASHBOARD</span>
          </h2>
          <p className="text-slate-500 text-lg mt-2 font-medium">Gestión de proyectos y estados de obra.</p>
        </div>
        <button 
          onClick={() => onNavigate('generator')}
          className="flex items-center justify-center gap-3 bg-orange-600 hover:bg-orange-700 text-white px-8 py-5 rounded-xl font-black transition-all shadow-xl shadow-orange-600/20 uppercase active:scale-95"
        >
          <Plus size={24} />
          Nuevo Presupuesto
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Obras Aceptadas" 
          value={`${settings.currency}${totalRevenue.toLocaleString()}`} 
          subtext="Facturación confirmada"
          icon={<CheckCircle size={28} className="text-white" />} 
          bgColor="bg-emerald-600"
        />
        <StatCard 
          label="Pendientes de Firma" 
          value={pendingBudgets.length.toString()} 
          subtext="En negociación"
          icon={<Clock size={28} className="text-slate-900" />} 
          bgColor="bg-orange-500"
        />
        <StatCard 
          label="Total Cotizado" 
          value={budgets.length.toString()} 
          subtext="Historial de ofertas"
          icon={<FileText size={28} className="text-orange-500" />} 
          bgColor="bg-slate-900"
        />
        <StatCard 
          label="Materiales / Mano de Obra" 
          value={products.length.toString()} 
          subtext="Ítems en catálogo"
          icon={<Hammer size={28} className="text-slate-900" />} 
          bgColor="bg-slate-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border-4 border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8 border-b-2 border-slate-50 pb-4">
            <div>
               <h3 className="text-xl font-black text-slate-900 uppercase italic">Control de Propuestas</h3>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Aceptar o Rechazar Proyectos</p>
            </div>
            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">
              {pendingBudgets.length} Pendientes
            </span>
          </div>
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {pendingBudgets.length > 0 ? (
              pendingBudgets.map((b) => (
                <div key={b.id} className="p-5 rounded-3xl bg-slate-50 border-2 border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 group hover:border-orange-200 transition-all">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center text-slate-900 font-black text-xl shadow-sm">
                      {b.client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 uppercase italic leading-tight truncate max-w-[150px] sm:max-w-none">{b.client.name}</h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Monto: <span className="text-slate-900 font-black">{settings.currency}{b.total.toLocaleString()}</span></p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => onUpdateStatus(b.id, 'rechazado')}
                      className="flex-1 sm:flex-none p-3 bg-white hover:bg-red-50 text-red-500 border-2 border-red-100 rounded-2xl transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase italic"
                    >
                      <XCircle size={16} />
                      Rechazar
                    </button>
                    <button 
                      onClick={() => onUpdateStatus(b.id, 'aceptado')}
                      className="flex-1 sm:flex-none p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase italic shadow-lg shadow-emerald-200"
                    >
                      <CheckSquare size={16} />
                      Aceptar Obra
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center text-slate-300 italic flex flex-col items-center gap-3 uppercase font-black tracking-widest text-sm">
                <CheckSquare size={48} className="opacity-20" />
                No hay propuestas pendientes
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#1e293b] text-white p-8 rounded-[2rem] shadow-xl">
           <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-black uppercase italic tracking-tight">Registro General</h3>
             <button onClick={() => onNavigate('history')} className="text-orange-500 text-xs font-black uppercase hover:underline">Ver Historial</button>
           </div>
           <div className="space-y-4">
             {recentBudgets.map((b) => (
               <div key={b.id} className="p-4 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className={`w-2 h-10 rounded-full ${b.status === 'aceptado' ? 'bg-emerald-500' : b.status === 'rechazado' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                    <div>
                      <p className="text-sm font-black uppercase italic">{b.client.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{b.status}</p>
                    </div>
                 </div>
                 <p className="text-sm font-black text-white">{settings.currency}{b.total.toLocaleString()}</p>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, subtext, icon, bgColor }: any) => (
  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-orange-500/30 transition-all group overflow-hidden relative">
    <div className="relative z-10">
      <div className={`p-4 rounded-xl ${bgColor} w-fit mb-6 transition-transform group-hover:rotate-6`}>
        {icon}
      </div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h4 className="text-3xl font-black text-slate-900 tracking-tighter italic">{value}</h4>
      <p className="text-[11px] text-slate-400 font-bold mt-2 uppercase">{subtext}</p>
    </div>
    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
       <HardHat size={120} />
    </div>
  </div>
);

export default Dashboard;
