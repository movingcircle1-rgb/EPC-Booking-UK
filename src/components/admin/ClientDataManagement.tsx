import { useState, useEffect } from 'react';
import { Users, FileText, Package, Mail, Phone, MapPin, Calendar, Eye, RefreshCw, TrendingUp, CheckCircle, XCircle, Truck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../portal/LoadingSpinner';
import StatusBadge from '../portal/StatusBadge';

interface ClientData {
  email: string;
  name: string;
  phone: string | null;
  quotations: any[];
  quoteRequests: any[];
  packagingOrders: any[];
  totalSpent: number;
  lastActivity: string;
}

export default function ClientDataManagement() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalQuotations: 0,
    totalQuoteRequests: 0,
    totalPackagingOrders: 0,
    totalRevenue: 0,
    pendingQuotes: 0
  });

  useEffect(() => {
    fetchAllClientData();
  }, []);

  async function acceptQuotation(quotationId: string) {
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
      await fetchAllClientData();
    } catch (error) {
      console.error('Error accepting quotation:', error);
      alert('Failed to accept quotation. Please try again.');
    }
  }

  async function declineQuotation(quotationId: string) {
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
      await fetchAllClientData();
    } catch (error) {
      console.error('Error declining quotation:', error);
      alert('Failed to decline quotation. Please try again.');
    }
  }

  async function updatePackagingOrderStatus(orderId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('packaging_orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      alert(`Packaging order status updated to ${newStatus}!`);
      await fetchAllClientData();
    } catch (error) {
      console.error('Error updating packaging order:', error);
      alert('Failed to update packaging order. Please try again.');
    }
  }

  async function fetchAllClientData() {
    try {
      setLoading(true);

      const [quotationsResult, quoteRequestsResult, packagingOrdersResult] = await Promise.all([
        supabase.from('quotations').select('*').order('created_at', { ascending: false }),
        supabase.from('quote_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('packaging_orders').select('*').order('created_at', { ascending: false })
      ]);

      if (quotationsResult.error) throw quotationsResult.error;
      if (quoteRequestsResult.error) throw quoteRequestsResult.error;
      if (packagingOrdersResult.error) throw packagingOrdersResult.error;

      const quotations = quotationsResult.data || [];
      const quoteRequests = quoteRequestsResult.data || [];
      const packagingOrders = packagingOrdersResult.data || [];

      const clientMap = new Map<string, ClientData>();

      quotations.forEach((q) => {
        if (!clientMap.has(q.customer_email)) {
          clientMap.set(q.customer_email, {
            email: q.customer_email,
            name: '',
            phone: null,
            quotations: [],
            quoteRequests: [],
            packagingOrders: [],
            totalSpent: 0,
            lastActivity: q.created_at
          });
        }
        const client = clientMap.get(q.customer_email)!;
        client.quotations.push(q);
        if (q.status === 'accepted') {
          client.totalSpent += parseFloat(q.total_amount.toString());
        }
        if (new Date(q.created_at) > new Date(client.lastActivity)) {
          client.lastActivity = q.created_at;
        }
      });

      quoteRequests.forEach((qr) => {
        if (!clientMap.has(qr.customer_email)) {
          clientMap.set(qr.customer_email, {
            email: qr.customer_email,
            name: qr.customer_name || '',
            phone: qr.customer_phone || null,
            quotations: [],
            quoteRequests: [],
            packagingOrders: [],
            totalSpent: 0,
            lastActivity: qr.created_at
          });
        }
        const client = clientMap.get(qr.customer_email)!;
        if (!client.name) client.name = qr.customer_name || '';
        if (!client.phone) client.phone = qr.customer_phone || null;
        client.quoteRequests.push(qr);
        if (new Date(qr.created_at) > new Date(client.lastActivity)) {
          client.lastActivity = qr.created_at;
        }
      });

      packagingOrders.forEach((po) => {
        if (!clientMap.has(po.customer_email)) {
          clientMap.set(po.customer_email, {
            email: po.customer_email,
            name: '',
            phone: po.contact_phone || null,
            quotations: [],
            quoteRequests: [],
            packagingOrders: [],
            totalSpent: 0,
            lastActivity: po.created_at
          });
        }
        const client = clientMap.get(po.customer_email)!;
        if (!client.phone) client.phone = po.contact_phone || null;
        client.packagingOrders.push(po);
        if (po.status === 'delivered') {
          client.totalSpent += parseFloat(po.total_amount.toString());
        }
        if (new Date(po.created_at) > new Date(client.lastActivity)) {
          client.lastActivity = po.created_at;
        }
      });

      const clientsArray = Array.from(clientMap.values()).sort((a, b) =>
        new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      );

      setClients(clientsArray);

      const totalRevenue = quotations
        .filter(q => q.status === 'accepted')
        .reduce((sum, q) => sum + parseFloat(q.total_amount.toString()), 0);

      const pendingQuotes = quoteRequests.filter(qr =>
        qr.status === 'new' || qr.status === 'pending' || qr.status === 'contacted'
      ).length;

      setStats({
        totalClients: clientsArray.length,
        totalQuotations: quotations.length,
        totalQuoteRequests: quoteRequests.length,
        totalPackagingOrders: packagingOrders.length,
        totalRevenue,
        pendingQuotes
      });
    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredClients = clients.filter(
    (client) =>
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
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
          <h2 className="text-2xl font-bold text-gray-900">Client Data Management</h2>
          <p className="text-gray-600 mt-1">Complete view of all client portal activity</p>
        </div>
        <button
          onClick={fetchAllClientData}
          className="flex items-center gap-2 px-4 py-2 bg-[#e71c5e] text-white rounded-lg hover:bg-[#c91852] transition-colors"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Users size={24} className="opacity-80" />
          </div>
          <p className="text-2xl font-bold">{stats.totalClients}</p>
          <p className="text-sm opacity-90">Total Clients</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <FileText size={24} className="opacity-80" />
          </div>
          <p className="text-2xl font-bold">{stats.totalQuotations}</p>
          <p className="text-sm opacity-90">Quotations</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <FileText size={24} className="opacity-80" />
          </div>
          <p className="text-2xl font-bold">{stats.totalQuoteRequests}</p>
          <p className="text-sm opacity-90">Quote Requests</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <Package size={24} className="opacity-80" />
          </div>
          <p className="text-2xl font-bold">{stats.totalPackagingOrders}</p>
          <p className="text-sm opacity-90">Packaging Orders</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp size={24} className="opacity-80" />
          </div>
          <p className="text-2xl font-bold">{stats.pendingQuotes}</p>
          <p className="text-sm opacity-90">Pending Quotes</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp size={24} className="opacity-80" />
          </div>
          <p className="text-2xl font-bold">£{stats.totalRevenue.toFixed(2)}</p>
          <p className="text-sm opacity-90">Total Revenue</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e71c5e]/20 focus:border-[#e71c5e]"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Quotations</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Requests</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Packaging</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Spent</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Last Activity</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No clients found
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.email} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">{client.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{client.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-600">{client.phone || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                        {client.quotations.length}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                        {client.quoteRequests.length}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                        {client.packagingOrders.length}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-emerald-600">
                        £{client.totalSpent.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs text-gray-600">{formatDate(client.lastActivity)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedClient(client);
                          setShowDetailModal(true);
                        }}
                        className="p-2 text-gray-600 hover:text-[#e71c5e] hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDetailModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#949494] to-[#6b6b6b] p-6 flex items-center justify-between sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedClient.name || 'Client'} Details</h2>
                <p className="text-gray-200 text-sm mt-1">{selectedClient.email}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 font-semibold mb-2">Contact Email</p>
                  <p className="text-gray-900">{selectedClient.email}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 font-semibold mb-2">Phone Number</p>
                  <p className="text-gray-900">{selectedClient.phone || 'Not provided'}</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4">
                  <p className="text-sm text-emerald-600 font-semibold mb-2">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">£{selectedClient.totalSpent.toFixed(2)}</p>
                </div>
              </div>

              {selectedClient.quoteRequests.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText size={20} className="text-yellow-600" />
                    Quote Requests ({selectedClient.quoteRequests.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedClient.quoteRequests.map((qr: any) => (
                      <div key={qr.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{qr.quote_reference}</p>
                            <p className="text-sm text-gray-600">{qr.service_type}</p>
                          </div>
                          <StatusBadge status={qr.status} />
                        </div>
                        <div className="grid md:grid-cols-2 gap-2 text-sm">
                          <p className="text-gray-600">From: {qr.move_from_postcode || 'N/A'}</p>
                          <p className="text-gray-600">To: {qr.move_to_postcode || 'N/A'}</p>
                          <p className="text-gray-600">Date: {qr.preferred_move_date ? formatDate(qr.preferred_move_date) : 'Not specified'}</p>
                          <p className="text-gray-600">Created: {formatDate(qr.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedClient.quotations.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText size={20} className="text-green-600" />
                    Quotations ({selectedClient.quotations.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedClient.quotations.map((q: any) => (
                      <div key={q.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{q.quotation_number}</p>
                            <p className="text-sm text-gray-600">{q.service_type}</p>
                          </div>
                          <div className="text-right">
                            <StatusBadge status={q.status} />
                            <p className="text-lg font-bold text-green-600 mt-1">£{parseFloat(q.total_amount).toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-2 text-sm mb-3">
                          <p className="text-gray-600">From: {q.move_from}</p>
                          <p className="text-gray-600">To: {q.move_to}</p>
                          <p className="text-gray-600">Move Date: {q.move_date ? formatDate(q.move_date) : 'Not set'}</p>
                          <p className="text-gray-600">Valid Until: {formatDate(q.valid_until)}</p>
                        </div>
                        {(q.status === 'pending' || q.status === 'sent') && (
                          <div className="flex gap-2 pt-3 border-t border-green-300">
                            <button
                              onClick={() => acceptQuotation(q.id)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
                            >
                              <CheckCircle size={16} />
                              Accept Quote
                            </button>
                            <button
                              onClick={() => declineQuotation(q.id)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
                            >
                              <XCircle size={16} />
                              Decline Quote
                            </button>
                          </div>
                        )}
                        {q.status === 'accepted' && (
                          <div className="pt-3 border-t border-green-300">
                            <p className="text-sm text-green-700 font-semibold flex items-center gap-2">
                              <CheckCircle size={16} />
                              This quotation has been accepted
                            </p>
                          </div>
                        )}
                        {q.status === 'rejected' && (
                          <div className="pt-3 border-t border-green-300">
                            <p className="text-sm text-red-700 font-semibold flex items-center gap-2">
                              <XCircle size={16} />
                              This quotation has been declined
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedClient.packagingOrders.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Package size={20} className="text-purple-600" />
                    Packaging Orders ({selectedClient.packagingOrders.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedClient.packagingOrders.map((po: any) => (
                      <div key={po.id} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">Order #{po.id.slice(0, 8)}</p>
                            <p className="text-sm text-gray-600">{po.delivery_address}</p>
                          </div>
                          <div className="text-right">
                            <StatusBadge status={po.status} />
                            <p className="text-lg font-bold text-purple-600 mt-1">£{parseFloat(po.total_amount).toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-2 text-sm mb-3">
                          <p className="text-gray-600">Postcode: {po.delivery_postcode}</p>
                          <p className="text-gray-600">Phone: {po.contact_phone}</p>
                          <p className="text-gray-600">Delivery: {po.delivery_date ? formatDate(po.delivery_date) : 'Pending'}</p>
                          <p className="text-gray-600">Created: {formatDate(po.created_at)}</p>
                        </div>
                        {po.status === 'pending' && (
                          <div className="flex gap-2 pt-3 border-t border-purple-300">
                            <button
                              onClick={() => updatePackagingOrderStatus(po.id, 'in_transit')}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
                            >
                              <Truck size={16} />
                              Ship Order
                            </button>
                            <button
                              onClick={() => updatePackagingOrderStatus(po.id, 'delivered')}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
                            >
                              <CheckCircle size={16} />
                              Mark Delivered
                            </button>
                          </div>
                        )}
                        {po.status === 'in_transit' && (
                          <div className="flex gap-2 pt-3 border-t border-purple-300">
                            <button
                              onClick={() => updatePackagingOrderStatus(po.id, 'delivered')}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
                            >
                              <CheckCircle size={16} />
                              Mark as Delivered
                            </button>
                          </div>
                        )}
                        {po.status === 'delivered' && (
                          <div className="pt-3 border-t border-purple-300">
                            <p className="text-sm text-green-700 font-semibold flex items-center gap-2">
                              <CheckCircle size={16} />
                              Order delivered successfully
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
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
