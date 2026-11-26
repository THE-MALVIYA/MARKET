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
          let icon = <Info className="w-4 h-4 text-[#00D69A]" />;
          let borderColor = 'border-[#00D69A]/50';
          let titleColor = 'text-[#00D69A]';

          if (toast.type === 'success') {
            icon = <CheckCircle2 className="w-4 h-4 text-[#00D69A]" />;
            borderColor = 'border-[#00D69A]/60';
            titleColor = 'text-[#00D69A]';
          } else if (toast.type === 'error') {
            icon = <AlertCircle className="w-4 h-4 text-red-400" />;
            borderColor = 'border-red-500/50';
            titleColor = 'text-red-300';
          } else if (toast.type === 'warning') {
            icon = <AlertTriangle className="w-4 h-4 text-[#E5B84B]" />;
            borderColor = 'border-[#E5B84B]/50';
            titleColor = 'text-[#E5B84B]';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.16 }}
              className={`pointer-events-auto rounded-xl border ${borderColor} bg-[#11161D]/95 p-3.5 shadow-2xl backdrop-blur-md flex items-start gap-3`}
            >
              <div className="flex-shrink-0 mt-0.5">{icon}</div>
              <div className="flex-1 pr-2">
                <h4 className={`text-xs font-semibold ${titleColor}`}>
                  {toast.title}
                </h4>
                {toast.message && (
                  <p className="text-[11px] text-[#8F9CA8] mt-0.5 leading-relaxed">
                    {toast.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-[#8F9CA8] hover:text-[#F4F7F6] p-0.5 cursor-pointer"
                aria-label="Dismiss notification"
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
