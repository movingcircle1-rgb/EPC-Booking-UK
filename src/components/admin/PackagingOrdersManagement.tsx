import { useState, useEffect } from 'react';
import { Package, Search, Eye, Truck, CheckCircle, RefreshCw, Calendar, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../portal/LoadingSpinner';
import StatusBadge from '../portal/StatusBadge';

interface PackagingOrder {
  id: string;
  customer_email: string;
  delivery_address: string;
  delivery_postcode: string;
  contact_phone: string;
  items: any[];
  total_amount: number;
  status: string;
  delivery_date: string | null;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function PackagingOrdersManagement() {
  const [orders, setOrders] = useState<PackagingOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<PackagingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<PackagingOrder | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  useEffect(() => {
    fetchOrders();

    const subscription = supabase
      .channel('packaging_orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'packaging_orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('packaging_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching packaging orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.delivery_postcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.contact_phone.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (trackingNumber) {
        updateData.tracking_number = trackingNumber;
      }

      if (deliveryDate) {
        updateData.delivery_date = deliveryDate;
      }

      const { error } = await supabase
        .from('packaging_orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      alert(`Order status updated to ${newStatus}!`);
      await fetchOrders();
      setShowDetailModal(false);
      setTrackingNumber('');
      setDeliveryDate('');
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order. Please try again.');
    }
  };

  const acceptOrder = async (orderId: string) => {
    if (!confirm('Accept this packaging order?')) return;

    try {
      const { error } = await supabase
        .from('packaging_orders')
        .update({
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      alert('Order accepted successfully!');
      await fetchOrders();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error accepting order:', error);
      alert('Failed to accept order. Please try again.');
    }
  };

  const rejectOrder = async (orderId: string) => {
    if (!confirm('Reject this packaging order?')) return;

    try {
      const { error } = await supabase
        .from('packaging_orders')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      alert('Order rejected.');
      await fetchOrders();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert('Failed to reject order. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_transit: 'bg-purple-100 text-purple-800',
      dispatched: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
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
    all: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    in_transit: orders.filter((o) => o.status === 'in_transit' || o.status === 'dispatched').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
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
          <h2 className="text-2xl font-bold text-gray-900">Packaging Orders</h2>
          <p className="text-gray-600 mt-1">Manage and track packaging material orders</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'All Orders', count: statusCounts.all, status: 'all' },
          { label: 'Pending', count: statusCounts.pending, status: 'pending' },
          { label: 'In Transit', count: statusCounts.in_transit, status: 'in_transit' },
          { label: 'Delivered', count: statusCounts.delivered, status: 'delivered' },
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
                placeholder="Search by email, postcode, or phone..."
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Delivery Address</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No packaging orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">#{order.id.slice(0, 8)}</span>
                      <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">{order.customer_email}</p>
                      <p className="text-xs text-gray-500">{order.contact_phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{order.delivery_address}</p>
                      <p className="text-xs text-gray-500">{order.delivery_postcode}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-bold text-orange-600">£{parseFloat(order.total_amount.toString()).toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setTrackingNumber(order.tracking_number || '');
                            setDeliveryDate(order.delivery_date || '');
                            setShowDetailModal(true);
                          }}
                          className="p-2 text-gray-600 hover:text-[#C73532] hover:bg-gray-100 rounded-lg transition-colors"
                          title="View & Manage"
                        >
                          <Eye size={18} />
                        </button>
                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => acceptOrder(order.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Accept Order"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => rejectOrder(order.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject Order"
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

      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Packaging Order Details</h2>
                <p className="text-orange-100 text-sm mt-1">Order #{selectedOrder.id.slice(0, 8)}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">Customer Information</h3>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-semibold">Email:</span> {selectedOrder.customer_email}</p>
                    <p className="text-sm"><span className="font-semibold">Phone:</span> {selectedOrder.contact_phone}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">Delivery Information</h3>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-semibold">Address:</span> {selectedOrder.delivery_address}</p>
                    <p className="text-sm"><span className="font-semibold">Postcode:</span> {selectedOrder.delivery_postcode}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-3">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">{item.name} x{item.quantity}</span>
                      <span className="text-sm font-semibold">£{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-orange-600">£{parseFloat(selectedOrder.total_amount.toString()).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-800">
                  <span className="font-semibold">Status:</span> {selectedOrder.status.replace('_', ' ')}
                </p>
                {selectedOrder.tracking_number && (
                  <p className="text-sm text-purple-800 mt-1">
                    <span className="font-semibold">Tracking:</span> {selectedOrder.tracking_number}
                  </p>
                )}
                {selectedOrder.delivery_date && (
                  <p className="text-sm text-purple-800 mt-1">
                    <span className="font-semibold">Delivery Date:</span> {formatDate(selectedOrder.delivery_date)}
                  </p>
                )}
              </div>

              {selectedOrder.status === 'pending' && (
                <div className="border-t pt-4 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">Admin Actions</h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() => acceptOrder(selectedOrder.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                      <CheckCircle size={18} />
                      Accept Order
                    </button>
                    <button
                      onClick={() => rejectOrder(selectedOrder.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                    >
                      <XCircle size={18} />
                      Reject Order
                    </button>
                  </div>
                </div>
              )}

              {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'pending' && (
                <div className="border-t pt-4 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-600">Update Order</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tracking Number
                      </label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="Enter tracking number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Date
                      </label>
                      <input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {selectedOrder.status === 'confirmed' && (
                      <button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'in_transit')}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                      >
                        <Truck size={18} />
                        Ship Order
                      </button>
                    )}
                    {(selectedOrder.status === 'in_transit' || selectedOrder.status === 'dispatched') && (
                      <button
                        onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                      >
                        <CheckCircle size={18} />
                        Mark as Delivered
                      </button>
                    )}
                  </div>
                </div>
              )}

              {selectedOrder.status === 'delivered' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-700 font-semibold flex items-center gap-2">
                    <CheckCircle size={16} />
                    This order has been delivered
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
