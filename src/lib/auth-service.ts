import { supabase } from './supabase';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: 'client' | 'partner' | 'trade' | 'staff' | 'temp_admin';
  gdprConsent: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export const authService = {
  async signUp(data: SignUpData) {
    const { email, password, fullName, phone, role, gdprConsent } = data;

    if (!gdprConsent) {
      throw new Error('GDPR consent is required to create an account');
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || '',
          role: role,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user');

    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const { error: roleUpdateError } = await supabase
        .from('user_roles')
        .update({ role, full_name: fullName, phone })
        .eq('user_id', authData.user.id);

      if (roleUpdateError) {
        console.warn('Role update warning:', roleUpdateError);
      }

      const { error: consentError } = await supabase
        .from('gdpr_consents')
        .insert({
          user_id: authData.user.id,
          consent_type: 'terms',
          consent_version: '1.0',
          is_consented: true,
        });

      if (consentError) {
        console.warn('GDPR consent warning:', consentError);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data: portalCheck } = await this.verifyPortalRecordExists(authData.user.id, role);

      if (!portalCheck) {
        console.warn('Portal record may not exist, attempting to create manually...');
        await this.ensurePortalRecord(authData.user.id, role, email, fullName, phone);
      }
    } catch (error) {
      console.error('Error during signup finalization:', error);
    }

    return authData;
  },

  async verifyPortalRecordExists(userId: string, role: string): Promise<{ data: boolean }> {
    try {
      if (role === 'partner') {
        const { data } = await supabase
          .from('partners')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();
        return { data: !!data };
      } else if (role === 'trade') {
        const { data } = await supabase
          .from('trade_accounts')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();
        return { data: !!data };
      } else if (role === 'staff') {
        const { data } = await supabase
          .from('staff_profiles')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();
        return { data: !!data };
      }
      return { data: true };
    } catch (error) {
      console.error('Error verifying portal record:', error);
      return { data: false };
    }
  },

  async ensurePortalRecord(userId: string, role: string, email: string, fullName: string, phone?: string) {
    try {
      if (role === 'partner') {
        const { error } = await supabase.from('partners').insert({
          user_id: userId,
          company_name: fullName || 'Partner Company',
          contact_name: fullName || 'Partner Contact',
          email,
          phone: phone || 'Not Provided',
          status: 'pending',
          partnership_type: 'referral',
        });
        if (error && !error.message.includes('duplicate')) {
          throw error;
        }
      } else if (role === 'trade') {
        const { error } = await supabase.from('trade_accounts').insert({
          user_id: userId,
          business_name: fullName || 'Trade Business',
          contact_name: fullName || 'Trade Contact',
          email,
          phone: phone || 'Not Provided',
          account_status: 'pending',
          discount_rate: 0,
          credit_limit: 0,
        });
        if (error && !error.message.includes('duplicate')) {
          throw error;
        }
      } else if (role === 'staff') {
        const { error } = await supabase.from('staff_profiles').insert({
          user_id: userId,
          job_role: 'Pending Assignment',
          hire_date: new Date().toISOString().split('T')[0],
        });
        if (error && !error.message.includes('duplicate')) {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error ensuring portal record:', error);
      throw error;
    }
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    console.log('[auth-service] signIn ok - session?', !!data?.session, 'user?', !!data?.user);
    console.log('[auth-service] storageKey present?', Object.keys(localStorage).some(k => k.includes('nr_storage_supabase_auth')));
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  },

  async getUserRole(userId: string) {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role, full_name, phone')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  getRedirectPathForRole(role: string): string {
    const r = String(role ?? '').trim().toLowerCase()

    // Normalize aliases that may appear in DB / metadata
    const normalized =
      r === 'admin2' ? 'admin-2' :
      r === 'admin_2' ? 'admin-2' :
      r === 'temp-admin' ? 'temp_admin' :
      r

    switch (normalized) {
      case 'admin':
        return '/admin/'
      case 'admin-2':
        return '/admin-2'
      case 'temp_admin':
        return '/temp-admin/'
      case 'client':
        return '/client-portal'
      case 'partner':
        return '/partner-portal/'
      case 'trade':
        return '/trade-portal/'
      case 'staff':
        return '/staff-portal'
      default:
        return '/'
    }
  },
};
