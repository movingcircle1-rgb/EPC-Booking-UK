import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, CreditCard, Shield, Save, Edit2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileManagement() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    job_role: '',
    department: '',
    previous_experience: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    bank_account_name: '',
    bank_account_number: '',
    bank_sort_code: '',
    ni_number: '',
    contact_consent: false,
    available_from_date: '',
    cv_file_url: ''
  });

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('staff_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          address: data.address || '',
          job_role: data.job_role || '',
          department: data.department || '',
          previous_experience: data.previous_experience || '',
          emergency_contact_name: data.emergency_contact_name || '',
          emergency_contact_phone: data.emergency_contact_phone || '',
          emergency_contact_relationship: data.emergency_contact_relationship || '',
          bank_account_name: data.bank_account_name || '',
          bank_account_number: data.bank_account_number || '',
          bank_sort_code: data.bank_sort_code || '',
          ni_number: data.ni_number || '',
          contact_consent: data.contact_consent || false,
          available_from_date: data.available_from_date || '',
          cv_file_url: data.cv_file_url || ''
        });
      }
    } catch (error) {
      console.error('[ProfileManagement] Error loading profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const updateData = {
        ...formData,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('staff_profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) throw error;

      alert('Profile updated successfully!');
      setEditing(false);
      loadProfile();
    } catch (error: any) {
      console.error('[ProfileManagement] Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const jobRoles = [
    'Packer',
    'Porter',
    '3.5T Luton / Van Driver',
    'Class 2 Driver',
    'Class 1 Driver',
    'Surveyor'
  ];

  const departments = [
    'Operations',
    'Customer Service',
    'Administration',
    'Warehouse',
    'Management'
  ];

  if (!profile) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg">
      <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
          <p className="text-sm text-gray-600 mt-1">View and update your personal and work information</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#e71c5e] text-white rounded-lg hover:bg-[#c91852] transition-colors"
          >
            <Edit2 size={16} />
            Edit Profile
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User size={20} className="text-[#e71c5e]" />
            Personal Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                disabled={!editing}
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail size={16} className="inline mr-1" />
                Email *
              </label>
              <input
                type="email"
                required
                disabled={!editing}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Phone size={16} className="inline mr-1" />
                Phone Number *
              </label>
              <input
                type="tel"
                required
                disabled={!editing}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin size={16} className="inline mr-1" />
                Address
              </label>
              <input
                type="text"
                disabled={!editing}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Work Information */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-[#e71c5e]" />
            Work Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Job Role *
              </label>
              <select
                required
                disabled={!editing}
                value={formData.job_role}
                onChange={(e) => setFormData({ ...formData, job_role: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select job role</option>
                {jobRoles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Department
              </label>
              <select
                disabled={!editing}
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Previous Experience
              </label>
              <textarea
                disabled={!editing}
                value={formData.previous_experience}
                onChange={(e) => setFormData({ ...formData, previous_experience: e.target.value })}
                rows={3}
                placeholder="Describe your previous work experience..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield size={20} className="text-[#e71c5e]" />
            Emergency Contact
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contact Name
              </label>
              <input
                type="text"
                disabled={!editing}
                value={formData.emergency_contact_name}
                onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                disabled={!editing}
                value={formData.emergency_contact_phone}
                onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Relationship
              </label>
              <input
                type="text"
                disabled={!editing}
                value={formData.emergency_contact_relationship}
                onChange={(e) => setFormData({ ...formData, emergency_contact_relationship: e.target.value })}
                placeholder="e.g., Spouse, Parent"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard size={20} className="text-[#e71c5e]" />
            Bank Account Details
          </h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Secure:</strong> Your bank details are encrypted and only accessible by authorized payroll staff.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account Holder Name
              </label>
              <input
                type="text"
                disabled={!editing}
                value={formData.bank_account_name}
                onChange={(e) => setFormData({ ...formData, bank_account_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account Number
              </label>
              <input
                type="text"
                disabled={!editing}
                value={formData.bank_account_number}
                onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                maxLength={8}
                placeholder="12345678"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sort Code
              </label>
              <input
                type="text"
                disabled={!editing}
                value={formData.bank_sort_code}
                onChange={(e) => setFormData({ ...formData, bank_sort_code: e.target.value })}
                maxLength={6}
                placeholder="12-34-56"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                National Insurance Number
              </label>
              <input
                type="text"
                disabled={!editing}
                value={formData.ni_number}
                onChange={(e) => setFormData({ ...formData, ni_number: e.target.value.toUpperCase() })}
                maxLength={9}
                placeholder="AB123456C"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Work Availability & Consent */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-[#e71c5e]" />
            Work Availability & Consent
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Available for Work From
              </label>
              <input
                type="date"
                disabled={!editing}
                value={formData.available_from_date}
                onChange={(e) => setFormData({ ...formData, available_from_date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload CV
              </label>
              {formData.cv_file_url && !editing && (
                <div className="mb-2">
                  <a
                    href={formData.cv_file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#e71c5e] hover:underline text-sm"
                  >
                    View Current CV
                  </a>
                </div>
              )}
              <input
                type="url"
                disabled={!editing}
                value={formData.cv_file_url}
                onChange={(e) => setFormData({ ...formData, cv_file_url: e.target.value })}
                placeholder="Enter URL to your CV file"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload your CV to a cloud service (Google Drive, Dropbox, etc.) and paste the shareable link here
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!editing}
                  checked={formData.contact_consent}
                  onChange={(e) => setFormData({ ...formData, contact_consent: e.target.checked })}
                  className="mt-1 h-5 w-5 text-[#e71c5e] border-gray-300 rounded focus:ring-[#e71c5e] disabled:cursor-not-allowed"
                />
                <div>
                  <span className="text-sm font-semibold text-gray-900">
                    I give consent to be contacted by National Removals and Storage in relation to upcoming work.
                  </span>
                  <p className="text-xs text-gray-600 mt-1">
                    By checking this box, you agree to receive notifications about available work assignments and scheduling updates.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {editing && (
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-[#e71c5e] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#c91852] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                loadProfile();
              }}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
