'use client';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50 p-4 backdrop-blur-sm transition-all"
      onClick={onClose}
    >
      <div 
        className="bg-surface w-full max-w-lg rounded-t-3xl md:rounded-3xl p-6 shadow-level-3 overflow-y-auto max-h-[90vh] animate-in slide-in-from-bottom md:zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-extrabold text-on-surface tracking-tight">
            {title}
          </h2>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center text-secondary hover:text-on-surface hover:bg-surface-container-low rounded-full transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
