import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Quotation {
  id: string;
  booking_id: string | null;
  quotation_number: string;
  customer_email: string;
  service_type: string;
  move_from: string;
  move_to: string;
  move_date: string | null;
  base_amount: number;
  additional_services_amount: number;
  total_amount: number;
  status: 'pending' | 'sent' | 'accepted' | 'rejected' | 'expired';
  quotation_pdf_url: string | null;
  terms_pdf_url: string | null;
  terms_accepted: boolean;
  terms_accepted_at: string | null;
  valid_until: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteRequest {
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
  estimated_volume: string | null;
  preferred_move_date: string | null;
  flexible_dates: boolean;
  additional_notes: string | null;
  status: string;
  quoted_amount: number | null;
  quoted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdditionalService {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  unit: string;
  is_active: boolean;
  display_order: number;
}

export function useQuotations(userEmail: string | undefined) {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userEmail) {
      setLoading(false);
      return;
    }

    fetchQuotations();

    // Set up real-time subscriptions
    const quotationsChannel = supabase
      .channel('quotations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quotations',
          filter: `customer_email=eq.${userEmail}`
        },
        (payload) => {
          console.log('[useQuotations] Real-time update:', payload);
          fetchQuotations();
        }
      )
      .subscribe();

    const quoteRequestsChannel = supabase
      .channel('quote-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quote_requests',
          filter: `customer_email=eq.${userEmail}`
        },
        (payload) => {
          console.log('[useQuotations] Real-time quote request update:', payload);
          fetchQuotations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(quotationsChannel);
      supabase.removeChannel(quoteRequestsChannel);
    };
  }, [userEmail]);

  async function fetchQuotations() {
    try {
      setLoading(true);
      setError(null);

      console.log('[useQuotations] Starting fetch for email:', userEmail);

      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      console.log('[useQuotations] Current session email:', session?.user?.email);

      // Fetch both quotations AND quote requests
      const [quotationsResult, quoteRequestsResult] = await Promise.all([
        supabase
          .from('quotations')
          .select('*')
          .eq('customer_email', userEmail)
          .order('created_at', { ascending: false }),
        supabase
          .from('quote_requests')
          .select('*')
          .eq('customer_email', userEmail)
          .order('created_at', { ascending: false })
      ]);

      console.log('[useQuotations] Quotations result:', {
        email: userEmail,
        data: quotationsResult.data,
        error: quotationsResult.error,
        count: quotationsResult.data?.length || 0
      });

      console.log('[useQuotations] Quote requests result:', {
        email: userEmail,
        data: quoteRequestsResult.data,
        error: quoteRequestsResult.error,
        count: quoteRequestsResult.data?.length || 0
      });

      if (quotationsResult.error) {
        console.error('[useQuotations] Quotations fetch error:', quotationsResult.error);
        throw quotationsResult.error;
      }

      if (quoteRequestsResult.error) {
        console.error('[useQuotations] Quote requests fetch error:', quoteRequestsResult.error);
        throw quoteRequestsResult.error;
      }

      console.log('[useQuotations] Setting data:', {
        quotations: quotationsResult.data?.length || 0,
        quoteRequests: quoteRequestsResult.data?.length || 0
      });

      setQuotations(quotationsResult.data || []);
      setQuoteRequests(quoteRequestsResult.data || []);
    } catch (err) {
      console.error('[useQuotations] Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }

  async function acceptQuotation(quotationId: string) {
    try {
      const { error: updateError } = await supabase
        .from('quotations')
        .update({
          status: 'accepted',
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', quotationId)
        .eq('customer_email', userEmail);

      if (updateError) throw updateError;

      await fetchQuotations();
      return { success: true };
    } catch (err) {
      console.error('[useQuotations] Error accepting quotation:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to accept quotation' };
    }
  }

  async function declineQuotation(quotationId: string) {
    try {
      const { error: updateError } = await supabase
        .from('quotations')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', quotationId)
        .eq('customer_email', userEmail);

      if (updateError) throw updateError;

      await fetchQuotations();
      return { success: true };
    } catch (err) {
      console.error('[useQuotations] Error declining quotation:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to decline quotation' };
    }
  }

  async function updateMoveDate(quotationId: string, moveDate: string) {
    try {
      const { error: updateError } = await supabase
        .from('quotations')
        .update({ move_date: moveDate, updated_at: new Date().toISOString() })
        .eq('id', quotationId)
        .eq('customer_email', userEmail);

      if (updateError) throw updateError;

      await fetchQuotations();
      return { success: true };
    } catch (err) {
      console.error('[useQuotations] Error updating move date:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update move date' };
    }
  }

  return {
    quotations,
    quoteRequests,
    loading,
    error,
    acceptQuotation,
    declineQuotation,
    updateMoveDate,
    refresh: fetchQuotations
  };
}

export function useAdditionalServices() {
  const [services, setServices] = useState<AdditionalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('additional_services')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;

      setServices(data || []);
    } catch (err) {
      console.error('[useAdditionalServices] Error fetching services:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  }

  async function addServiceToQuotation(quotationId: string, serviceId: string, quantity: number = 1) {
    try {
      const { error: insertError } = await supabase
        .from('booking_additional_services')
        .insert({
          quotation_id: quotationId,
          service_id: serviceId,
          quantity,
          created_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      return { success: true };
    } catch (err) {
      console.error('[useAdditionalServices] Error adding service:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to add service' };
    }
  }

  return {
    services,
    loading,
    error,
    addServiceToQuotation,
    refresh: fetchServices
  };
}
