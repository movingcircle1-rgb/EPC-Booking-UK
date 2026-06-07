import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Clock, CheckCircle, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function CommissionStatements() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalEarned: 0,
    pendingAmount: 0,
    paidAmount: 0,
    count: 0
  });

  useEffect(() => {
    loadCommissions();
  }, [user]);

  const loadCommissions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('partner_commissions')
        .select(`
          *,
          referral:partner_referrals(customer_name, move_from_postcode, move_to_postcode)
        `)
        .eq('partner_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const commissionData = data || [];
      setCommissions(commissionData);

      const totals = commissionData.reduce(
        (acc, comm) => {
          const amount = parseFloat(comm.commission_amount || 0);
          acc.totalEarned += amount;
          if (comm.status === 'pending' || comm.status === 'approved') acc.pendingAmount += amount;
          if (comm.status === 'paid') acc.paidAmount += amount;
          acc.count++;
          return acc;
        },
        { totalEarned: 0, pendingAmount: 0, paidAmount: 0, count: 0 }
      );

      setStats(totals);
    } catch (error) {
      console.error('[CommissionStatements] Error loading:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-blue-100 text-blue-800 border-blue-300',
      paid: 'bg-green-100 text-green-800 border-green-300'
    };

    const icons = {
      pending: <Clock size={14} />,
      approved: <CheckCircle size={14} />,
      paid: <CheckCircle size={14} />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${styles[status as keyof typeof styles] || styles.pending}`}>
        {icons[status as keyof typeof icons] || icons.pending}
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={24} />
            <p className="text-sm font-semibold opacity-90">Total Earned</p>
          </div>
          <p className="text-3xl font-bold">£{stats.totalEarned.toFixed(2)}</p>
          <p className="text-xs opacity-75 mt-1">{stats.count} commissions</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={24} />
            <p className="text-sm font-semibold opacity-90">Pending</p>
          </div>
          <p className="text-3xl font-bold">£{stats.pendingAmount.toFixed(2)}</p>
          <p className="text-xs opacity-75 mt-1">Awaiting approval</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={24} />
            <p className="text-sm font-semibold opacity-90">Paid</p>
          </div>
          <p className="text-3xl font-bold">£{stats.paidAmount.toFixed(2)}</p>
          <p className="text-xs opacity-75 mt-1">Received payments</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={24} />
            <p className="text-sm font-semibold opacity-90">Avg Commission</p>
          </div>
          <p className="text-3xl font-bold">
            £{stats.count > 0 ? (stats.totalEarned / stats.count).toFixed(2) : '0.00'}
          </p>
          <p className="text-xs opacity-75 mt-1">Per referral</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Commission Statements</h2>
            <p className="text-gray-600 mt-1">Track your earnings and payment history</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Download size={18} />
            Export
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-600">Loading statements...</div>
        ) : commissions.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 font-semibold">No commissions yet</p>
            <p className="text-sm text-gray-500 mt-2">Your earnings will appear here when referrals are completed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Job Value</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Commission</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Paid Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {commissions.map((commission) => (
                  <tr key={commission.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(commission.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {commission.referral?.customer_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {commission.referral?.move_from_postcode} → {commission.referral?.move_to_postcode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      £{parseFloat(commission.job_value).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {parseFloat(commission.commission_rate).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                      £{parseFloat(commission.commission_amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(commission.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {commission.paid_date ? new Date(commission.paid_date).toLocaleDateString('en-GB') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-2">Payment Information</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• Commissions are calculated when a referred customer completes their move</li>
          <li>• Pending commissions are reviewed and approved within 5 business days</li>
          <li>• Payments are processed monthly on the 1st of each month</li>
          <li>• Funds are transferred to your registered bank account</li>
          <li>• Payment references will be emailed to you</li>
        </ul>
      </div>
    </div>
  );
}
