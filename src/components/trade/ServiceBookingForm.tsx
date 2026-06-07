import { useState, useEffect } from 'react';
import { Truck, User, Package, Calendar, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface ServiceBookingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ServiceBookingForm({ onSuccess, onCancel }: ServiceBookingFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [formData, setFormData] = useState({
    serviceType: '',
    bookingDate: '',
    startTime: '',
    durationHours: '8',
    pickupLocation: '',
    deliveryLocation: '',
    notes: ''
  });

  const serviceTypes = [
    { value: 'vehicle_hire', label: 'Vehicle Hire', icon: Truck },
    { value: 'staff_hire', label: 'Staff Hire', icon: User },
    { value: 'vehicle_driver_hire', label: 'Vehicle & Driver Hire', icon: Truck },
  ];

  useEffect(() => {
    loadAvailableServices();
  }, []);

  useEffect(() => {
    if (formData.serviceType) {
      const servicesForType = availableServices.filter(s => s.service_type === formData.serviceType);
      if (servicesForType.length > 0) {
        setSelectedService(servicesForType[0]);
      } else {
        setSelectedService(null);
      }
    } else {
      setSelectedService(null);
    }
  }, [formData.serviceType, availableServices]);

  const loadAvailableServices = async () => {
    try {
      const { data, error } = await supabase
        .from('trade_services')
        .select('*')
        .eq('is_active', true)
        .order('service_type', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setAvailableServices(data || []);
    } catch (err) {
      console.error('[ServiceBookingForm] Error loading services:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Please log in to book services');
      return;
    }

    setLoading(true);
    try {
      const { data: tradeAccount } = await supabase
        .from('trade_accounts')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!tradeAccount) {
        alert('Trade account not found');
        return;
      }

      if (!selectedService) {
        alert('Please select a service type');
        return;
      }

      const hours = parseInt(formData.durationHours);
      const totalAmount = hours >= 8 && selectedService.price_per_day
        ? selectedService.price_per_day
        : (selectedService.price_per_hour || 0) * hours;

      const { error } = await supabase
        .from('trade_service_bookings')
        .insert({
          trade_account_id: tradeAccount.id,
          service_id: selectedService.id,
          booking_date: formData.bookingDate,
          start_time: formData.startTime,
          duration_hours: hours,
          total_amount: totalAmount,
          status: 'pending',
          notes: `${formData.notes}\n\nPickup: ${formData.pickupLocation}\nDelivery: ${formData.deliveryLocation}`
        });

      if (error) throw error;

      // Try to create notification (non-blocking)
      try {
        await supabase.from('notifications').insert({
          user_id: user.id,
          title: 'Service Booking Received',
          message: `Your ${formData.serviceType.replace('_', ' ')} booking request has been submitted and is pending approval.`,
          type: 'success'
        });
      } catch (notifError) {
        console.warn('Failed to create notification:', notifError);
      }

      alert('Service booking submitted successfully!');
      setFormData({
        serviceType: '',
        bookingDate: '',
        startTime: '',
        durationHours: '8',
        pickupLocation: '',
        deliveryLocation: '',
        notes: ''
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error booking service:', error);
      alert('Failed to submit booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Book Trade Services</h3>
        <p className="text-gray-600">Request vehicles, drivers, crew, or equipment for your jobs</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Service Type *
        </label>
        <div className="grid md:grid-cols-2 gap-3">
          {serviceTypes.map(({ value, label, icon: Icon }) => {
            const availableCount = availableServices.filter(s => s.service_type === value).length;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setFormData({ ...formData, serviceType: value })}
                disabled={availableCount === 0}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  formData.serviceType === value
                    ? 'border-[#C73532] bg-pink-50'
                    : availableCount === 0
                    ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Icon size={24} className={formData.serviceType === value ? 'text-[#C73532]' : 'text-gray-400'} />
                    <span className="font-semibold text-gray-900">{label}</span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    availableCount > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {availableCount}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {selectedService && (
          <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-900">Selected Service:</p>
                <p className="text-lg font-bold text-green-800">{selectedService.name}</p>
              </div>
              <div className="text-right">
                {selectedService.price_per_hour && (
                  <p className="text-sm text-green-700">£{selectedService.price_per_hour}/hour</p>
                )}
                {selectedService.price_per_day && (
                  <p className="text-sm font-semibold text-green-800">£{selectedService.price_per_day}/day</p>
                )}
              </div>
            </div>
            {selectedService.description && (
              <p className="text-xs text-green-700 mt-2">{selectedService.description}</p>
            )}
          </div>
        )}

        {formData.serviceType && !selectedService && (
          <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">No services available for this type. Please contact support.</p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Calendar size={16} className="inline mr-1" />
            Booking Date *
          </label>
          <input
            type="date"
            required
            value={formData.bookingDate}
            onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C73532] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Clock size={16} className="inline mr-1" />
            Start Time *
          </label>
          <input
            type="time"
            required
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C73532] focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Duration (hours) *
        </label>
        <select
          required
          value={formData.durationHours}
          onChange={(e) => setFormData({ ...formData, durationHours: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C73532] focus:border-transparent"
        >
          <option value="4">4 hours</option>
          <option value="6">6 hours</option>
          <option value="8">8 hours (Full Day)</option>
          <option value="12">12 hours</option>
          <option value="24">24 hours</option>
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Pickup Location *
          </label>
          <input
            type="text"
            required
            value={formData.pickupLocation}
            onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
            placeholder="Enter full address or postcode"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C73532] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Delivery Location
          </label>
          <input
            type="text"
            value={formData.deliveryLocation}
            onChange={(e) => setFormData({ ...formData, deliveryLocation: e.target.value })}
            placeholder="Enter full address or postcode (if applicable)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C73532] focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Additional Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={4}
          placeholder="Any special requirements or additional information..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C73532] focus:border-transparent"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#C73532] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#A92C2A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit Booking Request'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
