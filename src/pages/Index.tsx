import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  SearchBar, 
  SearchResults, 
  CartTable, 
  BillingSummary, 
  ConfirmationModal,
  PatientSearch,
  LocationSelector,
  DoctorSelector,
} from '@/components/pharmacy';
import type { Location, Doctor } from '@/components/pharmacy';
import { useDebounce, useClickOutside } from '@/hooks/useDebounce';
import { searchProducts, processBill } from '@/services/pharmacyApi';
import { Product, CartItem, Patient } from '@/types/pharmacy';
import { toast } from '@/hooks/use-toast';
import { Pill } from 'lucide-react';

function Index() {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Patient state
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Location state
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  
  // Doctor state
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  
  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  // Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  // Debounced search query
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  // Close search results when clicking outside
  useClickOutside(searchContainerRef, () => setShowResults(false));
  
  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      
      // Block search if no location selected
      if (!selectedLocation) {
        toast({
          title: 'Location Required',
          description: 'Please select a location before searching.',
          variant: 'destructive',
        });
        setSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        const results = await searchProducts(debouncedQuery, selectedLocation.LocationID);
        setSearchResults(results);
        setSelectedIndex(0);
      } catch (error) {
        toast({
          title: 'Search Error',
          description: 'Failed to search products. Please check if the API server is running.',
          variant: 'destructive',
        });
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    
    fetchResults();
  }, [debouncedQuery, selectedLocation]);
  
  // Add product to cart
  const addToCart = useCallback((product: Product) => {
    // Create unique cart ID from ProductName + Batch
    const cartId = `${product.ProductName.trim()}_${product.Batch}`;
    
    // Format expiry date from ISO string
    const formatExpiry = (exp: string) => {
      if (!exp) return '';
      const date = new Date(exp);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    };
    
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.cartId === cartId);
      
      if (existingIndex >= 0) {
        // Increase quantity if same product+batch already in cart
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }
      
      // Add new item with batch and expiry from API
      const newItem: CartItem = {
        ...product,
        cartId,
        quantity: 1,
        expiryDate: formatExpiry(product.Exp),
        salePrice: parseFloat(product.unitPrice),
      };
      return [...prev, newItem];
    });
    
    // Reset search
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    
    // Refocus search input
    setTimeout(() => searchInputRef.current?.focus(), 100);
    
    toast({
      title: 'Added to cart',
      description: `${product.ProductName} (Batch: ${product.Batch}) added`,
    });
  }, []);
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showResults || searchResults.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, searchResults.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (searchResults[selectedIndex]) {
          addToCart(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        break;
    }
  }, [showResults, searchResults, selectedIndex, addToCart]);
  
  // Cart operations
  const updateQuantity = useCallback((cartId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartId === cartId ? { ...item, quantity } : item
      )
    );
  }, []);
  
  const updateSalePrice = useCallback((cartId: string, salePrice: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartId === cartId ? { ...item, salePrice } : item
      )
    );
  }, []);
  
  const updateBatch = useCallback((cartId: string, batch: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartId === cartId ? { ...item, Batch: batch } : item
      )
    );
  }, []);
  
  const updateExpiry = useCallback((cartId: string, expiryDate: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartId === cartId ? { ...item, expiryDate } : item
      )
    );
  }, []);
  
  const removeItem = useCallback((cartId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
  }, []);
  
  // Handle location change when cart has items
  const handleLocationChangeConfirm = useCallback(() => {
    setCartItems([]);
  }, []);
  
  // Check if location is locked (cart has items)
  const isLocationLocked = cartItems.length > 0;
  
  // Calculate totals
  const { totalItems, totalAmount } = useMemo(() => {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cartItems.reduce((sum, item) => sum + item.quantity * item.salePrice, 0);
    return { totalItems, totalAmount };
  }, [cartItems]);
  
  // Process bill
  const handleProcessBill = useCallback(() => {
    setShowConfirmModal(true);
  }, []);
  
  const confirmBill = useCallback(async () => {
    if (!selectedLocation) {
      toast({
        title: 'Location Required',
        description: 'Please select a location before billing.',
        variant: 'destructive',
      });
      return;
    }
    
    setShowConfirmModal(false);
    setIsProcessing(true);
    
    try {
      const payload = {
        locationId: selectedLocation.LocationID,
        doctor: selectedDoctor ? {
          name: selectedDoctor.name,
        } : null,
        patient: selectedPatient ? {
          patient_id: selectedPatient.patient_id,
          name: selectedPatient.name,
          mobile: selectedPatient.mobile,
        } : null,
        items: cartItems.map((item) => ({
          ProductID: item.ProductID,
          ProductName: item.ProductName,
          Drug: item.Drug,
          Quantity: item.quantity,
          MRP: parseFloat(item.MRP),
          SalePrice: item.salePrice,
          Batch: item.Batch,
          ExpiryDate: item.expiryDate,
        })),
        totalItems,
        totalAmount,
        billedAt: new Date().toISOString(),
      };
      
      await processBill(payload);
      
      toast({
        title: 'Bill Processed',
        description: `Bill of ₹${totalAmount.toFixed(2)} processed successfully!`,
      });
      
      // Clear cart
      setCartItems([]);
      
      // Refocus search
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } catch (error) {
      toast({
        title: 'Billing Failed',
        description: 'Failed to process bill. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [cartItems, totalItems, totalAmount, selectedPatient, selectedLocation, selectedDoctor]);
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Pill className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Pharmacy Billing</h1>
            <p className="text-sm text-muted-foreground">OPD Sales Counter</p>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 pb-32">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Patient Search Section */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Patient Details</h2>
            <PatientSearch
              selectedPatient={selectedPatient}
              onPatientSelect={setSelectedPatient}
            />
          </section>
          
          {/* Location Selector Section */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Select Location *</h2>
            <LocationSelector
              selectedLocation={selectedLocation}
              onLocationSelect={setSelectedLocation}
              isLocked={isLocationLocked}
              onConfirmChange={handleLocationChangeConfirm}
            />
          </section>
          
          {/* Doctor Selector Section */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Consulting Doctor</h2>
            <DoctorSelector
              selectedDoctor={selectedDoctor}
              onDoctorSelect={setSelectedDoctor}
            />
          </section>
          
          {/* Medicine Search Section */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">Search Medicine</h2>
            <div 
              ref={searchContainerRef}
              className="relative max-w-2xl"
              onKeyDown={handleKeyDown}
            >
              <SearchBar
                value={searchQuery}
                onChange={(value) => {
                  if (!selectedLocation) {
                    toast({
                      title: 'Location Required',
                      description: 'Please select a location before searching.',
                      variant: 'destructive',
                    });
                    return;
                  }
                  setSearchQuery(value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                isLoading={isSearching}
                inputRef={searchInputRef}
              />
              <SearchResults
                results={searchResults}
                selectedIndex={selectedIndex}
                onSelect={addToCart}
                isVisible={showResults && searchQuery.length >= 2}
              />
            </div>
          </section>
          
          {/* Cart Section */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Shopping Cart
              {cartItems.length > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({cartItems.length} items)
                </span>
              )}
            </h2>
            <CartTable
              items={cartItems}
              onQuantityChange={updateQuantity}
              onSalePriceChange={updateSalePrice}
              onBatchChange={updateBatch}
              onExpiryChange={updateExpiry}
              onRemove={removeItem}
            />
          </section>
        </div>
      </main>
      
      {/* Billing Summary (Sticky Footer) */}
      <BillingSummary
        items={cartItems}
        onProcessBill={handleProcessBill}
        isProcessing={isProcessing}
      />
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onConfirm={confirmBill}
        onCancel={() => setShowConfirmModal(false)}
        totalAmount={totalAmount}
        totalItems={totalItems}
      />
    </div>
  );
}

export default Index;