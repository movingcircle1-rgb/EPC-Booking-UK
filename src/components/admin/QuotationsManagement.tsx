import { useState, useEffect } from 'react';
import { FileText, Search, Eye, CheckCircle, XCircle, RefreshCw, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../portal/LoadingSpinner';
import StatusBadge from '../portal/StatusBadge';

interface Quotation {
  id: string;
  quotation_number: string;
  customer_email: string;
  service_type: string;
  move_from: string;
  move_to: string;
  move_date: string | null;
  base_amount: number;
  total_amount: number;
  status: string;
  valid_until: string;
  terms_accepted: boolean;
  created_at: string;
  updated_at: string;
}

export default function QuotationsManagement() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [filteredQuotations, setFilteredQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchQuotations();
  }, []);

  useEffect(() => {
    filterQuotations();
  }, [quotations, searchTerm, statusFilter]);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotations(data || []);
    } catch (error) {
      console.error('Error fetching quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterQuotations = () => {
    let filtered = [...quotations];

    if (searchTerm) {
      filtered = filtered.filter(
        (quot) =>
          quot.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quot.quotation_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((quot) => quot.status === statusFilter);
    }

    setFilteredQuotations(filtered);
  };

  const acceptQuotation = async (quotationId: string) => {
    if (!confirm('Accept this quotation on behalf of the client?')) return;

    try {
      const { error } = await supabase
        .from('quotations')
        .update({
          status: 'accepted',
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', quotationId);

      if (error) throw error;

      alert('Quotation accepted successfully!');
      await fetchQuotations();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error accepting quotation:', error);
      alert('Failed to accept quotation. Please try again.');
    }
  };

  const rejectQuotation = async (quotationId: string) => {
    if (!confirm('Decline this quotation?')) return;

    try {
      const { error } = await supabase
        .from('quotations')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', quotationId);

      if (error) throw error;

      alert('Quotation declined.');
      await fetchQuotations();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error declining quotation:', error);
      alert('Failed to decline quotation. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-blue-100 text-blue-800',
      accepted: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const statusCounts = {
    all: quotations.length,
    pending: quotations.filter((q) => q.status === 'pending' || q.status === 'sent').length,
    accepted: quotations.filter((q) => q.status === 'accepted').length,
    rejected: quotations.filter((q) => q.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quotations</h2>
          <p className="text-gray-600 mt-1">Manage sent quotations and track acceptances</p>
        </div>
        <button
          onClick={fetchQuotations}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'All Quotations', count: statusCounts.all, status: 'all' },
          { label: 'Pending/Sent', count: statusCounts.pending, status: 'pending' },
          { label: 'Accepted', count: statusCounts.accepted, status: 'accepted' },
          { label: 'Rejected', count: statusCounts.rejected, status: 'rejected' },
        ].map((stat) => (
          <button
            key={stat.status}
            onClick={() => setStatusFilter(stat.status)}
            className={`p-4 rounded-lg border-2 transition-all ${
              statusFilter === stat.status
                ? 'border-[#C73532] bg-[#C73532]/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <p className="text-sm text-gray-600 font-semibold">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.count}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email or quotation number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C73532]/20 focus:border-[#C73532]"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Quotation #</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Service</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Route</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No quotations found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredQuotations.map((quotation) => (
                  <tr key={quotation.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">{quotation.quotation_number}</span>
                      <p className="text-xs text-gray-500">{formatDate(quotation.created_at)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">{quotation.customer_email}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">{quotation.service_type.replace('_', ' ')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{quotation.move_from}</p>
                      <p className="text-xs text-gray-500">to {quotation.move_to}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-bold text-green-600">£{parseFloat(quotation.total_amount.toString()).toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(quotation.status)}`}>
                        {quotation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedQuotation(quotation);
                            setShowDetailModal(true);
                          }}
                          className="p-2 text-gray-600 hover:text-[#C73532] hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {(quotation.status === 'pending' || quotation.status === 'sent') && (
                          <>
                            <button
                              onClick={() => acceptQuotation(quotation.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Accept Quotation"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => rejectQuotation(quotation.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject Quotation"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDetailModal && selectedQuotation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#949494] to-[#6b6b6b] p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Quotation Details</h2>
                <p className="text-gray-200 text-sm mt-1">Ref: {selectedQuotation.quotation_number}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <XCircle size={24} className="text-white" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">Customer Information</h3>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-semibold">Email:</span> {selectedQuotation.customer_email}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">Move Details</h3>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-semibold">Service:</span> {selectedQuotation.service_type.replace('_', ' ')}</p>
                    <p className="text-sm"><span className="font-semibold">From:</span> {selectedQuotation.move_from}</p>
                    <p className="text-sm"><span className="font-semibold">To:</span> {selectedQuotation.move_to}</p>
                    {selectedQuotation.move_date && (
                      <p className="text-sm"><span className="font-semibold">Date:</span> {formatDate(selectedQuotation.move_date)}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-3">Pricing</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">Base Amount:</span>
                    <span className="text-sm font-semibold">£{parseFloat(selectedQuotation.base_amount.toString()).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                    <span className="text-lg font-bold text-green-600">£{parseFloat(selectedQuotation.total_amount.toString()).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Status:</span> {selectedQuotation.status}
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  <span className="font-semibold">Valid Until:</span> {formatDate(selectedQuotation.valid_until)}
                </p>
                {selectedQuotation.terms_accepted && (
                  <p className="text-sm text-green-700 mt-2 font-semibold">Terms have been accepted</p>
                )}
              </div>

              {(selectedQuotation.status === 'pending' || selectedQuotation.status === 'sent') && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">Admin Actions</h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() => acceptQuotation(selectedQuotation.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                      <CheckCircle size={18} />
                      Accept on Behalf of Client
                    </button>
                    <button
                      onClick={() => rejectQuotation(selectedQuotation.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                    >
                      <XCircle size={18} />
                      Decline Quotation
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
