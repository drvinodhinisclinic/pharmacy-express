import { Search, Loader2 } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  isLoading: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
}

export function SearchBar({ value, onChange, onFocus, isLoading, inputRef }: SearchBarProps) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        {isLoading ? (
          <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
        ) : (
          <Search className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder="Search Medicine (min 2 characters)..."
        className="pharmacy-input pl-12 pr-4 text-lg"
        autoComplete="off"
      />
    </div>
  );
}