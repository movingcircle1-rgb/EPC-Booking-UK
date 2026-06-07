import { useState, useEffect } from 'react';
import { Calendar, Clock, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function AvailabilityManagement() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState<any[]>([]);

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  useEffect(() => {
    loadAvailability();
  }, [user]);

  const loadAvailability = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('staff_availability')
        .select('*')
        .eq('user_id', user.id)
        .order('day_of_week');

      if (error) throw error;

      const availabilityMap = daysOfWeek.map(day => {
        const existing = data?.find(a => a.day_of_week === day.value);
        return existing || {
          id: null,
          user_id: user.id,
          day_of_week: day.value,
          is_available: false,
          start_time: '09:00',
          end_time: '17:00',
          notes: ''
        };
      });

      setAvailability(availabilityMap);
    } catch (error) {
      console.error('[AvailabilityManagement] Error loading availability:', error);
    }
  };

  const handleAvailabilityChange = (dayIndex: number, field: string, value: any) => {
    setAvailability(prev => {
      const updated = [...prev];
      updated[dayIndex] = {
        ...updated[dayIndex],
        [field]: value
      };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      for (const dayAvail of availability) {
        if (dayAvail.id) {
          const { error } = await supabase
            .from('staff_availability')
            .update({
              is_available: dayAvail.is_available,
              start_time: dayAvail.start_time,
              end_time: dayAvail.end_time,
              notes: dayAvail.notes,
              updated_at: new Date().toISOString()
            })
            .eq('id', dayAvail.id);

          if (error) throw error;
        } else if (dayAvail.is_available) {
          const { error } = await supabase
            .from('staff_availability')
            .insert({
              user_id: user.id,
              day_of_week: dayAvail.day_of_week,
              is_available: true,
              start_time: dayAvail.start_time,
              end_time: dayAvail.end_time,
              notes: dayAvail.notes
            });

          if (error) throw error;
        }
      }

      alert('Availability updated successfully!');
      loadAvailability();
    } catch (error: any) {
      console.error('[AvailabilityManagement] Error saving availability:', error);
      alert('Failed to update availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar size={24} className="text-[#be0e0c]" />
          My Availability
        </h2>
        <p className="text-sm text-gray-600 mt-1">Set your weekly work availability</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-4">
          {daysOfWeek.map((day, index) => {
            const dayAvail = availability[index];
            if (!dayAvail) return null;

            return (
              <div
                key={day.value}
                className={`border-2 rounded-lg p-4 transition-all ${
                  dayAvail.is_available
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-3 min-w-[140px]">
                    <input
                      type="checkbox"
                      checked={dayAvail.is_available}
                      onChange={(e) => handleAvailabilityChange(index, 'is_available', e.target.checked)}
                      className="w-5 h-5 text-[#be0e0c] border-gray-300 rounded focus:ring-[#be0e0c]"
                    />
                    <label className="font-semibold text-gray-900">{day.label}</label>
                  </div>

                  {dayAvail.is_available && (
                    <>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-500" />
                        <input
                          type="time"
                          value={dayAvail.start_time}
                          onChange={(e) => handleAvailabilityChange(index, 'start_time', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={dayAvail.end_time}
                          onChange={(e) => handleAvailabilityChange(index, 'end_time', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent"
                        />
                      </div>

                      <input
                        type="text"
                        placeholder="Notes (optional)"
                        value={dayAvail.notes}
                        onChange={(e) => handleAvailabilityChange(index, 'notes', e.target.value)}
                        className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent"
                      />
                    </>
                  )}

                  {!dayAvail.is_available && (
                    <span className="text-sm text-gray-500 italic">Not available</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#be0e0c] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#9f0b0a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            {loading ? 'Saving...' : 'Save Availability'}
          </button>
        </div>
      </form>
    </div>
  );
}
