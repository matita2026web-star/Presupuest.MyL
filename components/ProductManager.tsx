
import React, { useState, useRef } from 'react';
import { 
  Plus, Search, Trash2, Edit3, Save, X, Package, Layers, Hammer, HardHat, 
  TrendingUp, Download, Upload, AlertTriangle, Filter, CheckCircle2, 
  ChevronRight, ArrowUpRight, BarChart3, History, Settings2, FileJson
} from 'lucide-react';
import { Product, UnitType } from '../types';

interface ProductManagerProps {
  products: Product[];
  onUpdate: (products: Product[]) => void;
  onDelete: (id: string) => void;
}

const ProductManager: React.FC<ProductManagerProps> = ({ products, onUpdate, onDelete }) => {
  // --- ESTADOS ORIGINALES ---
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<Product>>({
    name: '',
    price: 0,
    unit: UnitType.UNIDAD,
    category: 'General'
  });

  // --- NUEVOS ESTADOS (EXPANSIÓN) ---
  const [isBulkAdjusting, setIsBulkAdjusting] = useState(false);
  const [bulkPercent, setBulkPercent] = useState<number>(10);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [showImportExport, setShowImportExport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- LÓGICA ORIGINAL ---
  const handleSave = () => {
    if (!form.name || !form.price) return;
    
    if (editingId) {
      onUpdate(products.map(p => p.id === editingId ? { ...p, ...form } as Product : p));
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: form.name,
        price: form.price,
        unit: form.unit as UnitType,
        category: form.category || 'General'
      };
      onUpdate([...products, newProduct]);
    }
    resetForm();
  };

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setForm(p);
    setIsAdding(true);
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setForm({ name: '', price: 0, unit: UnitType.UNIDAD, category: 'General' });
  };

  // --- NUEVA LÓGICA DE GESTIÓN AVANZADA ---
  const handleBulkUpdate = () => {
    const factor = 1 + bulkPercent / 100;
    const updated = products.map(p => {
      if (selectedCategory === 'Todas' || p.category === selectedCategory) {
        return { ...p, price: Math.round(p.price * factor) };
      }
      return p;
    });
    onUpdate(updated);
    setIsBulkAdjusting(false);
    alert(`Actualización masiva completada: +${bulkPercent}% aplicado.`);
  };

  const exportToJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `catalogo_obra_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importFromJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json)) {
          onUpdate([...products, ...json]);
          alert("Importación exitosa.");
        }
      } catch (err) {
        alert("Archivo inválido.");
      }
    };
    reader.readAsText(file);
  };

  const categories = ['Todas', ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = products.filter(p => 
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedCategory === 'Todas' || p.category === selectedCategory)
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* HEADER DINÁMICO (ORIGINAL + MEJORAS) */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-slate-100 pb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
             <div className="bg-orange-500 p-2 rounded-lg text-white"><Settings2 size={18} /></div>
             <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.4em]">Panel de Control de Suministros</span>
          </div>
          <h2 className="text-5xl font-black text-slate-950 tracking-tighter uppercase italic leading-none">
            Catálogo de <br/><span className="text-orange-500">Insumos y Obra</span>
          </h2>
          <div className="flex items-center gap-3 mt-4">
             <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                    <HardHat size={14} className="text-slate-400" />
                  </div>
                ))}
             </div>
             <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Sincronizado con Supabase Cloud v2.1</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => setShowImportExport(!showImportExport)}
            className="bg-white border-2 border-slate-200 text-slate-600 px-6 py-4 rounded-2xl font-black transition-all flex items-center gap-3 uppercase text-xs hover:border-slate-900 hover:text-slate-900 shadow-sm"
          >
            <FileJson size={18} />
            Data Manager
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-slate-950 hover:bg-orange-600 text-white px-10 py-5 rounded-[1.5rem] font-black shadow-2xl shadow-orange-500/20 transition-all flex items-center justify-center gap-4 uppercase italic tracking-tight group"
          >
            <Plus size={24} className="group-hover:rotate-90 transition-transform" />
            Nuevo Ítem de Obra
          </button>
        </div>
      </div>

      {/* DASHBOARD DE MÉTRICAS RÁPIDAS (NUEVO) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Total Ítems', val: products.length, icon: Layers, color: 'blue' },
           { label: 'Categorías', val: categories.length - 1, icon: Package, color: 'orange' },
           { label: 'Costo Promedio', val: `$${Math.round(products.reduce((acc, p) => acc + p.price, 0) / (products.length || 1)).toLocaleString()}`, icon: BarChart3, color: 'emerald' },
           { label: 'Última Sync', val: 'Hoy', icon: History, color: 'slate' }
         ].map((card, idx) => (
           <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                 <div className={`p-3 rounded-2xl bg-${card.color}-50 text-${card.color}-600`}>
                    <card.icon size={20} />
                 </div>
                 <ArrowUpRight size={16} className="text-slate-300" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
              <p className="text-2xl font-black text-slate-900 mt-1 italic tracking-tighter">{card.val}</p>
           </div>
         ))}
      </div>

      {/* PANEL DE ACTUALIZACIÓN POR INFLACIÓN (NUEVO) */}
      <div className="bg-orange-500 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-orange-500/30">
        <div className="absolute right-0 top-0 opacity-10 -mr-10 -mt-10">
          <TrendingUp size={300} />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
           <div className="max-w-md">
              <h3 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-4">
                <AlertTriangle size={32} /> Ajuste por Inflación
              </h3>
              <p className="mt-2 text-orange-100 font-bold text-sm uppercase leading-relaxed">
                Actualice masivamente los precios de sus insumos y mano de obra aplicando un porcentaje directo sobre el catálogo.
              </p>
           </div>
           <div className="flex flex-wrap items-center gap-4 bg-white/10 p-4 rounded-[2rem] backdrop-blur-md border border-white/20">
              <div className="flex flex-col px-4">
                 <span className="text-[9px] font-black uppercase mb-1 opacity-60">Rubro</span>
                 <select 
                   value={selectedCategory} 
                   onChange={(e) => setSelectedCategory(e.target.value)}
                   className="bg-transparent font-black uppercase text-xs outline-none cursor-pointer"
                 >
                   {categories.map(c => <option key={c} value={c} className="text-slate-900">{c}</option>)}
                 </select>
              </div>
              <div className="h-10 w-[1px] bg-white/20"></div>
              <div className="flex flex-col px-4">
                 <span className="text-[9px] font-black uppercase mb-1 opacity-60">Incremento</span>
                 <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={bulkPercent} 
                      onChange={(e) => setBulkPercent(parseFloat(e.target.value) || 0)}
                      className="bg-transparent w-16 font-black text-xl outline-none"
                    />
                    <span className="font-black">%</span>
                 </div>
              </div>
              <button 
                onClick={handleBulkUpdate}
                className="bg-white text-orange-600 px-8 py-4 rounded-2xl font-black uppercase italic text-sm hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                Ejecutar Recargo
              </button>
           </div>
        </div>
      </div>

      {/* MODAL DE IMPORTACIÓN/EXPORTACIÓN (NUEVO) */}
      {showImportExport && (
        <div className="bg-slate-50 border-2 border-slate-200 rounded-[2.5rem] p-8 flex flex-col md:flex-row gap-6 animate-in slide-in-from-top duration-300">
           <div className="flex-1 bg-white p-6 rounded-3xl border border-slate-200 text-center">
              <Download size={32} className="mx-auto mb-4 text-slate-400" />
              <h4 className="font-black text-slate-950 uppercase italic mb-2">Exportar Backup</h4>
              <p className="text-xs text-slate-500 mb-6">Descargue su catálogo completo en formato JSON para seguridad.</p>
              <button onClick={exportToJson} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase text-xs">Descargar JSON</button>
           </div>
           <div className="flex-1 bg-white p-6 rounded-3xl border border-slate-200 text-center">
              <Upload size={32} className="mx-auto mb-4 text-orange-500" />
              <h4 className="font-black text-slate-950 uppercase italic mb-2">Importar Catálogo</h4>
              <p className="text-xs text-slate-500 mb-6">Suba un archivo JSON para fusionarlo con la base de datos actual.</p>
              <input type="file" accept=".json" onChange={importFromJson} ref={fileInputRef} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="w-full bg-orange-500 text-white py-4 rounded-xl font-black uppercase text-xs">Cargar Archivo</button>
           </div>
        </div>
      )}

      {/* FILTROS Y BUSCADOR (ORIGINAL + EXPANSIÓN) */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 flex items-center gap-6 w-full">
            <div className="p-4 bg-white rounded-2xl shadow-inner border border-slate-100">
                <Search size={28} className="text-orange-500" />
            </div>
            <input 
              type="text" 
              placeholder="Buscar por descripción, marca o rubro técnico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent flex-1 outline-none font-black text-slate-950 uppercase italic tracking-tighter text-2xl placeholder:text-slate-300"
            />
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100">
             {['Todas', 'Mano de Obra', 'Materiales'].map(cat => (
               <button 
                 key={cat} 
                 onClick={() => setSelectedCategory(cat)}
                 className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-slate-950 text-white' : 'text-slate-400 hover:text-slate-900'}`}
               >
                 {cat}
               </button>
             ))}
          </div>
        </div>

        {/* TABLA DE GESTIÓN (ORIGINAL + MEJORAS VISUALES) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 bg-slate-50">
                <th className="px-12 py-7 italic">Suministro / Servicio</th>
                <th className="px-12 py-7">Rubro Administrativo</th>
                <th className="px-12 py-7">Unidad</th>
                <th className="px-12 py-7 text-right">Cotización</th>
                <th className="px-12 py-7 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 group transition-all">
                  <td className="px-12 py-8">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-slate-950 group-hover:text-orange-500 transition-all shadow-sm">
                        <Hammer size={28} className="group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-950 uppercase italic tracking-tighter text-xl group-hover:text-orange-600 transition-colors">{p.name}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID Ref: {p.id.slice(-6)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-12 py-8">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                       <span className="text-slate-900 font-black uppercase text-xs">{p.category}</span>
                    </div>
                  </td>
                  <td className="px-12 py-8">
                     <span className="px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest">
                       {p.unit}
                     </span>
                  </td>
                  <td className="px-12 py-8 text-right">
                    <div className="flex flex-col items-end">
                       <span className="font-black text-slate-950 text-2xl italic font-mono">$ {p.price.toLocaleString()}</span>
                       <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Valor de Mercado</span>
                    </div>
                  </td>
                  <td className="px-12 py-8">
                    <div className="flex items-center justify-center gap-4">
                      <button 
                        onClick={() => handleEdit(p)} 
                        className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-950 hover:bg-white hover:shadow-lg rounded-2xl transition-all border border-transparent hover:border-slate-100"
                      >
                        <Edit3 size={20} />
                      </button>
                      <button 
                        onClick={() => onDelete(p.id)} 
                        className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* FOOTER DE TABLA (NUEVO) */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Mostrando {filtered.length} de {products.length} registros totales</p>
           <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-950 uppercase tracking-widest italic">Base de Datos Protegida</span>
           </div>
        </div>
      </div>

      {/* FORMULARIO MODAL (ORIGINAL + MEJORAS VISUALES) */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl transition-all">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-300 border-t-[12px] border-orange-500">
            <div className="p-12 space-y-10">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-500/20">
                      {editingId ? <Edit3 size={28} /> : <Plus size={28} />}
                   </div>
                   <div>
                      <h3 className="text-3xl font-black text-slate-950 uppercase italic tracking-tighter leading-none">
                        {editingId ? 'Editar Ítem' : 'Nuevo Ítem'}
                      </h3>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">Configuración Técnica del Insumo</p>
                   </div>
                </div>
                <button onClick={resetForm} className="p-4 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all active:scale-95"><X size={24}/></button>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                    <Package size={14} className="text-orange-500" /> Descripción del Ítem o Servicio
                  </label>
                  <input 
                    type="text" 
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    placeholder="EJ: COLOCACIÓN DE PISOS PORCELANATO"
                    className="w-full bg-slate-50 px-8 py-6 rounded-[1.5rem] border-2 border-slate-100 focus:border-orange-500 outline-none font-black uppercase italic text-xl transition-all shadow-inner focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Rubro Obra</label>
                    <input 
                      type="text" 
                      value={form.category}
                      onChange={(e) => setForm({...form, category: e.target.value})}
                      placeholder="MARCA O RUBRO"
                      className="w-full bg-slate-50 px-8 py-5 rounded-[1.5rem] border-2 border-slate-100 focus:border-orange-500 outline-none font-black uppercase transition-all shadow-inner focus:bg-white"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Cómputo Metétrico</label>
                    <div className="relative">
                      <select 
                        value={form.unit}
                        onChange={(e) => setForm({...form, unit: e.target.value as UnitType})}
                        className="w-full bg-slate-50 px-8 py-5 rounded-[1.5rem] border-2 border-slate-100 focus:border-orange-500 outline-none font-black uppercase transition-all appearance-none cursor-pointer shadow-inner focus:bg-white"
                      >
                        {Object.values(UnitType).map(u => <option key={u} value={u} className="font-black">{u}</option>)}
                      </select>
                      <ChevronRight size={20} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-slate-300 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Costo Unitario ($)</label>
                  <div className="relative">
                     <span className="absolute left-8 top-1/2 -translate-y-1/2 text-3xl font-black text-slate-300">$</span>
                     <input 
                       type="number" 
                       value={form.price}
                       onChange={(e) => setForm({...form, price: parseFloat(e.target.value) || 0})}
                       className="w-full bg-slate-950 text-orange-500 px-16 py-8 rounded-[2rem] border-2 border-transparent focus:border-orange-500 outline-none font-black text-5xl italic transition-all shadow-2xl font-mono"
                     />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                 <button 
                  onClick={resetForm}
                  className="flex-1 bg-slate-100 text-slate-500 font-black py-6 rounded-3xl uppercase italic text-sm hover:bg-slate-200 transition-all"
                 >
                   Cancelar
                 </button>
                 <button 
                  onClick={handleSave}
                  className="flex-[2] bg-slate-950 hover:bg-orange-600 text-white font-black py-6 rounded-3xl shadow-2xl transition-all flex items-center justify-center gap-4 uppercase italic text-lg border-b-8 border-slate-800 active:border-b-0 active:translate-y-2"
                 >
                  <CheckCircle2 size={24} className="text-orange-500" />
                  Consolidar Registro
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
