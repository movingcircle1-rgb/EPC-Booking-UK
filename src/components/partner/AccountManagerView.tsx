import { useState, useEffect } from 'react';
import { User, Mail, Phone, MessageCircle, Building2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function AccountManagerView() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [accountManager, setAccountManager] = useState<any>(null);

  useEffect(() => {
    loadAccountManager();
  }, [user]);

  const loadAccountManager = async () => {
    if (!user) return;

    try {
      const { data: partnerData } = await supabase
        .from('partners')
        .select('account_manager_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (partnerData?.account_manager_id) {
        const { data: managerData } = await supabase
          .from('account_managers')
          .select('*')
          .eq('id', partnerData.account_manager_id)
          .eq('is_active', true)
          .maybeSingle();

        setAccountManager(managerData);
      } else {
        const { data: defaultManager } = await supabase
          .from('account_managers')
          .select('*')
          .eq('is_active', true)
          .limit(1)
          .maybeSingle();

        setAccountManager(defaultManager);
      }
    } catch (error) {
      console.error('Error loading account manager:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e71c5e]"></div>
      </div>
    );
  }

  if (!accountManager) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
        <User size={48} className="text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Account Manager Assigned</h3>
        <p className="text-gray-600">
          An account manager will be assigned to your account shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Your Account Manager</h2>
        <p className="text-gray-600 mt-1">Your dedicated contact for all partnership matters</p>
      </div>

      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#e71c5e] to-[#c91852] flex items-center justify-center">
              {accountManager.avatar_url ? (
                <img
                  src={accountManager.avatar_url}
                  alt={accountManager.full_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User size={48} className="text-white" />
              )}
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{accountManager.full_name}</h3>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#e71c5e] bg-opacity-10 rounded-full text-[#e71c5e] font-semibold text-sm mb-4">
              <Building2 size={16} />
              {accountManager.department}
            </div>

            {accountManager.bio && (
              <p className="text-gray-700 mb-6 leading-relaxed">{accountManager.bio}</p>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <a
                href={`mailto:${accountManager.email}`}
                className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              >
                <div className="w-10 h-10 bg-[#e71c5e] bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail size={20} className="text-[#e71c5e]" />
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Email</p>
                  <p className="text-sm text-gray-900 font-medium">{accountManager.email}</p>
                </div>
              </a>

              {accountManager.phone && (
                <a
                  href={`tel:${accountManager.phone}`}
                  className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 font-semibold">Phone</p>
                    <p className="text-sm text-gray-900 font-medium">{accountManager.phone}</p>
                  </div>
                </a>
              )}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <MessageCircle size={20} className="text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">Need Assistance?</p>
                  <p className="text-sm text-blue-800">
                    Your account manager is here to help with referrals, commissions, marketing materials,
                    and any questions about your partnership. Feel free to reach out at any time!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
