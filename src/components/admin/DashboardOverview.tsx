import { useState, useEffect } from 'react';
import { MapPin, Link2, ClipboardList, Package, TrendingUp, Users, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../portal/LoadingSpinner';

interface DashboardStats {
  totalLocations: number;
  totalKeywords: number;
  totalArticles: number;
  publishedArticles: number;
  totalArticleViews: number;
  quoteRequests: {
    total: number;
    new: number;
    accepted: number;
    declined: number;
  };
  packagingOrders: {
    total: number;
    pending: number;
    confirmed: number;
    delivered: number;
  };
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();

    const quoteRequestsSubscription = supabase
      .channel('dashboard_quote_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quote_requests' }, () => {
        fetchDashboardStats();
      })
      .subscribe();

    const packagingOrdersSubscription = supabase
      .channel('dashboard_packaging_orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'packaging_orders' }, () => {
        fetchDashboardStats();
      })
      .subscribe();

    const locationsSubscription = supabase
      .channel('dashboard_locations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'locations' }, () => {
        fetchDashboardStats();
      })
      .subscribe();

    return () => {
      quoteRequestsSubscription.unsubscribe();
      packagingOrdersSubscription.unsubscribe();
      locationsSubscription.unsubscribe();
    };
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      const [locationsResult, keywordsResult, articlesResult, quoteRequestsResult, packagingOrdersResult] = await Promise.all([
        supabase.from('locations').select('id', { count: 'exact', head: true }),
        supabase.from('keywords').select('id', { count: 'exact', head: true }),
        supabase.from('articles').select('*'),
        supabase.from('quote_requests').select('*'),
        supabase.from('packaging_orders').select('*')
      ]);

      const articles = articlesResult.data || [];
      const quoteRequests = quoteRequestsResult.data || [];
      const packagingOrders = packagingOrdersResult.data || [];

      const totalViews = articles.reduce((sum: number, article: any) => sum + (article.view_count || 0), 0);

      setStats({
        totalLocations: locationsResult.count || 0,
        totalKeywords: keywordsResult.count || 0,
        totalArticles: articles.length,
        publishedArticles: articles.filter((a: any) => a.status === 'published').length,
        totalArticleViews: totalViews,
        quoteRequests: {
          total: quoteRequests.length,
          new: quoteRequests.filter((q: any) => q.status === 'new' || q.status === 'pending').length,
          accepted: quoteRequests.filter((q: any) => q.status === 'accepted').length,
          declined: quoteRequests.filter((q: any) => q.status === 'declined').length,
        },
        packagingOrders: {
          total: packagingOrders.length,
          pending: packagingOrders.filter((o: any) => o.status === 'pending').length,
          confirmed: packagingOrders.filter((o: any) => o.status === 'confirmed' || o.status === 'in_transit').length,
          delivered: packagingOrders.filter((o: any) => o.status === 'delivered').length,
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Unable to load dashboard statistics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome to Admin Dashboard</h2>
          <p className="text-gray-600 mt-1">Here's an overview of your business operations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Locations</p>
              <p className="text-3xl font-bold mt-2">{stats.totalLocations}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <MapPin size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp size={16} className="mr-1" />
            <span>Active cities</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Articles</p>
              <p className="text-3xl font-bold mt-2">{stats.publishedArticles}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp size={16} className="mr-1" />
            <span>{stats.totalArticleViews.toLocaleString()} total views</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Quote Requests</p>
              <p className="text-3xl font-bold mt-2">{stats.quoteRequests.total}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <ClipboardList size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Clock size={16} className="mr-1" />
            <span>{stats.quoteRequests.new} pending</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Packaging Orders</p>
              <p className="text-3xl font-bold mt-2">{stats.packagingOrders.total}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Package size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Clock size={16} className="mr-1" />
            <span>{stats.packagingOrders.pending} pending</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Quote Requests Overview</h3>
            <ClipboardList className="text-gray-400" size={24} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-yellow-600" size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">New Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.quoteRequests.new}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Accepted</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.quoteRequests.accepted}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="text-red-600" size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Declined</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.quoteRequests.declined}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Packaging Orders Status</h3>
            <Package className="text-gray-400" size={24} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-yellow-600" size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.packagingOrders.pending}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Confirmed / In Transit</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.packagingOrders.confirmed}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.packagingOrders.delivered}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <MapPin className="text-blue-600" size={24} />
            <span className="font-semibold text-gray-700">Manage Cities</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <Link2 className="text-purple-600" size={24} />
            <span className="font-semibold text-gray-700">Auto-Linking</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <ClipboardList className="text-green-600" size={24} />
            <span className="font-semibold text-gray-700">Quote Requests</span>
          </button>
          <button className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <Package className="text-orange-600" size={24} />
            <span className="font-semibold text-gray-700">Packaging Orders</span>
          </button>
        </div>
      </div>
    </div>
  );
}
