
import React, { useState } from 'react';
import { Plus, Search, Trash2, Edit3, Save, X, Package, Layers, Hammer, HardHat } from 'lucide-react';
import { Product, UnitType } from '../types';

interface ProductManagerProps {
  products: Product[];
  onUpdate: (products: Product[]) => void;
  onDelete: (id: string) => void;
}

const ProductManager: React.FC<ProductManagerProps> = ({ products, onUpdate, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<Product>>({
    name: '',
    price: 0,
    unit: UnitType.UNIDAD,
    category: 'General'
  });

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

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Catálogo de <span className="text-orange-500">Insumos y Obra</span></h2>
          <p className="text-slate-500 font-medium">Sincronizado en la nube con Supabase.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-5 rounded-xl font-black shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center gap-4 uppercase italic tracking-tight"
        >
          <Plus size={24} className="text-orange-500" />
          Nuevo Ítem de Obra
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border-t-8 border-orange-500">
            <div className="p-10 space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">{editingId ? 'Editar Ítem' : 'Nuevo Registro de Obra'}</h3>
                <button onClick={resetForm} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all"><X size={20}/></button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Descripción del Ítem</label>
                  <input 
                    type="text" 
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    placeholder="Ej: Pintura de Paredes con Látex"
                    className="w-full bg-slate-50 px-6 py-5 rounded-2xl border-2 border-slate-100 focus:border-orange-500 outline-none font-black uppercase italic transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Rubro / Categoría</label>
                    <input 
                      type="text" 
                      value={form.category}
                      onChange={(e) => setForm({...form, category: e.target.value})}
                      placeholder="Mano de Obra, Materiales..."
                      className="w-full bg-slate-50 px-6 py-5 rounded-2xl border-2 border-slate-100 focus:border-orange-500 outline-none font-bold uppercase transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Cómputo / Unidad</label>
                    <select 
                      value={form.unit}
                      onChange={(e) => setForm({...form, unit: e.target.value as UnitType})}
                      className="w-full bg-slate-50 px-6 py-5 rounded-2xl border-2 border-slate-100 focus:border-orange-500 outline-none font-black uppercase transition-all appearance-none cursor-pointer"
                    >
                      {Object.values(UnitType).map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Costo Unitario Vigente ($)</label>
                  <input 
                    type="number" 
                    value={form.price}
                    onChange={(e) => setForm({...form, price: parseFloat(e.target.value) || 0})}
                    className="w-full bg-slate-50 px-6 py-5 rounded-2xl border-2 border-slate-100 focus:border-orange-500 outline-none font-black text-3xl italic text-slate-900 transition-all"
                  />
                </div>
              </div>

              <button 
                onClick={handleSave}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-7 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-4 uppercase italic tracking-tight"
              >
                <Save size={24} className="text-orange-500" />
                Guardar en Supabase
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-6">
          <div className="p-3 bg-white rounded-xl shadow-inner border border-slate-100">
             <Search size={24} className="text-orange-500" />
          </div>
          <input 
            type="text" 
            placeholder="Filtrar por nombre del ítem o rubro de obra..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent flex-1 outline-none font-black text-slate-800 uppercase italic tracking-tight text-lg"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 bg-slate-50">
                <th className="px-12 py-6 italic">Descripción Técnica</th>
                <th className="px-12 py-6">Rubro Obra</th>
                <th className="px-12 py-6">Cómputo</th>
                <th className="px-12 py-6 text-right">Precio Actual</th>
                <th className="px-12 py-6 text-center">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 group transition-all">
                  <td className="px-12 py-8">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-orange-500 transition-all shadow-inner">
                        <Hammer size={24} />
                      </div>
                      <span className="font-black text-slate-900 uppercase italic tracking-tighter text-lg">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-12 py-8">
                    <span className="px-4 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-orange-200">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-12 py-8 text-slate-500 font-bold uppercase tracking-widest italic">{p.unit}</td>
                  <td className="px-12 py-8 text-right font-black text-slate-900 text-xl italic">${p.price.toLocaleString()}</td>
                  <td className="px-12 py-8">
                    <div className="flex items-center justify-center gap-4">
                      <button onClick={() => handleEdit(p)} className="p-4 text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all shadow-sm">
                        <Edit3 size={20} />
                      </button>
                      <button onClick={() => onDelete(p.id)} className="p-4 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all shadow-sm">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductManager;
