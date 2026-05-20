import React from "react";
import { MdOutlineInventory2, MdRefresh } from "react-icons/md";
import { useTranslation } from "../../../../../../node_modules/react-i18next";

interface EmptyStateProps { label: string; }

export const EmptyState: React.FC<EmptyStateProps> = ({ label }) => {
  const { t } = useTranslation();
  return (
    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 bg-[var(--bg-card)] rounded-full flex items-center justify-center mb-6 border border-[var(--border-main)] text-[var(--text-dim)]">
        <MdOutlineInventory2 size={40} />
      </div>
      <h3 className="text-[var(--text-main)] text-xl font-bold uppercase tracking-tighter">
        {t('common.no_found', { label })}
      </h3>
      <p className="text-[var(--text-muted)] text-sm mt-2 max-w-xs">
        {t('common.start_adding', { label: label.toLowerCase() })}
      </p>
    </div>
  );
};

export const LoadingState: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin mb-4" />
      <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest animate-pulse">
        {t('common.establishing_connection')}
      </p>
    </div>
  );
};

interface ErrorStateProps { label: string; onRetry: () => void; }

export const ErrorState: React.FC<ErrorStateProps> = ({ label, onRetry }) => {
  const { t } = useTranslation();
  return (
    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 text-red-500">
        <MdRefresh size={32} className="animate-spin-slow" />
      </div>
      <h3 className="text-red-500 text-xl font-black uppercase tracking-tighter">{t('common.sync_failed')}</h3>
      <p className="text-[var(--text-muted)] text-sm mt-2 max-w-xs">
        {t('common.sync_failed_desc')}
      </p>
      <button onClick={onRetry} className="mt-6 px-6 py-2.5 bg-red-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-500/20">
        {t('common.retry_sync')}
      </button>
    </div>
  );
};
