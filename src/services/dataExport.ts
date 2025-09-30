/**
 * Data Export Service
 * Handles export/import functionality for Clockify contract data
 */

export interface ExportData {
  contracts: any[];
  settings: any;
  exportedAt: string;
  version: string;
}

export class DataExportService {
  /**
   * Export data to JSON file
   */
  static exportData(contracts: any[], settings: any): void {
    try {
      const exportData: ExportData = {
        contracts,
        settings,
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `clockify-contracts-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('Failed to export data. Please try again.');
    }
  }

  /**
   * Parse imported file and validate structure
   */
  static parseImportFile(fileContent: string): ExportData {
    try {
      const data = JSON.parse(fileContent);
      
      // Validate required fields
      if (!data.contracts || !Array.isArray(data.contracts)) {
        throw new Error('Invalid file format: contracts array missing');
      }
      
      if (!data.settings || typeof data.settings !== 'object') {
        throw new Error('Invalid file format: settings object missing');
      }

      return data as ExportData;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON file format');
      }
      throw error;
    }
  }

  /**
   * Handle file import with error handling
   */
  static async importData(
    file: File,
    onSuccess: (data: ExportData) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = this.parseImportFile(content);
          onSuccess(data);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown import error';
          onError(message);
        }
      };

      reader.onerror = () => {
        onError('Failed to read file');
      };

      reader.readAsText(file);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      onError(message);
    }
  }
}