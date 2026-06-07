import { useState, useEffect } from 'react';
import { UserPlus, Users, Clock, CheckCircle, XCircle, MapPin, Calendar, Phone, Mail, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function ClientReferrals() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [partnerData, setPartnerData] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    move_from_postcode: '',
    move_to_postcode: '',
    property_size: '',
    move_date: '',
    referral_notes: ''
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [partnerResult, referralsResult] = await Promise.all([
        supabase.from('partners').select('*').eq('user_id', user.id).single(),
        supabase
          .from('partner_referrals')
          .select('*')
          .eq('partner_user_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      if (partnerResult.data) setPartnerData(partnerResult.data);
      if (referralsResult.data) setReferrals(referralsResult.data);
    } catch (error) {
      console.error('[ClientReferrals] Error loading:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !partnerData) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('partner_referrals').insert({
        partner_id: partnerData.id,
        partner_user_id: user.id,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        move_from_postcode: formData.move_from_postcode.toUpperCase(),
        move_to_postcode: formData.move_to_postcode.toUpperCase() || null,
        property_size: formData.property_size || null,
        move_date: formData.move_date || null,
        referral_notes: formData.referral_notes || null,
        status: 'pending'
      });

      if (error) throw error;

      alert('Referral submitted successfully! We will contact the customer within 24 hours.');
      setShowForm(false);
      setFormData({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        move_from_postcode: '',
        move_to_postcode: '',
        property_size: '',
        move_date: '',
        referral_notes: ''
      });
      loadData();
    } catch (error: any) {
      console.error('[ClientReferrals] Error submitting:', error);
      alert('Failed to submit referral. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      contacted: 'bg-blue-100 text-blue-800 border-blue-300',
      quoted: 'bg-purple-100 text-purple-800 border-purple-300',
      won: 'bg-green-100 text-green-800 border-green-300',
      lost: 'bg-red-100 text-red-800 border-red-300',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-300'
    };

    const icons = {
      pending: <Clock size={14} />,
      contacted: <Phone size={14} />,
      quoted: <Mail size={14} />,
      won: <CheckCircle size={14} />,
      lost: <XCircle size={14} />,
      cancelled: <XCircle size={14} />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${styles[status as keyof typeof styles] || styles.pending}`}>
        {icons[status as keyof typeof icons] || icons.pending}
        {status.toUpperCase()}
      </span>
    );
  };

  const stats = {
    total: referrals.length,
    pending: referrals.filter(r => r.status === 'pending').length,
    won: referrals.filter(r => r.status === 'won').length,
    inProgress: referrals.filter(r => ['contacted', 'quoted'].includes(r.status)).length
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
          <p className="text-sm font-semibold text-gray-600">Total Referrals</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-600">
          <p className="text-sm font-semibold text-gray-600">Pending</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-600">
          <p className="text-sm font-semibold text-gray-600">In Progress</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600">
          <p className="text-sm font-semibold text-gray-600">Won</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats.won}</p>
        </div>
      </div>

      {/* Submit Referral Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Client Referrals</h2>
          <p className="text-gray-600 mt-1">Submit and track your customer referrals</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#e71c5e] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#c91852] transition-colors"
        >
          <Plus size={20} />
          {showForm ? 'Cancel' : 'New Referral'}
        </button>
      </div>

      {/* Referral Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Submit New Referral</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder="Mr. John Smith"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Customer Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  placeholder="john.smith@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Customer Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  placeholder="07700 900123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Moving FROM Postcode *
                </label>
                <input
                  type="text"
                  required
                  value={formData.move_from_postcode}
                  onChange={(e) => setFormData({ ...formData, move_from_postcode: e.target.value.toUpperCase() })}
                  placeholder="B1 1AA"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Moving TO Postcode
                </label>
                <input
                  type="text"
                  value={formData.move_to_postcode}
                  onChange={(e) => setFormData({ ...formData, move_to_postcode: e.target.value.toUpperCase() })}
                  placeholder="M1 1AA (optional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Property Size
                </label>
                <select
                  value={formData.property_size}
                  onChange={(e) => setFormData({ ...formData, property_size: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
                >
                  <option value="">Select size...</option>
                  <option value="Studio">Studio</option>
                  <option value="1-Bed Flat">1-Bed Flat</option>
                  <option value="2-Bed Flat">2-Bed Flat</option>
                  <option value="2-Bed House">2-Bed House</option>
                  <option value="3-Bed House">3-Bed House</option>
                  <option value="4-Bed House">4-Bed House</option>
                  <option value="5+ Bed House">5+ Bed House</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Expected Move Date
                </label>
                <input
                  type="date"
                  value={formData.move_date}
                  onChange={(e) => setFormData({ ...formData, move_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={formData.referral_notes}
                  onChange={(e) => setFormData({ ...formData, referral_notes: e.target.value })}
                  rows={3}
                  placeholder="Any special requirements, flexible dates, storage needs, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#e71c5e] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#c91852] transition-colors disabled:opacity-50"
            >
              <UserPlus size={20} />
              {loading ? 'Submitting...' : 'Submit Referral'}
            </button>
          </form>
        </div>
      )}

      {/* Referrals List */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-xl font-bold text-gray-900">Your Referrals ({referrals.length})</h3>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-600">Loading referrals...</div>
        ) : referrals.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 font-semibold">No referrals yet</p>
            <p className="text-sm text-gray-500 mt-2">Click "New Referral" to submit your first customer</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {referrals.map((referral) => (
              <div key={referral.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-gray-900 text-lg">{referral.customer_name}</h4>
                      {getStatusBadge(referral.status)}
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <p className="flex items-center gap-1">
                        <Mail size={14} />
                        {referral.customer_email}
                      </p>
                      <p className="flex items-center gap-1">
                        <Phone size={14} />
                        {referral.customer_phone}
                      </p>
                      <p className="flex items-center gap-1">
                        <MapPin size={14} />
                        {referral.move_from_postcode} → {referral.move_to_postcode || 'TBC'}
                      </p>
                      {referral.move_date && (
                        <p className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(referral.move_date).toLocaleDateString('en-GB')}
                        </p>
                      )}
                    </div>
                    {referral.property_size && (
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Property:</strong> {referral.property_size}
                      </p>
                    )}
                    {referral.referral_notes && (
                      <p className="text-sm text-gray-600 mt-2 italic">
                        "{referral.referral_notes}"
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>Submitted</p>
                    <p className="font-semibold">{new Date(referral.created_at).toLocaleDateString('en-GB')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
