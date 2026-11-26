import React from 'react';
import { useMarket } from '../context/MarketContext';
import { ProductLiveVisual } from './ProductLiveVisual';
import { X, Trash2, ShoppingCart, ArrowRight, ShieldCheck } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    setActiveTab
  } = useMarket();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    setActiveTab('checkout');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/82 flex justify-end">
      <div className="dsk-surface w-full max-w-md border-l border-[#2C3C50] h-full flex flex-col justify-between relative">
        <div className="p-4 border-b border-[#253445] flex items-center justify-between bg-[#090E15]">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-[#00D69A]" />
            <h3 className="font-semibold text-sm text-white">
              Licensing Cart <span className="font-mono text-[#00D69A] tabular-nums">({cart.length})</span>
            </h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="dsk-btn-secondary-3d p-1.5 rounded-lg text-[#CBD5E1] hover:text-white cursor-pointer"
            aria-label="Close Cart"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#CBD5E1]">
              <div className="dsk-icon-3d w-12 h-12 rounded-xl flex items-center justify-center text-[#CBD5E1] mb-3">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <p className="text-sm text-white font-semibold">Your Licensing Cart is Empty</p>
              <p className="text-xs text-[#CBD5E1] mt-1 max-w-xs">
                Select Deephat platforms or developer infrastructure suites from the catalog.
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setActiveTab('products');
                }}
                className="dsk-btn-3d mt-4 px-4 py-2 rounded-lg text-xs cursor-pointer"
              >
                Explore Products
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="dsk-panel-3d p-3 rounded-xl flex items-center gap-3"
              >
                <ProductLiveVisual product={item.product} compact className="w-14 h-14 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-xs text-white truncate">
                      {item.product.name}
                    </h4>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-[#CBD5E1] hover:text-red-400 p-1 transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-[11px] font-mono text-[#00D69A] mt-0.5 tabular-nums">
                    {item.product.price.toLocaleString()} USDT
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="dsk-btn-secondary-3d w-6 h-6 rounded font-mono text-xs flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono text-xs text-white min-w-5 text-center tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="dsk-btn-secondary-3d w-6 h-6 rounded font-mono text-xs flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                    <span className="text-[11px] font-mono text-[#CBD5E1] ml-auto tabular-nums">
                      {(item.product.price * item.quantity).toLocaleString()} USDT
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t border-[#253445] bg-[#090E15]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-[#CBD5E1]">Total Due:</span>
              <span className="font-mono font-bold text-lg text-white tabular-nums">
                {cartTotal.toLocaleString()} <span className="text-xs text-[#00D69A]">USDT</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={clearCart}
                className="dsk-btn-secondary-3d py-2.5 px-3 rounded-lg text-xs cursor-pointer"
              >
                Clear Cart
              </button>
              <button
                onClick={handleCheckout}
                className="dsk-btn-3d py-2.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#CBD5E1] mt-3 justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00D69A]" />
              <span>USDT TRC-20 On-Chain Verification</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
