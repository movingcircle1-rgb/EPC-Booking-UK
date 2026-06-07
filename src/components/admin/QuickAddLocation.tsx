import { useState } from 'react';
import { X, Loader, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { generateLocation } from '../../lib/location-generator';

interface QuickAddLocationProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function QuickAddLocation({ onClose, onSuccess }: QuickAddLocationProps) {
  const [cityName, setCityName] = useState('');
  const [county, setCounty] = useState('');
  const [region, setRegion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const result = await generateLocation({
        city: cityName.trim(),
        county: county.trim() || undefined,
        region: region.trim() || undefined,
      });

      if (result.success) {
        setSuccess(true);
        setGeneratedUrl(result.url || null);

        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        const errorMsg = result.errors
          ? result.errors.join(', ')
          : result.error || 'Failed to generate location';
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('Error generating location:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (cityExample: string, countyExample: string, regionExample: string) => {
    setCityName(cityExample);
    setCounty(countyExample);
    setRegion(regionExample);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Quick Add Location</h3>
            <p className="text-sm text-gray-600 mt-1">
              Generate a new location page automatically with SEO optimization
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

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900">Success!</p>
              <p className="text-sm text-green-700 mt-1">
                Location page generated successfully
                {generatedUrl && (
                  <span className="block mt-1 font-mono text-xs">
                    URL: {generatedUrl}
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              disabled={loading || success}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="e.g., Manchester"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              The system will automatically generate SEO metadata, slug, and map links
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                County <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="text"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                disabled={loading || success}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="e.g., Greater Manchester"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                disabled={loading || success}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="e.g., North West England"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">Auto-Generated Features:</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-blue-600" />
                URL-friendly slug (e.g., manchester)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-blue-600" />
                SEO optimized meta title and description
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-blue-600" />
                Google Maps embed and links
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-blue-600" />
                Default contact information and opening hours
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-blue-600" />
                Synchronized with cities table
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Quick Examples:</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('Manchester', 'Greater Manchester', 'North West')}
                disabled={loading || success}
                className="text-xs px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Manchester
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('Liverpool', 'Merseyside', 'North West')}
                disabled={loading || success}
                className="text-xs px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Liverpool
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('Newcastle', 'Tyne and Wear', 'North East')}
                disabled={loading || success}
                className="text-xs px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Newcastle
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('Cardiff', 'South Glamorgan', 'Wales')}
                disabled={loading || success}
                className="text-xs px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cardiff
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || success || !cityName.trim()}
              className="flex-1 flex items-center justify-center gap-2 bg-[#be0e0c] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#9f0b0a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Generating Location...
                </>
              ) : success ? (
                <>
                  <CheckCircle size={20} />
                  Location Generated!
                </>
              ) : (
                <>
                  <MapPin size={20} />
                  Generate Location Page
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
