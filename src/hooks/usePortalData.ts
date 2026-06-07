import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchBookings() {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('customer_email', user.email)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBookings(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, [user]);

  return { bookings, loading, error };
}

export function useQuotations() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchQuotations() {
      try {
        const { data, error } = await supabase
          .from('quotations')
          .select('*')
          .eq('customer_email', user.email)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setQuotations(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchQuotations();
  }, [user]);

  return { quotations, loading, error };
}

export function useReferrals() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchReferrals() {
      try {
        const { data: partnerData } = await supabase
          .from('partners')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!partnerData) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('referrals')
          .select('*')
          .eq('partner_id', partnerData.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setReferrals(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchReferrals();
  }, [user]);

  return { referrals, loading, error };
}

export function useTradeJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchJobs() {
      try {
        const { data, error } = await supabase
          .from('trade_jobs')
          .select('*')
          .eq('status', 'open')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setJobs(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, [user]);

  return { jobs, loading, error };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchNotifications() {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setNotifications(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, [user]);

  return { notifications, loading, error };
}

export function useQuotes() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchQuotes() {
      try {
        const { data, error } = await supabase
          .from('quotes')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setQuotes(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchQuotes();
  }, [user]);

  return { quotes, loading, error };
}

export function useTradeBids() {
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchBids() {
      try {
        const { data: tradeData } = await supabase
          .from('trade_accounts')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!tradeData) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('trade_bids')
          .select(`
            *,
            trade_jobs (
              title,
              service_type,
              pickup_postcode,
              delivery_postcode,
              status
            )
          `)
          .eq('bidder_trade_id', tradeData.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBids(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBids();
  }, [user]);

  return { bids, loading, error };
}

export function useStaffSchedule() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchSchedule() {
      try {
        const { data, error } = await supabase
          .from('availability_calendar')
          .select('*')
          .eq('staff_id', user.id)
          .gte('date', new Date().toISOString().split('T')[0])
          .order('date', { ascending: true })
          .limit(30);

        if (error) throw error;
        setSchedule(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSchedule();
  }, [user]);

  return { schedule, loading, error };
}

export function useStaffProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      try {
        const { data, error } = await supabase
          .from('staff_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        setProfile(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  return { profile, loading, error };
}
