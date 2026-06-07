import { useState } from 'react';
import { X, Upload, Download, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { bulkGenerateLocations } from '../../lib/location-generator';

interface BulkLocationImportProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface ImportResult {
  city: string;
  success: boolean;
  url?: string;
  error?: string;
}

export default function BulkLocationImport({ onClose, onSuccess }: BulkLocationImportProps) {
  const [csvData, setCsvData] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvData(text);
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = `City,County,Region
Manchester,Greater Manchester,North West England
Liverpool,Merseyside,North West England
Birmingham,West Midlands,West Midlands
Leeds,West Yorkshire,Yorkshire and the Humber
Glasgow,Lanarkshire,Scotland`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'location-import-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCsvData = (csv: string) => {
    const lines = csv.trim().split('\n');
    const cities = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const matches = line.match(/(".*?"|[^,]+)/g);
      if (!matches || matches.length < 1) continue;

      const [city, county, region] = matches.map(m => m.replace(/^"|"$/g, '').trim());

      if (city) {
        cities.push({
          city,
          county: county || undefined,
          region: region || undefined,
        });
      }
    }

    return cities;
  };

  const handleImport = async () => {
    setLoading(true);
    setResults([]);
    setShowResults(false);

    try {
      const cities = parseCsvData(csvData);

      if (cities.length === 0) {
        throw new Error('No valid cities found in CSV data');
      }

      const generationResults = await bulkGenerateLocations(cities);

      const importResults: ImportResult[] = cities.map((city, index) => {
        const result = generationResults[index];
        return {
          city: city.city,
          success: result?.success || false,
          url: result?.url || undefined,
          error: result?.errors?.join(', ') || result?.error || undefined,
        };
      });

      setResults(importResults);
      setShowResults(true);

      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (err) {
      console.error('Error importing locations:', err);
      setResults([{
        city: 'Import Failed',
        success: false,
        error: err instanceof Error ? err.message : 'An error occurred',
      }]);
      setShowResults(true);
    } finally {
      setLoading(false);
    }
  };

  const successCount = results.filter(r => r.success).length;
  const failedCount = results.filter(r => !r.success).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Bulk Location Import</h3>
            <p className="text-sm text-gray-600 mt-1">
              Import multiple locations at once with automatic page generation
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {!showResults ? (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">CSV Format</h4>
              <p className="text-sm text-blue-800 mb-3">
                Upload a CSV file with the following columns: <strong>City, County, Region</strong>
              </p>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Download size={16} />
                Download Template CSV
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or Paste CSV Data
              </label>
              <textarea
                value={csvData}
                onChange={(e) => setCsvData(e.target.value)}
                disabled={loading}
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent font-mono text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="City,County,Region&#10;Manchester,Greater Manchester,North West England&#10;Liverpool,Merseyside,North West England"
              />
              <p className="text-xs text-gray-500 mt-1">
                {csvData ? `${parseCsvData(csvData).length} locations ready to import` : 'Paste your CSV data here'}
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm font-medium text-green-900 mb-2">Automatic Generation Includes:</p>
              <ul className="text-sm text-green-800 space-y-1">
                <li>✓ URL-friendly slugs for each location</li>
                <li>✓ SEO optimized metadata</li>
                <li>✓ Google Maps integration</li>
                <li>✓ Default contact information</li>
                <li>✓ Automatic page routing</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleImport}
                disabled={loading || !csvData.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-[#e71c5e] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#c91852] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Importing Locations...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Import Locations
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className={`p-4 rounded-lg border ${
              failedCount === 0
                ? 'bg-green-50 border-green-200'
                : successCount === 0
                ? 'bg-red-50 border-red-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                {failedCount === 0 ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                )}
                <h4 className={`font-bold ${
                  failedCount === 0
                    ? 'text-green-900'
                    : successCount === 0
                    ? 'text-red-900'
                    : 'text-yellow-900'
                }`}>
                  Import {failedCount === 0 ? 'Completed Successfully' : 'Completed with Issues'}
                </h4>
              </div>
              <p className={`text-sm ${
                failedCount === 0
                  ? 'text-green-800'
                  : successCount === 0
                  ? 'text-red-800'
                  : 'text-yellow-800'
              }`}>
                {successCount} successful, {failedCount} failed
              </p>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.success
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`font-medium ${
                        result.success ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {result.city}
                      </p>
                      {result.url && (
                        <p className="text-sm text-green-700 mt-1 font-mono">
                          {result.url}
                        </p>
                      )}
                      {result.error && (
                        <p className="text-sm text-red-700 mt-1">
                          {result.error}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-[#e71c5e] text-white rounded-lg hover:bg-[#c91852] transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
