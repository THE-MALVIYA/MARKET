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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-[#11161D] border-l border-[#1E2936] h-full flex flex-col justify-between shadow-2xl relative">
        <div className="p-4 border-b border-[#1E2936] flex items-center justify-between bg-[#0D1116]">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-[#00D69A]" />
            <h3 className="font-semibold text-sm text-[#F4F7F6]">
              Licensing Cart <span className="font-mono text-[#00D69A] tabular-nums">({cart.length})</span>
            </h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-lg text-[#8F9CA8] hover:text-[#F4F7F6] hover:bg-[#11161D] transition-colors cursor-pointer"
            aria-label="Close Cart"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#8F9CA8]">
              <div className="w-12 h-12 rounded-xl bg-[#0D1116] border border-[#1E2936] flex items-center justify-center text-[#8F9CA8] mb-3">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <p className="text-sm text-[#F4F7F6] font-semibold">Your Licensing Cart is Empty</p>
              <p className="text-xs text-[#8F9CA8] mt-1 max-w-xs">
                Select Deephat platforms or developer infrastructure suites from the catalog.
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setActiveTab('products');
                }}
                className="mt-4 px-4 py-2 rounded-lg bg-[#00D69A]/15 text-[#00D69A] border border-[#00D69A]/40 text-xs font-semibold hover:bg-[#00D69A]/25 transition-colors cursor-pointer"
              >
                Explore Products
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="p-3 rounded-xl bg-[#0D1116] border border-[#1E2936] flex items-center gap-3"
              >
                <ProductLiveVisual product={item.product} compact className="w-14 h-14 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-xs text-[#F4F7F6] truncate">
                      {item.product.name}
                    </h4>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-[#8F9CA8] hover:text-red-400 p-1 transition-colors cursor-pointer"
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
                      className="w-6 h-6 rounded bg-[#11161D] hover:bg-[#151C24] border border-[#1E2936] text-[#F4F7F6] font-mono text-xs flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono text-xs text-[#F4F7F6] min-w-5 text-center tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 rounded bg-[#11161D] hover:bg-[#151C24] border border-[#1E2936] text-[#F4F7F6] font-mono text-xs flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                    <span className="text-[11px] font-mono text-[#8F9CA8] ml-auto tabular-nums">
                      {(item.product.price * item.quantity).toLocaleString()} USDT
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 border-t border-[#1E2936] bg-[#0D1116]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-[#8F9CA8]">Total Due:</span>
              <span className="font-mono font-bold text-lg text-[#F4F7F6] tabular-nums">
                {cartTotal.toLocaleString()} <span className="text-xs text-[#00D69A]">USDT</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={clearCart}
                className="py-2.5 px-3 rounded-lg bg-[#11161D] hover:bg-[#151C24] border border-[#1E2936] text-[#8F9CA8] hover:text-[#F4F7F6] font-medium text-xs transition-colors cursor-pointer"
              >
                Clear Cart
              </button>
              <button
                onClick={handleCheckout}
                className="py-2.5 px-3 rounded-lg bg-[#00D69A] hover:bg-[#0EA5A4] text-[#07090B] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#8F9CA8] mt-3 justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00D69A]" />
              <span>USDT TRC-20 On-Chain Verification</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
