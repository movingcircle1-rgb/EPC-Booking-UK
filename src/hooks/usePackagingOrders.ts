import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface PackagingOrder {
  id: string;
  booking_id: string | null;
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
  user_id: string | null;
}

export function usePackagingOrders(userEmail: string | undefined) {
  const [orders, setOrders] = useState<PackagingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userEmail) {
      setLoading(false);
      return;
    }

    fetchOrders();

    // Set up real-time subscription
    const packagingOrdersChannel = supabase
      .channel('packaging-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'packaging_orders',
          filter: `customer_email=eq.${userEmail}`
        },
        (payload) => {
          console.log('[usePackagingOrders] Real-time update:', payload);
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(packagingOrdersChannel);
    };
  }, [userEmail]);

  async function fetchOrders() {
    try {
      setLoading(true);
      setError(null);

      console.log('[usePackagingOrders] Fetching orders for:', userEmail);

      const { data, error: fetchError } = await supabase
        .from('packaging_orders')
        .select('*')
        .eq('customer_email', userEmail)
        .order('created_at', { ascending: false });

      console.log('[usePackagingOrders] Result:', {
        data,
        error: fetchError,
        count: data?.length || 0
      });

      if (fetchError) throw fetchError;

      setOrders(data || []);
    } catch (err) {
      console.error('[usePackagingOrders] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch packaging orders');
    } finally {
      setLoading(false);
    }
  }

  return {
    orders,
    loading,
    error,
    refresh: fetchOrders
  };
}
