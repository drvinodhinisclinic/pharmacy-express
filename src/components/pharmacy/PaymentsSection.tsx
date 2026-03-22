import { useState, useEffect } from 'react';
import { Banknote, Smartphone, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import config, { getUrl } from '@/config/api';

export interface UpiDetails {
  utr: string;
  payerMobile: string;
  recordedById: string;
  recordedByName: string;
}

export interface PaymentDetails {
  cash: number;
  upi: number;
  upiDetails?: UpiDetails;
}

interface RecordedByUser {
  id: string;
  name: string;
}

interface PaymentsSectionProps {
  totalAmount: number;
  onPaymentChange: (payment: PaymentDetails, isValid: boolean) => void;
}

export function PaymentsSection({ totalAmount, onPaymentChange }: PaymentsSectionProps) {
  const [cashStr, setCashStr] = useState('');
  const [upiStr, setUpiStr] = useState('');
  const [error, setError] = useState<string | null>(null);

  // UPI detail fields
  const [utr, setUtr] = useState('');
  const [payerMobile, setPayerMobile] = useState('');
  const [recordedById, setRecordedById] = useState('');

  // Recorded-by dropdown data
  const [recordedByUsers, setRecordedByUsers] = useState<RecordedByUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const cash = parseFloat(cashStr) || 0;
  const upi = parseFloat(upiStr) || 0;
  const sum = Math.round((cash + upi) * 100) / 100;
  const roundedTotal = Math.round(totalAmount);
  const differenceAmount = Math.round(roundedTotal - sum);
  const hasUpi = upi > 0;

  // Fetch recorded-by users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const res = await fetch(getUrl('recordedByUsers'), { headers: config.headers });
        if (!res.ok) throw new Error('Failed to fetch recorded-by users');
        const data: RecordedByUser[] = await res.json();
        setRecordedByUsers(data);
      } catch (err) {
        console.error('Recorded-by users fetch error:', err);
        setRecordedByUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // Validation
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
      setError(`Payment total (₹${sum.toFixed(2)}) doesn't match bill (₹${roundedTotal.toFixed(2)}). ADD (₹${differenceAmount.toFixed(2)})`);
      onPaymentChange({ cash, upi }, false);
      return;
    }

    // UPI-specific validation
    if (hasUpi) {
      if (!utr || utr.trim().length < 8) {
        setError('UTR / Transaction Reference is required (min 8 characters)');
        onPaymentChange({ cash, upi }, false);
        return;
      }
      if (!/^[a-zA-Z0-9]+$/.test(utr.trim())) {
        setError('UTR must be alphanumeric');
        onPaymentChange({ cash, upi }, false);
        return;
      }
      if (!payerMobile.trim()) {
        setError('Payer mobile number & payment app is required');
        onPaymentChange({ cash, upi }, false);
        return;
      }
      if (!recordedById) {
        setError('Please select who recorded this payment');
        onPaymentChange({ cash, upi }, false);
        return;
      }
    }

    setError(null);
    const selectedUser = recordedByUsers.find(u => u.id === recordedById);
    const payment: PaymentDetails = {
      cash,
      upi,
      ...(hasUpi && {
        upiDetails: {
          utr: utr.trim(),
          payerMobile: payerMobile.trim(),
          recordedById,
          recordedByName: selectedUser?.name || '',
        },
      }),
    };
    onPaymentChange(payment, true);
  }, [cash, upi, totalAmount, utr, payerMobile, recordedById, recordedByUsers]);

  const fillCash = () => { setCashStr(roundedTotal.toFixed(2)); setUpiStr(''); };
  const fillUpi = () => { setUpiStr(roundedTotal.toFixed(2)); setCashStr(''); };

  return (
    <div className="space-y-4">
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
                onChange={(e) => setCashStr(e.target.value)}
                className="pl-7"
              />
            </div>
            <button type="button" onClick={fillCash} className="px-3 py-2 text-xs font-medium rounded-md bg-success/10 text-success hover:bg-success/20 transition-colors">
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
                onChange={(e) => setUpiStr(e.target.value)}
                className="pl-7"
              />
            </div>
            <button type="button" onClick={fillUpi} className="px-3 py-2 text-xs font-medium rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors">
              Full
            </button>
          </div>
        </div>
      </div>

      {/* UPI Detail Fields — only visible when UPI amount > 0 */}
      {hasUpi && (
        <div className="border border-border rounded-lg p-4 space-y-4 bg-muted/30">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-accent" />
            UPI Transaction Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* UTR */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                UTR / Transaction Ref <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. 412345678901"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                maxLength={40}
              />
              {utr.length > 0 && utr.length < 8 && (
                <p className="text-xs text-destructive">Min 8 characters</p>
              )}
            </div>

            {/* Payer Mobile & App */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Payer Mobile & App <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. 9876543210 - GPay"
                value={payerMobile}
                onChange={(e) => setPayerMobile(e.target.value)}
                maxLength={60}
              />
            </div>

            {/* Recorded By */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Recorded By <span className="text-destructive">*</span>
              </label>
              {isLoadingUsers ? (
                <div className="flex items-center gap-2 h-10 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                </div>
              ) : (
                <Select value={recordedById} onValueChange={setRecordedById}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select person" />
                  </SelectTrigger>
                  <SelectContent>
                    {recordedByUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>
      )}

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
