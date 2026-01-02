import { CartItem } from '@/types/pharmacy';
import { CartRow } from './CartRow';
import { ShoppingCart } from 'lucide-react';

interface CartTableProps {
  items: CartItem[];
  onQuantityChange: (productId: number, quantity: number) => void;
  onSalePriceChange: (productId: number, salePrice: number) => void;
  onBatchChange: (productId: number, batch: string) => void;
  onExpiryChange: (productId: number, expiry: string) => void;
  onRemove: (productId: number) => void;
}

export function CartTable({
  items,
  onQuantityChange,
  onSalePriceChange,
  onBatchChange,
  onExpiryChange,
  onRemove,
}: CartTableProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <ShoppingCart className="h-16 w-16 mb-4 opacity-30" />
        <p className="text-lg font-medium">Cart is empty</p>
        <p className="text-sm">Search and add medicines to begin billing</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="pharmacy-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Drug</th>
            <th>Qty</th>
            <th>MRP</th>
            <th>Batch</th>
            <th>Expiry</th>
            <th>Sale Price</th>
            <th>Line Total</th>
            <th className="w-12"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <CartRow
              key={item.ProductID}
              item={item}
              onQuantityChange={onQuantityChange}
              onSalePriceChange={onSalePriceChange}
              onBatchChange={onBatchChange}
              onExpiryChange={onExpiryChange}
              onRemove={onRemove}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}