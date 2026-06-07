import { useEffect, useState } from 'react';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { hardNavigate } from '../lib/nav'
import { DollarSign, Users, TrendingUp, Bell, User, FileText, PlusCircle, Award, AlertCircle, Home, UserCircle, Download, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useReferrals, useNotifications } from '../hooks/usePortalData';
import { useEnsurePortalRecord } from '../hooks/useEnsurePortalRecord';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import PortalHeader from '../components/PortalHeader';
import DashboardCard from '../components/portal/DashboardCard';
import EmptyState from '../components/portal/EmptyState';
import StatusBadge from '../components/portal/StatusBadge';
import LoadingSpinner from '../components/portal/LoadingSpinner';
import ProfileManagement from '../components/partner/ProfileManagement';
import AccountManagerView from '../components/partner/AccountManagerView';
import ClientReferrals from '../components/partner/ClientReferrals';
import CommissionStatements from '../components/partner/CommissionStatements';
import MarketingMaterials from '../components/partner/MarketingMaterials';

export default function PartnerPortalPage() {
  useRequireAuth();
  const { user, userRole, loading: authLoading } = useAuth();
  const { isVerifying, hasRecord, error: portalError } = useEnsurePortalRecord();
  const { referrals, loading: referralsLoading } = useReferrals();
  const { notifications, loading: notificationsLoading } = useNotifications();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showReferralForm, setShowReferralForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    serviceType: 'House Removal',
    moveFrom: '',
    moveTo: '',
    notes: ''
  });

  useEffect(() => {
    console.log('[PartnerPortalPage] Auth state:', { authLoading, user: !!user, userRole: userRole?.role });

    if (!authLoading && !user) {
      console.log('[PartnerPortalPage] No user, redirecting to login');
      hardNavigate('/portal/login');
      return;
    }

    if (!authLoading && user && userRole) {
      console.log('[PartnerPortalPage] User role verified:', userRole.role);
      if (userRole.role !== 'partner' && userRole.role !== 'admin') {
        console.log('[PartnerPortalPage] Not a partner, redirecting to correct portal');
        const correctPath = userRole.role === 'client' ? '/client-portal' :
                          userRole.role === 'trade' ? '/trade-portal' :
                          userRole.role === 'staff' ? '/staff-portal' : '/';
        hardNavigate(correctPath, { replace: true });
      }
    }
  }, [user, userRole, authLoading]);

  const handleSubmitReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: partnerData } = await supabase
        .from('partners')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (!partnerData) {
        alert('Partner account not found');
        return;
      }

      const { error } = await supabase
        .from('referrals')
        .insert({
          partner_id: partnerData.id,
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          customer_phone: formData.customerPhone,
          service_type: formData.serviceType,
          move_from: formData.moveFrom,
          move_to: formData.moveTo,
          referral_notes: formData.notes,
          status: 'pending',
          commission_rate: 5.00
        });

      if (error) throw error;

      alert('Referral submitted successfully!');
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        serviceType: 'House Removal',
        moveFrom: '',
        moveTo: '',
        notes: ''
      });
      setShowReferralForm(false);
      window.location.reload();
    } catch (error: any) {
      console.error('Error submitting referral:', error);
      alert('Failed to submit referral. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user || isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (portalError || !hasRecord) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <AlertCircle size={32} className="text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Setting Up Your Portal</h2>
          <p className="text-gray-600 mb-6">
            {portalError || 'Your partner account is being configured. Please refresh the page in a moment.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#be0e0c] hover:bg-[#9f0b0a] text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.is_read).length;
  const pendingReferrals = referrals.filter(r => ['pending', 'contacted'].includes(r.status));
  const completedReferrals = referrals.filter(r => r.status === 'completed');
  const totalCommission = referrals
    .filter(r => r.commission_paid)
    .reduce((sum, r) => sum + parseFloat(r.commission_amount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalHeader title="Partner Portal" />
      <SEO
        title="Partner Portal - My Dashboard"
        description="Manage your referrals, track commissions, and grow your partnership"
        canonicalUrl="https://nationalremovalsandstorage.co.uk/partner-portal"
        noindex={true}
      />

      <div className="bg-gradient-to-r from-slate-600 to-slate-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {userRole?.full_name || 'Partner'}</h1>
              <p className="text-gray-100">Manage your referrals and track commissions</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-3 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all">
                <Bell size={24} />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#be0e0c] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              <button
                onClick={() => hardNavigate('/profile')}
                className="flex items-center gap-2 p-3 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all"
              >
                <User size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md mb-8 overflow-x-auto">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-2 ${
                activeTab === 'dashboard'
                  ? 'border-[#be0e0c] text-[#be0e0c]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutDashboard size={20} />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-2 ${
                activeTab === 'profile'
                  ? 'border-[#be0e0c] text-[#be0e0c]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserCircle size={20} />
              Account Profile
            </button>
            <button
              onClick={() => setActiveTab('referrals')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-2 ${
                activeTab === 'referrals'
                  ? 'border-[#be0e0c] text-[#be0e0c]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users size={20} />
              Client Referrals
            </button>
            <button
              onClick={() => setActiveTab('statements')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-2 ${
                activeTab === 'statements'
                  ? 'border-[#be0e0c] text-[#be0e0c]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <DollarSign size={20} />
              Commission
            </button>
            <button
              onClick={() => setActiveTab('materials')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-2 ${
                activeTab === 'materials'
                  ? 'border-[#be0e0c] text-[#be0e0c]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Download size={20} />
              Marketing
            </button>
            <button
              onClick={() => setActiveTab('manager')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-2 ${
                activeTab === 'manager'
                  ? 'border-[#be0e0c] text-[#be0e0c]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <User size={20} />
              Account Manager
            </button>
          </div>
        </div>

        {activeTab === 'profile' && <ProfileManagement />}
        {activeTab === 'referrals' && <ClientReferrals />}
        {activeTab === 'statements' && <CommissionStatements />}
        {activeTab === 'materials' && <MarketingMaterials />}
        {activeTab === 'manager' && <AccountManagerView />}

        {activeTab === 'dashboard' && (
          <>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#be0e0c]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Referrals</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{referrals.length}</p>
              </div>
              <div className="w-12 h-12 bg-[#be0e0c] bg-opacity-10 rounded-full flex items-center justify-center">
                <Users size={24} className="text-[#be0e0c]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Pending</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{pendingReferrals.length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <TrendingUp size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{completedReferrals.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Award size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Earned</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">£{totalCommission.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign size={24} className="text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <button
            onClick={() => setShowReferralForm(!showReferralForm)}
            className="bg-[#be0e0c] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#9f0b0a] transition-colors flex items-center gap-2"
          >
            <PlusCircle size={20} />
            Submit New Referral
          </button>
        </div>

        {showReferralForm && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">New Referral Form</h2>
            <form onSubmit={handleSubmitReferral} className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Customer Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Customer Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Customer Phone
                </label>
                <input
                  type="tel"
                  required
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent"
                  placeholder="07xxx xxxxxx"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Service Type
                </label>
                <select
                  value={formData.serviceType}
                  onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent">
                  <option>House Removal</option>
                  <option>Office Removal</option>
                  <option>International Move</option>
                  <option>Storage Services</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Move From
                </label>
                <input
                  type="text"
                  required
                  value={formData.moveFrom}
                  onChange={(e) => setFormData({...formData, moveFrom: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent"
                  placeholder="City or Postcode"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Move To
                </label>
                <input
                  type="text"
                  required
                  value={formData.moveTo}
                  onChange={(e) => setFormData({...formData, moveTo: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent"
                  placeholder="City or Postcode"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent"
                  placeholder="Any specific requirements or information about this referral..."
                />
              </div>
              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#be0e0c] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#9f0b0a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Referral'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReferralForm(false)}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <DashboardCard
            title="Recent Referrals"
            icon={Users}
            action={{ label: 'View All', onClick: () => {} }}
          >
            {referralsLoading ? (
              <LoadingSpinner />
            ) : referrals.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No Referrals Yet"
                description="Start earning commissions by referring customers to us. Submit your first referral to get started."
                actionLabel="Submit Referral"
                onAction={() => setShowReferralForm(true)}
              />
            ) : (
              <div className="space-y-4">
                {referrals.slice(0, 5).map((referral) => (
                  <div key={referral.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900">{referral.customer_name}</h3>
                        <p className="text-sm text-gray-600">{referral.service_type}</p>
                      </div>
                      <StatusBadge status={referral.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Commission Rate</p>
                        <p className="font-semibold text-gray-900">{referral.commission_rate}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Potential Earnings</p>
                        <p className="font-semibold text-[#be0e0c]">
                          £{referral.commission_amount || '0.00'}
                        </p>
                      </div>
                    </div>
                    {referral.commission_paid && (
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full text-sm text-green-800 font-semibold">
                        <DollarSign size={16} />
                        Commission Paid
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>

          <DashboardCard title="Commission Summary" icon={DollarSign}>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-[#be0e0c] to-[#9f0b0a] rounded-lg p-6 text-white">
                <p className="text-sm font-semibold mb-2">Total Earnings This Month</p>
                <p className="text-4xl font-bold mb-4">£0.00</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-white text-opacity-80">Pending</p>
                    <p className="font-bold">£0.00</p>
                  </div>
                  <div>
                    <p className="text-white text-opacity-80">Paid</p>
                    <p className="font-bold">£{totalCommission.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-3">Recent Statements</h4>
                <EmptyState
                  icon={FileText}
                  title="No Statements Yet"
                  description="Commission statements will appear here once your referrals are completed."
                />
              </div>
            </div>
          </DashboardCard>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <DashboardCard title="Recent Notifications" icon={Bell}>
            {notificationsLoading ? (
              <LoadingSpinner />
            ) : notifications.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="No Notifications"
                description="You're all caught up! You'll see updates about your referrals here."
              />
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${
                      notification.is_read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{notification.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>

          <DashboardCard title="Partner Resources" icon={FileText}>
            <div className="space-y-3">
              <button className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#be0e0c] hover:shadow-md transition-all text-left flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Marketing Materials</h4>
                  <p className="text-xs text-gray-600 mt-1">Download brochures and flyers</p>
                </div>
                <FileText size={20} className="text-gray-400" />
              </button>

              <button className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#be0e0c] hover:shadow-md transition-all text-left flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Partner Agreement</h4>
                  <p className="text-xs text-gray-600 mt-1">View your partnership terms</p>
                </div>
                <FileText size={20} className="text-gray-400" />
              </button>

              <button className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#be0e0c] hover:shadow-md transition-all text-left flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Commission Structure</h4>
                  <p className="text-xs text-gray-600 mt-1">View earning potential</p>
                </div>
                <DollarSign size={20} className="text-gray-400" />
              </button>

              <button className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#be0e0c] hover:shadow-md transition-all text-left flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Partner Support</h4>
                  <p className="text-xs text-gray-600 mt-1">Contact your account manager</p>
                </div>
                <Users size={20} className="text-gray-400" />
              </button>
            </div>
          </DashboardCard>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
