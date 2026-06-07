import { useState, useEffect } from 'react';
import { Download, FileText, Package, ExternalLink, X, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { generateMarketingPDF, generateZipDownload, generateHTMLDownload } from '../../lib/marketing-pdf-generator';

interface OrderModalData {
  materialId: string;
  materialName: string;
}

export default function MarketingMaterials() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderModalData, setOrderModalData] = useState<OrderModalData | null>(null);
  const [partnerInfo, setPartnerInfo] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const [orderForm, setOrderForm] = useState({
    quantity: 1,
    deliveryContactName: '',
    deliveryAddress: '',
    deliveryPostcode: '',
    deliveryPhone: '',
    orderNotes: ''
  });

  useEffect(() => {
    loadMaterials();
    loadOrders();
    loadPartnerInfo();
  }, [user]);

  const loadPartnerInfo = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('partners')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setPartnerInfo(data);
        setOrderForm(prev => ({
          ...prev,
          deliveryContactName: data.contact_person || '',
          deliveryPhone: data.phone || '',
          deliveryAddress: data.address || ''
        }));
      }
    } catch (error) {
      console.error('[MarketingMaterials] Error loading partner info:', error);
    }
  };

  const loadMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('marketing_materials')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error('[MarketingMaterials] Error loading materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('marketing_material_orders')
        .select(`
          *,
          material:marketing_materials(title, category)
        `)
        .eq('partner_user_id', user.id)
        .order('created_at', { ascending: false });

      setOrders(data || []);
    } catch (error) {
      console.error('[MarketingMaterials] Error loading orders:', error);
    }
  };

  const handleDownload = async (material: any) => {
    setDownloading(material.id);

    try {
      let blob: Blob;
      let filename: string;

      if (material.file_type === 'ZIP') {
        blob = generateZipDownload(material);
        filename = material.title.toLowerCase().replace(/\s+/g, '-') + '.txt';
      } else if (material.file_type === 'HTML') {
        blob = generateHTMLDownload(material);
        filename = material.title.toLowerCase().replace(/\s+/g, '-') + '.html';
      } else {
        blob = generateMarketingPDF(material);
        filename = material.title.toLowerCase().replace(/\s+/g, '-') + '.pdf';
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      if (partnerInfo) {
        await supabase
          .from('marketing_materials')
          .update({ download_count: (material.download_count || 0) + 1 })
          .eq('id', material.id);

        await loadMaterials();
      }

      const successMsg = document.createElement('div');
      successMsg.style.cssText = 'position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:16px 24px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:9999;font-family:sans-serif;font-weight:600;';
      successMsg.textContent = `✓ ${material.title} downloaded successfully!`;
      document.body.appendChild(successMsg);
      setTimeout(() => document.body.removeChild(successMsg), 3000);

    } catch (error) {
      console.error('[MarketingMaterials] Error generating download:', error);
      alert('Failed to download file. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const openOrderModal = (material: any) => {
    setOrderModalData({
      materialId: material.id,
      materialName: material.title
    });
    setShowOrderModal(true);
  };

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setOrderModalData(null);
    setOrderForm({
      quantity: 1,
      deliveryContactName: partnerInfo?.contact_person || '',
      deliveryAddress: partnerInfo?.address || '',
      deliveryPostcode: '',
      deliveryPhone: partnerInfo?.phone || '',
      orderNotes: ''
    });
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !partnerInfo || !orderModalData) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('marketing_material_orders')
        .insert({
          partner_id: partnerInfo.id,
          partner_user_id: user.id,
          material_id: orderModalData.materialId,
          quantity: orderForm.quantity,
          delivery_contact_name: orderForm.deliveryContactName,
          delivery_address: orderForm.deliveryAddress,
          delivery_postcode: orderForm.deliveryPostcode,
          delivery_phone: orderForm.deliveryPhone,
          order_notes: orderForm.orderNotes,
          status: 'pending'
        });

      if (error) throw error;

      const successMsg = document.createElement('div');
      successMsg.style.cssText = 'position:fixed;top:20px;right:20px;background:#10b981;color:white;padding:16px 24px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:9999;font-family:sans-serif;font-weight:600;';
      successMsg.textContent = '✓ Order submitted successfully!';
      document.body.appendChild(successMsg);
      setTimeout(() => document.body.removeChild(successMsg), 3000);

      closeOrderModal();
      loadOrders();
    } catch (error) {
      console.error('[MarketingMaterials] Error submitting order:', error);
      alert('Failed to submit order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ['all', ...new Set(materials.map(m => m.category))];

  const filteredMaterials = selectedCategory === 'all'
    ? materials
    : materials.filter(m => m.category === selectedCategory);

  const getFileIcon = (fileType: string) => {
    switch (fileType?.toLowerCase()) {
      case 'pdf':
        return <FileText size={24} className="text-red-600" />;
      case 'zip':
        return <Package size={24} className="text-purple-600" />;
      case 'html':
        return <FileText size={24} className="text-blue-600" />;
      default:
        return <FileText size={24} className="text-gray-600" />;
    }
  };

  const getOrderStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      processing: 'bg-blue-100 text-blue-800 border-blue-300',
      shipped: 'bg-purple-100 text-purple-800 border-purple-300',
      delivered: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status.toUpperCase()}
      </span>
    );
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
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Marketing Materials</h2>
          <p className="text-gray-600">Download brochures, logos, and order promotional materials</p>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedCategory === category
                    ? 'bg-[#e71c5e] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {filteredMaterials.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Materials Found</h3>
              <p className="text-gray-600">
                No marketing materials available in this category at the moment.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((material) => (
                <div
                  key={material.id}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-[#e71c5e] transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getFileIcon(material.file_type)}
                    </div>
                    <span className="px-3 py-1 bg-[#e71c5e] bg-opacity-10 text-[#e71c5e] text-xs font-bold rounded-full">
                      {material.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">{material.title}</h3>

                  {material.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{material.description}</p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    {material.file_type && (
                      <span className="font-semibold">{material.file_type.toUpperCase()}</span>
                    )}
                    {material.file_size && (
                      <span>{material.file_size}</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {material.is_downloadable && (
                      <button
                        onClick={() => handleDownload(material)}
                        disabled={downloading === material.id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#e71c5e] text-white rounded-lg hover:bg-[#c91852] transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {downloading === material.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Download size={16} />
                            Download
                          </>
                        )}
                      </button>
                    )}
                    {material.is_orderable && (
                      <button
                        onClick={() => openOrderModal(material)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                      >
                        <Package size={16} />
                        Order
                      </button>
                    )}
                  </div>

                  {material.download_count > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 text-center">
                        Downloaded {material.download_count} times
                      </p>
                    </div>
                  )}

                  {material.is_orderable && material.stock_available !== null && material.stock_available > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-green-600 font-semibold text-center">
                        {material.stock_available} in stock
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex items-start gap-3">
            <ExternalLink size={20} className="text-[#e71c5e] flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Need Custom Materials?</h4>
              <p className="text-sm text-gray-600">
                If you need customized marketing materials or have specific requirements, please contact your
                account manager. We can create branded materials tailored to your needs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {orders.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Your Orders</h3>
            <p className="text-gray-600 text-sm mt-1">Track your material orders</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Material</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Delivery To</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Tracking</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(order.created_at).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {order.material?.title || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.delivery_postcode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getOrderStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {order.tracking_number || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showOrderModal && orderModalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Order Material</h3>
                <p className="text-sm text-gray-600 mt-1">{orderModalData.materialName}</p>
              </div>
              <button
                onClick={closeOrderModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleOrderSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={orderForm.quantity}
                  onChange={(e) => setOrderForm({ ...orderForm, quantity: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={orderForm.deliveryContactName}
                  onChange={(e) => setOrderForm({ ...orderForm, deliveryContactName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Delivery Address *
                </label>
                <textarea
                  required
                  rows={3}
                  value={orderForm.deliveryAddress}
                  onChange={(e) => setOrderForm({ ...orderForm, deliveryAddress: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Postcode *
                </label>
                <input
                  type="text"
                  required
                  value={orderForm.deliveryPostcode}
                  onChange={(e) => setOrderForm({ ...orderForm, deliveryPostcode: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
                  placeholder="B1 1AA"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={orderForm.deliveryPhone}
                  onChange={(e) => setOrderForm({ ...orderForm, deliveryPhone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Order Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={orderForm.orderNotes}
                  onChange={(e) => setOrderForm({ ...orderForm, orderNotes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e71c5e] focus:border-transparent"
                  placeholder="Any special instructions or requirements..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Order Processing</p>
                    <p>Orders are typically processed within 3-5 business days. You'll receive tracking information via email once shipped.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeOrderModal}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-[#e71c5e] text-white rounded-lg hover:bg-[#c91852] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
