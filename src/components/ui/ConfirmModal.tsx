import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

export type ConfirmVariant = 'danger' | 'warning' | 'primary';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  icon?: React.ReactNode;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'danger',
  icon,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la confirmation :', error);
    } finally {
      setLoading(false);
    }
  };

  const variantStyles = {
    danger: {
      iconBg: 'bg-red-500/10 border-red-500/20 text-red-400',
      btn: 'bg-red-600 hover:bg-red-500 shadow-red-600/20',
      defaultIcon: <Trash2 className="w-6 h-6" />,
    },
    warning: {
      iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      btn: 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20',
      defaultIcon: <AlertTriangle className="w-6 h-6" />,
    },
    primary: {
      iconBg: 'bg-primary-500/10 border-primary-500/20 text-primary-400',
      btn: 'bg-primary-600 hover:bg-primary-500 shadow-primary-600/20',
      defaultIcon: <AlertTriangle className="w-6 h-6" />,
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-slate-800 border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl text-slate-100 relative">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl border ${currentVariant.iconBg} shrink-0`}>
            {icon || currentVariant.defaultIcon}
          </div>
          <div className="space-y-1.5 flex-1 pr-4">
            <h3 className="text-lg font-bold text-white leading-snug">{title}</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex justify-end items-center gap-3 pt-6 mt-4 border-t border-slate-700/60">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs sm:text-sm font-medium transition disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2.5 rounded-xl text-white text-xs sm:text-sm font-semibold transition shadow-lg flex items-center gap-2 disabled:opacity-50 ${currentVariant.btn}`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{loading ? 'Action en cours...' : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
