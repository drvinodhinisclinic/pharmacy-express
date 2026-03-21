import { useState, useRef } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';

interface PrescriptionUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

const MAX_FILES = 3;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];

export function PrescriptionUpload({ files, onFilesChange }: PrescriptionUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setError(null);

    // Validate types
    const invalid = selected.filter((f) => !ACCEPTED_TYPES.includes(f.type));
    if (invalid.length > 0) {
      setError('Only JPG and PNG images are allowed');
      return;
    }

    // Validate count
    const total = files.length + selected.length;
    if (total > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} images allowed`);
      return;
    }

    onFilesChange([...files, ...selected]);

    // Reset input so same file can be re-added if removed
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
    setError(null);
  };

  return (
    <div className="space-y-3">
      {/* Upload button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={files.length >= MAX_FILES}
          className="pharmacy-btn-secondary flex items-center gap-2 text-sm !py-2 !px-4"
        >
          <Upload className="h-4 w-4" />
          Upload Image ({files.length}/{MAX_FILES})
        </button>
        <span className="text-xs text-muted-foreground">JPG, PNG only</span>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="relative group w-24 h-24 rounded-lg border border-border overflow-hidden bg-muted"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-foreground/60 text-background text-[10px] px-1 py-0.5 truncate">
                {file.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
