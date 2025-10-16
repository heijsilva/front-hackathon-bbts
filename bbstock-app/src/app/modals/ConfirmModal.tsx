'use client';

import ModalBase from './ModalBase';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  loading?: boolean;
};

export default function ConfirmModal({
  open, onClose, title = 'Confirmação',
  message, confirmText = 'Confirmar', cancelText = 'Cancelar',
  onConfirm, loading
}: Props) {
  return (
    <ModalBase open={open} onClose={onClose} title={title}>
      <p style={{ color:'#334155' }}>{message}</p>
      <div className="bb-modal-footer">
        <button className="bb-btn-ghost" onClick={onClose} disabled={loading}>{cancelText}</button>
        <button className="bb-btn" onClick={onConfirm} disabled={loading}>
          {loading ? 'Processando...' : confirmText}
        </button>
      </div>
    </ModalBase>
  );
}