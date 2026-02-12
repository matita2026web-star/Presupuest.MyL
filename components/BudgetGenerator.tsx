
import React, { useState } from 'react';
import { 
  Search, Plus, Trash2, Save, FileText, User, 
  Phone, Calendar, Info, Calculator, Percent, Tag, Hammer, HardHat
} from 'lucide-react';
import { Product, Budget, BudgetOrderItem, ClientData, BusinessSettings } from '../types';

interface BudgetGeneratorProps {
  products: Product[];
  settings: BusinessSettings;
  onSave: (budget: Budget) => void;
}

const BudgetGenerator: React.FC<BudgetGeneratorProps> = ({ products, settings, onSave }) => {
  const [client, setClient] = useState<ClientData>({ name: '', phone: '', observations: '' });
  const [items, setItems] = useState<BudgetOrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState<string>('1');
  
  const [taxRate, setTaxRate] = useState<number>(settings.defaultTax);
  const [discount, setDiscount] = useState<number>(0);
  const [validDays, setValidDays] = useState<number>(15);

  const addItem = () => {
    const product = products.find(p => p.id === selectedProductId);
    if (!product || !quantity || parseFloat(quantity) <= 0) return;

    const qty = parseFloat(quantity);
    const newItem: BudgetOrderItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      quantity: qty,
      subtotal: product.price * qty,
    };

    setItems([...items, newItem]);
    setSelectedProductId('');
    setQuantity('1');
    setSearchTerm('');
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((acc, curr) => acc + curr.subtotal, 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxAmount = ((subtotal - discountAmount) * taxRate) / 100;
  const total = subtotal - discountAmount + taxAmount;

  const handleSave = () => {
    if (!client.name || items.length === 0) {
      alert('Se requiere nombre del cliente e ítems de obra.');
      return;
    }

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validDays);

    const newBudget: Budget = {
      id: `OBRA-${Date.now().toString().slice(-5)}`,
      date: new Date().toISOString(),
      validUntil: validUntil.toISOString(),
      client,
      items,
      taxRate,
      discount,
      subtotal,
      total,
      status: 'pendiente'
    };

    onSave(newBudget);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 animate-in fade-in duration-700 pb-20">
      <div className="xl:col-span-3 space-y-8">
        
        <section className="bg-white p-8 rounded-3xl border-l-8 border-orange-500 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 text-slate-100 -mr-4 -mt-4">
            <User size={100} />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 uppercase tracking-tighter">
            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-orange-500">
               <User size={20} />
            </div>
            Carpeta de Cliente / Obra
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cliente / Empresa</label>
              <input 
                type="text" 
                value={client.name}
                onChange={(e) => setClient({...client, name: e.target.value})}
                placeholder="Juan Perez / Constructora S.A."
                className="w-full bg-slate-50 px-5 py-4 rounded-xl border-2 border-slate-100 focus:border-orange-500 focus:ring-0 font-bold transition-all outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contacto Directo</label>
              <input 
                type="text" 
                value={client.phone}
                onChange={(e) => setClient({...client, phone: e.target.value})}
                placeholder="Teléfono / Celular"
                className="w-full bg-slate-50 px-5 py-4 rounded-xl border-2 border-slate-100 focus:border-orange-500 focus:ring-0 font-bold transition-all outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Días de Validez</label>
              <input 
                type="number" 
                value={validDays}
                onChange={(e) => setValidDays(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-50 px-5 py-4 rounded-xl border-2 border-slate-100 focus:border-orange-500 focus:ring-0 font-black outline-none"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notas de Ingeniería / Condiciones Técnicas</label>
              <textarea 
                value={client.observations}
                onChange={(e) => setClient({...client, observations: e.target.value})}
                placeholder="Especificaciones técnicas y plazos..."
                rows={2}
                className="w-full bg-slate-50 px-5 py-4 rounded-xl border-2 border-slate-100 focus:border-orange-500 focus:ring-0 font-medium outline-none"
              />
            </div>
          </div>
        </section>

        <section className="bg-[#1e293b] p-8 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-slate-800 -mr-6 -mt-6">
            <Hammer size={120} />
          </div>
          <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tighter">
             <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-slate-900">
               <Plus size={20} />
            </div>
            Cómputo de Materiales y Rubros
          </h3>
          <div className="flex flex-col md:flex-row gap-4 items-end relative z-10">
            <div className="flex-1 relative space-y-2 w-full">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Buscar Insumo</label>
              <input 
                type="text" 
                placeholder="Escribe el nombre del ítem..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 text-white px-5 py-4 rounded-xl border-2 border-slate-700 focus:border-orange-500 focus:ring-0 font-bold outline-none"
              />
              {searchTerm && !selectedProductId && (
                <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-xl shadow-2xl max-h-60 overflow-y-auto border border-slate-200">
                  {filteredProducts.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedProductId(p.id); setSearchTerm(p.name); }}
                      className="w-full text-left px-5 py-4 hover:bg-orange-50 border-b border-slate-50 last:border-0 flex justify-between items-center transition-colors"
                    >
                      <div>
                        <p className="font-black text-slate-900 uppercase tracking-tighter">{p.name}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase">{settings.currency}{p.price} / {p.unit}</p>
                      </div>
                      <Plus size={16} className="text-orange-600" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="w-full md:w-32 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cant.</label>
              <input 
                type="number" 
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-slate-800 text-white px-5 py-4 rounded-xl border-2 border-slate-700 focus:border-orange-500 focus:ring-0 font-black text-center outline-none"
              />
            </div>
            <button 
              onClick={addItem}
              disabled={!selectedProductId}
              className="w-full md:w-auto px-10 py-4 bg-orange-500 hover:bg-orange-600 text-slate-900 font-black rounded-xl shadow-lg shadow-orange-500/20 disabled:opacity-20 transition-all h-[56px] uppercase italic tracking-tighter"
            >
              Cargar
            </button>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">
                  <th className="px-8 py-5">Rubro / Material</th>
                  <th className="px-8 py-5 text-center">Cant.</th>
                  <th className="px-8 py-5 text-right">Unitario</th>
                  <th className="px-8 py-5 text-right">Subtotal</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length > 0 ? (
                  items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-8 py-6">
                        <p className="font-black text-slate-800 uppercase italic tracking-tighter">{item.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.unit}</p>
                      </td>
                      <td className="px-8 py-6 text-center font-black text-slate-700">{item.quantity}</td>
                      <td className="px-8 py-6 text-right font-bold text-slate-500">{settings.currency}{item.price.toLocaleString()}</td>
                      <td className="px-8 py-6 text-right font-black text-slate-900 text-lg">{settings.currency}{item.subtotal.toLocaleString()}</td>
                      <td className="px-8 py-6 text-right">
                        <button onClick={() => removeItem(idx)} className="p-3 text-slate-300 hover:text-red-500 transition-all hover:bg-red-50 rounded-xl">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                       <div className="flex flex-col items-center gap-4 text-slate-300">
                          <HardHat size={48} className="animate-bounce" />
                          <p className="text-sm font-black uppercase tracking-widest italic">Inicie la carga de ítems</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="xl:col-span-1">
        <div className="bg-[#1e293b] text-white p-8 rounded-[2rem] shadow-2xl sticky top-28 space-y-8 border-t-8 border-orange-500">
          <h3 className="text-xl font-black flex items-center gap-3 uppercase italic tracking-tighter">
            <Calculator className="text-orange-500" />
            Liquidación
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between text-slate-400 font-bold uppercase text-[10px] tracking-widest">
              <span>Costo Base</span>
              <span className="text-white">{settings.currency}{subtotal.toLocaleString()}</span>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-700">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                  <Tag size={12} className="text-orange-500" /> % Bonificación
                </div>
                <input 
                  type="number" 
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-20 bg-slate-800 border-2 border-slate-700 rounded-lg px-2 py-2 text-right font-black text-orange-400 outline-none focus:border-orange-500"
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                  <Percent size={12} className="text-orange-500" /> % IVA / Gtos.
                </div>
                <input 
                  type="number" 
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-20 bg-slate-800 border-2 border-slate-700 rounded-lg px-2 py-2 text-right font-black text-orange-400 outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="h-0.5 bg-slate-700 my-8" />

            <div className="flex flex-col gap-1 items-end">
              <span className="text-[11px] font-black text-orange-400 uppercase tracking-[0.2em]">Presupuesto Final</span>
              <span className="text-5xl font-black text-white tracking-tighter italic">
                {settings.currency}{total.toLocaleString()}
              </span>
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-6 rounded-2xl transition-all shadow-xl shadow-orange-900/40 flex items-center justify-center gap-4 uppercase italic tracking-tight active:scale-95"
          >
            <Save size={24} />
            GUARDAR OBRA
          </button>
          
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-center">
             <p className="text-[11px] text-slate-400 leading-tight uppercase font-bold">
               Válido hasta el {new Date(new Date().setDate(new Date().getDate() + validDays)).toLocaleDateString()}.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetGenerator;
