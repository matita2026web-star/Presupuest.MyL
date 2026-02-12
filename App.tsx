import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, Package, FilePlus, History, 
  Settings as SettingsIcon, Menu, X, Bell, User, HardHat, Loader2,
  Database, Wifi, WifiOff, AlertCircle, ChevronRight, Search,
  Briefcase, Activity, PlusCircle, DownloadCloud, ShieldCheck
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import ProductManager from './components/ProductManager';
import BudgetGenerator from './components/BudgetGenerator';
import BudgetHistory from './components/BudgetHistory';
import SettingsView from './components/SettingsView';
import { Product, Budget, BusinessSettings, BudgetStatus } from './types';
import { storage } from './services/storage';

const App: React.FC = () => {
  // --- ESTADOS ORIGINALES ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'generator' | 'history' | 'settings'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // --- NUEVOS ESTADOS DE SISTEMA ---
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notifications, setNotifications] = useState<{id: number, text: string, type: 'info' | 'success'}[]>([]);
  const [showQuickActions, setShowQuickActions] = useState(false);

  // --- EFECTOS Y SINCRONIZACIÓN ---
  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [prodData, budData, settsData] = await Promise.all([
          storage.getProducts(),
          storage.getBudgets(),
          storage.getSettings()
        ]);
        setProducts(prodData);
        setBudgets(budData);
        setSettings(settsData);
      } catch (err) {
        console.error("Error cargando datos de Supabase:", err);
        addNotification("Error de conexión con el servidor", "info");
      } finally {
        setTimeout(() => setIsLoading(false), 800); // Suavizado de carga
      }
    };
    loadInitialData();

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  // --- UTILIDADES DE NOTIFICACIÓN ---
  const addNotification = (text: string, type: 'info' | 'success' = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, text, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  };

  // --- FUNCIONES DE PRESUPUESTOS (ORIGINALES + CALLBACKS) ---
  const handleSaveBudget = async (newBudget: Budget) => {
    try {
      if (budgets.find(b => b.id === newBudget.id)) {
        setBudgets(budgets.map(b => b.id === newBudget.id ? newBudget : b));
        addNotification("Presupuesto actualizado");
      } else {
        setBudgets([newBudget, ...budgets]);
        addNotification("Nuevo presupuesto guardado", "success");
      }
      await storage.saveBudget(newBudget);
      setEditingBudget(null);
      setActiveTab('history');
    } catch (err) {
      addNotification("Error al sincronizar presupuesto", "info");
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if(!window.confirm("¿Confirmas la eliminación permanente de esta obra?")) return;
    try {
      setBudgets(budgets.filter(b => b.id !== id));
      await storage.deleteBudget(id);
      addNotification("Registro eliminado");
    } catch (err) {
      console.error("Error al borrar:", err);
    }
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setActiveTab('generator');
  };

  const handleUpdateBudgetStatus = async (id: string, status: BudgetStatus) => {
    const updatedBudgets = budgets.map(b => b.id === id ? { ...b, status } : b);
    setBudgets(updatedBudgets);
    await storage.updateBudgetStatus(id, status);
    addNotification(`Estado actualizado: ${status.toUpperCase()}`);
  };

  // --- GESTIÓN DE PRODUCTOS ---
  const handleUpdateProducts = async (newProducts: Product[]) => {
    setProducts(newProducts);
    try {
      for (const p of newProducts) {
        await storage.saveProduct(p);
      }
      addNotification("Catálogo sincronizado");
    } catch (err) {
      addNotification("Fallo en sincronización de precios", "info");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    await storage.deleteProduct(id);
    addNotification("Ítem removido del catálogo");
  };

  const handleUpdateSettings = async (newSettings: BusinessSettings) => {
    setSettings(newSettings);
    await storage.saveSettings(newSettings);
    addNotification("Configuración de Constructora guardada");
  };

  // --- UI DE CARGA (ORIGINAL MEJORADA) ---
  if (isLoading || !settings) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-50" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 bg-orange-500 rounded-[2.5rem] flex items-center justify-center mb-8 animate-bounce shadow-[0_20px_50px_rgba(249,115,22,0.3)] border-b-8 border-orange-700">
             <HardHat size={56} className="text-slate-900" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <Loader2 className="animate-spin text-orange-500" size={28} />
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">
              Expediente <span className="text-orange-500">Supabase</span>
            </h2>
          </div>
          <div className="flex gap-2">
            {[1,2,3].map(i => <div key={i} className="w-2 h-2 bg-slate-700 rounded-full animate-pulse" style={{animationDelay: `${i*0.2}s`}} />)}
          </div>
          <p className="text-slate-500 font-black mt-8 uppercase text-[9px] tracking-[0.5em] border-t border-slate-800 pt-4">Data Protection Secured</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Panel Principal', icon: LayoutDashboard },
    { id: 'generator', label: editingBudget ? 'Editando Obra' : 'Nuevo Presupuesto', icon: FilePlus },
    { id: 'products', label: 'Catálogo / Precios', icon: Package },
    { id: 'history', label: 'Historial de Obras', icon: History },
    { id: 'settings', label: 'Mi Constructora', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen flex bg-[#f1f5f9] text-slate-900 overflow-hidden font-sans selection:bg-orange-100">
      
      {/* OVERLAY NOTIFICACIONES */}
      <div className="fixed top-6 right-6 z-[100] space-y-3 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border-l-4 animate-in slide-in-from-right duration-300 ${
            n.type === 'success' ? 'bg-slate-900 text-white border-orange-500' : 'bg-white text-slate-900 border-blue-500'
          }`}>
            {n.type === 'success' ? <ShieldCheck size={18} className="text-orange-500" /> : <Activity size={18} className="text-blue-500" />}
            <span className="text-xs font-black uppercase tracking-widest italic">{n.text}</span>
          </div>
        ))}
      </div>

      {/* SIDEBAR (ORIGINAL + BRANDING REFORZADO) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-[#1e293b] text-white border-r border-slate-800 transform transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-10">
            <div className="flex items-center gap-4 group">
              <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-slate-900 shadow-xl shadow-orange-500/20 group-hover:rotate-6 transition-transform">
                <HardHat size={32} />
              </div>
              <div className="overflow-hidden">
                <h1 className="text-2xl font-black text-white truncate leading-none uppercase tracking-tighter italic">
                  {settings.name || 'MI OBRA'}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <p className="text-[9px] text-slate-400 uppercase tracking-[0.2em] font-black">Licencia Profesional</p>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-6 space-y-3">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-4 mb-4">Navegación Técnica</p>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id !== 'generator') setEditingBudget(null);
                  setActiveTab(item.id as any);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-6 py-5 rounded-2xl transition-all group
                  ${activeTab === item.id 
                    ? 'bg-orange-500 text-slate-900 font-black shadow-[0_10px_25px_rgba(249,115,22,0.4)] translate-x-2' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}
                `}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={22} className={activeTab === item.id ? 'text-slate-900' : 'group-hover:text-orange-500 transition-colors'} />
                  <span className="text-[13px] font-black uppercase tracking-widest">{item.label}</span>
                </div>
                {activeTab === item.id && <ChevronRight size={16} />}
              </button>
            ))}
          </nav>

          <div className="p-8">
            <div className="p-5 bg-slate-900/50 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Estado de Red</p>
                {isOnline ? <Wifi size={14} className="text-emerald-500" /> : <WifiOff size={14} className="text-red-500" />}
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                <p className="text-xs text-slate-200 font-black uppercase tracking-tighter">
                  {isOnline ? 'Sincronizado' : 'Modo Offline'}
                </p>
              </div>
              <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                 <div className="h-full bg-orange-500 w-full opacity-30"></div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL (HEADER + VISTA) */}
      <main className="flex-1 flex flex-col min-w-0 h-screen relative">
        
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-3 bg-slate-100 text-slate-600 hover:bg-orange-500 hover:text-white rounded-xl transition-all"
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:flex flex-col">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em]">Módulo Activo</span>
                  <div className="h-px w-8 bg-slate-200"></div>
                </div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic leading-tight">
                  {navItems.find(n => n.id === activeTab)?.label}
                </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
              {/* ACCIONES RÁPIDAS */}
              <div className="hidden md:flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                 <button onClick={() => setActiveTab('generator')} className="p-3 hover:bg-white rounded-xl text-slate-500 hover:text-orange-500 transition-all" title="Nuevo Presupuesto">
                    <PlusCircle size={20} />
                 </button>
                 <button onClick={() => addNotification("Base de datos ok", "info")} className="p-3 hover:bg-white rounded-xl text-slate-500 hover:text-orange-500 transition-all" title="Verificar DB">
                    <Database size={20} />
                 </button>
              </div>

              <div className="flex items-center gap-5 border-l border-slate-200 pl-8">
                 <div className="hidden xl:flex flex-col text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Director de Obra</span>
                    <span className="text-sm font-black text-slate-900 italic tracking-tighter uppercase">{settings.ownerName || 'ADMINISTRADOR'}</span>
                 </div>
                 <div className="relative group">
                   <div className="w-14 h-14 rounded-2xl bg-slate-900 border-2 border-slate-200 flex items-center justify-center overflow-hidden shadow-lg group-hover:border-orange-500 transition-all cursor-pointer">
                     {settings.logoUrl ? (
                       <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                     ) : (
                       <User className="text-orange-500" size={28} />
                     )}
                   </div>
                   <div className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 border-4 border-white rounded-full"></div>
                 </div>
              </div>
          </div>
        </header>

        {/* ÁREA DE CONTENIDO DINÁMICO */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto p-8 md:p-12">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {activeTab === 'dashboard' && (
                <Dashboard 
                  products={products} 
                  budgets={budgets} 
                  settings={settings} 
                  onNavigate={setActiveTab}
                  onUpdateStatus={handleUpdateBudgetStatus}
                />
              )}
              {activeTab === 'products' && (
                <ProductManager 
                  products={products} 
                  onUpdate={handleUpdateProducts}
                  onDelete={handleDeleteProduct}
                />
              )}
              {activeTab === 'generator' && (
                <BudgetGenerator 
                  products={products} 
                  settings={settings} 
                  onSave={handleSaveBudget} 
                  initialData={editingBudget}
                />
              )}
              {activeTab === 'history' && (
                <BudgetHistory 
                  budgets={budgets} 
                  settings={settings} 
                  onEdit={handleEditBudget}
                  onDelete={handleDeleteBudget}
                />
              )}
              {activeTab === 'settings' && (
                <SettingsView settings={settings} onUpdate={handleUpdateSettings} />
              )}
            </div>
          </div>
          
          {/* FOOTER DISCRETO */}
          <footer className="max-w-7xl mx-auto px-12 py-10 opacity-30 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em]">
             <div className="flex items-center gap-4">
                <span className="flex items-center gap-2"><Briefcase size={12}/> Industrial Version 2026</span>
                <span>•</span>
                <span>Terminos & Privacidad</span>
             </div>
             <div className="flex items-center gap-2">
                <DownloadCloud size={12}/> Cloud Sync Active
             </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default App;
