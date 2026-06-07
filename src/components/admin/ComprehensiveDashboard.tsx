import { useEffect, useState } from 'react';
import { Users, Briefcase, UserCog, Package, DollarSign, TrendingUp, Calendar, FileText, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ComprehensiveDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    clients: { total: 0, active: 0, quotations: 0, activeBookings: 0 },
    partners: { total: 0, active: 0, referrals: 0, commissionPaid: 0 },
    trade: { total: 0, active: 0, jobs: 0, bids: 0, bookings: 0 },
    staff: { total: 0, active: 0, onShift: 0 },
    overall: { totalRevenue: 0, pendingPayments: 0, activeJobs: 0 }
  });

  useEffect(() => {
    loadAllStats();
  }, []);

  const loadAllStats = async () => {
    try {
      const [
        clientsCount,
        clientsActive,
        quotationsCount,
        partnersCount,
        partnersActive,
        referralsCount,
        commissionData,
        tradeCount,
        tradeActive,
        tradeJobsCount,
        tradeBidsCount,
        tradeBookingsCount,
        staffCount,
        staffActive
      ] = await Promise.all([
        supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('role', 'client'),
        supabase.from('user_roles').select('id', { count: 'exact', head: true }).eq('role', 'client'),
        supabase.from('quotations').select('id', { count: 'exact', head: true }),
        supabase.from('partners').select('id', { count: 'exact', head: true }),
        supabase.from('partners').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('referrals').select('id', { count: 'exact', head: true }),
        supabase.from('commission_statements').select('paid_amount'),
        supabase.from('trade_accounts').select('id', { count: 'exact', head: true }),
        supabase.from('trade_accounts').select('id', { count: 'exact', head: true }).eq('account_status', 'active'),
        supabase.from('trade_jobs').select('id', { count: 'exact', head: true }),
        supabase.from('trade_bids').select('id', { count: 'exact', head: true }),
        supabase.from('trade_service_bookings').select('id', { count: 'exact', head: true }),
        supabase.from('staff_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('staff_profiles').select('id', { count: 'exact', head: true }).eq('is_active', true)
      ]);

      const totalCommission = commissionData.data?.reduce((sum, record) =>
        sum + parseFloat(record.paid_amount || 0), 0) || 0;

      setStats({
        clients: {
          total: clientsCount.count || 0,
          active: clientsActive.count || 0,
          quotations: quotationsCount.count || 0,
          activeBookings: 0
        },
        partners: {
          total: partnersCount.count || 0,
          active: partnersActive.count || 0,
          referrals: referralsCount.count || 0,
          commissionPaid: totalCommission
        },
        trade: {
          total: tradeCount.count || 0,
          active: tradeActive.count || 0,
          jobs: tradeJobsCount.count || 0,
          bids: tradeBidsCount.count || 0,
          bookings: tradeBookingsCount.count || 0
        },
        staff: {
          total: staffCount.count || 0,
          active: staffActive.count || 0,
          onShift: 0
        },
        overall: {
          totalRevenue: 0,
          pendingPayments: 0,
          activeJobs: tradeJobsCount.count || 0
        }
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
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
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Users size={32} className="opacity-80" />
            <span className="text-3xl font-bold">{stats.clients.total}</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Clients</h3>
          <div className="space-y-1 text-sm">
            <p className="opacity-90">Active: {stats.clients.active}</p>
            <p className="opacity-90">Quotations: {stats.clients.quotations}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Briefcase size={32} className="opacity-80" />
            <span className="text-3xl font-bold">{stats.partners.total}</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Partners</h3>
          <div className="space-y-1 text-sm">
            <p className="opacity-90">Active: {stats.partners.active}</p>
            <p className="opacity-90">Referrals: {stats.partners.referrals}</p>
            <p className="opacity-90">Paid: £{stats.partners.commissionPaid.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <Package size={32} className="opacity-80" />
            <span className="text-3xl font-bold">{stats.trade.total}</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Trade</h3>
          <div className="space-y-1 text-sm">
            <p className="opacity-90">Active: {stats.trade.active}</p>
            <p className="opacity-90">Jobs: {stats.trade.jobs}</p>
            <p className="opacity-90">Bids: {stats.trade.bids}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <UserCog size={32} className="opacity-80" />
            <span className="text-3xl font-bold">{stats.staff.total}</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Staff</h3>
          <div className="space-y-1 text-sm">
            <p className="opacity-90">Active: {stats.staff.active}</p>
            <p className="opacity-90">On Shift: {stats.staff.onShift}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">£{stats.overall.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign size={24} className="text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500">This Month</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Pending Payments</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">£{stats.overall.pendingPayments.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock size={24} className="text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500">Awaiting Processing</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#be0e0c]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-600 text-sm font-semibold">Active Jobs</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.overall.activeJobs}</p>
            </div>
            <div className="w-12 h-12 bg-[#be0e0c] bg-opacity-10 rounded-full flex items-center justify-center">
              <TrendingUp size={24} className="text-[#be0e0c]" />
            </div>
          </div>
          <p className="text-sm text-gray-500">In Progress</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FileText size={24} />
          Quick Actions
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#be0e0c] hover:shadow-md transition-all text-left">
            <Users size={20} className="text-[#be0e0c] mb-2" />
            <p className="font-semibold text-gray-900">Manage Users</p>
            <p className="text-xs text-gray-600 mt-1">View all users and roles</p>
          </button>

          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#be0e0c] hover:shadow-md transition-all text-left">
            <Calendar size={20} className="text-[#be0e0c] mb-2" />
            <p className="font-semibold text-gray-900">View Bookings</p>
            <p className="text-xs text-gray-600 mt-1">Manage all bookings</p>
          </button>

          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#be0e0c] hover:shadow-md transition-all text-left">
            <FileText size={20} className="text-[#be0e0c] mb-2" />
            <p className="font-semibold text-gray-900">Reports</p>
            <p className="text-xs text-gray-600 mt-1">Generate reports</p>
          </button>

          <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#be0e0c] hover:shadow-md transition-all text-left">
            <AlertCircle size={20} className="text-[#be0e0c] mb-2" />
            <p className="font-semibold text-gray-900">Alerts</p>
            <p className="text-xs text-gray-600 mt-1">View system alerts</p>
          </button>
        </div>
      </div>
    </div>
  );
}
