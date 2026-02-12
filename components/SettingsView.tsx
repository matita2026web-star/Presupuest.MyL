
import React, { useState, useRef } from 'react';
import { 
  Save, Building2, User, Phone, MapPin, 
  DollarSign, Image, HardHat, Upload
} from 'lucide-react';
import { BusinessSettings } from '../types';

interface SettingsProps {
  settings: BusinessSettings;
  onUpdate: (settings: BusinessSettings) => void;
}

const SettingsView: React.FC<SettingsProps> = ({ settings, onUpdate }) => {
  const [form, setForm] = useState<BusinessSettings>(settings);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm({ ...form, logoUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Business Identity */}
        <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
               <Building2 size={16} />
             </div>
             <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Identidad Corporativa</h3>
          </div>
          
          <div className="flex flex-col items-center gap-4">
             <div className="w-32 h-32 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : <Image size={32} className="text-slate-300" />}
             </div>
             <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[10px] font-bold text-indigo-600 uppercase border border-indigo-200 px-4 py-2 rounded-full">Cambiar Logo</button>
             <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial</label>
              <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Responsable Técnico</label>
              <input type="text" value={form.ownerName} onChange={(e) => setForm({...form, ownerName: e.target.value})} className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold" />
            </div>
          </div>
        </section>

        {/* Contact & Config */}
        <section className="bg-slate-900 p-6 rounded-3xl text-white space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
               <DollarSign size={16} />
             </div>
             <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-300">Configuración Técnica</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
               <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Símbolo Moneda</label>
               <input type="text" value={form.currency} onChange={(e) => setForm({...form, currency: e.target.value})} className="w-full bg-slate-800 border border-slate-700 px-4 py-3 rounded-xl text-center text-indigo-400 font-bold" />
             </div>
             <div className="space-y-1">
               <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">IVA / Gastos %</label>
               <input type="number" value={form.defaultTax} onChange={(e) => setForm({...form, defaultTax: parseFloat(e.target.value) || 0})} className="w-full bg-slate-800 border border-slate-700 px-4 py-3 rounded-xl text-center text-indigo-400 font-bold" />
             </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-xl">
               <Phone size={16} className="text-indigo-400"/>
               <input type="text" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="Teléfono" className="bg-transparent outline-none flex-1 text-xs font-bold" />
            </div>
            <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-xl">
               <MapPin size={16} className="text-indigo-400"/>
               <input type="text" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} placeholder="Dirección Fiscal" className="bg-transparent outline-none flex-1 text-xs font-bold" />
            </div>
          </div>
        </section>

        <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform uppercase text-sm tracking-widest">
           {saved ? 'DATOS GUARDADOS ✓' : 'GUARDAR CAMBIOS'}
        </button>
      </form>
    </div>
  );
};

export default SettingsView;
