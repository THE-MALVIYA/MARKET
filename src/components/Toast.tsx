import React from 'react';
import { useMarket } from '../context/MarketContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useMarket();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          let icon = <Info className="w-4 h-4 text-cyan-400" />;
          let borderColor = 'border-cyan-500/40';
          let bgColor = 'bg-[#0a0f19]/95';
          let textColor = 'text-cyan-300';

          if (toast.type === 'success') {
            icon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
            borderColor = 'border-emerald-500/40';
            textColor = 'text-emerald-300';
          } else if (toast.type === 'error') {
            icon = <AlertCircle className="w-4 h-4 text-red-400" />;
            borderColor = 'border-red-500/40';
            textColor = 'text-red-300';
          } else if (toast.type === 'warning') {
            icon = <AlertTriangle className="w-4 h-4 text-amber-400" />;
            borderColor = 'border-amber-500/40';
            textColor = 'text-amber-300';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto rounded-xl border ${borderColor} ${bgColor} p-3.5 shadow-2xl backdrop-blur-md flex items-start gap-3 relative overflow-hidden`}
            >
              <div className="flex-shrink-0 mt-0.5">{icon}</div>
              <div className="flex-1 pr-4">
                <h4 className={`text-xs font-mono font-bold ${textColor}`}>
                  {toast.title}
                </h4>
                {toast.message && (
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    {toast.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-500 hover:text-slate-300 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
