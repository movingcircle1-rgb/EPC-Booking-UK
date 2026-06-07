import { useState } from 'react';
import { X, Calendar, Check } from 'lucide-react';

interface MoveDatePickerProps {
  quotationId: string;
  currentDate: string | null;
  onSelect: (quotationId: string, date: string) => Promise<void>;
  onClose: () => void;
}

export function MoveDatePicker({ quotationId, currentDate, onSelect, onClose }: MoveDatePickerProps) {
  const [selectedDate, setSelectedDate] = useState(currentDate || '');
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 7);
  const minDateStr = minDate.toISOString().split('T')[0];

  const handleSubmit = async () => {
    if (!selectedDate) {
      alert('Please select a move date');
      return;
    }

    setSubmitting(true);
    try {
      await onSelect(quotationId, selectedDate);
      onClose();
    } catch (err) {
      console.error('[MoveDatePicker] Error:', err);
      alert('Failed to update move date. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Choose Move Date
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Please select your preferred moving date. We recommend booking at least 7 days in advance to ensure availability.
            </p>
          </div>

          <div>
            <label htmlFor="moveDate" className="block text-sm font-semibold text-gray-700 mb-2">
              Select Move Date
            </label>
            <input
              type="date"
              id="moveDate"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={minDateStr}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
            />
          </div>

          {selectedDate && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 font-medium mb-1">Selected Move Date:</p>
              <p className="text-green-900 font-bold text-lg">{formatDate(selectedDate)}</p>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">Important Notes:</h4>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>Move dates are subject to availability</li>
              <li>We'll confirm your date within 24 hours</li>
              <li>Mid-week moves may qualify for discounts</li>
              <li>Peak season dates book up quickly</li>
            </ul>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedDate || submitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Confirming...
              </>
            ) : (
              <>
                <Check className="h-5 w-5" />
                Confirm Move Date
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
