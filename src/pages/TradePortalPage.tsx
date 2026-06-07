import { useEffect, useState } from 'react';
import { hardNavigate } from '../lib/nav'
import {
  LayoutDashboard, Truck, Briefcase, Plus, User, Bell,
  Calendar, DollarSign, Award, TrendingUp, Search, Filter
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEnsurePortalRecord } from '../hooks/useEnsurePortalRecord';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import PortalHeader from '../components/PortalHeader';
import LoadingSpinner from '../components/portal/LoadingSpinner';
import StatusBadge from '../components/portal/StatusBadge';
import ServiceBookingForm from '../components/trade/ServiceBookingForm';
import JobPostingForm from '../components/trade/JobPostingForm';
import AccountManagement from '../components/trade/AccountManagement';

type TabType = 'dashboard' | 'jobs' | 'bookings' | 'post-job' | 'book-service' | 'account';

export default function TradePortalPage() {
  const { user, userRole, loading: authLoading, signOut } = useAuth();
  const { isVerifying, hasRecord } = useEnsurePortalRecord();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [jobs, setJobs] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [myPostedJobs, setMyPostedJobs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [bidForm, setBidForm] = useState({ amount: '', date: '', notes: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (!authLoading && !user) {
      hardNavigate('/portal/login');
      return;
    }

    if (!authLoading && user && userRole) {
      if (userRole.role !== 'trade' && userRole.role !== 'admin') {
        const correctPath = userRole.role === 'client' ? '/client-portal' :
                          userRole.role === 'partner' ? '/partner-portal' :
                          userRole.role === 'staff' ? '/staff-portal' : '/';
        hardNavigate(correctPath, { replace: true });
      }
    }
  }, [user, userRole, authLoading]);

  useEffect(() => {
    if (user && hasRecord) {
      loadPortalData();
    }
  }, [user, hasRecord]);

  const loadPortalData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: tradeAccount } = await supabase
        .from('trade_accounts')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!tradeAccount) return;

      const [jobsData, bidsData, bookingsData, postedJobsData, notificationsData] = await Promise.all([
        supabase.from('trade_jobs').select('*').eq('status', 'open').order('created_at', { ascending: false }),
        supabase.from('trade_bids').select('*, trade_jobs(*)').eq('bidder_trade_id', tradeAccount.id).order('created_at', { ascending: false }),
        supabase.from('trade_service_bookings').select('*, trade_services(*)').eq('trade_account_id', tradeAccount.id).order('booking_date', { ascending: false }),
        supabase.from('trade_jobs').select('*').eq('posted_by_trade_id', tradeAccount.id).order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10)
      ]);

      setJobs(jobsData.data || []);
      setMyBids(bidsData.data || []);
      setMyBookings(bookingsData.data || []);
      setMyPostedJobs(postedJobsData.data || []);
      setNotifications(notificationsData.data || []);
    } catch (error) {
      console.error('Error loading portal data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBid = async (jobId: string) => {
    if (!bidForm.amount || !bidForm.date) {
      alert('Please enter bid amount and proposed date');
      return;
    }

    setSubmitting(true);
    try {
      const { data: tradeAccount } = await supabase
        .from('trade_accounts')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (!tradeAccount) {
        alert('Trade account not found');
        return;
      }

      const { error } = await supabase.from('trade_bids').insert({
        job_id: jobId,
        bidder_trade_id: tradeAccount.id,
        bid_amount: parseFloat(bidForm.amount),
        proposed_date: bidForm.date,
        cover_letter: bidForm.notes,
        estimated_duration_hours: 8,
        status: 'pending'
      });

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: user!.id,
        title: 'Bid Submitted',
        message: 'Your bid has been submitted successfully and is pending review.',
        type: 'success'
      });

      alert('Bid submitted successfully!');
      setBidForm({ amount: '', date: '', notes: '' });
      setSelectedJob(null);
      loadPortalData();
    } catch (error: any) {
      console.error('Error submitting bid:', error);
      alert('Failed to submit bid. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePurchaseJob = async (jobId: string, price: number) => {
    if (!confirm(`Purchase this job for £${price.toFixed(2)}?`)) return;

    try {
      const { data: tradeAccount } = await supabase
        .from('trade_accounts')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (!tradeAccount) {
        alert('Trade account not found');
        return;
      }

      const { error } = await supabase
        .from('trade_jobs')
        .update({
          status: 'awarded',
          is_purchased: true,
          purchased_by_trade_id: tradeAccount.id,
          purchase_price: price
        })
        .eq('id', jobId);

      if (error) throw error;

      await supabase.from('notifications').insert({
        user_id: user!.id,
        title: 'Job Purchased',
        message: 'You have successfully purchased this job. Check your email for details.',
        type: 'success'
      });

      alert('Job purchased successfully!');
      loadPortalData();
    } catch (error: any) {
      console.error('Error purchasing job:', error);
      alert('Failed to purchase job. Please try again.');
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    loadPortalData();
  };

  if (authLoading || !user || isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.pickup_postcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.delivery_postcode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || job.service_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jobs', label: 'Browse Jobs', icon: Search },
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
    { id: 'post-job', label: 'Post Job', icon: Plus },
    { id: 'book-service', label: 'Book Service', icon: Truck },
    { id: 'account', label: 'My Account', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalHeader title="Trade Portal" />
      <SEO
        title="Trade Portal - National Removals and Storage"
        description="Secure trade portal for partner logistics businesses"
        canonicalUrl="https://nationalremovalsandstorage.co.uk/trade-portal"
        noindex={true}
      />

      <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Trade Partner Portal</h1>
              <p className="text-orange-100 mt-1">Welcome back, {userRole?.full_name || 'Trade Partner'}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="relative p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#be0e0c] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all text-sm font-semibold"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-lg mb-6 overflow-x-auto">
          <div className="flex border-b">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as TabType)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all whitespace-nowrap ${
                  activeTab === id
                    ? 'text-[#be0e0c] border-b-2 border-[#be0e0c]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#be0e0c]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Available Jobs</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{jobs.length}</p>
                  </div>
                  <Briefcase size={32} className="text-[#be0e0c]" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">My Bids</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{myBids.length}</p>
                  </div>
                  <TrendingUp size={32} className="text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Active Bookings</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{myBookings.filter(b => b.status === 'confirmed').length}</p>
                  </div>
                  <Calendar size={32} className="text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Posted Jobs</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{myPostedJobs.length}</p>
                  </div>
                  <Award size={32} className="text-yellow-500" />
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Notifications</h3>
                {notifications.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No notifications yet</p>
                ) : (
                  <div className="space-y-3">
                    {notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all ${
                          notification.is_read
                            ? 'bg-gray-50 border-gray-300'
                            : 'bg-blue-50 border-blue-500'
                        }`}
                        onClick={() => markNotificationRead(notification.id)}
                      >
                        <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#be0e0c] hover:shadow-md transition-all"
                  >
                    <Search size={24} className="text-[#be0e0c] mb-2" />
                    <p className="font-semibold text-sm">Browse Jobs</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('post-job')}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#be0e0c] hover:shadow-md transition-all"
                  >
                    <Plus size={24} className="text-[#be0e0c] mb-2" />
                    <p className="font-semibold text-sm">Post New Job</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('book-service')}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#be0e0c] hover:shadow-md transition-all"
                  >
                    <Truck size={24} className="text-[#be0e0c] mb-2" />
                    <p className="font-semibold text-sm">Book Service</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('account')}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#be0e0c] hover:shadow-md transition-all"
                  >
                    <User size={24} className="text-[#be0e0c] mb-2" />
                    <p className="font-semibold text-sm">My Account</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by title, postcode..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#be0e0c] focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="removal">Removals</option>
                  <option value="delivery">Delivery</option>
                  <option value="storage">Storage</option>
                  <option value="packing">Packing</option>
                  <option value="driver">Driver</option>
                  <option value="porter">Porter</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {loading ? (
                <LoadingSpinner />
              ) : filteredJobs.length === 0 ? (
                <p className="text-center text-gray-500 py-12">No jobs available matching your criteria</p>
              ) : (
                <div className="space-y-4">
                  {filteredJobs.map((job) => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{job.service_type}</p>
                        </div>
                        <StatusBadge status={job.status} />
                      </div>

                      <p className="text-gray-700 mb-4">{job.description}</p>

                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">From</p>
                          <p className="font-semibold text-gray-900">{job.pickup_postcode}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">To</p>
                          <p className="font-semibold text-gray-900">{job.delivery_postcode}</p>
                        </div>
                        {job.volume_cubic_feet && (
                          <div>
                            <p className="text-sm text-gray-600">Volume (Cubic Feet)</p>
                            <p className="font-semibold text-gray-900">{job.volume_cubic_feet} cu ft</p>
                          </div>
                        )}
                        {job.volume_cubic_metres && (
                          <div>
                            <p className="text-sm text-gray-600">Volume (Cubic Metres)</p>
                            <p className="font-semibold text-gray-900">{parseFloat(job.volume_cubic_metres).toFixed(2)} m³</p>
                          </div>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Preferred Date</p>
                          <p className="font-semibold text-gray-900">{new Date(job.preferred_date).toLocaleDateString()}</p>
                        </div>
                        {job.job_date && (
                          <div>
                            <p className="text-sm text-gray-600">Job Date (Confirmed)</p>
                            <p className="font-semibold text-green-700">{new Date(job.job_date).toLocaleDateString()}</p>
                          </div>
                        )}
                        {job.estimated_job_date && (
                          <div>
                            <p className="text-sm text-gray-600">Estimated Job Date</p>
                            <p className="font-semibold text-orange-700">{new Date(job.estimated_job_date).toLocaleDateString()} (Unconfirmed)</p>
                          </div>
                        )}
                        {job.budget_amount && (
                          <div>
                            <p className="text-sm text-gray-600">Fixed Price</p>
                            <p className="font-bold text-[#be0e0c]">£{parseFloat(job.budget_amount).toFixed(2)}</p>
                          </div>
                        )}
                      </div>

                      {job.additional_requirements && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-1">Additional Requirements</p>
                          <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg">{job.additional_requirements}</p>
                        </div>
                      )}

                      {selectedJob === job.id ? (
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <input
                            type="number"
                            placeholder="Bid Amount (£)"
                            value={bidForm.amount}
                            onChange={(e) => setBidForm({ ...bidForm, amount: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                          <input
                            type="date"
                            value={bidForm.date}
                            onChange={(e) => setBidForm({ ...bidForm, date: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                          <textarea
                            placeholder="Cover letter (optional)"
                            value={bidForm.notes}
                            onChange={(e) => setBidForm({ ...bidForm, notes: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSubmitBid(job.id)}
                              disabled={submitting}
                              className="flex-1 bg-[#be0e0c] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#9f0b0a] disabled:opacity-50"
                            >
                              {submitting ? 'Submitting...' : 'Submit Bid'}
                            </button>
                            <button
                              onClick={() => setSelectedJob(null)}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedJob(job.id)}
                            className="flex-1 bg-[#be0e0c] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#9f0b0a] transition-colors"
                          >
                            Submit Bid
                          </button>
                          {job.budget_amount && (
                            <button
                              onClick={() => handlePurchaseJob(job.id, parseFloat(job.budget_amount))}
                              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                            >
                              <DollarSign size={18} className="inline mr-1" />
                              Buy Now: £{parseFloat(job.budget_amount).toFixed(2)}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">My Service Bookings</h3>
            {myBookings.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No bookings yet</p>
            ) : (
              <div className="space-y-4">
                {myBookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900">{booking.trade_services?.name}</h4>
                        <p className="text-sm text-gray-600">{booking.trade_services?.service_type}</p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-semibold">{new Date(booking.booking_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-semibold">{booking.duration_hours} hours</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="font-bold text-[#be0e0c]">£{parseFloat(booking.total_amount).toFixed(2)}</p>
                      </div>
                    </div>
                    {booking.notes && (
                      <p className="mt-3 text-sm text-gray-700 bg-gray-50 p-3 rounded">{booking.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'post-job' && (
          <JobPostingForm onSuccess={() => { loadPortalData(); setActiveTab('dashboard'); }} />
        )}

        {activeTab === 'book-service' && (
          <ServiceBookingForm onSuccess={() => { loadPortalData(); setActiveTab('bookings'); }} />
        )}

        {activeTab === 'account' && <AccountManagement />}
      </div>
    </div>
  );
}
