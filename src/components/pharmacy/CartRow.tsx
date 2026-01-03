import { CartItem } from '@/types/pharmacy';
import { Trash2 } from 'lucide-react';

interface CartRowProps {
  item: CartItem;
  onQuantityChange: (cartId: string, quantity: number) => void;
  onSalePriceChange: (cartId: string, salePrice: number) => void;
  onBatchChange: (cartId: string, batch: string) => void;
  onExpiryChange: (cartId: string, expiry: string) => void;
  onRemove: (cartId: string) => void;
}

export function CartRow({
  item,
  onQuantityChange,
  onSalePriceChange,
  onBatchChange,
  onExpiryChange,
  onRemove,
}: CartRowProps) {
  const lineTotal = item.quantity * item.salePrice;

  return (
    <tr className="group">
      <td className="font-medium">{item.ProductName}</td>
      <td className="text-muted-foreground text-xs max-w-32 truncate">{item.Drug}</td>
      <td>
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) => onQuantityChange(item.cartId, Math.max(1, parseInt(e.target.value) || 1))}
          className="w-16 px-2 py-1 text-center border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </td>
      <td className="text-muted-foreground">₹{parseFloat(item.MRP).toFixed(2)}</td>
      <td>
        <input
          type="text"
          value={item.Batch}
          onChange={(e) => onBatchChange(item.cartId, e.target.value)}
          placeholder="Batch"
          className="w-24 px-2 py-1 text-xs border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </td>
      <td>
        <input
          type="date"
          value={item.expiryDate}
          onChange={(e) => onExpiryChange(item.cartId, e.target.value)}
          className="w-32 px-2 py-1 text-xs border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </td>
      <td>
        <input
          type="number"
          step="0.01"
          min="0"
          value={item.salePrice}
          onChange={(e) => onSalePriceChange(item.cartId, parseFloat(e.target.value) || 0)}
          className="w-20 px-2 py-1 text-center border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </td>
      <td className="font-semibold text-primary">₹{lineTotal.toFixed(2)}</td>
      <td>
        <button
          onClick={() => onRemove(item.cartId)}
          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
          title="Remove item"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}