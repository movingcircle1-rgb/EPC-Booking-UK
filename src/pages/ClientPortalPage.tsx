import { useEffect, useState } from 'react';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { hardNavigate } from '../lib/nav'
import { Package as PackageIcon, FileText, Calendar, Bell, User, ShoppingCart, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useQuotations } from '../hooks/useQuotations';
import { usePackagingOrders } from '../hooks/usePackagingOrders';
import SEO from '../components/SEO';
import PortalHeader from '../components/PortalHeader';
import LoadingSpinner from '../components/portal/LoadingSpinner';
import { QuotationCard } from '../components/client/QuotationCard';
import { AddServicesModal } from '../components/client/AddServicesModal';
import { PaymentModal } from '../components/client/PaymentModal';
import { MoveDatePicker } from '../components/client/MoveDatePicker';
import { PackagingOrderModal } from '../components/client/PackagingOrderModal';
import { ResourcesSection } from '../components/client/ResourcesSection';
import EmptyState from '../components/portal/EmptyState';
import QuoteForm from '../components/QuoteForm';

export default function ClientPortalPage() {
  useRequireAuth();
const { user, userRole, loading: authLoading } = useAuth();

  const {
    quotations,
    quoteRequests,
    loading: quotationsLoading,
    error,
    acceptQuotation,
    declineQuotation,
    updateMoveDate,
    refresh
  } = useQuotations(user?.email);

  const {
    orders: packagingOrders,
    loading: packagingLoading,
    error: packagingError,
    refresh: refreshPackaging
  } = usePackagingOrders(user?.email);

  useEffect(() => {
    console.log('[ClientPortalPage] Quotations state:', {
      quotations,
      quoteRequests,
      loading: quotationsLoading,
      error,
      userEmail: user?.email
    });
  }, [quotations, quoteRequests, quotationsLoading, error, user?.email]);

  const [activeModal, setActiveModal] = useState<{
    type: 'services' | 'payment' | 'moveDate' | 'packaging' | null;
    quotationId?: string;
    amount?: number;
    currentDate?: string | null;
  }>({ type: null });

  const [activeTab, setActiveTab] = useState<'quotations' | 'resources'>('quotations');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'requests' | 'packaging'>('all');
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  useEffect(() => {
    console.log('[ClientPortalPage] Auth state:', { authLoading, user: !!user, userRole: userRole?.role });

    if (!authLoading && !user) {
      console.log('[ClientPortalPage] No user, redirecting to login');
      hardNavigate('/portal/login');
      return;
    }

    if (!authLoading && user && userRole) {
      console.log('[ClientPortalPage] User role verified:', userRole.role);
      if (userRole.role !== 'client' && userRole.role !== 'admin') {
        console.log('[ClientPortalPage] Not a client, redirecting to correct portal');
        const correctPath = userRole.role === 'partner' ? '/partner-portal' :
                          userRole.role === 'trade' ? '/trade-portal' :
                          userRole.role === 'staff' ? '/staff-portal' : '/';
        hardNavigate(correctPath, { replace: true });
      }
    }
  }, [user, userRole, authLoading]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const handleAcceptQuotation = async (id: string) => {
    const result = await acceptQuotation(id);
    if (result.success) {
      alert('Quotation accepted successfully! You can now add services and proceed to payment.');
    } else {
      alert(result.error || 'Failed to accept quotation');
    }
  };

  const handleDeclineQuotation = async (id: string) => {
    if (confirm('Are you sure you want to decline this quotation?')) {
      const result = await declineQuotation(id);
      if (result.success) {
        alert('Quotation declined.');
      } else {
        alert(result.error || 'Failed to decline quotation');
      }
    }
  };

  const handleUpdateMoveDate = async (quotationId: string, date: string) => {
    const result = await updateMoveDate(quotationId, date);
    if (result.success) {
      alert('Move date confirmed successfully!');
    } else {
      alert(result.error || 'Failed to update move date');
    }
  };

  const pendingQuotations = quotations.filter(q => (q.status === 'pending' || q.status === 'sent') && new Date(q.valid_until) >= new Date());
  const acceptedQuotations = quotations.filter(q => q.status === 'accepted');
  const expiredQuotations = quotations.filter(q => (q.status === 'pending' || q.status === 'sent') && new Date(q.valid_until) < new Date());
  const pendingRequests = quoteRequests.filter(q => q.status === 'new' || q.status === 'pending' || q.status === 'contacted');
  const totalItems = quotations.length + quoteRequests.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalHeader title="Client Portal" />
      <SEO
        title="Client Portal - My Dashboard"
        description="Manage your moves, track bookings, and access important documents"
        canonicalUrl="https://nationalremovalsandstorage.co.uk/client-portal"
        noindex={true}
      />

      <div className="bg-gradient-to-r from-[#949494] to-[#6b6b6b] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {userRole?.full_name || 'Client'}</h1>
              <p className="text-gray-100">Manage your quotations and moving resources</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-3 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all">
                <Bell size={24} />
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
        <div className="mb-6 flex flex-col sm:flex-row justify-end gap-4">
          <button
            onClick={() => setActiveModal({ type: 'packaging' })}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 group"
          >
            <PackageIcon size={24} className="group-hover:scale-110 transition-transform" />
            Order Packaging
          </button>
          <button
            onClick={() => setShowQuoteForm(true)}
            className="bg-gradient-to-r from-[#be0e0c] to-[#9f0b0a] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 group"
          >
            <Plus size={24} className="group-hover:rotate-90 transition-transform" />
            Get a Quote
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => { setFilterStatus('requests'); setActiveTab('quotations'); }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-all text-left cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Quote Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{pendingRequests.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FileText size={24} className="text-green-600" />
              </div>
            </div>
          </button>

          <button
            onClick={() => { setFilterStatus('accepted'); setActiveTab('quotations'); }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-all text-left cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Accepted Quotes</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{acceptedQuotations.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar size={24} className="text-blue-600" />
              </div>
            </div>
          </button>

          <button
            onClick={() => { setFilterStatus('all'); setActiveTab('quotations'); }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-all text-left cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Items</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalItems}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <FileText size={24} className="text-orange-600" />
              </div>
            </div>
          </button>

          <button
            onClick={() => { setFilterStatus('packaging'); setActiveTab('quotations'); }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-all text-left cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Packaging Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{packagingOrders.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <ShoppingCart size={24} className="text-purple-600" />
              </div>
            </div>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('quotations')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                  activeTab === 'quotations'
                    ? 'text-gray-800 border-b-2 border-gray-800'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-5 w-5" />
                  My Quotations
                </div>
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                  activeTab === 'resources'
                    ? 'text-gray-800 border-b-2 border-gray-800'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <PackageIcon className="h-5 w-5" />
                  Resources & Support
                </div>
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'quotations' ? (
              <>
                {filterStatus !== 'all' && (
                  <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-800 font-semibold">
                        Filtered: {filterStatus === 'requests' ? 'Quote Requests' : filterStatus === 'accepted' ? 'Accepted Quotes' : filterStatus === 'packaging' ? 'Packaging Orders' : 'Pending Quotes'}
                      </span>
                    </div>
                    <button
                      onClick={() => setFilterStatus('all')}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                    >
                      Clear Filter
                    </button>
                  </div>
                )}
                {quotationsLoading ? (
                  <div className="py-12">
                    <LoadingSpinner />
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-600">Error loading quotations: {error}</p>
                  </div>
                ) : totalItems === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="No Quotations Yet"
                    description="You haven't received any quotations yet. Contact us to get a personalized quote for your move."
                    actionLabel="Contact Us"
                    onAction={() => hardNavigate('/contact')}
                  />
                ) : (
                <div className="space-y-8">
                  {(filterStatus === 'all' || filterStatus === 'requests') && pendingRequests.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Quote Requests
                        {filterStatus === 'requests' && <span className="ml-2 text-sm text-gray-500">({pendingRequests.length})</span>}
                      </h2>
                      <div className="space-y-4">
                        {pendingRequests.map((request) => (
                          <div key={request.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900">Quote Request {request.quote_reference}</h3>
                                <p className="text-sm text-gray-600">Submitted on {new Date(request.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                              </div>
                              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                                {request.status === 'new' ? 'Awaiting Review' : 'In Progress'}
                              </span>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-600 font-medium">Service Type</p>
                                <p className="text-gray-900 capitalize">{request.service_type.replace(/_/g, ' ')}</p>
                              </div>
                              {request.property_type && (
                                <div>
                                  <p className="text-sm text-gray-600 font-medium">Property Type</p>
                                  <p className="text-gray-900 capitalize">{request.property_type}</p>
                                </div>
                              )}
                              {request.number_of_bedrooms && (
                                <div>
                                  <p className="text-sm text-gray-600 font-medium">Bedrooms</p>
                                  <p className="text-gray-900">{request.number_of_bedrooms}</p>
                                </div>
                              )}
                              {request.move_from_postcode && (
                                <div>
                                  <p className="text-sm text-gray-600 font-medium">From</p>
                                  <p className="text-gray-900">{request.move_from_postcode}</p>
                                </div>
                              )}
                              {request.move_to_postcode && (
                                <div>
                                  <p className="text-sm text-gray-600 font-medium">To</p>
                                  <p className="text-gray-900">{request.move_to_postcode}</p>
                                </div>
                              )}
                              {request.preferred_move_date && (
                                <div className="md:col-span-2">
                                  <p className="text-sm text-gray-600 font-medium">Preferred Date</p>
                                  <p className="text-gray-900">{new Date(request.preferred_move_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                              )}
                            </div>
                            {request.additional_notes && (
                              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <p className="text-sm text-gray-600 font-medium mb-1">Your Message</p>
                                <p className="text-sm text-gray-700">{request.additional_notes}</p>
                              </div>
                            )}
                            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <p className="text-sm text-blue-800">
                                <strong>What's next?</strong> Our team is reviewing your request and will send you a detailed quotation within 24 hours. Check back here or watch your email for updates!
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(filterStatus === 'all' || filterStatus === 'pending') && pendingQuotations.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Pending Quotations
                        {filterStatus === 'pending' && <span className="ml-2 text-sm text-gray-500">({pendingQuotations.length})</span>}
                      </h2>
                      <div className="space-y-6">
                        {pendingQuotations.map((quotation) => (
                          <QuotationCard
                            key={quotation.id}
                            quotation={quotation}
                            onAccept={handleAcceptQuotation}
                            onDecline={handleDeclineQuotation}
                            onAddServices={(id) => setActiveModal({ type: 'services', quotationId: id })}
                            onSelectMoveDate={(id) =>
                              setActiveModal({
                                type: 'moveDate',
                                quotationId: id,
                                currentDate: quotation.move_date
                              })
                            }
                            onViewPayment={(id) => {
                              const quote = quotations.find(q => q.id === id);
                              setActiveModal({ type: 'payment', quotationId: id, amount: quote?.total_amount || 0 });
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {(filterStatus === 'all' || filterStatus === 'accepted') && acceptedQuotations.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Accepted Quotations
                        {filterStatus === 'accepted' && <span className="ml-2 text-sm text-gray-500">({acceptedQuotations.length})</span>}
                      </h2>
                      <div className="space-y-6">
                        {acceptedQuotations.map((quotation) => (
                          <QuotationCard
                            key={quotation.id}
                            quotation={quotation}
                            onAccept={handleAcceptQuotation}
                            onDecline={handleDeclineQuotation}
                            onAddServices={(id) => setActiveModal({ type: 'services', quotationId: id })}
                            onSelectMoveDate={(id) =>
                              setActiveModal({
                                type: 'moveDate',
                                quotationId: id,
                                currentDate: quotation.move_date
                              })
                            }
                            onViewPayment={(id) => {
                              const quote = quotations.find(q => q.id === id);
                              setActiveModal({ type: 'payment', quotationId: id, amount: quote?.total_amount || 0 });
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {filterStatus === 'all' && expiredQuotations.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-4">Expired Quotations</h2>
                      <div className="space-y-6">
                        {expiredQuotations.map((quotation) => (
                          <QuotationCard
                            key={quotation.id}
                            quotation={quotation}
                            onAccept={handleAcceptQuotation}
                            onDecline={handleDeclineQuotation}
                            onAddServices={(id) => setActiveModal({ type: 'services', quotationId: id })}
                            onSelectMoveDate={(id) =>
                              setActiveModal({
                                type: 'moveDate',
                                quotationId: id,
                                currentDate: quotation.move_date
                              })
                            }
                            onViewPayment={(id) => {
                              const quote = quotations.find(q => q.id === id);
                              setActiveModal({ type: 'payment', quotationId: id, amount: quote?.total_amount || 0 });
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {(filterStatus === 'all' || filterStatus === 'packaging') && packagingOrders.length > 0 && (
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-between">
                        <span>
                          Packaging Orders
                          {filterStatus === 'packaging' && <span className="ml-2 text-sm text-gray-500">({packagingOrders.length})</span>}
                        </span>
                        <button
                          onClick={() => setActiveModal({ type: 'packaging' })}
                          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2 text-sm font-semibold"
                        >
                          <Plus size={16} />
                          New Order
                        </button>
                      </h2>
                      <div className="space-y-4">
                        {packagingOrders.map((order) => (
                          <div key={order.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900">Order #{order.id.slice(0, 8)}</h3>
                                <p className="text-sm text-gray-600">
                                  Placed on {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                order.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.status === 'pending' ? 'Processing' :
                                 order.status === 'in_transit' ? 'In Transit' :
                                 order.status === 'delivered' ? 'Delivered' : order.status}
                              </span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-gray-600 font-medium">Delivery Address</p>
                                <p className="text-gray-900">{order.delivery_address}</p>
                                <p className="text-gray-700">{order.delivery_postcode}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 font-medium">Contact Phone</p>
                                <p className="text-gray-900">{order.contact_phone}</p>
                              </div>
                              {order.delivery_date && (
                                <div>
                                  <p className="text-sm text-gray-600 font-medium">Delivery Date</p>
                                  <p className="text-gray-900">
                                    {new Date(order.delivery_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                  </p>
                                </div>
                              )}
                              {order.tracking_number && (
                                <div>
                                  <p className="text-sm text-gray-600 font-medium">Tracking Number</p>
                                  <p className="text-gray-900 font-mono">{order.tracking_number}</p>
                                </div>
                              )}
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                              <p className="text-sm text-gray-600 font-medium mb-2">Order Items</p>
                              <div className="space-y-1">
                                {order.items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex justify-between text-sm">
                                    <span className="text-gray-700">{item.name} x{item.quantity}</span>
                                    <span className="text-gray-900 font-medium">
                                      £{(item.price * item.quantity).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                              <span className="text-lg font-bold text-gray-900">Total</span>
                              <span className="text-2xl font-bold text-orange-600">
                                £{parseFloat(order.total_amount.toString()).toFixed(2)}
                              </span>
                            </div>

                            {order.notes && (
                              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm text-blue-800">
                                  <strong>Note:</strong> {order.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                )}
              </>
            ) : (
              <ResourcesSection />
            )}
          </div>
        </div>
      </div>

      {activeModal.type === 'services' && activeModal.quotationId && (
        <AddServicesModal
          quotationId={activeModal.quotationId}
          onClose={() => setActiveModal({ type: null })}
          onComplete={() => {
            refresh();
            setActiveModal({ type: null });
          }}
        />
      )}

      {activeModal.type === 'payment' && activeModal.quotationId && activeModal.amount !== undefined && (
        <PaymentModal
          quotationId={activeModal.quotationId}
          amount={activeModal.amount}
          onClose={() => setActiveModal({ type: null })}
        />
      )}

      {activeModal.type === 'moveDate' && activeModal.quotationId && (
        <MoveDatePicker
          quotationId={activeModal.quotationId}
          currentDate={activeModal.currentDate || null}
          onSelect={handleUpdateMoveDate}
          onClose={() => setActiveModal({ type: null })}
        />
      )}

      {activeModal.type === 'packaging' && (
        <PackagingOrderModal
          onClose={() => setActiveModal({ type: null })}
          onComplete={() => {
            refresh();
            refreshPackaging();
            setActiveModal({ type: null });
          }}
        />
      )}

      {showQuoteForm && (
        <QuoteForm
          onClose={() => {
            setShowQuoteForm(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}
