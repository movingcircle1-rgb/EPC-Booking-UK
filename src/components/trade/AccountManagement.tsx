import { useState, useEffect } from 'react';
import { Building, Mail, Phone, MapPin, CreditCard, User, Shield, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function AccountManagement() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accountData, setAccountData] = useState<any>(null);
  const [accountManager, setAccountManager] = useState<any>(null);
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    businessAddress: '',
    companyRegistrationNumber: '',
    vatNumber: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankSortCode: ''
  });

  useEffect(() => {
    loadAccountData();
  }, [user]);

  const loadAccountData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('trade_accounts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setAccountData(data);
        setFormData({
          businessName: data.business_name || '',
          contactName: data.contact_name || '',
          email: data.email || '',
          phone: data.phone || '',
          businessAddress: data.business_address || '',
          companyRegistrationNumber: data.company_registration_number || '',
          vatNumber: data.vat_number || '',
          bankAccountName: data.bank_account_name || '',
          bankAccountNumber: data.bank_account_number || '',
          bankSortCode: data.bank_sort_code || ''
        });

        if (data.account_manager_id) {
          const { data: managerData } = await supabase
            .from('account_managers')
            .select('*')
            .eq('id', data.account_manager_id)
            .eq('is_active', true)
            .maybeSingle();

          if (managerData) {
            setAccountManager(managerData);
          }
        } else {
          const { data: defaultManager } = await supabase
            .from('account_managers')
            .select('*')
            .eq('is_active', true)
            .limit(1)
            .maybeSingle();

          if (defaultManager) {
            setAccountManager(defaultManager);
          }
        }
      }
    } catch (error) {
      console.error('Error loading account data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !accountData) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('trade_accounts')
        .update({
          business_name: formData.businessName,
          contact_name: formData.contactName,
          email: formData.email,
          phone: formData.phone,
          business_address: formData.businessAddress,
          company_registration_number: formData.companyRegistrationNumber,
          vat_number: formData.vatNumber,
          bank_account_name: formData.bankAccountName,
          bank_account_number: formData.bankAccountNumber,
          bank_sort_code: formData.bankSortCode,
          updated_at: new Date().toISOString()
        })
        .eq('id', accountData.id);

      if (error) throw error;

      alert('Account details updated successfully!');
      loadAccountData();
    } catch (error: any) {
      console.error('Error updating account:', error);
      alert('Failed to update account. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e71c5e]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Building size={16} className="inline mr-1" />
              Business Name *
            </label>
            <input
              type="text"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <User size={16} className="inline mr-1" />
              Contact Name *
            </label>
            <input
              type="text"
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Mail size={16} className="inline mr-1" />
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Phone size={16} className="inline mr-1" />
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <MapPin size={16} className="inline mr-1" />
            Business Address
          </label>
          <textarea
            value={formData.businessAddress}
            onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Company Registration Number
            </label>
            <input
              type="text"
              value={formData.companyRegistrationNumber}
              onChange={(e) => setFormData({ ...formData, companyRegistrationNumber: e.target.value })}
              placeholder="e.g., 12345678"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              VAT Number
            </label>
            <input
              type="text"
              value={formData.vatNumber}
              onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
              placeholder="e.g., GB123456789"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          <CreditCard size={24} className="inline mr-2" />
          Banking Information
        </h3>
        <p className="text-sm text-gray-600 mb-6">For receiving payments from completed jobs</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Account Holder Name
            </label>
            <input
              type="text"
              value={formData.bankAccountName}
              onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Account Number
            </label>
            <input
              type="text"
              value={formData.bankAccountNumber}
              onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
              placeholder="12345678"
              maxLength={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Sort Code
            </label>
            <input
              type="text"
              value={formData.bankSortCode}
              onChange={(e) => setFormData({ ...formData, bankSortCode: e.target.value })}
              placeholder="12-34-56"
              maxLength={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {accountManager && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            <Shield size={20} className="inline mr-2" />
            Your Account Manager
          </h3>
          <div className="flex items-center gap-6 mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#e71c5e] to-[#c91852] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {accountManager.full_name.charAt(0)}
            </div>
            <div className="flex-1">
              <h4 className="text-2xl font-bold text-gray-900">{accountManager.full_name}</h4>
              <p className="text-sm text-gray-600">{accountManager.department}</p>
              {accountManager.bio && (
                <p className="text-sm text-gray-700 mt-2">{accountManager.bio}</p>
              )}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <a
              href={`mailto:${accountManager.email}`}
              className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <Mail size={20} className="text-[#e71c5e]" />
              <div>
                <p className="text-xs text-gray-600">Email</p>
                <p className="font-semibold text-gray-900 text-sm">{accountManager.email}</p>
              </div>
            </a>
            {accountManager.phone && (
              <a
                href={`tel:${accountManager.phone}`}
                className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
              >
                <Phone size={20} className="text-green-600" />
                <div>
                  <p className="text-xs text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900 text-sm">{accountManager.phone}</p>
                </div>
              </a>
            )}
          </div>
          <p className="mt-4 text-sm text-gray-700">
            Your dedicated account manager is here to help with any questions or support you need.
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#e71c5e] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#c91852] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
