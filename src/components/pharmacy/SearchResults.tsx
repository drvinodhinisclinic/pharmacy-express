import { Product } from '@/types/pharmacy';

interface SearchResultsProps {
  results: Product[];
  selectedIndex: number;
  onSelect: (product: Product) => void;
  isVisible: boolean;
}

export function SearchResults({ results, selectedIndex, onSelect, isVisible }: SearchResultsProps) {
  if (!isVisible || results.length === 0) return null;

  return (
    <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto scrollbar-thin animate-fade-in">
      {results.map((product, index) => (
        <div
          key={product.ProductID}
          className={`px-4 py-3 cursor-pointer border-b border-border last:border-b-0 transition-colors ${
            index === selectedIndex
              ? 'bg-primary/10 border-l-4 border-l-primary'
              : 'hover:bg-muted/50'
          }`}
          onClick={() => onSelect(product)}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">
                {product.ProductName}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {product.Drug}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-medium text-primary">
                ₹{parseFloat(product.unitPrice).toFixed(2)}/unit
              </p>
              <p className="text-xs text-muted-foreground">
                MRP: ₹{parseFloat(product.MRP).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}