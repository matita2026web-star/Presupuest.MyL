import React, { useState } from 'react';
import { Search, Eye, Share2, Trash2, Send, Download, X, Calendar, User, FileCheck, HardHat, CheckCircle2, XCircle, Clock, Edit3 } from 'lucide-react';
import { Budget, BusinessSettings } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface BudgetHistoryProps {
  budgets: Budget[];
  settings: BusinessSettings;
  onEdit: (budget: Budget) => void; // Nueva prop para editar
  onDelete: (budgetId: string) => void; // Nueva prop para borrar
}

const BudgetHistory: React.FC<BudgetHistoryProps> = ({ budgets, settings, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  const filtered = budgets.filter(b => b.client.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // ... (Función generatePDF y sendWhatsApp se mantienen igual)
  const generatePDF = (budget: Budget) => {
    const doc = new jsPDF();
    const margin = 20;
    
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 50, 'F');
    
    doc.setFillColor(249, 115, 22);
    doc.rect(0, 50, 210, 3, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(settings.name.toUpperCase(), margin, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${settings.ownerName} | ${settings.phone}`, margin, 34);
    doc.text(settings.address || '', margin, 39);

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('COTIZACIÓN DE OBRA', 210 - margin - 60, 25, { align: 'right' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Expediente: ${budget.id}`, 210 - margin, 34, { align: 'right' });

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENTE / PROYECTO:', margin, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(budget.client.name, margin, 72);
    doc.text(`Tel: ${budget.client.phone}`, margin, 78);

    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN TÉCNICA:', 210 - margin - 60, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha Emisión: ${new Date(budget.date).toLocaleDateString()}`, 210 - margin - 60, 72);
    doc.text(`Vencimiento: ${new Date(budget.validUntil).toLocaleDateString()}`, 210 - margin - 60, 78);

    autoTable(doc, {
      startY: 90,
      margin: { left: margin, right: margin },
      head: [['Descripción de Rubros / Materiales', 'Unid.', 'Cant.', 'Precio Unit.', 'Total Rubro']],
      body: budget.items.map(i => [
        i.name,
        i.unit,
        i.quantity,
        `${settings.currency}${i.price.toLocaleString()}`,
        `${settings.currency}${i.subtotal.toLocaleString()}`
      ]),
      headStyles: { fillColor: [30, 41, 59], fontStyle: 'bold', textColor: [249, 115, 22] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 9, cellPadding: 5 },
    });

    const finalY = (doc as any).lastAutoTable.finalY;

    const rightOffset = 140;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Subtotal:', rightOffset, finalY + 15);
    doc.setFont('helvetica', 'normal');
    doc.text(`${settings.currency}${budget.subtotal.toLocaleString()}`, 210 - margin, finalY + 15, { align: 'right' });
    
    if (budget.discount > 0) {
      doc.text(`Bonificación (${budget.discount}%):`, rightOffset, finalY + 22);
      const discVal = (budget.subtotal * budget.discount) / 100;
      doc.text(`-${settings.currency}${discVal.toLocaleString()}`, 210 - margin, finalY + 22, { align: 'right' });
    }

    if (budget.taxRate > 0) {
      doc.text(`IVA (${budget.taxRate}%):`, rightOffset, finalY + 29);
      const taxVal = ((budget.subtotal * (1 - budget.discount / 100)) * budget.taxRate) / 100;
      doc.text(`${settings.currency}${taxVal.toLocaleString()}`, 210 - margin, finalY + 29, { align: 'right' });
    }

    doc.setFillColor(249, 115, 22);
    doc.rect(rightOffset - 5, finalY + 35, 210 - margin - rightOffset + 10, 14, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('TOTAL:', rightOffset, finalY + 44);
    doc.text(`${settings.currency}${budget.total.toLocaleString()}`, 210 - margin, finalY + 44, { align: 'right' });

    if (budget.client.observations) {
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('OBSERVACIONES:', margin, finalY + 60);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(budget.client.observations, margin, finalY + 66, { maxWidth: 170 });
    }

    doc.save(`${budget.id}_${budget.client.name.replace(/\s+/g, '_')}.pdf`);
  };

  const sendWhatsApp = (b: Budget) => {
    const text = `👷 *${settings.name.toUpperCase()} - PRESUPUESTO*\n\nHola *${b.client.name}*, envío cotización adjunta.\n\n🏗️ *ID:* ${b.id}\n💰 *Monto:* ${settings.currency}${b.total.toLocaleString()}\n🗓️ *Vence:* ${new Date(b.validUntil).toLocaleDateString()}\n\nFavor de confirmar aceptación para iniciar obra.`;
    window.open(`https://wa.me/${b.client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este presupuesto? Esta acción no se puede deshacer.')) {
      onDelete(id);
      setSelectedBudget(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Historial de <span className="text-orange-500">Obras</span></h2>
          <p className="text-slate-500 font-medium">Búsqueda y gestión de presupuestos emitidos.</p>
        </div>
        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder="Buscar por cliente o proyecto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-orange-500 outline-none font-bold transition-all"
          />
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(b => (
          <div key={b.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
            {/* Botón de Borrado Rápido */}
            <button 
              onClick={() => handleDelete(b.id)}
              className="absolute top-4 right-4 z-20 p-2 text-slate-300 hover:text-red-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>

            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-orange-50 transition-colors"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-900 bg-orange-500 px-3 py-1 rounded-lg uppercase tracking-widest italic">{b.id}</span>
                  {b.status === 'aceptado' ? (
                    <span className="flex items-center gap-1 text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase tracking-tighter">
                      <CheckCircle2 size={10} /> Aceptado
                    </span>
                  ) : b.status === 'rechazado' ? (
                    <span className="flex items-center gap-1 text-[8px] font-black text-red-600 bg-red-50 px-2 py-1 rounded-full uppercase tracking-tighter">
                      <XCircle size={10} /> Rechazado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[8px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-full uppercase tracking-tighter">
                      <Clock size={10} /> Pendiente
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-8">{new Date(b.date).toLocaleDateString()}</span>
              </div>
              
              <div className="mb-8">
                <h4 className="text-xl font-black text-slate-900 leading-tight truncate uppercase italic">{b.client.name}</h4>
                <div className="flex items-center gap-2 text-slate-400 mt-2">
                  <Calendar size={12} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-tighter">Vence: {new Date(b.validUntil).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-50 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Costo Total</p>
                  <p className="text-3xl font-black text-slate-900 leading-none mt-1 italic">{settings.currency}${b.total.toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onEdit(b)}
                    className="p-3 bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-xl transition-all"
                    title="Editar Presupuesto"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => setSelectedBudget(b)}
                    className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            <div className="p-10 border-t-8 border-orange-500">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-900 bg-orange-500 px-4 py-2 rounded-lg uppercase tracking-[0.2em] italic">{selectedBudget.id}</span>
                    <span className={`text-[10px] font-black uppercase px-4 py-2 rounded-full ${selectedBudget.status === 'aceptado' ? 'bg-emerald-100 text-emerald-600' : selectedBudget.status === 'rechazado' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                      Estado: {selectedBudget.status}
                    </span>
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 mt-6 uppercase italic tracking-tighter">{selectedBudget.client.name}</h3>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Expediente Técnico de Obra</p>
                </div>
                <div className="flex gap-2">
                   <button 
                    onClick={() => handleDelete(selectedBudget.id)}
                    className="p-4 text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                  >
                    <Trash2 size={24} />
                  </button>
                  <button onClick={() => setSelectedBudget(null)} className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all"><X size={28} /></button>
                </div>
              </div>

              {/* ... (Sección de información técnica y tabla se mantienen igual) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contacto</p>
                  <p className="font-black text-slate-800 uppercase italic tracking-tighter">{selectedBudget.client.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emisión</p>
                  <p className="font-black text-slate-800 uppercase italic tracking-tighter">{new Date(selectedBudget.date).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Responsable</p>
                  <p className="font-black text-slate-800 uppercase italic tracking-tighter">{settings.ownerName || 'ADMIN'}</p>
                </div>
              </div>

              <div className="bg-slate-900 rounded-3xl overflow-hidden mb-12 shadow-xl shadow-slate-900/20 max-h-[300px] overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-800 sticky top-0 z-10">
                    <tr className="text-[10px] font-black text-orange-400 uppercase tracking-widest">
                      <th className="px-10 py-5">Descripción</th>
                      <th className="px-10 py-5 text-center">Cant.</th>
                      <th className="px-10 py-5 text-right">Unitario</th>
                      <th className="px-10 py-5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-white">
                    {selectedBudget.items.map((i, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-10 py-6">
                          <p className="font-black uppercase italic tracking-tighter">{i.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{i.unit}</p>
                        </td>
                        <td className="px-10 py-6 text-center font-black text-slate-400">{i.quantity}</td>
                        <td className="px-10 py-6 text-right font-bold text-slate-500">{settings.currency}${i.price.toLocaleString()}</td>
                        <td className="px-10 py-6 text-right font-black text-white text-lg">{settings.currency}${i.subtotal.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-10 border-t-2 border-slate-100">
                <div className="bg-slate-50 p-6 rounded-3xl flex items-center gap-10 border border-slate-200">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal Obra</span>
                      <span className="font-black text-slate-900 text-xl italic">{settings.currency}${selectedBudget.subtotal.toLocaleString()}</span>
                   </div>
                   <div className="w-0.5 h-12 bg-slate-200"></div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bonificación</span>
                      <span className="font-black text-red-600 text-xl italic">-${((selectedBudget.subtotal * selectedBudget.discount) / 100).toLocaleString()}</span>
                   </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-black text-orange-600 uppercase tracking-[0.3em] mb-2 italic">Total Presupuestado</p>
                  <h5 className="text-7xl font-black text-slate-900 tracking-tighter italic">{settings.currency}${selectedBudget.total.toLocaleString()}</h5>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-4 mt-16">
                <button 
                  onClick={() => { onEdit(selectedBudget); setSelectedBudget(null); }}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-black px-8 py-6 rounded-2xl shadow-xl flex items-center gap-4 transition-all active:scale-95 uppercase italic tracking-tight"
                >
                  <Edit3 size={24} />
                  Editar
                </button>
                <button 
                  onClick={() => generatePDF(selectedBudget)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-black px-8 py-6 rounded-2xl shadow-xl flex items-center gap-4 transition-all active:scale-95 uppercase italic tracking-tight"
                >
                  <Download size={24} />
                  PDF
                </button>
                 <button 
                  onClick={() => sendWhatsApp(selectedBudget)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-6 rounded-2xl shadow-xl flex items-center gap-4 transition-all active:scale-95 uppercase italic tracking-tight"
                >
                  <Send size={24} />
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetHistory;
