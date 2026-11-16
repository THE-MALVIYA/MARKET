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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-[#060806] border-l border-[#223022] h-full flex flex-col justify-between shadow-2xl relative">
        {/* Header */}
        <div className="p-4 border-b border-[#1c261c] flex items-center justify-between bg-[#080b08]">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-emerald-400" />
            <h3 className="font-mono font-bold text-sm text-zinc-100">
              ESCROW CART [{cart.length}]
            </h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#121812] transition-colors cursor-pointer"
            aria-label="Close Cart"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500 font-mono">
              <div className="w-12 h-12 bg-[#0b0e0b] border border-[#1f291f] flex items-center justify-center text-zinc-600 mb-3">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <p className="text-sm text-zinc-300 font-medium">Escrow Cart Empty</p>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                Select security toolkits or infrastructure packages from the onion directory.
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setActiveTab('marketplace');
                }}
                className="mt-4 px-4 py-2 bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 text-xs font-mono hover:bg-emerald-500/25 transition-colors cursor-pointer"
              >
                Browse Directory
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="p-3 bg-[#090c09] border border-[#1c261c] flex items-center gap-3 relative"
              >
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 object-cover bg-black border border-[#1f291f] flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-mono font-bold text-xs text-zinc-100 truncate">
                      {item.product.name}
                    </h4>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-zinc-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-[11px] font-mono text-emerald-400 mt-0.5 tabular-nums">
                    {item.product.price.toLocaleString()} USDT
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 bg-[#111711] hover:bg-[#1a221a] border border-[#243024] text-zinc-200 font-mono text-xs flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono text-xs text-zinc-200 min-w-5 text-center tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 bg-[#111711] hover:bg-[#1a221a] border border-[#243024] text-zinc-200 font-mono text-xs flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                    <span className="text-[11px] font-mono text-zinc-500 ml-auto tabular-nums">
                      Sub: {(item.product.price * item.quantity).toLocaleString()} USDT
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Summary */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-[#1c261c] bg-[#040504]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-mono text-zinc-400">Escrow Total:</span>
              <span className="font-mono font-bold text-lg text-emerald-400 tabular-nums">
                {cartTotal.toLocaleString()} USDT
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={clearCart}
                className="py-2.5 px-3 bg-[#0c100c] hover:bg-[#141a14] border border-[#222c22] text-zinc-400 hover:text-zinc-200 font-mono text-xs transition-colors cursor-pointer"
              >
                Clear Cart
              </button>
              <button
                onClick={handleCheckout}
                className="py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 mt-3 justify-center">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>USDT TRC-20 Escrow Protection</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
