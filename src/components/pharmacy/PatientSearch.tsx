import { useState, useRef, useEffect } from 'react';
import { Patient } from '@/types/pharmacy';
import { searchPatients } from '@/services/pharmacyApi';
import { useDebounce, useClickOutside } from '@/hooks/useDebounce';
import { User, Search, Loader2, Phone, Calendar, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PatientSearchProps {
  selectedPatient: Patient | null;
  onPatientSelect: (patient: Patient | null) => void;
}

export function PatientSearch({ selectedPatient, onPatientSelect }: PatientSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  useClickOutside(searchContainerRef, () => setShowResults(false));
  
  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        const results = await searchPatients(debouncedQuery);
        setSearchResults(results);
        setSelectedIndex(0);
      } catch (error) {
        toast({
          title: 'Search Error',
          description: 'Failed to search patients.',
          variant: 'destructive',
        });
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    
    fetchResults();
  }, [debouncedQuery]);
  
  const handleSelect = (patient: Patient) => {
    onPatientSelect(patient);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    toast({
      title: 'Patient Selected',
      description: `${patient.name} selected`,
    });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
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
          handleSelect(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        break;
    }
  };
  
  const clearPatient = () => {
    onPatientSelect(null);
  };
  
  return (
    <div className="space-y-3">
      <div 
        ref={searchContainerRef}
        className="relative max-w-md"
        onKeyDown={handleKeyDown}
      >
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder="Search patient by name or mobile..."
            className="w-full pl-10 pr-10 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin" />
          )}
        </div>
        
        {/* Search Results Dropdown */}
        {showResults && searchQuery.length >= 2 && (
          <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {isSearching ? 'Searching...' : 'No patients found'}
              </div>
            ) : (
              searchResults.map((patient, index) => (
                <button
                  key={patient.patient_id}
                  onClick={() => handleSelect(patient)}
                  className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-accent/50 transition-colors ${
                    index === selectedIndex ? 'bg-accent/50' : ''
                  }`}
                >
                  <div className="p-2 bg-primary/10 rounded-full">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{patient.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {patient.age}Y / {patient.gender} • {patient.mobile}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
      
      {/* Selected Patient Display */}
      {selectedPatient && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Patient Name</p>
                  <p className="font-semibold text-foreground">{selectedPatient.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Age</p>
                  <p className="font-semibold text-foreground">{selectedPatient.age} years</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Gender</p>
                  <p className="font-semibold text-foreground">{selectedPatient.gender}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Mobile</p>
                  <p className="font-semibold text-foreground">{selectedPatient.mobile}</p>
                </div>
              </div>
            </div>
            <button
              onClick={clearPatient}
              className="text-sm text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
