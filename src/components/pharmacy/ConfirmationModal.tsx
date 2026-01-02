import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  totalAmount: number;
  totalItems: number;
}

export function ConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
  totalAmount,
  totalItems,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-card rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 animate-slide-up">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-warning/10 rounded-full">
            <AlertTriangle className="h-6 w-6 text-warning" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">
              Confirm Bill Processing
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You are about to process a bill with:
            </p>
            <ul className="mt-3 space-y-1 text-sm">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Total Items:</span>
                <span className="font-medium text-foreground">{totalItems}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Grand Total:</span>
                <span className="font-bold text-primary">₹{totalAmount.toFixed(2)}</span>
              </li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              This action cannot be undone. Do you want to proceed?
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="pharmacy-btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="pharmacy-btn-primary"
          >
            Confirm & Bill
          </button>
        </div>
      </div>
    </div>
  );
}