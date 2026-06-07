import { useState, useEffect } from 'react';
import { Building2, Mail, Phone, MapPin, CreditCard, Save, Edit2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileManagement() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [partnerData, setPartnerData] = useState<any>(null);
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    bank_account_name: '',
    bank_account_number: '',
    bank_sort_code: ''
  });

  useEffect(() => {
    loadPartnerData();
  }, [user]);

  const loadPartnerData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPartnerData(data);
        setFormData({
          company_name: data.company_name || '',
          contact_name: data.contact_name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          bank_account_name: data.bank_account_name || '',
          bank_account_number: data.bank_account_number || '',
          bank_sort_code: data.bank_sort_code || ''
        });
      }
    } catch (error) {
      console.error('Error loading partner data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !partnerData) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('partners')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', partnerData.id);

      if (error) throw error;

      alert('Profile updated successfully!');
      setEditing(false);
      loadPartnerData();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#be0e0c]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Account Profile</h2>
            <p className="text-gray-600 mt-1">Manage your account details and banking information</p>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#be0e0c] text-white rounded-lg hover:bg-[#9f0b0a] transition-colors"
            >
              <Edit2 size={18} />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  loadPartnerData();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Building2 size={16} />
              Company Name
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent"
              />
            ) : (
              <p className="text-lg text-gray-900 px-4 py-3 bg-gray-50 rounded-lg">{formData.company_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Mail size={16} />
              Contact Name
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent"
              />
            ) : (
              <p className="text-lg text-gray-900 px-4 py-3 bg-gray-50 rounded-lg">{formData.contact_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Mail size={16} />
              Email Address
            </label>
            {editing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent"
              />
            ) : (
              <p className="text-lg text-gray-900 px-4 py-3 bg-gray-50 rounded-lg">{formData.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Phone size={16} />
              Phone Number
            </label>
            {editing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent"
              />
            ) : (
              <p className="text-lg text-gray-900 px-4 py-3 bg-gray-50 rounded-lg">{formData.phone}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <MapPin size={16} />
              Business Address
            </label>
            {editing ? (
              <textarea
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent"
              />
            ) : (
              <p className="text-lg text-gray-900 px-4 py-3 bg-gray-50 rounded-lg">{formData.address || 'Not provided'}</p>
            )}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CreditCard size={20} />
            Banking Details
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.bank_account_name}
                  onChange={(e) => setFormData({ ...formData, bank_account_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent"
                  placeholder="Account holder name"
                />
              ) : (
                <p className="text-lg text-gray-900 px-4 py-3 bg-gray-50 rounded-lg">
                  {formData.bank_account_name || 'Not provided'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account Number
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.bank_account_number}
                  onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent"
                  placeholder="12345678"
                  maxLength={8}
                />
              ) : (
                <p className="text-lg text-gray-900 px-4 py-3 bg-gray-50 rounded-lg font-mono">
                  {formData.bank_account_number ? `****${formData.bank_account_number.slice(-4)}` : 'Not provided'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sort Code
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.bank_sort_code}
                  onChange={(e) => setFormData({ ...formData, bank_sort_code: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent"
                  placeholder="12-34-56"
                  maxLength={8}
                />
              ) : (
                <p className="text-lg text-gray-900 px-4 py-3 bg-gray-50 rounded-lg font-mono">
                  {formData.bank_sort_code || 'Not provided'}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Your banking details are securely stored and only used for commission payments.
              Please ensure all information is accurate to avoid payment delays.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
