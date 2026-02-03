import { useState, useEffect } from 'react';
import { Stethoscope, Loader2, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface Doctor {
  id: number;
  name: string;
}

interface DoctorSelectorProps {
  selectedDoctor: Doctor | null;
  onDoctorSelect: (doctor: Doctor | null) => void;
}

export function DoctorSelector({
  selectedDoctor,
  onDoctorSelect,
}: DoctorSelectorProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          'http://localhost:3000/api/doctors',
          { headers: { 'ngrok-skip-browser-warning': 'true' } }
        );
        if (!response.ok) {
          throw new Error('Failed to fetch doctors');
        }
        const result = await response.json();
        // Handle both array response and { data: [] } response
        const doctorData: Doctor[] = Array.isArray(result) ? result : (result.data || []);
        
        if (doctorData.length === 0) {
          setError('No doctors available');
          setDoctors([]);
          return;
        }
        
        setDoctors(doctorData);
        
        // Auto-select if only one doctor
        if (doctorData.length === 1) {
          onDoctorSelect(doctorData[0]);
        }
      } catch (err) {
        console.error('Doctor fetch error:', err);
        setError('Failed to load doctors. Please refresh.');
        setDoctors([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const handleValueChange = (value: string) => {
    const doctor = doctors.find((d) => d.id.toString() === value);
    onDoctorSelect(doctor || null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
        <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
        <span className="text-sm text-muted-foreground">Loading doctors...</span>
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
    <div className="flex items-center gap-3">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Stethoscope className="h-5 w-5 text-primary" />
      </div>
      <Select
        value={selectedDoctor?.id.toString() || ''}
        onValueChange={handleValueChange}
      >
        <SelectTrigger className="w-full max-w-md">
          <SelectValue placeholder="Select Consulting Doctor" />
        </SelectTrigger>
        <SelectContent className="bg-popover border border-border shadow-lg z-50">
          {doctors.map((doctor) => (
            <SelectItem
              key={doctor.id}
              value={doctor.id.toString()}
              className="cursor-pointer"
            >
              {doctor.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
