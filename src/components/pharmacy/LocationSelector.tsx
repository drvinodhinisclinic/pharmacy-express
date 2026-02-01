import { useState, useEffect } from 'react';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export interface Location {
  LocationID: number;
  LocationName: string;
}

interface LocationSelectorProps {
  selectedLocation: Location | null;
  onLocationSelect: (location: Location | null) => void;
  isLocked: boolean;
  onConfirmChange: () => void;
}

export function LocationSelector({
  selectedLocation,
  onLocationSelect,
  isLocked,
  onConfirmChange,
}: LocationSelectorProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingLocationId, setPendingLocationId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          'http://192.168.0.103:3000/api/productmgmt/locations',
          { headers: { 'ngrok-skip-browser-warning': 'true' } }
        );
        if (!response.ok) {
          throw new Error('Failed to fetch locations');
        }
        const result = await response.json();
        const locationData: Location[] = result.data || [];
        
        if (locationData.length === 0) {
          setError('No locations available');
          setLocations([]);
          return;
        }
        
        setLocations(locationData);
        
        // Auto-select if only one location
        if (locationData.length === 1) {
          onLocationSelect(locationData[0]);
        }
      } catch (err) {
        console.error('Location fetch error:', err);
        setError('Failed to load locations. Please refresh.');
        setLocations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const handleValueChange = (value: string) => {
    if (isLocked) {
      // Show confirmation dialog
      setPendingLocationId(value);
      setShowConfirmDialog(true);
      return;
    }
    
    const location = locations.find((l) => l.LocationID.toString() === value);
    onLocationSelect(location || null);
  };

  const handleConfirmChange = () => {
    setShowConfirmDialog(false);
    onConfirmChange(); // Clear cart
    
    if (pendingLocationId) {
      const location = locations.find((l) => l.LocationID.toString() === pendingLocationId);
      onLocationSelect(location || null);
    }
    setPendingLocationId(null);
  };

  const handleCancelChange = () => {
    setShowConfirmDialog(false);
    setPendingLocationId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
        <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
        <span className="text-sm text-muted-foreground">Loading locations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <span className="text-sm text-destructive">{error}</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <Select
          value={selectedLocation?.LocationID.toString() || ''}
          onValueChange={handleValueChange}
        >
          <SelectTrigger className={`w-full max-w-md ${isLocked ? 'opacity-75' : ''}`}>
            <SelectValue placeholder="Select Location *" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-border shadow-lg z-50">
            {locations.map((location) => (
              <SelectItem
                key={location.LocationID}
                value={location.LocationID.toString()}
                className="cursor-pointer"
              >
                {location.LocationName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isLocked && (
          <span className="text-xs text-muted-foreground">(Locked - cart has items)</span>
        )}
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Location?</AlertDialogTitle>
            <AlertDialogDescription>
              Changing the location will clear all items from your cart. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelChange}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmChange}>
              Clear Cart & Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
