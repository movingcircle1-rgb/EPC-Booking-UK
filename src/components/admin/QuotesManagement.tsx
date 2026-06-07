import { useState, useEffect } from 'react';
import { FileText, Search, Filter, Eye, CheckCircle, XCircle, Clock, Mail, Phone, MapPin, Calendar, DollarSign, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../portal/LoadingSpinner';
import StatusBadge from '../portal/StatusBadge';

interface Quote {
  id: string;
  quote_number: string;
  name: string;
  email: string;
  phone: string;
  service_type: string;
  from_postcode: string;
  to_postcode: string;
  property_size: string;
  preferred_date: string;
  flexible_dates: boolean;
  location: string;
  message: string;
  additional_requirements: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface QuoteRequest {
  id: string;
  quote_reference: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  service_type: string;
  move_from_postcode: string | null;
  move_to_postcode: string | null;
  property_type: string | null;
  number_of_bedrooms: number | null;
  preferred_move_date: string | null;
  flexible_dates: boolean;
  additional_notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

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

export default function QuotesManagement() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<QuoteRequest[]>([]);
  const [filteredQuotations, setFilteredQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'requests' | 'quotations' | 'old_quotes'>('requests');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchQuotes();

    const quoteRequestsSubscription = supabase
      .channel('quote_requests_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quote_requests' }, () => {
        fetchQuotes();
      })
      .subscribe();

    const quotationsSubscription = supabase
      .channel('quotations_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quotations' }, () => {
        fetchQuotes();
      })
      .subscribe();

    return () => {
      quoteRequestsSubscription.unsubscribe();
      quotationsSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    filterQuotes();
  }, [quotes, searchTerm, statusFilter]);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const [quotesResult, requestsResult, quotationsResult] = await Promise.all([
        supabase.from('quotes').select('*').order('created_at', { ascending: false }),
        supabase.from('quote_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('quotations').select('*').order('created_at', { ascending: false })
      ]);

      if (quotesResult.error) console.error('Error fetching quotes:', quotesResult.error);
      if (requestsResult.error) console.error('Error fetching quote requests:', requestsResult.error);
      if (quotationsResult.error) console.error('Error fetching quotations:', quotationsResult.error);

      setQuotes(quotesResult.data || []);
      setQuoteRequests(requestsResult.data || []);
      setQuotations(quotationsResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterQuotes = () => {
    let filteredQ = [...quotes];
    let filteredR = [...quoteRequests];
    let filteredQu = [...quotations];

    if (searchTerm) {
      filteredQ = filteredQ.filter(
        (quote) =>
          quote.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quote.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
      filteredR = filteredR.filter(
        (req) =>
          req.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.quote_reference.toLowerCase().includes(searchTerm.toLowerCase())
      );
      filteredQu = filteredQu.filter(
        (quot) =>
          quot.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quot.quotation_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filteredQ = filteredQ.filter((quote) => quote.status === statusFilter);
      filteredR = filteredR.filter((req) => req.status === statusFilter);
      filteredQu = filteredQu.filter((quot) => quot.status === statusFilter);
    }

    setFilteredQuotes(filteredQ);
    setFilteredRequests(filteredR);
    setFilteredQuotations(filteredQu);
  };

  const updateQuoteStatus = async (quoteId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ status: newStatus, processed_at: new Date().toISOString() })
        .eq('id', quoteId);

      if (error) throw error;

      setQuotes((prev) =>
        prev.map((quote) =>
          quote.id === quoteId ? { ...quote, status: newStatus } : quote
        )
      );

      if (selectedQuote?.id === quoteId) {
        setSelectedQuote((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error('Error updating quote status:', error);
      alert('Failed to update quote status');
    }
  };

  const updateQuoteRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('quote_requests')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;

      setQuoteRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: newStatus } : req
        )
      );

      if (selectedRequest?.id === requestId) {
        setSelectedRequest((prev) => prev ? { ...prev, status: newStatus } : null);
      }

      alert(`Quote request ${newStatus}!`);
      if (showDetailModal) {
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('Error updating quote request:', error);
      alert('Failed to update quote request status');
    }
  };

  const acceptQuoteRequest = async (requestId: string) => {
    if (!confirm('Accept this quote request?')) return;
    await updateQuoteRequestStatus(requestId, 'accepted');
  };

  const rejectQuoteRequest = async (requestId: string) => {
    if (!confirm('Reject this quote request?')) return;
    await updateQuoteRequestStatus(requestId, 'declined');
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
      await fetchQuotes();
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
      await fetchQuotes();
    } catch (error) {
      console.error('Error declining quotation:', error);
      alert('Failed to decline quotation. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      contacted: 'bg-purple-100 text-purple-800',
      quoted: 'bg-green-100 text-green-800',
      accepted: 'bg-emerald-100 text-emerald-800',
      declined: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
      completed: 'bg-teal-100 text-teal-800',
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
    all: quotes.length + quoteRequests.length + quotations.length,
    new: quotes.filter((q) => q.status === 'new').length + quoteRequests.filter((q) => q.status === 'new').length,
    pending: quotes.filter((q) => q.status === 'pending').length + quotations.filter((q) => q.status === 'pending' || q.status === 'sent').length,
    contacted: quotes.filter((q) => q.status === 'contacted').length + quoteRequests.filter((q) => q.status === 'contacted').length,
    quoted: quotes.filter((q) => q.status === 'quoted').length + quoteRequests.filter((q) => q.status === 'quoted').length,
    requests: quoteRequests.length,
    quotations: quotations.length,
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
          <h2 className="text-2xl font-bold text-gray-900">Quote Requests</h2>
          <p className="text-gray-600 mt-1">Manage and process customer quote requests</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'All Quotes', count: statusCounts.all, status: 'all', color: 'gray' },
          { label: 'New', count: statusCounts.new, status: 'new', color: 'blue' },
          { label: 'Pending', count: statusCounts.pending, status: 'pending', color: 'yellow' },
          { label: 'Contacted', count: statusCounts.contacted, status: 'contacted', color: 'purple' },
          { label: 'Quoted', count: statusCounts.quoted, status: 'quoted', color: 'green' },
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
                placeholder="Search by name, email, or reference number..."
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No quote requests found matching your criteria
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">{request.quote_reference}</span>
                      <p className="text-xs text-gray-500">{formatDate(request.created_at)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">{request.customer_name}</p>
                      <p className="text-xs text-gray-500">{request.customer_email}</p>
                      <p className="text-xs text-gray-500">{request.customer_phone || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">{request.service_type.replace('_', ' ')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{request.move_from_postcode || 'N/A'}</p>
                      <p className="text-xs text-gray-500">to {request.move_to_postcode || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">
                        {request.preferred_move_date ? formatDate(request.preferred_move_date) : 'Not specified'}
                      </p>
                      {request.flexible_dates && (
                        <p className="text-xs text-gray-500">Flexible</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowDetailModal(true);
                          }}
                          className="p-2 text-gray-600 hover:text-[#C73532] hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {(request.status === 'new' || request.status === 'pending') && (
                          <>
                            <button
                              onClick={() => acceptQuoteRequest(request.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Accept Quote Request"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => rejectQuoteRequest(request.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject Quote Request"
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

      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#949494] to-[#6b6b6b] p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Quote Request Details</h2>
                <p className="text-gray-200 text-sm mt-1">Ref: {selectedRequest.quote_reference}</p>
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
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#C73532]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText size={16} className="text-[#C73532]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Name</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedRequest.customer_name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#C73532]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail size={16} className="text-[#C73532]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedRequest.customer_email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#C73532]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone size={16} className="text-[#C73532]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedRequest.customer_phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">Move Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Service Type</p>
                        <p className="text-sm font-semibold text-gray-900 capitalize">{selectedRequest.service_type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Route</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedRequest.move_from_postcode || 'N/A'} → {selectedRequest.move_to_postcode || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Preferred Date</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedRequest.preferred_move_date ? formatDate(selectedRequest.preferred_move_date) : 'Not specified'}
                          {selectedRequest.flexible_dates && <span className="text-gray-500 ml-2">(Flexible)</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedRequest.property_type && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Property Type</h3>
                  <p className="text-sm text-gray-900 capitalize">{selectedRequest.property_type.replace('_', ' ')}</p>
                  {selectedRequest.number_of_bedrooms && (
                    <p className="text-sm text-gray-700 mt-1">{selectedRequest.number_of_bedrooms} bedrooms</p>
                  )}
                </div>
              )}

              {selectedRequest.additional_notes && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Additional Notes</h3>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedRequest.additional_notes}</p>
                </div>
              )}

              {(selectedRequest.status === 'new' || selectedRequest.status === 'pending') && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">Admin Actions</h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() => acceptQuoteRequest(selectedRequest.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                      <CheckCircle size={18} />
                      Accept Quote Request
                    </button>
                    <button
                      onClick={() => rejectQuoteRequest(selectedRequest.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                    >
                      <XCircle size={18} />
                      Reject Quote Request
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
