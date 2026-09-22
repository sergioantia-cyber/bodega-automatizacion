import React from 'react';
import { Plus, Check, Heart, AlertTriangle } from 'lucide-react';
import { Product } from '../types';
import { TactileCard } from './ui/TactileCard';
import { TactileButton } from './ui/TactileButton';
import { Badge } from './ui/Badge';

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  isFavorite?: boolean;
  onAddToCart: (product: Product) => void;
  onToggleFavorite?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantityInCart,
  isFavorite = false,
  onAddToCart,
  onToggleFavorite
}) => {
  const isOutOfStock = product.stock <= 0 || !product.inStock;
  const isLowStock = !isOutOfStock && product.stock <= (product.minStock || 3);

  return (
    <TactileCard className="flex flex-col justify-between overflow-hidden relative p-3">
      {/* Badges superiores */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 items-start">
        {isOutOfStock ? (
          <Badge variant="coral">Agotado</Badge>
        ) : isLowStock ? (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-slate-900 bg-amber-400 text-slate-950 text-[10px] font-black uppercase shadow-tactile-sm">
            <AlertTriangle className="w-2.5 h-2.5" />
            <span>Pocas: {product.stock}</span>
          </span>
        ) : product.tag ? (
          <Badge variant={product.tag === 'OFERTA' ? 'coral' : 'lime'}>
            {product.tag}
          </Badge>
        ) : null}
      </div>

      {/* Botón Favorito ❤️ */}
      {onToggleFavorite && (
        <button
          type="button"
          onClick={() => onToggleFavorite(product.id)}
          title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          aria-label="Marcar favorito"
          className="absolute top-4 right-4 z-10 w-7 h-7 rounded-lg bg-white/90 dark:bg-slate-800/90 border border-slate-900 shadow-tactile-sm flex items-center justify-center active:translate-y-0.5 transition-transform"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite
                ? 'text-rose-500 fill-rose-500'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          />
        </button>
      )}

      {/* Product Image Frame */}
      <div className="w-full aspect-square rounded-xl bg-slate-100 dark:bg-slate-700/60 border-2 border-slate-900 overflow-hidden relative flex items-center justify-center p-2 mb-3 mt-1">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full object-contain filter drop-shadow-sm select-none transition-transform duration-200 hover:scale-105 ${
            isOutOfStock ? 'opacity-40 grayscale' : ''
          }`}
        />
        {quantityInCart > 0 && (
          <div className="absolute bottom-2 right-2 bg-slate-950 text-white border-2 border-white px-2 py-0.5 rounded-lg text-xs font-black shadow-tactile-sm flex items-center gap-1">
            <Check className="w-3 h-3 text-bogad-lime stroke-[3]" />
            <span>x{quantityInCart}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {product.unit}
            </span>
            {product.stock > 0 && (
              <span className="text-[10px] font-mono font-bold text-slate-400">
                Disp: {product.stock}
              </span>
            )}
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight line-clamp-2 mt-0.5 min-h-[2.5rem]">
            {product.name}
          </h3>
        </div>

        {/* Pricing & Button */}
        <div className="mt-3 pt-2 border-t-2 border-slate-900/10 dark:border-slate-700/60 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-black text-slate-950 dark:text-white">
                ${product.price.toFixed(2)}
              </span>
            </div>
            {product.originalPrice && (
              <span className="text-[11px] font-bold text-slate-400 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <TactileButton
            variant={isOutOfStock ? 'outline' : quantityInCart > 0 ? 'lime' : 'primary'}
            size="sm"
            disabled={isOutOfStock}
            onClick={() => onAddToCart(product)}
            className={`flex items-center gap-1 px-3 py-1.5 ${
              isOutOfStock ? 'opacity-40 cursor-not-allowed border-slate-400' : ''
            }`}
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>{isOutOfStock ? 'Agotado' : quantityInCart > 0 ? 'Más' : 'Pedir'}</span>
          </TactileButton>
        </div>
      </div>
    </TactileCard>
  );
};
