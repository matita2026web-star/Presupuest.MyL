
import React, { useState } from 'react';
import { 
  Search, Trash2, Send, Download, Calendar, 
  Clock, AlertCircle, Edit3, ChevronRight, Compass, FileText
} from 'lucide-react';
import { Budget, BusinessSettings, BudgetStatus } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface BudgetHistoryProps {
  budgets: Budget[];
  settings: BusinessSettings;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: BudgetStatus) => void;
  onEdit: (budget: Budget) => void;
}

const BudgetHistory: React.FC<BudgetHistoryProps> = ({ budgets, settings, onDelete, onUpdateStatus, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BudgetStatus | 'todos'>('todos');

  const filtered = budgets.filter(b => {
    const matchesSearch = b.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const generatePDF = (budget: Budget) => {
    try {
      const doc = new jsPDF();
      const margin = 20;
      const pageWidth = doc.internal.pageSize.width;
      
      // Header Arquitectura
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 60, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text(settings.name?.toUpperCase() || 'MI EMPRESA', margin, 30);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(`${settings.ownerName.toUpperCase()}`, margin, 38);
      doc.text(`TEL: ${settings.phone} | DIR: ${settings.address.toUpperCase()}`, margin, 44);

      doc.setTextColor(249, 115, 22);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('COTIZACIÓN PROFESIONAL', pageWidth - margin, 30, { align: 'right' });
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text(`EXPEDIENTE: ${budget.id}`, pageWidth - margin, 40, { align: 'right' });

      // Info Proyecto
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMEN TÉCNICO:', margin, 75);
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, 78, pageWidth - margin, 78);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`CLIENTE: ${budget.client.name.toUpperCase()}`, margin, 88);
      doc.text(`EMISIÓN: ${new Date(budget.date).toLocaleDateString()}`, pageWidth - margin, 88, { align: 'right' });
      doc.text(`VALIDEZ HASTA: ${new Date(budget.validUntil).toLocaleDateString()}`, pageWidth - margin, 94, { align: 'right' });

      // TABLA 1: MANO DE OBRA
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(249, 115, 22);
      doc.text('1. MANO DE OBRA Y SERVICIOS TÉCNICOS', margin, 105);
      
      autoTable(doc, {
        startY: 108,
        margin: { left: margin, right: margin },
        head: [['DESCRIPCIÓN DEL TRABAJO', 'UNID.', 'CANT.', 'UNITARIO', 'SUBTOTAL']],
        body: budget.items.map(i => [
          i.name.toUpperCase(),
          i.unit.toUpperCase(),
          i.quantity.toFixed(2),
          `${settings.currency}${i.price.toLocaleString()}`,
          `${settings.currency}${i.subtotal.toLocaleString()}`
        ]),
        headStyles: { fillColor: [249, 115, 22], textColor: [255, 255, 255], fontSize: 9, halign: 'center' },
        styles: { fontSize: 8.5, cellPadding: 5 },
        columnStyles: { 0: { cellWidth: 'auto' }, 4: { halign: 'right', fontStyle: 'bold' } }
      });

      let finalY = (doc as any).lastAutoTable.finalY + 15;

      // TABLA 2: MATERIALES
      if (budget.requiredMaterials.length > 0) {
        if (finalY + 40 > doc.internal.pageSize.height) { doc.addPage(); finalY = margin; }
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(58, 124, 165); // Steel Blue
        doc.text('2. MATERIALES E INSUMOS NECESARIOS', margin, finalY);
        
        autoTable(doc, {
          startY: finalY + 3,
          margin: { left: margin, right: margin },
          head: [['MATERIAL / INSUMO', 'UNID.', 'CANT.', 'UNIT. ESTIM.', 'SUBTOTAL']],
          body: budget.requiredMaterials.map(m => [
            m.name.toUpperCase(),
            m.unit.toUpperCase(),
            m.quantity.toFixed(2),
            `${settings.currency}${m.price.toLocaleString()}`,
            `${settings.currency}${m.subtotal.toLocaleString()}`
          ]),
          headStyles: { fillColor: [58, 124, 165], textColor: [255, 255, 255], fontSize: 9, halign: 'center' },
          styles: { fontSize: 8.5, cellPadding: 5 },
          columnStyles: { 0: { cellWidth: 'auto' }, 4: { halign: 'right', fontStyle: 'bold' } }
        });
        finalY = (doc as any).lastAutoTable.finalY + 15;
      }

      // RESUMEN FINAL
      if (finalY + 70 > doc.internal.pageSize.height) { doc.addPage(); finalY = margin; }
      
      const sumX = 110;
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text('TOTAL MANO DE OBRA:', sumX, finalY);
      doc.text(`${settings.currency}${budget.subtotalLabor.toLocaleString()}`, pageWidth - margin, finalY, { align: 'right' });

      doc.text(`TOTAL MATERIALES (${budget.materialsIncluded ? 'Incluidos' : 'No Incluidos'}):`, sumX, finalY + 8);
      doc.text(`${settings.currency}${budget.subtotalMaterials.toLocaleString()}`, pageWidth - margin, finalY + 8, { align: 'right' });

      if (budget.discount > 0) {
        doc.text(`DESCUENTO GLOBAL (${budget.discount}%):`, sumX, finalY + 16);
        doc.text(`-${settings.currency}${( (budget.subtotalLabor + (budget.materialsIncluded ? budget.subtotalMaterials : 0)) * budget.discount / 100).toLocaleString()}`, pageWidth - margin, finalY + 16, { align: 'right' });
      }

      // Caja Total Final (Verde)
      doc.setFillColor(52, 199, 89); // success-green
      doc.rect(sumX - 5, finalY + 22, pageWidth - margin - sumX + 10, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL GENERAL:', sumX, finalY + 35);
      doc.text(`${settings.currency}${budget.total.toLocaleString()}`, pageWidth - margin, finalY + 35, { align: 'right' });

      // Notas al pie
      doc.setTextColor(150);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('Nota: Esta cotización contempla solo lo detallado en las tablas superiores.', margin, finalY + 55);
      if (budget.clientBuysMaterials) {
        doc.text('* Los materiales quedan a cargo exclusivo del cliente/comitente.', margin, finalY + 60);
      }

      doc.save(`PresuBuild_${budget.id}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Error al exportar PDF PresuBuild PRO.");
    }
  };

  const sendWhatsApp = (b: Budget) => {
    const text = `👷 *${settings.name.toUpperCase()} - PresuBuild PRO*
📋 *COTIZACIÓN DE OBRA*
🏗️ *Proyecto:* ${b.client.name.toUpperCase()}
📄 *Expediente:* ${b.id}
💰 *TOTAL:* ${settings.currency}${b.total.toLocaleString()}
_Válido hasta el ${new Date(b.validUntil).toLocaleDateString()}._`;
    window.open(`https://wa.me/${b.client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const statusColors = {
    aceptado: 'text-emerald-600 bg-emerald-50',
    rechazado: 'text-rose-600 bg-rose-50',
    pendiente: 'text-orange-600 bg-orange-50'
  };

  return (
    <div className="space-y-12 animate-scale pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-50 pb-12">
        <div>
          <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tighter leading-none mb-4">Archivo Histórico</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Gestión Centralizada de Proyectos</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <input 
            type="text" 
            placeholder="BUSCAR EXPEDIENTE..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="px-6 py-5 bg-slate-50 border-transparent rounded-[1.5rem] text-xs font-extrabold uppercase outline-none focus:bg-white w-full sm:w-80 soft-shadow" 
          />
          <div className="flex bg-slate-50 rounded-2xl p-2 soft-shadow">
             {(['todos', 'pendiente', 'aceptado', 'rechazado'] as const).map(f => (
               <button key={f} onClick={() => setStatusFilter(f)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${statusFilter === f ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400'}`}>{f}</button>
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(b => (
          <div key={b.id} className="bg-white rounded-[3rem] border border-slate-50 soft-shadow overflow-hidden flex flex-col group hover:scale-[1.02] transition-all">
            <div className="p-10 flex-1">
              <div className="flex justify-between items-start mb-8">
                <span className="text-[10px] font-black bg-slate-900 text-orange-500 px-4 py-2 rounded-xl font-mono tracking-tighter shadow-lg">{b.id}</span>
                <div className="relative group/status">
                  <span className={`text-[9px] font-black uppercase px-4 py-2 rounded-full ${statusColors[b.status]}`}>{b.status}</span>
                  <div className="absolute right-0 top-full mt-3 bg-white shadow-2xl rounded-2xl p-3 hidden group-hover/status:block z-30 border border-slate-50 w-36 animate-scale">
                    {(['pendiente', 'aceptado', 'rechazado'] as BudgetStatus[]).map(s => (
                      <button key={s} onClick={() => onUpdateStatus(b.id, s)} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase text-slate-400 hover:text-orange-500 rounded-xl transition-colors">{s}</button>
                    ))}
                  </div>
                </div>
              </div>
              
              <h4 className="text-2xl font-extrabold text-slate-900 uppercase italic truncate tracking-tighter mb-4">{b.client.name}</h4>
              
              <div className="flex items-center gap-6 text-[10px] font-bold text-slate-300 uppercase mb-10 pb-6 border-b border-slate-50">
                <div className="flex items-center gap-2"><Calendar size={14} /> {new Date(b.date).toLocaleDateString()}</div>
                <div className={`flex items-center gap-2 ${new Date(b.validUntil) < new Date() ? 'text-rose-500' : ''}`}><Clock size={14} /> {new Date(b.validUntil).toLocaleDateString()}</div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[9px] font-bold text-slate-300 uppercase mb-2 tracking-widest">Total Certificado</p>
                  <p className="text-3xl font-extrabold text-success-green font-mono tracking-tighter leading-none">{settings.currency}{b.total.toLocaleString()}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => onEdit(b)} className="w-12 h-12 bg-slate-900 text-white rounded-2xl hover:bg-orange-500 transition-all flex items-center justify-center shadow-xl"><Edit3 size={20}/></button>
                  <button onClick={() => generatePDF(b)} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-orange-500 transition-all flex items-center justify-center"><Download size={20}/></button>
                  <button onClick={() => sendWhatsApp(b)} className="w-12 h-12 bg-emerald-500 text-white rounded-2xl hover:scale-110 transition-all flex items-center justify-center shadow-lg"><Send size={20}/></button>
                </div>
              </div>
            </div>
            <button onClick={() => { if(confirm('¿BORRAR EXPEDIENTE?')) onDelete(b.id) }} className="w-full py-5 bg-slate-50/50 text-[10px] font-bold text-slate-200 uppercase hover:text-rose-500 transition-all border-t border-slate-50">Eliminar Expediente</button>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="py-40 text-center opacity-10 flex flex-col items-center">
           <Compass size={80} />
           <p className="text-sm font-black uppercase tracking-[0.5em] mt-6">Archivo Vacío</p>
        </div>
      )}
    </div>
  );
};

export default BudgetHistory;
