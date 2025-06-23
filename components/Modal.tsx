import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode; // e.g., buttons
}

/**
 * Modal is a reusable, accessible dialog component.
 * - open: whether the modal is visible
 * - onClose: function to close the modal
 * - title: optional modal title
 * - children: modal content
 * - actions: optional footer actions (e.g., buttons)
 */
const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Close on outside click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Don't render if not open
  if (!open) return null;

  // Render modal in a portal (best practice for overlays)
  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-2 animate-fade-in">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          >
            &times;
          </button>
        </div>
        <div className="px-4 py-4">{children}</div>
        {actions && (
          <div className="px-4 py-3 border-t flex justify-end gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
