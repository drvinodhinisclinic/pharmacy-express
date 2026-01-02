import { useMemo } from 'react';
import { CartItem } from '@/types/pharmacy';
import { Receipt, Package, IndianRupee } from 'lucide-react';

interface BillingSummaryProps {
  items: CartItem[];
  onProcessBill: () => void;
  isProcessing: boolean;
}

export function BillingSummary({ items, onProcessBill, isProcessing }: BillingSummaryProps) {
  const { totalItems, subtotal } = useMemo(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.salePrice, 0);
    return { totalItems, subtotal };
  }, [items]);

  const isEmpty = items.length === 0;

  return (
    <div className="sticky bottom-0 bg-card border-t border-border shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Stats */}
          <div className="flex items-center gap-6 md:gap-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Package className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Items</p>
                <p className="text-xl font-bold text-foreground">{items.length}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Qty</p>
                <p className="text-xl font-bold text-foreground">{totalItems}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <IndianRupee className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Grand Total</p>
                <p className="text-2xl font-bold text-success">₹{subtotal.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          {/* Process Button */}
          <button
            onClick={onProcessBill}
            disabled={isEmpty || isProcessing}
            className="pharmacy-btn-primary min-w-48 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <span className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Receipt className="h-5 w-5" />
                Process Bill
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}