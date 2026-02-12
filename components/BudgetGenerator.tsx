
import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Save, User, Calculator, 
  Package, Construction, X, Edit2, TrendingDown,
  Layers, ShoppingCart, Briefcase, ChevronRight, Hammer,
  CheckCircle2, Info
} from 'lucide-react';
import { Product, Budget, BudgetOrderItem, ClientData, BusinessSettings, RequiredMaterial, UnitType } from '../types';

interface BudgetGeneratorProps {
  products: Product[];
  settings: BusinessSettings;
  onSave: (budget: Budget) => void;
  initialBudget?: Budget | null;
  onCancel?: () => void;
}

const BudgetGenerator: React.FC<BudgetGeneratorProps> = ({ products, settings, onSave, initialBudget, onCancel }) => {
  const [client, setClient] = useState<ClientData>({ name: '', phone: '', observations: '' });
  const [items, setItems] = useState<BudgetOrderItem[]>([]);
  const [requiredMaterials, setRequiredMaterials] = useState<RequiredMaterial[]>([]);
  
  const [materialsIncluded, setMaterialsIncluded] = useState(true);
  const [clientBuysMaterials, setClientBuysMaterials] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState<string>('1');

  // Form para nuevo material rápido
  const [matForm, setMatForm] = useState({ name: '', quantity: '1', unit: 'unidad', price: '0' });
  
  const [taxRate, setTaxRate] = useState<number>(settings.defaultTax);
  const [discount, setDiscount] = useState<number>(0);
  const [manualAdjustment, setManualAdjustment] = useState<number>(0); 
  const [validDays, setValidDays] = useState<number>(15);
  const [budgetID, setBudgetID] = useState<string>(`EXP-${Date.now().toString().slice(-6)}`);

  useEffect(() => {
    if (initialBudget) {
      setBudgetID(initialBudget.id);
      setClient(initialBudget.client);
      setItems([...initialBudget.items]);
      setRequiredMaterials(initialBudget.requiredMaterials || []);
      setMaterialsIncluded(initialBudget.materialsIncluded ?? true);
      setClientBuysMaterials(initialBudget.clientBuysMaterials ?? false);
      setTaxRate(initialBudget.taxRate);
      setDiscount(initialBudget.discount);
      const diffTime = Math.abs(new Date(initialBudget.validUntil).getTime() - new Date(initialBudget.date).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setValidDays(diffDays || 15);
    }
  }, [initialBudget]);

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

  const updateLaborItem = (idx: number, field: 'price' | 'quantity', value: string) => {
    const val = parseFloat(value) || 0;
    const newItems = [...items];
    const updatedItem = { ...newItems[idx], [field]: val };
    updatedItem.subtotal = updatedItem.price * updatedItem.quantity;
    newItems[idx] = updatedItem;
    setItems(newItems);
  };

  const addMaterial = () => {
    if (!matForm.name || !matForm.quantity) return;
    const qty = parseFloat(matForm.quantity) || 0;
    const price = parseFloat(matForm.price) || 0;
    const newMat: RequiredMaterial = {
      name: matForm.name,
      quantity: qty,
      unit: matForm.unit,
      price: price,
      subtotal: qty * price
    };
    setRequiredMaterials([...requiredMaterials, newMat]);
    setMatForm({ name: '', quantity: '1', unit: 'unidad', price: '0' });
  };

  const updateMaterialItem = (idx: number, field: keyof RequiredMaterial, value: any) => {
    const newMats = [...requiredMaterials];
    const updated = { ...newMats[idx], [field]: value };
    if (field === 'price' || field === 'quantity') {
      const q = field === 'quantity' ? parseFloat(value) || 0 : updated.quantity;
      const p = field === 'price' ? parseFloat(value) || 0 : updated.price;
      updated.subtotal = q * p;
    }
    newMats[idx] = updated;
    setRequiredMaterials(newMats);
  };

  const removeLabor = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const removeMaterial = (idx: number) => setRequiredMaterials(requiredMaterials.filter((_, i) => i !== idx));

  // Filter products for the labor search dropdown
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const subtotalLabor = items.reduce((acc, curr) => acc + curr.subtotal, 0);
  const subtotalMaterials = requiredMaterials.reduce((acc, curr) => acc + curr.subtotal, 0);
  
  const effectiveMaterialsSubtotal = materialsIncluded ? subtotalMaterials : 0;
  const generalSubtotal = subtotalLabor + effectiveMaterialsSubtotal;
  
  const discountAmount = (generalSubtotal * discount) / 100;
  const taxAmount = ((generalSubtotal - discountAmount) * taxRate) / 100;
  const totalValue = generalSubtotal - discountAmount + taxAmount - manualAdjustment;

  const handleSave = () => {
    if (!client.name || (items.length === 0 && requiredMaterials.length === 0)) {
      alert('⚠️ Faltan datos críticos: Nombre del proyecto y al menos una tarea o material.');
      return;
    }
    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + validDays);
    onSave({
      id: budgetID,
      date: initialBudget ? initialBudget.date : new Date().toISOString(),
      validUntil: validUntilDate.toISOString(),
      client, 
      items, 
      requiredMaterials,
      materialsIncluded,
      clientBuysMaterials,
      taxRate, 
      discount, 
      subtotalLabor,
      subtotalMaterials,
      total: totalValue, 
      status: initialBudget ? initialBudget.status : 'pendiente'
    });
  };

  return (
    <div className="space-y-12 animate-scale pb-40">
      
      {/* Header PresuBuild PRO */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tighter leading-none mb-4">
            PresuBuild <span className="text-orange-500">PRO</span>
          </h2>
          <div className="flex items-center gap-3">
             <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-lg text-[10px] font-extrabold uppercase tracking-widest">{budgetID}</span>
             <span className="text-slate-300 font-bold text-xs">Modo Ingeniería de Costos</span>
          </div>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all">
            <X size={24}/>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Main Work Area */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Identificación del Proyecto */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-50 soft-shadow space-y-8">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <User size={16} className="text-orange-500" /> Información del Proyecto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" value={client.name} onChange={(e) => setClient({...client, name: e.target.value})} placeholder="TITULAR / NOMBRE DE OBRA" className="w-full px-6 py-5 font-bold uppercase text-sm" />
              <input type="text" value={client.phone} onChange={(e) => setClient({...client, phone: e.target.value})} placeholder="WHATSAPP" className="w-full px-6 py-5 font-bold text-sm" />
              <textarea value={client.observations} onChange={(e) => setClient({...client, observations: e.target.value})} placeholder="OBSERVACIONES TÉCNICAS (PLAZOS, CONDICIONES)..." rows={2} className="md:col-span-2 w-full px-6 py-5 font-medium text-sm" />
            </div>
          </section>

          {/* 1. MANO DE OBRA */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest italic flex items-center gap-3">
                 <Hammer size={18} className="text-orange-500" /> 1. Mano de Obra
               </h3>
               <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                 Subtotal: {settings.currency}{subtotalLabor.toLocaleString()}
               </span>
            </div>

            {/* Buscador de Tareas Laborales */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl space-y-4">
               <div className="relative">
                 <input 
                   type="text" 
                   placeholder="BUSCAR TRABAJO EN CATÁLOGO..." 
                   value={searchTerm} 
                   onChange={(e) => { setSearchTerm(e.target.value); setSelectedProductId(''); }} 
                   className="w-full !bg-white/5 border-2 !border-white/10 text-white px-8 py-5 rounded-2xl font-bold uppercase text-sm placeholder:text-slate-600 focus:!border-orange-500 outline-none" 
                 />
                 {searchTerm && !selectedProductId && (
                   <div className="absolute top-full left-0 right-0 z-[100] mt-3 bg-white rounded-2xl shadow-2xl max-h-60 overflow-y-auto no-scrollbar border-2 border-slate-900 overflow-hidden">
                     {filteredProducts.map(p => (
                       <button key={p.id} onClick={() => { setSelectedProductId(p.id); setSearchTerm(p.name); }} className="w-full text-left p-4 hover:bg-slate-50 border-b border-slate-50 last:border-0 flex justify-between items-center group">
                         <div>
                           <p className="font-extrabold text-slate-900 uppercase text-[11px] leading-none mb-1">{p.name}</p>
                           <span className="text-[9px] font-bold text-slate-300 uppercase">{settings.currency}{p.price.toLocaleString()} / {p.unit}</span>
                         </div>
                         <Plus size={16} className="text-orange-500" />
                       </button>
                     ))}
                   </div>
                 )}
               </div>
               <div className="flex gap-3">
                 <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="CANT." className="w-20 !bg-white/5 !border-white/10 text-white py-4 font-extrabold text-xl text-center" />
                 <button onClick={addItem} disabled={!selectedProductId} className="flex-1 bg-orange-500 text-white font-extrabold rounded-2xl uppercase italic text-xs shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors">
                   <Plus size={18} /> AGREGAR TRABAJO
                 </button>
               </div>
            </div>

            {/* Lista de Mano de Obra */}
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[2rem] border-l-[6px] border-orange-500 soft-shadow animate-scale">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <p className="font-extrabold text-slate-900 uppercase text-xs mb-1">{item.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{item.unit}</p>
                    </div>
                    <button onClick={() => removeLabor(idx)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex gap-4">
                       <div className="flex flex-col">
                          <span className="text-[8px] font-black text-slate-300 uppercase mb-1">CANT.</span>
                          <input type="number" value={item.quantity} onChange={(e) => updateLaborItem(idx, 'quantity', e.target.value)} className="w-20 bg-slate-50 py-2 px-1 text-center text-xs font-extrabold outline-none" />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[8px] font-black text-slate-300 uppercase mb-1">UNIT.</span>
                          <input type="number" value={item.price} onChange={(e) => updateLaborItem(idx, 'price', e.target.value)} className="w-28 bg-slate-50 py-2 px-2 text-right text-xs font-extrabold text-orange-600 outline-none" />
                       </div>
                    </div>
                    <div className="text-right">
                       <span className="text-[8px] font-black text-slate-300 uppercase">Subtotal</span>
                       <p className="font-mono font-extrabold text-slate-900 text-base">{settings.currency}{item.subtotal.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 2. MATERIALES NECESARIOS */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest italic flex items-center gap-3">
                 <Package size={18} className="text-[#3A7CA5]" /> 2. Materiales de Obra
               </h3>
               <span className="text-[10px] font-bold text-[#3A7CA5] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                 Estimado: {settings.currency}{subtotalMaterials.toLocaleString()}
               </span>
            </div>

            {/* Cargador de Materiales Personalizado */}
            <div className="bg-[#3A7CA5] p-8 rounded-[2.5rem] shadow-xl space-y-5">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <input type="text" value={matForm.name} onChange={(e) => setMatForm({...matForm, name: e.target.value})} placeholder="MATERIAL (EJ: CEMENTO LOMA NEGRA)" className="w-full !bg-white/10 !border-white/20 text-white px-6 py-4 rounded-xl font-bold uppercase text-xs placeholder:text-blue-100/40 outline-none" />
                 <div className="flex gap-2">
                    <input type="number" value={matForm.quantity} onChange={(e) => setMatForm({...matForm, quantity: e.target.value})} placeholder="CANT." className="w-20 !bg-white/10 !border-white/20 text-white py-4 rounded-xl font-bold text-center" />
                    <select value={matForm.unit} onChange={(e) => setMatForm({...matForm, unit: e.target.value})} className="flex-1 !bg-white/10 !border-white/20 text-white px-4 rounded-xl font-bold text-[10px] uppercase outline-none">
                       {['unidad', 'bolsa', 'm3', 'kg', 'litro', 'm2', 'placa'].map(u => <option key={u} value={u} className="text-slate-900">{u.toUpperCase()}</option>)}
                    </select>
                 </div>
               </div>
               <div className="flex gap-3">
                 <div className="flex items-center bg-white/10 rounded-xl px-4 flex-1">
                    <span className="text-blue-200 text-xs font-bold mr-3">$ UNIT.</span>
                    <input type="number" value={matForm.price} onChange={(e) => setMatForm({...matForm, price: e.target.value})} className="w-full bg-transparent text-white py-4 font-bold text-xl outline-none" />
                 </div>
                 <button onClick={addMaterial} className="bg-white text-[#3A7CA5] font-black px-8 py-4 rounded-xl uppercase tracking-tighter text-xs shadow-xl active:scale-95 transition-all">
                   + AGREGAR MATERIAL
                 </button>
               </div>
            </div>

            {/* Lista de Materiales */}
            <div className="space-y-4">
              {requiredMaterials.map((mat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[2rem] border-l-[6px] border-[#3A7CA5] soft-shadow animate-scale">
                   <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <p className="font-extrabold text-slate-900 uppercase text-xs mb-1">{mat.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{mat.unit}</p>
                    </div>
                    <button onClick={() => removeMaterial(idx)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex gap-4">
                       <div className="flex flex-col">
                          <span className="text-[8px] font-black text-slate-300 uppercase mb-1">CANT.</span>
                          <input type="number" value={mat.quantity} onChange={(e) => updateMaterialItem(idx, 'quantity', e.target.value)} className="w-16 bg-slate-50 py-2 px-1 text-center text-xs font-extrabold outline-none" />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[8px] font-black text-slate-300 uppercase mb-1">PRECIO EST.</span>
                          <input type="number" value={mat.price} onChange={(e) => updateMaterialItem(idx, 'price', e.target.value)} className="w-24 bg-slate-50 py-2 px-2 text-right text-xs font-extrabold text-[#3A7CA5] outline-none" />
                       </div>
                    </div>
                    <div className="text-right">
                       <span className="text-[8px] font-black text-slate-300 uppercase">Total Mat.</span>
                       <p className="font-mono font-extrabold text-slate-900 text-base">{settings.currency}{mat.subtotal.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkboxes de Configuración de Materiales */}
            <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 flex flex-wrap gap-8 justify-center">
               <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${materialsIncluded ? 'bg-[#3A7CA5] border-[#3A7CA5]' : 'bg-white border-slate-300'}`} onClick={() => setMaterialsIncluded(!materialsIncluded)}>
                    {materialsIncluded && <CheckCircle2 size={16} className="text-white" />}
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-600 tracking-tight">Incluir en el Presupuesto Total</span>
               </label>
               <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${clientBuysMaterials ? 'bg-orange-500 border-orange-500' : 'bg-white border-slate-300'}`} onClick={() => setClientBuysMaterials(!clientBuysMaterials)}>
                    {clientBuysMaterials && <CheckCircle2 size={16} className="text-white" />}
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-600 tracking-tight">Los materiales los compra el cliente</span>
               </label>
            </div>
          </section>
        </div>

        {/* 3. RESUMEN GENERAL (SIDEBAR) */}
        <div className="lg:col-span-4">
          <div className="bg-white p-10 rounded-[3.5rem] soft-shadow border border-slate-50 space-y-10 lg:sticky lg:top-24">
            <h3 className="text-xl font-extrabold flex items-center gap-4 tracking-tighter">
              <Calculator size={24} className="text-orange-500" /> Liquidación Obra
            </h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mano de Obra</span>
                <span className="font-mono font-extrabold text-base text-slate-900">{settings.currency}{subtotalLabor.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Materiales {!materialsIncluded && <span className="text-slate-300 italic text-[8px]">(No Inc.)</span>}</span>
                <span className={`font-mono font-extrabold text-base ${materialsIncluded ? 'text-slate-900' : 'text-slate-300 line-through'}`}>{settings.currency}{subtotalMaterials.toLocaleString()}</span>
              </div>
              
              <div className="space-y-3">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-3">
                   <TrendingDown size={14} className="text-rose-400" /> Ajuste / Redondeo
                 </label>
                 <input 
                    type="number" 
                    value={manualAdjustment} 
                    onChange={(e) => setManualAdjustment(parseFloat(e.target.value) || 0)} 
                    className="w-full !bg-slate-50 !border-transparent rounded-2xl px-6 py-4 font-extrabold text-rose-500 text-2xl text-center" 
                    placeholder="0.00" 
                 />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">IVA / GASTOS %</span>
                   <input type="number" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} className="w-full !bg-slate-50 !border-transparent rounded-2xl p-4 text-center font-extrabold text-slate-900" />
                </div>
                <div className="space-y-2">
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">DTO. GLOBAL %</span>
                   <input type="number" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} className="w-full !bg-slate-50 !border-transparent rounded-2xl p-4 text-center font-extrabold text-orange-500" />
                </div>
              </div>

              <div className="pt-10 text-right relative">
                <div className="absolute -top-3 right-0 bg-white px-4 text-[10px] font-black text-success-green uppercase tracking-[0.4em] italic">Total Final Certificado</div>
                <div className="bg-emerald-50 p-8 rounded-[2.5rem] border-2 border-emerald-100">
                  <p className="text-5xl font-extrabold text-success-green italic font-mono tracking-tighter leading-none">
                    {settings.currency}{totalValue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <button onClick={handleSave} className="btn-elite w-full bg-slate-900 text-white font-extrabold py-8 rounded-[2.5rem] shadow-2xl flex items-center justify-center gap-4 uppercase italic text-lg tracking-tight">
              <Save size={28} className="text-orange-500" />
              {initialBudget ? 'GUARDAR AJUSTES' : 'EMITIR PRESUPUESTO'}
            </button>
            <p className="text-[8px] text-center text-slate-300 font-bold uppercase tracking-widest px-4 leading-relaxed">
              * Los precios pueden variar según disponibilidad de stock y condiciones de mercado al momento de la compra.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetGenerator;
