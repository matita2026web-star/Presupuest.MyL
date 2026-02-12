
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, FilePlus, History, 
  Settings as SettingsIcon, User, HardHat, Compass
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
  const [settings, setSettings] = useState<BusinessSettings>(storage.getSettings());
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  useEffect(() => {
    setProducts(storage.getProducts());
    setBudgets(storage.getBudgets());
  }, []);

  const handleUpdateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    storage.saveProducts(newProducts);
  };

  const handleSaveBudget = (newBudget: Budget) => {
    let updatedBudgets;
    const exists = budgets.findIndex(b => b.id === newBudget.id);
    if (exists !== -1) {
      updatedBudgets = [...budgets];
      updatedBudgets[exists] = newBudget;
    } else {
      updatedBudgets = [newBudget, ...budgets];
    }
    setBudgets(updatedBudgets);
    storage.saveBudgets(updatedBudgets);
    setEditingBudget(null);
    setActiveTab('history');
  };

  const handleUpdateBudgetStatus = (id: string, status: BudgetStatus) => {
    const updatedBudgets = budgets.map(b => b.id === id ? { ...b, status } : b);
    setBudgets(updatedBudgets);
    storage.saveBudgets(updatedBudgets);
  };

  const handleDeleteBudget = (id: string) => {
    const updatedBudgets = budgets.filter(b => b.id !== id);
    setBudgets(updatedBudgets);
    storage.saveBudgets(updatedBudgets);
  };

  const handleUpdateSettings = (newSettings: BusinessSettings) => {
    setSettings(newSettings);
    storage.saveSettings(newSettings);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setActiveTab('generator');
  };

  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'generator', label: editingBudget ? 'Editando' : 'Crear', icon: FilePlus },
    { id: 'products', label: 'Insumos', icon: Package },
    { id: 'history', label: 'Archivo', icon: History },
    { id: 'settings', label: 'Perfil', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar Desktop - Ultra Clean */}
      <aside className="hidden lg:flex flex-col w-72 bg-white sticky top-0 h-screen border-r border-slate-100 px-6 py-8">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-xl shadow-orange-500/20">
            <Compass size={28} className="text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tighter leading-none">{settings.name || 'PresuApp Pro'}</h1>
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Estudio Técnico</span>
          </div>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id !== 'generator') setEditingBudget(null);
                setActiveTab(item.id as any);
              }}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all text-sm font-bold ${
                activeTab === item.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-slate-50">
           <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
             <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                <User size={18} className="text-slate-400" />
             </div>
             <div className="truncate">
                <p className="text-[10px] font-bold text-slate-300 uppercase">Director</p>
                <p className="text-xs font-bold truncate">{settings.ownerName}</p>
             </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden h-20 bg-white/80 backdrop-blur-xl border-b border-slate-50 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Compass size={22} className="text-white" />
            </div>
            <h1 className="font-extrabold text-base tracking-tighter leading-none">{settings.name || 'PresuApp'}</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
            <User size={18} className="text-slate-400" />
          </div>
        </header>

        <div className="flex-1 p-6 lg:p-12 max-w-6xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <Dashboard 
              products={products} 
              budgets={budgets} 
              settings={settings} 
              onNavigate={setActiveTab}
              onUpdateStatus={handleUpdateBudgetStatus}
            />
          )}
          {activeTab === 'products' && <ProductManager products={products} onUpdate={handleUpdateProducts} />}
          {activeTab === 'generator' && (
            <BudgetGenerator 
              products={products} 
              settings={settings} 
              onSave={handleSaveBudget} 
              initialBudget={editingBudget}
              onCancel={() => {
                setEditingBudget(null);
                setActiveTab('history');
              }}
            />
          )}
          {activeTab === 'history' && (
            <BudgetHistory 
              budgets={budgets} 
              settings={settings} 
              onDelete={handleDeleteBudget} 
              onUpdateStatus={handleUpdateBudgetStatus} 
              onEdit={handleEditBudget}
            />
          )}
          {activeTab === 'settings' && <SettingsView settings={settings} onUpdate={handleUpdateSettings} />}
        </div>

        {/* Floating Mobile Nav - Premium Style */}
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50">
          <nav className="bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] p-2 flex items-center justify-around shadow-2xl shadow-slate-900/40">
             {navItems.map((item) => (
               <button
                 key={item.id}
                 onClick={() => {
                  if (item.id !== 'generator') setEditingBudget(null);
                  setActiveTab(item.id as any);
                 }}
                 className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all ${
                   activeTab === item.id ? 'bg-orange-500 text-white scale-110 shadow-lg' : 'text-slate-500'
                 }`}
               >
                 <item.icon size={20} />
               </button>
             ))}
          </nav>
        </div>
      </main>
    </div>
  );
};

export default App;
