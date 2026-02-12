import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, FilePlus, History, 
  Settings as SettingsIcon, Menu, X, Bell, User, HardHat, Loader2
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import ProductManager from './components/ProductManager';
import BudgetGenerator from './components/BudgetGenerator';
import BudgetHistory from './components/BudgetHistory';
import SettingsView from './components/SettingsView';
import { Product, Budget, BusinessSettings, BudgetStatus } from './types';
import { storage } from './services/storage';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'generator' | 'history' | 'settings'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado para manejar la edición
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  useEffect(() => {
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
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // --- FUNCIONES DE PRESUPUESTOS ---

  const handleSaveBudget = async (newBudget: Budget) => {
    // Si estamos editando, reemplazamos, si no, agregamos
    if (budgets.find(b => b.id === newBudget.id)) {
      setBudgets(budgets.map(b => b.id === newBudget.id ? newBudget : b));
    } else {
      setBudgets([newBudget, ...budgets]);
    }
    
    await storage.saveBudget(newBudget);
    setEditingBudget(null);
    setActiveTab('history');
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      setBudgets(budgets.filter(b => b.id !== id));
      await storage.deleteBudget(id); // Asegúrate que storage tenga deleteBudget
    } catch (err) {
      console.error("Error al borrar:", err);
    }
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setActiveTab('generator'); // Saltamos al generador con los datos
  };

  const handleUpdateBudgetStatus = async (id: string, status: BudgetStatus) => {
    const updatedBudgets = budgets.map(b => b.id === id ? { ...b, status } : b);
    setBudgets(updatedBudgets);
    await storage.updateBudgetStatus(id, status);
  };

  // --- OTRAS FUNCIONES ---

  const handleUpdateProducts = async (newProducts: Product[]) => {
    setProducts(newProducts);
    for (const p of newProducts) {
      await storage.saveProduct(p);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    setProducts(products.filter(p => p.id !== id));
    await storage.deleteProduct(id);
  };

  const handleUpdateSettings = async (newSettings: BusinessSettings) => {
    setSettings(newSettings);
    await storage.saveSettings(newSettings);
  };

  if (isLoading || !settings) {
    return (
      <div className="min-h-screen bg-[#1e293b] flex flex-col items-center justify-center text-white p-6">
        <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center mb-6 animate-bounce shadow-2xl shadow-orange-500/20">
           <HardHat size={48} className="text-slate-900" />
        </div>
        <Loader2 className="animate-spin text-orange-500 mb-4" size={32} />
        <h2 className="text-2xl font-black uppercase italic tracking-tighter">Conectando con <span className="text-orange-500">Supabase</span></h2>
        <p className="text-slate-400 font-bold mt-2 uppercase text-[10px] tracking-[0.3em]">Cargando expedientes técnicos...</p>
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
    <div className="min-h-screen flex bg-[#f8fafc] text-slate-900 overflow-hidden font-sans">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#1e293b] text-white border-r border-slate-700 transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-slate-900 shadow-lg shadow-orange-500/20">
                <HardHat size={28} />
              </div>
              <div className="overflow-hidden">
                <h1 className="text-xl font-black text-white truncate leading-tight uppercase tracking-tighter">
                  {settings.name || 'MI OBRA'}
                </h1>
                <p className="text-[10px] text-orange-400 uppercase tracking-widest font-black">CONSTRUCTORA PRO</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id !== 'generator') setEditingBudget(null);
                  setActiveTab(item.id as any);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all group
                  ${activeTab === item.id 
                    ? 'bg-orange-500 text-slate-900 font-black shadow-lg shadow-orange-500/30 translate-x-1' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <item.icon size={22} className={activeTab === item.id ? 'text-slate-900' : 'group-hover:text-orange-500 transition-colors'} />
                <span className="text-[14px] uppercase tracking-wide">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-slate-700">
            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
              <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Status Base de Datos</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-xs text-slate-300 font-bold uppercase tracking-tighter">Sincronizado</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:flex flex-col">
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                  {navItems.find(n => n.id === activeTab)?.label}
                </h2>
                <div className="w-10 h-1 bg-orange-500 rounded-full mt-0.5"></div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Responsable</span>
                <span className="text-sm font-bold text-slate-900">{settings.ownerName || 'ADMIN'}</span>
             </div>
             <div className="w-12 h-12 rounded-2xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center overflow-hidden">
               {settings.logoUrl ? (
                 <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
               ) : (
                 <User className="text-slate-400" size={24} />
               )}
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
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
                initialData={editingBudget} // Necesitas que BudgetGenerator acepte initialData
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
            {activeTab === 'settings' && <SettingsView settings={settings} onUpdate={handleUpdateSettings} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
