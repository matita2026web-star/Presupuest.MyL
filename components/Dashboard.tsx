import React from 'react';
import { 
  FileText, Package, CheckCircle, TrendingUp, 
  ArrowUpRight, Users, Calendar, Plus, HardHat, Hammer,
  XCircle, CheckSquare, Clock, ArrowDownRight, Target, 
  BarChart3, Briefcase, Calculator, Layers, Zap
} from 'lucide-react';
import { Product, Budget, BusinessSettings, BudgetStatus, UnitType } from '../types';

interface DashboardProps {
  products: Product[];
  budgets: Budget[];
  settings: BusinessSettings;
  onNavigate: (tab: any) => void;
  onUpdateStatus: (id: string, status: BudgetStatus) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ products, budgets, settings, onNavigate, onUpdateStatus }) => {
  // --- LÓGICA ORIGINAL ---
  const totalRevenue = budgets.filter(b => b.status === 'aceptado').reduce((acc, curr) => acc + curr.total, 0);
  const pendingBudgets = budgets.filter(b => b.status === 'pendiente');
  const recentBudgets = budgets.slice(0, 4);
  
  // --- NUEVA LÓGICA DE ANÁLISIS ---
  const rejectedTotal = budgets.filter(b => b.status === 'rechazado').reduce((acc, curr) => acc + curr.total, 0);
  const conversionRate = budgets.length > 0 
    ? (budgets.filter(b => b.status === 'aceptado').length / budgets.length) * 100 
    : 0;

  // Cálculo de valor promedio por presupuesto
  const averageTicket = budgets.length > 0 ? totalRevenue / budgets.length : 0;

  // Clasificación de insumos para el mini-reporte
  const laborCount = products.filter(p => p.category.toLowerCase().includes('mano') || p.category.toLowerCase().includes('obra')).length;
  const materialsCount = products.length - laborCount;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-16">
      
      {/* HEADER DINÁMICO (ORIGINAL + BRANDING) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-slate-50 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className="bg-slate-900 p-2 rounded-lg text-orange-500">
                <Briefcase size={20} />
             </div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Panel Administrativo v3.5</span>
          </div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
            {settings.name || 'CONSTRUCTORA'} <span className="text-orange-500">DASHBOARD</span>
          </h2>
          <p className="text-slate-500 text-lg mt-3 font-medium flex items-center gap-2">
            <Zap size={18} className="text-orange-400" />
            Control de rendimiento operativo y flujo de caja.
          </p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => onNavigate('products')}
             className="hidden lg:flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-900 px-6 py-5 rounded-2xl font-black transition-all hover:border-slate-900 uppercase text-xs"
           >
             <Package size={20} />
             Stock
           </button>
           <button 
             onClick={() => onNavigate('generator')}
             className="flex items-center justify-center gap-3 bg-orange-600 hover:bg-orange-700 text-white px-10 py-5 rounded-2xl font-black transition-all shadow-2xl shadow-orange-600/30 uppercase active:scale-95 group"
           >
             <Plus size={24} className="group-hover:rotate-90 transition-transform" />
             Nuevo Presupuesto
           </button>
        </div>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS (ESTILO MEJORADO) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Facturación Obra" 
          value={`${settings.currency}${totalRevenue.toLocaleString()}`} 
          subtext="Capital en ejecución"
          icon={<CheckCircle size={28} className="text-white" />} 
          bgColor="bg-emerald-600"
          trend="+12.5%"
        />
        <StatCard 
          label="Pendientes Firma" 
          value={pendingBudgets.length.toString()} 
          subtext="En etapa comercial"
          icon={<Clock size={28} className="text-slate-900" />} 
          bgColor="bg-orange-500"
        />
        <StatCard 
          label="Total Cotizado" 
          value={budgets.length.toString()} 
          subtext="Volumen de ofertas"
          icon={<FileText size={28} className="text-orange-500" />} 
          bgColor="bg-slate-900"
          trend="Global"
        />
        <StatCard 
          label="Catálogo Técnico" 
          value={products.length.toString()} 
          subtext={`${laborCount} Mano Obra / ${materialsCount} Mat.`}
          icon={<Hammer size={28} className="text-slate-900" />} 
          bgColor="bg-slate-100"
        />
      </div>

      {/* NUEVA SECCIÓN: ANÁLISIS DE CONVERSIÓN Y RENDIMIENTO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white rounded-[2.5rem] border-4 border-slate-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Rendimiento Comercial</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Tasa de aceptación de presupuestos</p>
               </div>
               <div className="text-right">
                  <span className="text-4xl font-black text-orange-500 italic">{conversionRate.toFixed(1)}%</span>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conversion Rate</p>
               </div>
            </div>
            
            <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden mb-10">
               <div 
                 className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_20px_rgba(16,185,129,0.5)]" 
                 style={{ width: `${conversionRate}%` }}
               ></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               <MiniMetric label="Ticket Promedio" value={`${settings.currency}${Math.round(averageTicket).toLocaleString()}`} icon={<Calculator size={14}/>}/>
               <MiniMetric label="Tasa Rebote" value={`${(100 - conversionRate).toFixed(1)}%`} icon={<ArrowDownRight size={14}/>} color="text-red-500"/>
               <MiniMetric label="Insumos Obra" value={products.length} icon={<Layers size={14}/>}/>
               <MiniMetric label="Objetivo Mensual" value="85%" icon={<Target size={14}/>} color="text-blue-500"/>
            </div>
         </div>

         <div className="bg-orange-500 rounded-[2.5rem] p-8 text-white flex flex-col justify-between relative overflow-hidden group">
            <TrendingUp size={180} className="absolute -right-10 -bottom-10 text-white/10 group-hover:scale-110 transition-transform" />
            <div className="relative z-10">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-80">Proyección de Cierre</p>
               <h3 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Crecimiento <br/> trimestral</h3>
               <p className="mt-4 text-orange-100 font-bold text-sm leading-relaxed uppercase">
                 Has superado el volumen de cotizaciones del mes pasado en un <span className="text-white font-black underline">22%</span>.
               </p>
            </div>
            <button 
              onClick={() => onNavigate('history')}
              className="relative z-10 w-full bg-white text-orange-600 font-black py-4 rounded-2xl uppercase italic text-xs tracking-widest shadow-xl hover:bg-slate-900 hover:text-white transition-all mt-8"
            >
              Analizar Reportes
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CONTROL DE PROPUESTAS (ORIGINAL CON MEJORAS) */}
        <div className="bg-white p-8 rounded-[2.5rem] border-4 border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8 border-b-2 border-slate-50 pb-6">
            <div>
               <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Control de Propuestas</h3>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Aceptar o Rechazar Proyectos</p>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
               <span className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-orange-100">
                 {pendingBudgets.length} Pendientes
               </span>
            </div>
          </div>
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {pendingBudgets.length > 0 ? (
              pendingBudgets.map((b) => (
                <div key={b.id} className="p-6 rounded-[2rem] bg-slate-50 border-2 border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6 group hover:border-orange-300 hover:bg-white hover:shadow-xl transition-all">
                  <div className="flex items-center gap-5 w-full sm:w-auto">
                    <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center text-slate-900 font-black text-2xl shadow-sm group-hover:bg-slate-900 group-hover:text-orange-500 transition-all">
                      {b.client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 uppercase italic leading-tight text-lg">{b.client.name}</h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Cotización: <span className="text-orange-600 font-black">{settings.currency}{b.total.toLocaleString()}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button 
                      onClick={() => onUpdateStatus(b.id, 'rechazado')}
                      className="flex-1 sm:flex-none p-4 bg-white hover:bg-red-50 text-red-500 border-2 border-red-100 rounded-2xl transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase italic"
                    >
                      <XCircle size={18} />
                      Descartar
                    </button>
                    <button 
                      onClick={() => onUpdateStatus(b.id, 'aceptado')}
                      className="flex-1 sm:flex-none p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase italic shadow-xl shadow-emerald-200"
                    >
                      <CheckSquare size={18} />
                      Iniciar Obra
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-24 text-center text-slate-300 italic flex flex-col items-center gap-5 uppercase font-black tracking-[0.3em] text-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border-2 border-dashed border-slate-200">
                   <CheckSquare size={40} className="opacity-20" />
                </div>
                Bandeja de entrada limpia
              </div>
            )}
          </div>
        </div>

        {/* REGISTRO GENERAL (ESTILO DARK MEJORADO) */}
        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden border-t-8 border-orange-500">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <BarChart3 size={120} />
            </div>
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div>
                <h3 className="text-2xl font-black uppercase italic tracking-tight">Registro General</h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Últimas cotizaciones generadas</p>
              </div>
              <button onClick={() => onNavigate('history')} className="bg-slate-800 p-3 rounded-xl text-orange-500 hover:bg-orange-500 hover:text-white transition-all">
                 <ArrowUpRight size={20} />
              </button>
            </div>
            <div className="space-y-4 relative z-10">
              {recentBudgets.map((b) => (
                <div key={b.id} className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between group hover:bg-slate-800 transition-all">
                  <div className="flex items-center gap-4">
                     <div className={`w-3 h-12 rounded-full ${
                       b.status === 'aceptado' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 
                       b.status === 'rechazado' ? 'bg-red-500' : 
                       'bg-orange-500'
                     }`}></div>
                     <div>
                       <p className="text-base font-black uppercase italic tracking-tighter group-hover:text-orange-500 transition-colors">{b.client.name}</p>
                       <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                          <Calendar size={10} /> {new Date(b.date).toLocaleDateString()} • {b.status}
                       </p>
                     </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-white font-mono">{settings.currency}{b.total.toLocaleString()}</p>
                    <p className="text-[9px] text-slate-500 font-black uppercase">Final s/ Imp.</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-10 p-6 bg-slate-800/80 rounded-3xl border border-slate-700 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
                     <XCircle size={18} />
                  </div>
                  <span className="text-xs font-black uppercase text-slate-400">Total Rechazado</span>
               </div>
               <span className="text-sm font-black text-slate-300 font-mono">-{settings.currency}{rejectedTotal.toLocaleString()}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTES AUXILIARES ---

const StatCard = ({ label, value, subtext, icon, bgColor, trend }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm hover:border-orange-500/40 transition-all group overflow-hidden relative">
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-5 rounded-2xl ${bgColor} w-fit transition-transform group-hover:rotate-12 shadow-xl`}>
          {icon}
        </div>
        {trend && (
           <span className="text-[10px] font-black bg-slate-900 text-white px-3 py-1 rounded-full uppercase italic tracking-tighter">
             {trend}
           </span>
        )}
      </div>
      <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
      <h4 className="text-3xl font-black text-slate-950 tracking-tighter italic leading-none">{value}</h4>
      <p className="text-[11px] text-slate-400 font-bold mt-3 uppercase flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
        {subtext}
      </p>
    </div>
    <div className="absolute -top-10 -right-10 p-4 opacity-[0.03] pointer-events-none group-hover:scale-110 group-hover:opacity-[0.07] transition-all duration-700">
        <HardHat size={220} />
    </div>
  </div>
);

const MiniMetric = ({ label, value, icon, color = "text-slate-900" }: any) => (
  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
     <div className="flex items-center gap-2 mb-2 text-slate-400">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
     </div>
     <p className={`text-sm font-black uppercase italic ${color}`}>{value}</p>
  </div>
);

export default Dashboard;
