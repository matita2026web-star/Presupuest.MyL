import React, { useState, useRef, useEffect } from 'react';
import { Save, Building2, User, Mail, Phone, MapPin, Percent, DollarSign, Image, HardHat, Info, Upload, Trash2, CheckCircle2 } from 'lucide-react';
import { BusinessSettings } from '../types';

interface SettingsProps {
  settings: BusinessSettings;
  onUpdate: (settings: BusinessSettings) => void;
}

const SettingsView: React.FC<SettingsProps> = ({ settings, onUpdate }) => {
  // Inicialización segura para evitar errores de "undefined"
  const [form, setForm] = useState<BusinessSettings>({
    name: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    logoUrl: '',
    currency: 'ARS',
    defaultTax: 0,
    ...settings // Sobrescribe con los datos reales si existen
  });

  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincronizar el formulario si los settings cargan después del render inicial
  useEffect(() => {
    if (settings) {
      setForm(prev => ({ ...prev, ...settings }));
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (opcional pero recomendado para localStorage/DB)
      if (file.size > 1024 * 1024) {
        alert("El logo es muy pesado. Intenta con uno de menos de 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setForm({ ...form, logoUrl: '' });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto pb-20">
      <div className="mb-12 flex items-center justify-between">
        <div>
           <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">
             Perfil Corporativo <span className="text-orange-500">PRO</span>
           </h2>
           <p className="text-slate-500 font-medium text-lg mt-2">Personalice la identidad de su constructora en todos los documentos.</p>
        </div>
        <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-orange-500 shadow-xl shadow-slate-200">
           <HardHat size={40} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* COLUMNA IZQUIERDA: IDENTIDAD */}
          <div className="bg-white p-10 rounded-[2.5rem] border-2 border-slate-100 shadow-sm space-y-8 relative overflow-hidden">
            <h3 className="font-black text-xl flex items-center gap-3 text-slate-900 uppercase italic tracking-tighter">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-slate-900">
                 <Building2 size={18} />
              </div>
              Identidad de Empresa
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logotipo Profesional</label>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-32 h-32 rounded-3xl bg-slate-50 border-4 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative group transition-all hover:border-orange-200">
                    {form.logoUrl ? (
                      <>
                        <img src={form.logoUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={removeLogo}
                          className="absolute inset-0 bg-red-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 font-black text-[9px] uppercase"
                        >
                          <Trash2 size={20} /> Quitar
                        </button>
                      </>
                    ) : (
                      <Image size={32} className="text-slate-200" />
                    )}
                  </div>
                  <div className="flex-1 space-y-3 w-full">
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-slate-900 hover:bg-orange-600 text-white px-6 py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase italic tracking-tight transition-all shadow-lg"
                    >
                      <Upload size={18} className="text-orange-400" />
                      Subir Imagen
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <p className="text-[10px] text-slate-400 text-center sm:text-left leading-tight uppercase font-bold">
                      Formatos: JPG, PNG. Máx 1MB.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de la Constructora</label>
                <div className="relative">
                  <input 
                    type="text" 
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-12 pr-6 py-5 rounded-2xl border-2 border-slate-100 focus:border-orange-500 font-black uppercase italic outline-none transition-all bg-slate-50/50 focus:bg-white"
                    placeholder="EJ: ALFA CONSTRUCCIONES"
                  />
                  <Building2 size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Responsable Técnico</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={form.ownerName}
                    onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                    className="w-full pl-12 pr-6 py-5 rounded-2xl border-2 border-slate-100 focus:border-orange-500 font-bold outline-none transition-all bg-slate-50/50 focus:bg-white"
                    placeholder="Nombre del Ingeniero/Arquitecto"
                  />
                  <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: CONTACTO Y FINANZAS */}
          <div className="bg-[#1e293b] text-white p-10 rounded-[2.5rem] shadow-2xl space-y-8 relative overflow-hidden border-t-8 border-orange-500">
            <h3 className="font-black text-xl flex items-center gap-3 text-orange-500 uppercase italic tracking-tighter">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-900">
                 <DollarSign size={18} />
              </div>
              Parámetros de Obra
            </h3>
            
            <div className="space-y-6 relative z-10">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Moneda Local</label>
                  <input 
                    type="text" 
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
                    className="w-full px-6 py-5 rounded-2xl bg-slate-800 border-2 border-slate-700 focus:border-orange-500 text-orange-400 font-black text-center outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">IVA / Impuesto %</label>
                  <input 
                    type="number" 
                    value={form.defaultTax}
                    onChange={(e) => setForm({ ...form, defaultTax: parseFloat(e.target.value) || 0 })}
                    className="w-full px-6 py-5 rounded-2xl bg-slate-800 border-2 border-slate-700 focus:border-orange-500 text-orange-400 font-black text-center outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp de Contacto</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full pl-12 pr-6 py-5 rounded-2xl bg-slate-800 border-2 border-slate-700 focus:border-orange-500 font-bold outline-none transition-all"
                    placeholder="+54 9..."
                  />
                  <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dirección de Oficina</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full pl-12 pr-6 py-5 rounded-2xl bg-slate-800 border-2 border-slate-700 focus:border-orange-500 font-bold outline-none transition-all"
                    placeholder="Ubicación física"
                  />
                  <MapPin size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                </div>
              </div>
            </div>

            {/* Decoración de fondo para la tarjeta oscura */}
            <div className="absolute -bottom-10 -right-10 opacity-5 rotate-12">
               <Building2 size={200} />
            </div>
          </div>
        </div>

        {/* BARRA DE ACCIÓN */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-white p-8 rounded-[2rem] border-2 border-slate-100 shadow-xl gap-6">
          <div className="flex items-center gap-4 text-slate-500 max-w-lg">
             <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Info size={24} className="text-orange-500" />
             </div>
             <p className="text-xs font-bold uppercase tracking-tight italic leading-tight">
               Los cambios se aplicarán a todos los presupuestos nuevos y exportaciones PDF existentes.
             </p>
          </div>
          <button 
            type="submit"
            className={`w-full md:w-auto flex items-center justify-center gap-4 px-12 py-5 rounded-2xl font-black transition-all shadow-xl uppercase italic tracking-tight active:scale-95 ${
              saved 
              ? 'bg-emerald-500 text-white shadow-emerald-200' 
              : 'bg-orange-600 hover:bg-slate-900 text-white shadow-orange-200'
            }`}
          >
            {saved ? <CheckCircle2 size={24} /> : <Save size={24} />}
            {saved ? 'DATOS SINCRONIZADOS' : 'GUARDAR CONFIGURACIÓN'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsView;
