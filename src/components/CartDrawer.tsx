import React from 'react';
import { useMarket } from '../context/MarketContext';
import { X, Trash2, ShoppingCart, ArrowRight, ShieldCheck } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { isCartOpen, setIsCartOpen, cart, updateQuantity, removeFromCart, clearCart, cartTotal, setActiveTab } = useMarket();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false);
    setActiveTab('checkout');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-[#080c14] border-l border-cyan-500/30 h-full flex flex-col justify-between shadow-2xl relative">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-cyan-400" />
            <h3 className="font-mono font-bold text-sm text-slate-100">
              TOOL CART ({cart.length})
            </h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 font-mono">
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mb-3">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-400 font-medium">Your session cart is empty</p>
              <p className="text-xs text-slate-600 mt-1 max-w-xs">
                Select developer toolkits and security software modules from the marketplace catalog.
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setActiveTab('marketplace');
                }}
                className="mt-4 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono hover:bg-cyan-500/30 transition-colors cursor-pointer"
              >
                Explore Toolkits
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="p-3 rounded-xl bg-[#0d121c] border border-slate-800 flex items-center gap-3 relative group"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-lg object-cover bg-black flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-mono font-bold text-xs text-slate-200 truncate">
                      {item.product.name}
                    </h4>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-[11px] font-mono text-cyan-400 mt-0.5">
                    {item.product.price} USDT
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono text-xs text-slate-300 min-w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                    <span className="text-[10px] font-mono text-slate-500 ml-auto">
                      Sub: {(item.product.price * item.quantity).toFixed(0)} USDT
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Summary */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-[#06090e]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-mono text-slate-400">Total Amount:</span>
              <span className="font-mono font-extrabold text-lg text-emerald-400">
                {cartTotal} USDT
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={clearCart}
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-mono text-xs transition-colors cursor-pointer"
              >
                Clear Cart
              </button>
              <button
                onClick={handleCheckout}
                className="py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
              >
                <span>Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 mt-3 justify-center">
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
              <span>Direct USDT Settlement // TRC-20 Network</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
