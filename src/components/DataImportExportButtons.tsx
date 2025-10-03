import { useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { DataExportService } from '../services/dataExport';

interface DataImportExportButtonsProps {
  onExportData: () => void;
  onImportData: (data: any) => void;
}

export function DataImportExportButtons({ 
  onExportData, 
  onImportData 
}: DataImportExportButtonsProps) {
  const [importError, setImportError] = useState<string | null>(null);

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);

    DataExportService.importData(
      file,
      (data) => {
        onImportData(data);
        // Reset file input
        event.target.value = '';
      },
      (error) => {
        setImportError(error);
        // Reset file input
        event.target.value = '';
      }
    );
  };

  return (
    <div className="space-y-2">
      {importError && (
        <Alert variant="destructive" className="font-normal">
          <AlertDescription className="font-normal">
            Import Error: {importError}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onExportData}
          className="normal-case flex items-center gap-1 font-normal"
        >
          <Download className="w-4 h-4" />
          Export
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('import-file')?.click()}
          className="normal-case flex items-center gap-1 font-normal"
        >
          <Upload className="w-4 h-4" />
          Import
        </Button>
        
        <input
          id="import-file"
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileImport}
          aria-label="Import backup data file"
          title="Import backup data file"
        />
      </div>
    </div>
  );
}