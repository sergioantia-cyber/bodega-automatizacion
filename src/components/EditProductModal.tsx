import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Package, Check } from 'lucide-react';
import { Product } from '../types';
import { TactileCard } from './ui/TactileCard';
import { TactileButton } from './ui/TactileButton';
import { CATEGORIES } from '../services/productData';
import { soundService } from '../services/soundService';

interface EditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProduct: Product) => void;
  onDelete?: (productId: string) => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState<Product['category']>('despensa');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [unit, setUnit] = useState('Unidad');
  const [stock, setStock] = useState('10');
  const [minStock, setMinStock] = useState('3');
  const [tag, setTag] = useState<string>('');
  const [inStock, setInStock] = useState<boolean>(true);
  const [image, setImage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setBarcode(product.barcode || '');
      setCategory(product.category || 'despensa');
      setPrice(product.price !== undefined ? product.price.toString() : '');
      setOriginalPrice(product.originalPrice !== undefined ? product.originalPrice.toString() : '');
      setUnit(product.unit || 'Unidad');
      setStock(product.stock !== undefined ? product.stock.toString() : '0');
      setMinStock(product.minStock !== undefined ? product.minStock.toString() : '3');
      setTag(product.tag || '');
      setInStock(product.inStock !== false);
      setImage(product.image || '');
      setShowDeleteConfirm(false);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handleStockDelta = (delta: number) => {
    const current = parseInt(stock) || 0;
    const next = Math.max(0, current + delta);
    setStock(next.toString());
    setInStock(next > 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || isNaN(Number(price))) return;

    const parsedPrice = parseFloat(Number(price).toFixed(2));
    const parsedOriginalPrice = originalPrice && !isNaN(Number(originalPrice))
      ? parseFloat(Number(originalPrice).toFixed(2))
      : undefined;
    const parsedStock = parseInt(stock) >= 0 ? parseInt(stock) : 0;
    const parsedMinStock = parseInt(minStock) >= 0 ? parseInt(minStock) : 3;

    const updated: Product = {
      ...product,
      name: name.trim(),
      barcode: barcode.trim() || undefined,
      category,
      price: parsedPrice,
      originalPrice: parsedOriginalPrice,
      unit: unit.trim() || 'Unidad',
      stock: parsedStock,
      minStock: parsedMinStock,
      inStock: inStock && parsedStock > 0,
      tag: tag.trim() || undefined,
      image: image.trim() || product.image
    };

    soundService.playSuccessChime();
    onSave(updated);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && product) {
      soundService.playWarning();
      onDelete(product.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <TactileCard variant="yellow" className="relative p-5 shadow-tactile-lg border-2 border-slate-950">
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-slate-950 border-2 border-slate-950 shadow-tactile-sm flex items-center justify-center font-black active:translate-y-0.5 hover:bg-slate-100"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>

          {/* Encabezado */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white border-2 border-slate-950 shadow-tactile-sm flex items-center justify-center overflow-hidden shrink-0">
              {image ? (
                <img src={image} alt={name} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              )}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-white border border-slate-900 rounded shadow-tactile-sm">
                Ficha y Edición de Producto
              </span>
              <h3 className="text-base font-black text-slate-950 leading-tight mt-0.5">
                {product.name}
              </h3>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 bg-white/95 p-3.5 rounded-xl border-2 border-slate-950 shadow-tactile-sm">
            {/* 1. Nombre del Producto */}
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                Nombre del Producto
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Gaseosa Cola 1.5L"
                className="w-full px-3 py-2 text-sm font-bold bg-slate-50 border-2 border-slate-900 rounded-lg shadow-tactile-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-bogad-yellow"
              />
            </div>

            {/* 2. Código de Barras y Categoría */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                  Código de Barras
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="7751234567890"
                    className="w-full px-2.5 py-1.5 font-mono text-xs font-bold bg-slate-50 border-2 border-slate-900 rounded-lg shadow-tactile-sm text-slate-900"
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
                  className="w-full px-2.5 py-1.5 text-xs font-bold bg-slate-50 border-2 border-slate-900 rounded-lg shadow-tactile-sm text-slate-900 cursor-pointer"
                >
                  {CATEGORIES.filter(c => c.id !== 'todos').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Precios y Presentación */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                  Precio ($)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.05"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-2 py-1.5 text-sm font-black bg-slate-50 border-2 border-slate-900 rounded-lg shadow-tactile-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                  P. Oferta / Antes
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.00"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="Opcional"
                  className="w-full px-2 py-1.5 text-sm font-bold bg-slate-50 border-2 border-slate-900 rounded-lg shadow-tactile-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                  Presentación
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="1.5L, 500g"
                  className="w-full px-2 py-1.5 text-xs font-bold bg-slate-50 border-2 border-slate-900 rounded-lg shadow-tactile-sm text-slate-900"
                />
              </div>
            </div>

            {/* 4. Control de Inventario y Stock */}
            <div className="p-3 bg-amber-50 rounded-xl border-2 border-amber-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-amber-950 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" />
                  <span>Existencias / Stock</span>
                </span>
                <span className={`text-xs font-black px-2 py-0.5 rounded border border-slate-900 ${
                  parseInt(stock) <= 0
                    ? 'bg-bogad-coral text-white'
                    : parseInt(stock) <= parseInt(minStock)
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-bogad-lime text-slate-950'
                }`}>
                  {parseInt(stock) <= 0
                    ? 'AGOTADO'
                    : parseInt(stock) <= parseInt(minStock)
                    ? 'STOCK BAJO'
                    : 'EN STOCK'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-black uppercase text-amber-900 mb-0.5">
                    Cantidad Disponible
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => {
                      setStock(e.target.value);
                      setInStock(parseInt(e.target.value) > 0);
                    }}
                    className="w-full px-2.5 py-1.5 text-base font-black bg-white border-2 border-slate-900 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-amber-900 mb-0.5">
                    Alerta Mínima
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-base font-black bg-white border-2 border-slate-900 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              {/* Botones de ajuste rápido de stock */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] font-black text-amber-950 uppercase mr-1">Rápido:</span>
                <button
                  type="button"
                  onClick={() => handleStockDelta(-1)}
                  className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-900 rounded text-xs font-black active:translate-y-0.5"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() => handleStockDelta(1)}
                  className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-900 rounded text-xs font-black active:translate-y-0.5"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => handleStockDelta(5)}
                  className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-900 rounded text-xs font-black active:translate-y-0.5"
                >
                  +5
                </button>
                <button
                  type="button"
                  onClick={() => handleStockDelta(10)}
                  className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-900 rounded text-xs font-black active:translate-y-0.5"
                >
                  +10
                </button>
              </div>
            </div>

            {/* 5. Etiquetas y Visibilidad */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                  Etiqueta Especial
                </label>
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-bold bg-slate-50 border-2 border-slate-900 rounded-lg text-slate-900 cursor-pointer"
                >
                  <option value="">(Ninguna)</option>
                  <option value="OFERTA">🔥 OFERTA</option>
                  <option value="NUEVO">✨ NUEVO</option>
                  <option value="POPULAR">⭐ POPULAR</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                  Estado
                </label>
                <button
                  type="button"
                  onClick={() => setInStock(!inStock)}
                  className={`w-full py-1.5 px-2 rounded-lg border-2 border-slate-900 text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-tactile-sm ${
                    inStock
                      ? 'bg-emerald-100 text-emerald-950 border-emerald-800'
                      : 'bg-rose-100 text-rose-950 border-rose-800'
                  }`}
                >
                  {inStock ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-700" />
                      <span>Activo / Visible</span>
                    </>
                  ) : (
                    <>
                      <X className="w-3.5 h-3.5 stroke-[3] text-rose-700" />
                      <span>Inactivo</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 6. URL de Imagen */}
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-700 mb-1">
                URL de Imagen
              </label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-50 border-2 border-slate-900 rounded-lg text-slate-900"
              />
            </div>

            {/* Botones de acción */}
            <div className="pt-2 flex gap-2">
              <TactileButton
                type="submit"
                variant="primary"
                size="sm"
                className="flex-1 bg-bogad-lime hover:bg-lime-300 text-slate-950 flex items-center justify-center gap-1.5 font-black py-2"
              >
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>Guardar Cambios</span>
              </TactileButton>

              <TactileButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={onClose}
                className="px-4"
              >
                Cancelar
              </TactileButton>
            </div>
          </form>

          {/* Zona de peligro: Eliminar producto */}
          {onDelete && (
            <div className="mt-3 pt-2 border-t border-slate-950/20 text-center">
              {showDeleteConfirm ? (
                <div className="p-2.5 bg-rose-100 border-2 border-rose-600 rounded-xl space-y-2">
                  <p className="text-xs font-black text-rose-950">
                    ¿Seguro que deseas eliminar "{product.name}"?
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-black border border-slate-950 shadow-tactile-sm"
                    >
                      Sí, Eliminar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1 bg-white text-slate-900 rounded-lg text-xs font-black border border-slate-900"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-xs font-black text-rose-800 hover:text-rose-950 underline flex items-center justify-center gap-1 mx-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar este producto del inventario</span>
                </button>
              )}
            </div>
          )}
        </TactileCard>
      </div>
    </div>
  );
};
