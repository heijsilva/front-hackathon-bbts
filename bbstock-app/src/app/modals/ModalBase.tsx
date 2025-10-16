'use client';

import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: number;
};

export default function ModalBase({
  open, onClose, title, subtitle, children, footer, maxWidth = 760,
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px] flex items-center justify-center"
      onMouseDown={(e) => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog" aria-modal="true"
    >
      <div
        className="w-full bg-white border border-[#E6ECFF] rounded-2xl shadow-[0_20px_60px_rgba(15,23,42,0.18)] overflow-hidden"
        style={{ maxWidth }}
      >
        <div className="flex items-start justify-between px-5 py-4 border-b border-[#EEF2FF] bg-[#F8FAFF]">
          <div>
            <h3 className="text-[16px] font-semibold text-[#0F1A2B]">{title}</h3>
            {subtitle && <p className="text-[13px] text-[#6E7BA6] mt-0.5">{subtitle}</p>}
          </div>
          <button
            ref={closeBtnRef}
            className="inline-flex items-center gap-1 rounded-lg border border-[#DDE7FF] px-3 py-2 text-[#0F2C93] hover:bg-[#EEF3FF]"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={16} />
            Fechar
          </button>
        </div>

        <div className="px-5 py-5 max-h-[68vh] overflow-auto">{children}</div>

        {footer && (
          <div className="px-5 py-4 border-t border-[#EEF2FF] bg-[#FAFBFF] flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}