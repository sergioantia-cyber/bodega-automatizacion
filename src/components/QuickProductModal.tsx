import React, { useState } from 'react';
import { X, Sparkles, PlusCircle } from 'lucide-react';
import { Product } from '../types';
import { TactileCard } from './ui/TactileCard';
import { TactileButton } from './ui/TactileButton';
import { CATEGORIES } from '../services/productData';
import { soundService } from '../services/soundService';

interface QuickProductModalProps {
  barcode: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
}

export const QuickProductModal: React.FC<QuickProductModalProps> = ({
  barcode,
  isOpen,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [minStock, setMinStock] = useState('3');
  const [category, setCategory] = useState<Product['category']>('despensa');
  const [unit, setUnit] = useState('Unidad');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || isNaN(Number(price))) return;

    const stockNum = parseInt(stock) >= 0 ? parseInt(stock) : 0;
    const minStockNum = parseInt(minStock) >= 0 ? parseInt(minStock) : 3;

    const newProduct: Product = {
      id: `p-${Date.now()}`,
      barcode: barcode.trim(),
      name: name.trim(),
      price: parseFloat(Number(price).toFixed(2)),
      category,
      unit: unit.trim() || 'Unidad',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80',
      tag: 'NUEVO',
      inStock: stockNum > 0,
      stock: stockNum,
      minStock: minStockNum
    };

    soundService.playSuccessChime();
    onSave(newProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md animate-in zoom-in-95 duration-200">
        <TactileCard variant="yellow" className="relative p-5 shadow-tactile-lg border-2 border-slate-950">
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Cerrar formulario"
            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-slate-950 border-2 border-slate-950 shadow-tactile-sm flex items-center justify-center font-black active:translate-y-0.5 active:shadow-none hover:bg-slate-100 transition-all"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>

          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white border-2 border-slate-950 shadow-tactile-sm flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-950 leading-tight">
                Producto No Registrado
              </h3>
              <p className="text-xs font-bold text-slate-800">
                Código: <span className="font-mono bg-white/80 px-1.5 py-0.5 rounded border border-slate-900">{barcode}</span>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 bg-white/95 p-3.5 rounded-xl border-2 border-slate-950 shadow-tactile-sm">
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                Nombre del Producto
              </label>
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Galleta Rellena Vainilla"
                className="w-full px-3 py-2 text-sm font-bold bg-slate-50 border-2 border-slate-900 rounded-lg shadow-tactile-sm focus:outline-none focus:ring-2 focus:ring-bogad-yellow text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                  Precio ($)
                </label>
                <input
                  type="number"
                  step="0.10"
                  min="0.10"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-sm font-bold bg-slate-50 border-2 border-slate-900 rounded-lg shadow-tactile-sm focus:outline-none focus:ring-2 focus:ring-bogad-yellow text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                  Presentación / Unidad
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="Unidad, 500g, 1L"
                  className="w-full px-3 py-2 text-sm font-bold bg-slate-50 border-2 border-slate-900 rounded-lg shadow-tactile-sm focus:outline-none focus:ring-2 focus:ring-bogad-yellow text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Product['category'])}
                className="w-full px-3 py-2 text-sm font-bold bg-slate-50 border-2 border-slate-900 rounded-lg shadow-tactile-sm focus:outline-none focus:ring-2 focus:ring-bogad-yellow text-slate-900 cursor-pointer"
              >
                {CATEGORIES.filter(c => c.id !== 'todos').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-amber-50/80 p-2 rounded-lg border border-amber-200">
              <div>
                <label className="block text-[10px] font-black uppercase text-amber-950 mb-0.5">
                  Stock Inicial
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="10"
                  className="w-full px-2.5 py-1.5 text-sm font-black bg-white border-2 border-slate-900 rounded-lg shadow-tactile-sm focus:outline-none focus:ring-2 focus:ring-bogad-yellow text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-amber-950 mb-0.5">
                  Alerta Stock Bajo (Mín.)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                  placeholder="3"
                  className="w-full px-2.5 py-1.5 text-sm font-black bg-white border-2 border-slate-900 rounded-lg shadow-tactile-sm focus:outline-none focus:ring-2 focus:ring-bogad-yellow text-slate-900"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <TactileButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={onClose}
                className="w-1/3"
              >
                Cancelar
              </TactileButton>

              <TactileButton
                type="submit"
                variant="primary"
                size="sm"
                className="w-2/3 bg-bogad-lime hover:bg-lime-300 flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                <span>Guardar y Agregar</span>
              </TactileButton>
            </div>
          </form>
        </TactileCard>
      </div>
    </div>
  );
};
