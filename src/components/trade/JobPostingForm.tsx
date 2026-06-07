import { useState } from 'react';
import { Truck, Package, Calendar, MapPin, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface JobPostingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function JobPostingForm({ onSuccess, onCancel }: JobPostingFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    serviceType: '',
    pickupPostcode: '',
    deliveryPostcode: '',
    volumeCubicFeet: '',
    volumeCubicMetres: '',
    jobDate: '',
    estimatedJobDate: '',
    preferredDate: '',
    flexibleDates: false,
    budgetAmount: '',
    requirements: ''
  });

  const serviceTypes = [
    { value: 'removal', label: 'House Removal' },
    { value: 'removal', label: 'Office Removal' },
    { value: 'delivery', label: 'Single Item Delivery' },
    { value: 'storage', label: 'Storage Transport' },
    { value: 'removal', label: 'European Move' },
    { value: 'removal', label: 'International Move' },
    { value: 'delivery', label: 'Furniture Disposal' },
    { value: 'packing', label: 'Packing Service' },
    { value: 'driver', label: 'Driver Assistance' },
    { value: 'porter', label: 'Porter/Helper Service' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Please log in to post jobs');
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

      const { error } = await supabase
        .from('trade_jobs')
        .insert({
          posted_by_trade_id: tradeAccount.id,
          title: formData.title,
          description: formData.description,
          service_type: formData.serviceType,
          pickup_postcode: formData.pickupPostcode,
          delivery_postcode: formData.deliveryPostcode,
          volume_cubic_feet: formData.volumeCubicFeet ? parseInt(formData.volumeCubicFeet) : null,
          volume_cubic_metres: formData.volumeCubicMetres ? parseFloat(formData.volumeCubicMetres) : null,
          job_date: formData.jobDate || null,
          estimated_job_date: formData.estimatedJobDate || null,
          preferred_date: formData.preferredDate,
          flexible_dates: formData.flexibleDates,
          budget_amount: formData.budgetAmount ? parseFloat(formData.budgetAmount) : null,
          requirements: formData.requirements,
          additional_requirements: formData.requirements,
          status: 'open',
          posting_fee: 0
        });

      if (error) throw error;

      // Try to create notification (non-blocking)
      try {
        await supabase.from('notifications').insert({
          user_id: user.id,
          title: 'Job Posted Successfully',
          message: `Your job "${formData.title}" has been posted and is now visible to other trade partners.`,
          type: 'success'
        });
      } catch (notifError) {
        console.warn('Failed to create notification:', notifError);
      }

      alert('Job posted successfully!');
      setFormData({
        title: '',
        description: '',
        serviceType: '',
        pickupPostcode: '',
        deliveryPostcode: '',
        volumeCubicFeet: '',
        volumeCubicMetres: '',
        jobDate: '',
        estimatedJobDate: '',
        preferredDate: '',
        flexibleDates: false,
        budgetAmount: '',
        requirements: ''
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error posting job:', error);
      alert('Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Post a Job</h3>
        <p className="text-gray-600">Share jobs with other trade partners who can bid or purchase them</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Job Title *
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., 3-Bed House Removal - Birmingham to London"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C73532] focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <FileText size={16} className="inline mr-1" />
          Description *
        </label>
        <textarea
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          placeholder="Provide detailed information about the job..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C73532] focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <Truck size={16} className="inline mr-1" />
          Service Type *
        </label>
        <select
          required
          value={formData.serviceType}
          onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C73532] focus:border-transparent"
        >
          <option value="">Select service type</option>
          {serviceTypes.map((type, index) => (
            <option key={`${type.value}-${index}`} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <MapPin size={16} className="inline mr-1" />
            Pickup Postcode *
          </label>
          <input
            type="text"
            required
            value={formData.pickupPostcode}
            onChange={(e) => setFormData({ ...formData, pickupPostcode: e.target.value.toUpperCase() })}
            placeholder="e.g., WV13 3YA"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C73532] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <MapPin size={16} className="inline mr-1" />
            Delivery Postcode *
          </label>
          <input
            type="text"
            required
            value={formData.deliveryPostcode}
            onChange={(e) => setFormData({ ...formData, deliveryPostcode: e.target.value.toUpperCase() })}
            placeholder="e.g., SW1A 1AA"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C73532] focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Package size={16} className="inline mr-1" />
            Volume (cubic feet)
          </label>
          <input
            type="number"
            value={formData.volumeCubicFeet}
            onChange={(e) => setFormData({ ...formData, volumeCubicFeet: e.target.value })}
            placeholder="e.g., 500"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C73532] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Package size={16} className="inline mr-1" />
            Volume (Cubic Metres) *
          </label>
          <input
            type="number"
            step="0.01"
            required
            value={formData.volumeCubicMetres}
            onChange={(e) => setFormData({ ...formData, volumeCubicMetres: e.target.value })}
            placeholder="e.g., 14.16"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C73532] focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">1 cubic metre = 35.31 cubic feet</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Calendar size={16} className="inline mr-1" />
            Preferred Date *
          </label>
          <input
            type="date"
            required
            value={formData.preferredDate}
            onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C73532] focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Calendar size={16} className="inline mr-1" />
            Job Date (Confirmed)
          </label>
          <input
            type="date"
            value={formData.jobDate}
            onChange={(e) => setFormData({ ...formData, jobDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C73532] focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">Only fill if job date is confirmed</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Calendar size={16} className="inline mr-1" />
            Estimated Job Date (Unconfirmed)
          </label>
          <input
            type="date"
            value={formData.estimatedJobDate}
            onChange={(e) => setFormData({ ...formData, estimatedJobDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C73532] focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">Fill if job date is estimated/flexible</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="flexibleDates"
          checked={formData.flexibleDates}
          onChange={(e) => setFormData({ ...formData, flexibleDates: e.target.checked })}
          className="w-5 h-5 text-[#C73532] border-gray-300 rounded focus:ring-[#C73532]"
        />
        <label htmlFor="flexibleDates" className="text-sm font-medium text-gray-700">
          Dates are flexible
        </label>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Budget Amount (£)
        </label>
        <input
          type="number"
          step="0.01"
          value={formData.budgetAmount}
          onChange={(e) => setFormData({ ...formData, budgetAmount: e.target.value })}
          placeholder="e.g., 350.00"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C73532] focus:border-transparent"
        />
        <p className="mt-1 text-sm text-gray-500">Optional: Set a fixed price for direct purchase</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Additional Requirements
        </label>
        <textarea
          value={formData.requirements}
          onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
          rows={3}
          placeholder="Special requirements, equipment needed, access restrictions, etc."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C73532] focus:border-transparent"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#C73532] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#A92C2A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Posting...' : 'Post Job'}
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
