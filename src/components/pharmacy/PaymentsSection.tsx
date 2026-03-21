import { useState, useEffect } from 'react';
import { Banknote, Smartphone } from 'lucide-react';
import { Input } from '@/components/ui/input';

export interface PaymentDetails {
  cash: number;
  upi: number;
}

interface PaymentsSectionProps {
  totalAmount: number;
  onPaymentChange: (payment: PaymentDetails, isValid: boolean) => void;
}

export function PaymentsSection({ totalAmount, onPaymentChange }: PaymentsSectionProps) {
  const [cashStr, setCashStr] = useState('');
  const [upiStr, setUpiStr] = useState('');
  const [error, setError] = useState<string | null>(null);

  const cash = parseFloat(cashStr) || 0;
  const upi = parseFloat(upiStr) || 0;
  const sum = Math.round((cash + upi) * 100) / 100;
  const roundedTotal = Math.round(totalAmount * 100) / 100;

  useEffect(() => {
    if (totalAmount === 0) {
      setError(null);
      onPaymentChange({ cash: 0, upi: 0 }, false);
      return;
    }

    if (cash === 0 && upi === 0) {
      setError('Enter at least one payment amount');
      onPaymentChange({ cash, upi }, false);
      return;
    }

    if (sum !== roundedTotal) {
      setError(`Payment total (₹${sum.toFixed(2)}) doesn't match bill (₹${roundedTotal.toFixed(2)})`);
      onPaymentChange({ cash, upi }, false);
      return;
    }

    setError(null);
    onPaymentChange({ cash, upi }, true);
  }, [cash, upi, totalAmount]);

  // Auto-fill the other field when one is entered
  const handleCashChange = (val: string) => {
    setCashStr(val);
    // If user clears cash, don't auto-fill UPI
  };

  const handleUpiChange = (val: string) => {
    setUpiStr(val);
  };

  // Quick-fill: set full amount to cash or UPI
  const fillCash = () => {
    setCashStr(roundedTotal.toFixed(2));
    setUpiStr('');
  };

  const fillUpi = () => {
    setUpiStr(roundedTotal.toFixed(2));
    setCashStr('');
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cash Input */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Banknote className="h-4 w-4 text-success" />
            Cash Amount
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={cashStr}
                onChange={(e) => handleCashChange(e.target.value)}
                className="pl-7"
              />
            </div>
            <button
              type="button"
              onClick={fillCash}
              className="px-3 py-2 text-xs font-medium rounded-md bg-success/10 text-success hover:bg-success/20 transition-colors"
            >
              Full
            </button>
          </div>
        </div>

        {/* UPI Input */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-accent" />
            UPI Amount
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={upiStr}
                onChange={(e) => handleUpiChange(e.target.value)}
                className="pl-7"
              />
            </div>
            <button
              type="button"
              onClick={fillUpi}
              className="px-3 py-2 text-xs font-medium rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
            >
              Full
            </button>
          </div>
        </div>
      </div>

      {/* Validation message */}
      {error && totalAmount > 0 && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Payment summary */}
      {(cash > 0 || upi > 0) && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {cash > 0 && <span>Cash: ₹{cash.toFixed(2)}</span>}
          {upi > 0 && <span>UPI: ₹{upi.toFixed(2)}</span>}
          <span className={sum === roundedTotal ? 'text-success font-medium' : 'text-destructive font-medium'}>
            Total: ₹{sum.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}
